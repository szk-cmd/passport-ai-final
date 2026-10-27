import TripMap from '../TripMap'
import type { MapPin } from '../../lib/types'

// แผนที่บน output ใช้ TripMap ตัวเดียวกับหน้า Passport (หมุดสีตามวัน เส้นประตามลำดับเวลา) แบบกดเลื่อนไม่ได้
export default function OutputMap({ pins, routeColor, className = '', markerScale = 1 }: { pins: MapPin[]; routeColor: string; className?: string; markerScale?: number }) {
  if (!pins.length) return null
  return (
    <div className={`${markerScale > 1 ? 'output-map-lg' : 'output-map'} overflow-hidden ${className}`}>
      <TripMap pins={pins} day="all" routeColor={routeColor} interactive={false} markerScale={markerScale} />
    </div>
  )
}
