import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Clock, Printer, Star } from 'lucide-react'
import { FullScreenLoader } from '../components/ui'
import { DEFAULT_HIDDEN, FRAMES, INFO_LABELS, fitPhotoIds, getFrame, type InfoKey } from '../components/outputs/frames'
import { MAX_FRAME_TEXT, passportUrl, toOutputData } from '../lib/outputs'
import { usePassportBySlug } from '../lib/usePassportBySlug'
import NotFoundPassport from './NotFoundPassport'

// ราคายังไม่ได้ตั้ง ใส่ [฿__] ไว้ก่อน
const SIZES = [
  { id: 'a4', label: 'A4', note: '21 × 29.7 ซม.', price: '[฿__]' },
  { id: '8x10', label: '8 × 10 นิ้ว', note: '20 × 25 ซม.', price: '[฿__]' },
]
const FRAME_COLORS = [
  { id: 'wood', label: 'ไม้ธรรมชาติ', color: 'linear-gradient(135deg, #C9965F, #9A6B3E 60%, #B88552)' },
  { id: 'black', label: 'ดำ', color: '#1C1714' },
  { id: 'white', label: 'ขาว', color: '#FDFBF7' },
]

// พิมพ์เฉพาะแผ่นกรอบรูป A4 แนวตั้ง ไม่มีขอบกระดาษ
const PRINT_CSS = `
@page { size: A4 portrait; margin: 0; }
@media print {
  body * { visibility: hidden !important; }
  .print-sheet, .print-sheet * { visibility: visible !important; }
  .print-sheet { position: absolute; left: 0; top: 0; width: 210mm !important; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}`

// กรอบรูปสำหรับผู้สูงอายุ: ขั้น 1 เลือกแบบ รูป ข้อมูลที่แสดง ข้อความ → ขั้น 2 ขนาด/สีกรอบ (ยังไม่เปิดสั่งจริง) หรือพิมพ์เอง
export default function FrameStudio() {
  const { slug } = useParams()
  const nav = useNavigate()
  const row = usePassportBySlug(slug)
  const d = useMemo(() => (row ? toOutputData(row.data) : null), [row])
  const allIds = useMemo(() => d?.photos.map((p) => p.id) ?? [], [d])

  const [step, setStep] = useState<1 | 2>(1)
  const [frameId, setFrameId] = useState(FRAMES[0].id)
  const [picked, setPicked] = useState<string[] | null>(null)
  const [hidden, setHidden] = useState<InfoKey[]>(DEFAULT_HIDDEN)
  const [text, setText] = useState<string | null>(null)
  const [sizeId, setSizeId] = useState(SIZES[0].id)
  const [colorId, setColorId] = useState(FRAME_COLORS[0].id)
  const [comingSoon, setComingSoon] = useState(false)

  if (row === undefined) return <FullScreenLoader />
  if (!row || !d) return <NotFoundPassport />

  const frame = getFrame(frameId)
  const ids = picked ?? fitPhotoIds(allIds, frameId, allIds.slice(0, frame.photos.max))
  const photos = ids.map((id) => d.photos.find((p) => p.id === id)!).filter(Boolean)
  const msg = text ?? d.shortText
  const shareUrl = passportUrl(row.share_slug)
  const { min, max } = frame.photos
  const enough = ids.length >= Math.min(min, allIds.length)
  const size = SIZES.find((s) => s.id === sizeId)!
  const color = FRAME_COLORS.find((c) => c.id === colorId)!

  const sheet = (id = frameId, list = photos) => {
    const F = getFrame(id).Component
    return <F d={d} shareUrl={shareUrl} text={msg} photos={list} hidden={hidden} />
  }

  function chooseFrame(id: string) {
    setFrameId(id)
    setPicked(fitPhotoIds(allIds, id, ids))
  }
  function togglePhoto(id: string) {
    if (max === 1) return setPicked([id])
    if (ids.includes(id)) return setPicked(ids.filter((x) => x !== id))
    if (ids.length < max) setPicked([...ids, id])
  }
  const toggleInfo = (k: InfoKey) => setHidden((h) => (h.includes(k) ? h.filter((x) => x !== k) : [...h, k]))

  return (
    <div className="min-h-screen paper">
      <style>{PRINT_CSS}</style>
      <header className="no-print mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
        <button className="btn-ghost !px-3" onClick={() => (step === 2 ? setStep(1) : nav(-1))}><ArrowLeft size={18} /> {step === 2 ? 'เปลี่ยนแบบ' : 'กลับ'}</button>
        <div className="min-w-0">
          <p className="kicker text-ember">กรอบรูป · ขั้นที่ {step} จาก 2</p>
          <h1 className="truncate text-xl font-bold">{d.title}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-16">
        {/* แผ่นที่จะพิมพ์ (ตัวอย่างใหญ่) */}
        {step === 1 ? (
          <div className="print-sheet mx-auto w-full max-w-md overflow-hidden rounded-xl shadow-lift">{sheet()}</div>
        ) : (
          <div className="mx-auto w-4/5 max-w-sm p-[5%] shadow-lift" style={{ background: color.color }}>
            <div className="print-sheet shadow-inner">{sheet()}</div>
          </div>
        )}

        {step === 1 ? (
          <div className="no-print mt-6 space-y-5">
            <section className="card p-4">
              <h2 className="font-semibold">เลือกแบบ</h2>
              <div className="no-scrollbar -mx-4 mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-1">
                {FRAMES.map((f) => {
                  const on = f.id === frameId
                  return (
                    <button key={f.id} onClick={() => chooseFrame(f.id)} aria-pressed={on} className="w-24 shrink-0 snap-start text-center">
                      <div className={`pointer-events-none overflow-hidden rounded-lg ring-2 ring-offset-2 ${on ? 'ring-ember' : 'ring-transparent'}`} aria-hidden>
                        {sheet(f.id, fitPhotoIds(allIds, f.id, ids).map((id) => d.photos.find((p) => p.id === id)!))}
                      </div>
                      <span className={`mt-1.5 block text-xs ${on ? 'font-semibold text-ember' : 'text-ink-muted'}`}>{f.name}</span>
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="card p-4">
              <div className="flex items-baseline justify-between">
                <h2 className="font-semibold">รูปในกรอบ</h2>
                <span className={`text-sm ${enough ? 'text-ink-muted' : 'font-semibold text-ember'}`}>{ids.length}/{max} รูป</span>
              </div>
              <p className="mt-1 text-xs text-ink-muted">
                {max === 1 ? 'แบบนี้ใช้รูปเดียว แตะเพื่อเปลี่ยนรูป' : `แตะเพื่อเลือก/เอาออก (อย่างน้อย ${min} รูป) · รูปหมายเลข 1 = รูปใหญ่ กดดาวเพื่อเปลี่ยนรูปใหญ่`}
              </p>
              {d.photos.length === 0 ? (
                <p className="mt-3 rounded-xl bg-saffron-100 px-3 py-2 text-sm">Passport นี้ยังไม่มีรูปไฮไลต์ อัปโหลดรูปในคลังรูปแล้วกด “สร้างใหม่” ที่หน้า Passport</p>
              ) : (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {d.photos.map((p) => {
                    const order = ids.indexOf(p.id)
                    const on = order !== -1
                    const full = !on && max > 1 && ids.length >= max
                    return (
                      <div key={p.id} className="relative">
                        <button onClick={() => togglePhoto(p.id)} disabled={full} aria-pressed={on} aria-label={p.caption} className={`block w-full overflow-hidden rounded-lg ring-2 ring-offset-2 ${on ? 'ring-ember' : 'ring-transparent'} ${!on ? (full ? 'opacity-30' : 'opacity-60 hover:opacity-100') : ''}`}>
                          <img src={p.thumb} alt="" className="aspect-square w-full object-cover" />
                        </button>
                        {on && max > 1 && <span className="pointer-events-none absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-ember text-[11px] font-bold text-white">{order + 1}</span>}
                        {on && order > 0 && (
                          <button onClick={() => setPicked([p.id, ...ids.filter((x) => x !== p.id)])} className="absolute bottom-1 left-1 grid h-6 w-6 place-items-center rounded-full bg-espresso/70 text-white" aria-label="ใช้เป็นรูปใหญ่">
                            <Star size={12} />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            <section className="card p-4">
              <h2 className="font-semibold">ข้อมูลที่แสดง</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {frame.info.map((k) => {
                  const on = !hidden.includes(k)
                  return (
                    <button key={k} onClick={() => toggleInfo(k)} aria-pressed={on} className={`chip !px-3 !py-1.5 !text-sm ${on ? 'bg-espresso text-cream' : 'bg-cream-200 text-ink-muted'}`}>
                      {on && <Check size={14} />} {INFO_LABELS[k]}
                    </button>
                  )
                })}
              </div>
              {!hidden.includes('qr') && !row.is_public && (
                <p className="mt-3 rounded-xl bg-saffron-100 px-3 py-2 text-xs">QR จะเปิดได้เมื่อเปิด “แชร์สาธารณะ” ที่หน้า Passport</p>
              )}
            </section>

            <section className={`card p-4 ${hidden.includes('text') ? 'opacity-50' : ''}`}>
              <label className="label" htmlFor="frame-text">ข้อความบนกรอบรูป</label>
              <textarea id="frame-text" className="input min-h-[84px]" maxLength={MAX_FRAME_TEXT} value={msg} onChange={(e) => setText(e.target.value)} />
              <p className="mt-1 text-xs text-ink-muted">{msg.length}/{MAX_FRAME_TEXT} · สั้นๆ 2-3 บรรทัด อ่านง่ายสำหรับผู้ใหญ่ที่บ้าน</p>
            </section>

            <div className="space-y-2">
              <button className="btn-primary w-full !py-3.5" onClick={() => setStep(2)} disabled={!enough}>ถัดไป เลือกขนาดและกรอบ</button>
              <button className="btn-outline w-full" onClick={() => window.print()}><Printer size={16} /> พิมพ์ / บันทึก PDF ไปพิมพ์เอง</button>
            </div>
          </div>
        ) : (
          <div className="no-print mt-6 space-y-5">
            <section className="card p-4">
              <h2 className="font-semibold">ขนาด</h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {SIZES.map((s) => (
                  <button key={s.id} onClick={() => setSizeId(s.id)} aria-pressed={s.id === sizeId} className={`rounded-xl border p-3 text-left ${s.id === sizeId ? 'border-ember ring-2 ring-ember/20' : 'border-cream-300'}`}>
                    <span className="block font-semibold">{s.label}</span>
                    <span className="block text-xs text-ink-muted">{s.note}</span>
                    <span className="mt-1.5 block text-sm font-semibold">{s.price}</span>
                  </button>
                ))}
              </div>
            </section>
            <section className="card p-4">
              <h2 className="font-semibold">สีกรอบ</h2>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {FRAME_COLORS.map((c) => (
                  <button key={c.id} onClick={() => setColorId(c.id)} aria-pressed={c.id === colorId} className={`flex flex-col items-center rounded-xl border p-3 ${c.id === colorId ? 'border-ember ring-2 ring-ember/20' : 'border-cream-300'}`}>
                    <span className="h-8 w-8 rounded-full ring-1 ring-cream-300" style={{ background: c.color }} />
                    <span className="mt-1.5 text-sm">{c.label}</span>
                  </button>
                ))}
              </div>
            </section>
            <div className="flex items-baseline justify-between px-1">
              <span className="text-sm text-ink-muted">แบบ{frame.name} · {size.label} · กรอบ{color.label}</span>
              <span className="text-2xl font-bold">{size.price}</span>
            </div>
            <div className="space-y-2">
              <button className="btn-primary w-full !py-3.5" onClick={() => setComingSoon(true)}>สั่งพิมพ์</button>
              {comingSoon && <p className="flex items-center justify-center gap-2 rounded-xl bg-saffron-100 px-4 py-3 text-sm"><Clock size={16} /> ฟีเจอร์นี้เปิดให้บริการเร็วๆ นี้</p>}
              <button className="btn-outline w-full" onClick={() => window.print()}><Printer size={16} /> พิมพ์ / บันทึก PDF ไปพิมพ์เอง</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
