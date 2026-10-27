import { fmtRange } from '../../../lib/format'
import { seeded } from '../../../lib/outputs'
import { CornerQr, FrameMap, isShown, Pic, Sheet, type FrameProps } from './shared'

// โพลารอยด์: รูป 4-6 รูปเอียงเล็กน้อย มีคำบรรยายใต้รูป
export default function Polaroid({ d, shareUrl, text, photos, hidden }: FrameProps) {
  const list = photos.slice(0, 6)
  const show = (k: Parameters<typeof isShown>[1]) => isShown(hidden, k)
  const threeCols = list.length > 4
  const card = 'bg-white shadow-[0_0.6cqw_1.6cqw_rgba(44,33,25,0.3)]'

  return (
    <Sheet className="bg-cream-200">
      <div className="flex h-full flex-col p-[6cqw]">
        <div className="shrink-0 text-center">
          <h2 className="font-display text-[8cqw] font-bold leading-tight">{d.title}</h2>
          {show('date') && <p className="text-[4cqw] font-medium">{fmtRange(d.startDate, d.endDate)}</p>}
        </div>

        <div className={`my-auto grid content-center gap-x-[4cqw] gap-y-[5cqw] py-[4cqw] ${threeCols ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {list.map((p, i) => (
            <figure key={p.id} className={`${card} p-[2cqw] pb-[1.5cqw]`} style={{ transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (1.5 + seeded(p.url) * 2.5)}deg)` }}>
              <Pic photo={p} className={`w-full ${threeCols ? 'aspect-square' : 'aspect-[4/3]'}`} />
              {show('captions') && (
                <figcaption className={`mt-[1.5cqw] line-clamp-2 text-center font-display font-medium leading-tight ${threeCols ? 'min-h-[7.5cqw] text-[3cqw]' : 'min-h-[9cqw] text-[3.6cqw]'}`}>
                  {p.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>

        <div className="flex shrink-0 items-end justify-between gap-[3cqw]">
          {show('map') && d.pins.length > 0 && (
            <div className={`${card} w-[25cqw] shrink-0 rotate-[-2deg] p-[1.5cqw]`}>
              <FrameMap d={d} className="aspect-[4/3] w-full" />
            </div>
          )}
          {show('text') && text ? <p className="line-clamp-3 font-display text-[4.6cqw] font-medium leading-snug">“{text}”</p> : <span />}
          {show('qr') && <CornerQr url={shareUrl} light="#EFE8DA" />}
        </div>
      </div>
    </Sheet>
  )
}
