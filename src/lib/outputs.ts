// ข้อมูลสำหรับ output 2 แบบ (การ์ดโซเชียล + กรอบรูป) แปลงจาก PassportData ที่ Agent 01–05 สร้างไว้
// รูป = รูปไฮไลต์ของ Passport (ชุดเดียวกับหน้า Passport), แผนที่ = หมุด pins ชุดเดียวกับหน้า Passport
import { THEMES } from './constants'
import type { MapPin, PassportData } from './types'

export const MAX_FRAME_TEXT = 100

export type OutputPhoto = { id: string; url: string; thumb: string; caption: string; day: number | null }

export type OutputData = {
  title: string
  startDate: string
  endDate: string
  days: number
  places: number
  distanceKm: number
  photoCount: number
  photos: OutputPhoto[]
  pins: MapPin[]
  cities: string[]
  shortText: string
  theme: (typeof THEMES)[string]
}

export function toOutputData(d: PassportData): OutputData {
  const cities = d.cities.length ? d.cities : d.destination ? [d.destination] : []
  return {
    title: d.tripTitle || d.tripName,
    startDate: d.startDate,
    endDate: d.endDate,
    days: d.tripDays,
    places: d.stats.places,
    distanceKm: Math.round(d.stats.distanceKm),
    photoCount: d.stats.photos,
    photos: d.highlights.map((h, i) => ({ id: String(i), url: h.url, thumb: h.thumb || h.url, caption: h.caption, day: h.day })),
    pins: d.pins,
    cities,
    shortText: (d.vibeQuote || '').slice(0, MAX_FRAME_TEXT),
    theme: THEMES[d.theme] ?? THEMES.ember,
  }
}

// ลิงก์หน้า Passport สาธารณะ (ใช้ใน QR) — HashRouter: <origin><path>#/p/<slug>
export function passportUrl(slug: string) {
  return `${window.location.origin}${window.location.pathname}#/p/${slug}`
}

// ตัวเลขสุ่มแบบคงที่จากข้อความ (มุมเอียงของรูป/ตราประทับไม่เปลี่ยนทุกครั้งที่วาด)
export function seeded(text: string, salt = 0) {
  let h = 2166136261 ^ salt
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return ((h >>> 0) % 10000) / 10000
}
