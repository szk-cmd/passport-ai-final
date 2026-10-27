import type { ComponentType } from 'react'
import Classic from './Classic'
import Minimal from './Minimal'
import PassportPage from './PassportPage'
import Polaroid from './Polaroid'
import type { FrameProps, InfoKey } from './shared'

export { DEFAULT_HIDDEN, INFO_LABELS, type FrameProps, type InfoKey } from './shared'

// แบบกรอบรูปทั้งหมด เพิ่มแบบใหม่ที่นี่ที่เดียว
// photos = จำนวนรูปที่เลือกได้ (รูปแรก = รูปใหญ่), info = ข้อมูลที่ผู้ใช้เปิด/ปิดได้
export const FRAMES: {
  id: string
  name: string
  Component: ComponentType<FrameProps>
  photos: { min: number; max: number }
  info: InfoKey[]
}[] = [
  { id: 'classic', name: 'คลาสสิก', Component: Classic, photos: { min: 1, max: 5 }, info: ['date', 'text', 'map', 'qr'] },
  { id: 'polaroid', name: 'โพลารอยด์', Component: Polaroid, photos: { min: 4, max: 6 }, info: ['date', 'captions', 'text', 'map', 'qr'] },
  { id: 'passport', name: 'พาสปอร์ต', Component: PassportPage, photos: { min: 1, max: 1 }, info: ['date', 'stats', 'text', 'stamps', 'map', 'qr'] },
  { id: 'minimal', name: 'มินิมอล', Component: Minimal, photos: { min: 1, max: 1 }, info: ['date', 'text', 'map', 'qr'] },
]

export function getFrame(id: string) {
  return FRAMES.find((f) => f.id === id) ?? FRAMES[0]
}

// ปรับรายการรูปให้พอดีกับแบบ: เกินตัดท้าย ขาดเติมจากรูปไฮไลต์ที่เหลือ
export function fitPhotoIds(allIds: string[], frameId: string, picked: string[]) {
  const { min, max } = getFrame(frameId).photos
  const valid = [...new Set(picked)].filter((id) => allIds.includes(id)).slice(0, max)
  const extra = allIds.filter((id) => !valid.includes(id))
  return [...valid, ...extra.slice(0, Math.max(0, min - valid.length))]
}
