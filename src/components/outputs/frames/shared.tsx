import type { CSSProperties, ReactNode } from 'react'
import type { OutputData, OutputPhoto } from '../../../lib/outputs'
import OutputMap from '../OutputMap'
import QrCode from '../QrCode'

// ข้อมูลบนกรอบที่ผู้ใช้เปิด/ปิดได้ (แต่ละแบบประกาศว่ารองรับอะไรใน index.ts)
export type InfoKey = 'date' | 'text' | 'captions' | 'stats' | 'stamps' | 'map' | 'qr'

export const INFO_LABELS: Record<InfoKey, string> = {
  date: 'วันที่',
  text: 'ข้อความสั้น',
  captions: 'คำบรรยายใต้รูป',
  stats: 'สถิติทริป',
  stamps: 'ตราประทับ',
  map: 'แผนที่เส้นทาง',
  qr: 'QR โค้ด',
}

// ปิดไว้ตั้งแต่แรก ผู้ใช้กดเปิดเองถ้าอยากเพิ่ม
export const DEFAULT_HIDDEN: InfoKey[] = ['map']

// ทุกแบบรับ props ชุดเดียวกัน ใช้ทั้งตัวอย่างบนจอและตอนพิมพ์
export type FrameProps = {
  d: OutputData
  shareUrl: string
  text: string
  photos: OutputPhoto[] // รูปตามลำดับที่ผู้ใช้เลือก รูปแรก = รูปใหญ่
  hidden: InfoKey[]
}

export const isShown = (hidden: InfoKey[], key: InfoKey) => !hidden.includes(key)

// แผ่น A4 แนวตั้ง ขนาดทุกอย่างข้างในใช้หน่วย cqw (% ของความกว้างแผ่น) ย่อ/ขยายได้ทั้งแผ่น
// class a4-sheet: ตอนพิมพ์ขยายเป็น 210mm พอดี
export function Sheet({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`a4-sheet relative aspect-[210/297] w-full overflow-hidden text-espresso ${className}`} style={{ containerType: 'inline-size', ...style }}>
      {children}
    </div>
  )
}

export function Pic({ photo, className = '' }: { photo: OutputPhoto; className?: string }) {
  return <img src={photo.url} alt={photo.caption} crossOrigin="anonymous" className={`block object-cover ${className}`} />
}

export function FrameMap({ d, className = '' }: { d: OutputData; className?: string }) {
  if (!d.pins.length) return null
  return <OutputMap pins={d.pins} routeColor={d.theme.secondary} className={`rounded-[1cqw] ${className}`} />
}

export function CornerQr({ url, light = '#FFFFFF', label = true }: { url: string; light?: string; label?: boolean }) {
  return (
    <div className="flex shrink-0 items-end gap-[1.5cqw]">
      {label && (
        <p className="text-right text-[2.6cqw] font-medium leading-snug">
          สแกนดู
          <br />
          เรื่องราว
        </p>
      )}
      <div className="w-[13cqw]">
        <QrCode url={url} light={light} />
      </div>
    </div>
  )
}
