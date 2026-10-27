import { fmtRange } from '../../../lib/format'
import type { OutputData } from '../../../lib/outputs'
import CityStamp from '../CityStamp'
import { CornerQr, FrameMap, isShown, Pic, Sheet, type FrameProps } from './shared'

// พาสปอร์ต: หน้าข้อมูลพาสปอร์ต + ตราประทับเมือง + แถบ MRZ ด้านล่าง
export default function PassportPage({ d, shareUrl, text, photos, hidden }: FrameProps) {
  const [hero] = photos
  const show = (k: Parameters<typeof isShown>[1]) => isShown(hidden, k)
  const withMap = show('map') && d.pins.length > 0
  const stamps = show('stamps') ? d.cities.slice(0, withMap ? 2 : 3) : []
  const stampColors = [d.theme.secondary, d.theme.highlight]
  const fields = [
    { label: 'ชื่อทริป · TRIP', value: d.title, big: true },
    ...(show('date') ? [{ label: 'วันที่ · DATES', value: fmtRange(d.startDate, d.endDate) }] : []),
    ...(show('stats')
      ? [
          { label: 'ระยะเวลา · DURATION', value: `${d.days} วัน · ${d.places} สถานที่` },
          { label: 'ระยะทาง · DISTANCE', value: `${d.distanceKm.toLocaleString('th-TH')} กม.` },
        ]
      : []),
  ]

  return (
    <Sheet className="bg-[#F4EFE4]">
      <div className="absolute inset-0 opacity-[0.07]" style={{ background: `repeating-radial-gradient(circle at 80% 30%, ${d.theme.highlight} 0 0.3cqw, transparent 0.3cqw 2.4cqw)` }} aria-hidden />
      <div className="relative flex h-full flex-col">
        <div className="flex shrink-0 items-center justify-between px-[5cqw] py-[2.5cqw] text-cream" style={{ background: d.theme.primary }}>
          <span className="font-display text-[3.6cqw] font-semibold">หนังสือเดินทางแห่งความทรงจำ</span>
          <span className="font-display text-[3.6cqw] font-semibold tracking-[0.3em]">PASSPORT</span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-[5cqw] pt-[5cqw]">
          <div className="flex shrink-0 gap-[4cqw]">
            {hero && <Pic photo={hero} className="aspect-[3/4] w-[36cqw] shrink-0 rounded-[1cqw] border-[0.5cqw] border-white shadow-md" />}
            <dl className="min-w-0 space-y-[2.2cqw]">
              {fields.map((f) => (
                <div key={f.label}>
                  <dt className="text-[2.6cqw] font-semibold tracking-wide" style={{ color: d.theme.secondary }}>{f.label}</dt>
                  <dd className={`font-display font-semibold leading-tight ${f.big ? 'text-[6.4cqw] font-bold' : 'text-[4.4cqw]'}`}>{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {show('text') && text && (
            <p className="mt-[4cqw] line-clamp-3 shrink-0 border-l-[0.8cqw] pl-[3cqw] font-display text-[4.8cqw] font-medium leading-snug" style={{ borderColor: d.theme.accent }}>{text}</p>
          )}

          <div className="flex min-h-0 flex-1 justify-between gap-[2cqw] pb-[3cqw]">
            <div className="flex flex-1 items-center justify-around gap-[2cqw]">
              {withMap && <FrameMap d={d} className="aspect-[4/3] w-[38cqw] shrink-0" />}
              {stamps.map((c, i) => (
                <CityStamp key={c} label={c} shape={i === 1 && !withMap ? 'rect' : 'circle'} color={stampColors[i % 2]} className={withMap ? 'w-[19cqw]' : i === 1 ? 'w-[30cqw]' : 'w-[25cqw]'} />
              ))}
            </div>
            <div className="self-end">{show('qr') && <CornerQr url={shareUrl} light="#F4EFE4" label={false} />}</div>
          </div>
        </div>

        <div className="shrink-0 overflow-hidden whitespace-pre border-t-[0.4cqw] border-espresso/30 bg-white px-[5cqw] py-[2.5cqw] font-mono text-[3cqw] font-semibold leading-relaxed">
          {mrzLines(d).map((line) => <p key={line}>{line}</p>)}
        </div>
      </div>
    </Sheet>
  )
}

// 2 บรรทัด บรรทัดละ 44 ตัว เติม "<" แบบ MRZ จริง (อักษรอังกฤษ/ตัวเลขเท่านั้น)
function mrzLines(d: OutputData) {
  const pad = (t: string) => t.toUpperCase().replace(/[^A-Z0-9<]/g, '<').padEnd(44, '<').slice(0, 44)
  const ymd = (s: string) => s.replace(/-/g, '')
  return [pad(`P<THA<<PASSPORTAI<<${ymd(d.startDate)}`), pad(`${ymd(d.startDate)}<${ymd(d.endDate)}<D${d.days}<P${d.places}<KM${d.distanceKm}`)]
}
