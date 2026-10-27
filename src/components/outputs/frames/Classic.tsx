import { fmtRange } from '../../../lib/format'
import { CornerQr, FrameMap, isShown, Pic, Sheet, type FrameProps } from './shared'

// คลาสสิก: รูปใหญ่ 1 + รูปเล็กสูงสุด 4 ชื่อทริปและวันที่ด้านล่าง
export default function Classic({ d, shareUrl, text, photos, hidden }: FrameProps) {
  const [hero, ...rest] = photos
  const small = rest.slice(0, 4)
  const show = (k: Parameters<typeof isShown>[1]) => isShown(hidden, k)

  return (
    <Sheet className="bg-cream">
      <div className="flex h-full flex-col border-[2.5cqw] p-[3cqw]" style={{ borderColor: d.theme.primary }}>
        <div className="flex h-full flex-col border-[0.4cqw] p-[3.5cqw]" style={{ borderColor: d.theme.accent }}>
          {hero && <Pic photo={hero} className="min-h-0 w-full flex-1 rounded-[1.2cqw]" />}
          {small.length > 0 && (
            <div className="mt-[2cqw] flex shrink-0 justify-center gap-[2cqw]">
              {small.map((p) => (
                <Pic key={p.id} photo={p} className="aspect-square w-[calc((100%-6cqw)/4)] rounded-[1cqw]" />
              ))}
            </div>
          )}
          {show('map') && <FrameMap d={d} className="mt-[2cqw] h-[24cqw] shrink-0" />}
          {show('text') && text && (
            <p className="mt-[3.5cqw] line-clamp-3 shrink-0 text-center font-display text-[5cqw] font-medium leading-snug">“{text}”</p>
          )}
          <div className="mt-[3.5cqw] flex shrink-0 items-end justify-between gap-[3cqw] border-t-[0.4cqw] border-espresso/25 pt-[3cqw]">
            <div className="min-w-0">
              <h2 className="font-display text-[8cqw] font-bold leading-tight">{d.title}</h2>
              {show('date') && <p className="text-[4cqw] font-medium">{fmtRange(d.startDate, d.endDate)}</p>}
            </div>
            {show('qr') && <CornerQr url={shareUrl} light="#F8F5EF" />}
          </div>
        </div>
      </div>
    </Sheet>
  )
}
