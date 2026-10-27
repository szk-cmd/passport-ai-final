import { fmtRange } from '../../../lib/format'
import { CornerQr, FrameMap, isShown, Pic, Sheet, type FrameProps } from './shared'

// มินิมอล: รูปเดียวเต็มกรอบ ชื่อสถานที่และวันที่ตัวบาง แต่ใหญ่และเข้มพออ่านง่าย
export default function Minimal({ d, shareUrl, text, photos, hidden }: FrameProps) {
  const [hero] = photos
  const show = (k: Parameters<typeof isShown>[1]) => isShown(hidden, k)

  return (
    <Sheet className="bg-white">
      <div className="flex h-full flex-col p-[6cqw]">
        <div className="relative flex min-h-0 flex-1 flex-col">
          {hero && <Pic photo={hero} className="min-h-0 w-full flex-1" />}
          {show('map') && d.pins.length > 0 && (
            <div className="absolute bottom-[3cqw] right-[3cqw] w-[30cqw] bg-white p-[1cqw] shadow-lg">
              <FrameMap d={d} className="aspect-[4/3] w-full" />
            </div>
          )}
        </div>
        <div className="mt-[5cqw] flex shrink-0 items-end justify-between gap-[4cqw]">
          <div className="min-w-0">
            <h2 className="font-display text-[9cqw] font-light leading-tight">{d.cities[0] ?? d.title}</h2>
            {show('date') && <p className="mt-[0.5cqw] font-display text-[4.2cqw] font-light tracking-[0.15em]">{fmtRange(d.startDate, d.endDate)}</p>}
            {show('text') && text && <p className="mt-[3cqw] line-clamp-3 text-[4.2cqw] leading-snug">{text}</p>}
          </div>
          {show('qr') && <CornerQr url={shareUrl} label={false} />}
        </div>
      </div>
    </Sheet>
  )
}
