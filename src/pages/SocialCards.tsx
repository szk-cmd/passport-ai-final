import { useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Download } from 'lucide-react'
import { toPng } from 'html-to-image'
import { FullScreenLoader, Spinner } from '../components/ui'
import OutputMap from '../components/outputs/OutputMap'
import { dayColor } from '../lib/constants'
import { fmtRange } from '../lib/format'
import { toOutputData, type OutputData } from '../lib/outputs'
import type { MapPin } from '../lib/types'
import { usePassportBySlug } from '../lib/usePassportBySlug'
import NotFoundPassport from './NotFoundPassport'

const PREVIEW_SCALE = 0.3 // การ์ดออกแบบที่ขนาดจริง (px) แล้วย่อด้วย CSS ให้ดูบนจอ

// การ์ดโซเชียลสไตล์ Strava 3 แบบ ดาวน์โหลดเป็น PNG ขนาดจริงไปโพสต์ IG / Facebook / TikTok
export default function SocialCards() {
  const { slug } = useParams()
  const nav = useNavigate()
  const row = usePassportBySlug(slug)
  const d = useMemo(() => (row ? toOutputData(row.data) : null), [row])

  if (row === undefined) return <FullScreenLoader />
  if (!row || !d) return <NotFoundPassport />
  const file = (kind: string) => `${d.title.replace(/[\\/:*?"<>|\s]+/g, '-')}-${kind}.png`

  return (
    <div className="min-h-screen paper">
      <header className="mx-auto flex max-w-md items-center gap-3 px-4 py-4">
        <button className="btn-ghost !px-3" onClick={() => nav(-1)}><ArrowLeft size={18} /> กลับ</button>
        <div className="min-w-0">
          <p className="kicker text-ember">การ์ดโซเชียล</p>
          <h1 className="truncate text-xl font-bold">{d.title}</h1>
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 pb-16">
        <p className="text-sm text-ink-muted">เลือกขนาดที่ต้องการ กดดาวน์โหลด แล้วแชร์ลง IG / Facebook / TikTok</p>
        <Preview label="Story · 1080×1920" width={1080} height={1920} file={file('story')}><StoryCard d={d} /></Preview>
        <Preview label="Post · 1080×1080" width={1080} height={1080} file={file('post')}><SquareCard d={d} /></Preview>
        <Preview label="พื้นโปร่งใส · วางทับรูปตัวเอง" width={1080} height={1920} file={file('transparent')} checker><TransparentCard d={d} /></Preview>
      </main>
    </div>
  )
}

function Preview({ label, width, height, file, checker = false, children }: { label: string; width: number; height: number; file: string; checker?: boolean; children: ReactNode }) {
  const card = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)

  // วาดการ์ดขนาดจริงเป็น PNG (รูปและแผนที่ต้องโหลดเสร็จก่อน) ถ้าฝังฟอนต์ไม่ได้ ลองใหม่แบบไม่ฝังฟอนต์
  async function download() {
    if (!card.current) return
    setBusy(true)
    const opts = { width, height, pixelRatio: 1, cacheBust: true, style: { transform: 'none' } }
    try {
      let url: string
      try {
        url = await toPng(card.current, opts)
      } catch {
        url = await toPng(card.current, { ...opts, skipFonts: true })
      }
      const a = document.createElement('a')
      a.href = url
      a.download = file
      a.click()
    } catch (e) {
      alert(`ดาวน์โหลดรูปไม่สำเร็จ ลองใหม่อีกครั้ง (${(e as Error).message})`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mt-8 flex flex-col items-center">
      <div className="mb-2 flex w-full items-center justify-between">
        <p className="font-semibold">{label}</p>
        <button className="btn-outline !px-3 !py-1.5" onClick={download} disabled={busy}>
          {busy ? <Spinner size={14} /> : <Download size={15} />} PNG
        </button>
      </div>
      <div className="overflow-hidden rounded-xl shadow-lift" style={{ width: width * PREVIEW_SCALE, height: height * PREVIEW_SCALE, background: checker ? 'repeating-conic-gradient(#555 0% 25%, #777 0% 50%) 0 0 / 24px 24px' : undefined }}>
        <div ref={card} style={{ width, height, transform: `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left' }}>{children}</div>
      </div>
    </section>
  )
}

function Brand({ size = 44, color }: { size?: number; color?: string }) {
  return (
    <p className="shrink-0 whitespace-nowrap font-display font-bold tracking-wide" style={{ fontSize: size }}>
      Passport <span style={{ color }}>AI</span>
    </p>
  )
}

function Stats({ d, size = 1 }: { d: OutputData; size?: number }) {
  const items = [
    { value: d.days, label: 'วัน' },
    { value: d.places, label: 'สถานที่' },
    { value: d.distanceKm.toLocaleString('th-TH'), label: 'กม.' },
    { value: d.photoCount, label: 'รูป' },
  ]
  return (
    <div className="flex" style={{ gap: 64 * size }}>
      {items.map((it) => (
        <div key={it.label}>
          <p style={{ fontSize: 34 * size }} className="opacity-70">{it.label}</p>
          <p style={{ fontSize: 92 * size, lineHeight: 1.1 }} className="font-display font-bold">{it.value}</p>
        </div>
      ))}
    </div>
  )
}

// 1080×1920: รูปไฮไลต์เต็มจอ + แผนที่ + ชื่อทริป + สถิติ
export function StoryCard({ d }: { d: OutputData }) {
  const photo = d.photos[0]
  // ไม่ใส่ฟิล์มทับรูป ให้เห็นรูปเต็มใบ ตัวหนังสือใช้เงาแทนเพื่อให้อ่านออกบนรูปทุกแบบ
  const shadow = { textShadow: '0 2px 14px rgba(0,0,0,.55), 0 1px 3px rgba(0,0,0,.6)' }
  return (
    <div className="relative h-full w-full text-white" style={{ background: d.theme.primary }}>
      {photo && <img src={photo.url} alt="" crossOrigin="anonymous" className="absolute inset-0 h-full w-full object-cover" />}
      <div className="absolute inset-0 flex flex-col justify-between p-[72px]" style={shadow}>
        <div className="flex items-start justify-between gap-8">
          <Brand size={32} color={d.theme.accent} />
          {/* แผนที่เล็กมุมขวาบน บังรูปให้น้อยที่สุด */}
          {d.pins.length > 0 && <OutputMap pins={d.pins} routeColor={d.theme.secondary} className="h-[230px] w-[310px] shrink-0 rounded-[24px] shadow-xl ring-[4px] ring-white/90" markerScale={1.4} />}
        </div>
        <div>
          <h2 className="font-display text-[76px] font-bold leading-tight">{d.title}</h2>
          <p className="mt-1 text-[32px]">{fmtRange(d.startDate, d.endDate)}</p>
          <div className="mt-8"><Stats d={d} size={0.6} /></div>
          <p className="mt-8 text-[28px] font-semibold" style={{ color: d.theme.accent }}>#PassportAI</p>
        </div>
      </div>
    </div>
  )
}

// 1080×1080: พื้นสีธีม แผนที่ใหญ่ minimal
export function SquareCard({ d }: { d: OutputData }) {
  return (
    <div className="flex h-full w-full flex-col justify-between p-[72px] text-espresso" style={{ background: d.theme.bg }}>
      <div className="flex items-start justify-between gap-8">
        <div className="min-w-0">
          <h2 className="font-display text-[84px] font-bold leading-tight" style={{ color: d.theme.primary }}>{d.title}</h2>
          <p className="text-[36px] opacity-70">{fmtRange(d.startDate, d.endDate)}</p>
        </div>
        <Brand size={36} color={d.theme.secondary} />
      </div>
      {d.pins.length > 0 ? (
        <OutputMap pins={d.pins} routeColor={d.theme.secondary} className="h-[440px] w-full rounded-[32px]" markerScale={2.5} />
      ) : (
        d.photos[0] && <img src={d.photos[0].url} alt="" crossOrigin="anonymous" className="h-[440px] w-full rounded-[32px] object-cover" />
      )}
      <div className="flex items-end justify-between">
        <Stats d={d} size={0.72} />
        <p className="text-[32px] font-semibold" style={{ color: d.theme.highlight }}>#PassportAI</p>
      </div>
    </div>
  )
}

// 1080×1920 พื้นโปร่งใส: ตัวหนังสือ + เส้นทาง (ลายเดียวกับแผนที่ใน Passport) ไว้วางทับรูปของผู้ใช้เอง
export function TransparentCard({ d }: { d: OutputData }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-end pb-[220px] text-center text-white">
      <RouteLine pins={d.pins} size={400} />
      <h2 className="mt-12 font-display text-[96px] font-bold leading-tight drop-shadow-lg">{d.title}</h2>
      <div className="mt-10 drop-shadow-lg"><Stats d={d} size={0.85} /></div>
      <div className="mt-14 flex items-center gap-6 text-[38px] drop-shadow-lg">
        <span className="font-display font-bold">Passport AI</span>
        <span className="opacity-80">#PassportAI</span>
      </div>
    </div>
  )
}

// เส้นทางล้วนแบบ Strava: เส้นประสีขาว + หมุดสีตามวัน (สีเดียวกับแผนที่ใน Passport)
function RouteLine({ pins, size }: { pins: MapPin[]; size: number }) {
  if (pins.length === 0) return null
  const pad = 30
  const lats = pins.map((p) => p.lat)
  const lons = pins.map((p) => p.lon)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLon = Math.min(...lons)
  const spanLon = Math.max(...lons) - minLon || 1
  const spanLat = maxLat - minLat || 1
  const scale = Math.min((size - pad * 2) / spanLon, (size - pad * 2) / spanLat)
  const ox = (size - spanLon * scale) / 2
  const oy = (size - spanLat * scale) / 2
  const pts = pins.map((p) => ({ x: ox + (p.lon - minLon) * scale, y: oy + (maxLat - p.lat) * scale, day: p.day }))
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg" aria-hidden>
      <polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#fff" strokeWidth={8} strokeDasharray="14 18" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={16} fill={dayColor(p.day)} stroke="#fff" strokeWidth={5} />)}
    </svg>
  )
}
