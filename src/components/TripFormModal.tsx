import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { COMPANIONS, CURRENCIES, THEMES, TONES } from '../lib/constants'
import { addDays, todayISO } from '../lib/format'
import type { Trip } from '../lib/types'
import { Modal, Spinner } from './ui'

export default function TripFormModal({ open, onClose, trip, onSaved }: { open: boolean; onClose: () => void; trip?: Trip | null; onSaved: (t: Trip) => void }) {
  const [form, setForm] = useState({
    name: '', destination: '', start_date: todayISO(), end_date: addDays(todayISO(), 3),
    companion: 'friends', budget: '', home_currency: 'THB', tone: 'cute', theme: 'ember',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  // ผู้ใช้เลือกวันกลับเองแล้ว = ล็อกไว้ เปลี่ยนวันไปทีหลังจะไม่ไปแก้วันกลับ (เว้นแต่วันกลับอยู่ก่อนวันไป)
  const [endLocked, setEndLocked] = useState(false)

  useEffect(() => {
    if (!open) return
    setError('')
    setEndLocked(Boolean(trip))
    if (trip)
      setForm({
        name: trip.name, destination: trip.destination ?? '', start_date: trip.start_date, end_date: trip.end_date,
        companion: trip.companion, budget: trip.budget != null ? String(trip.budget) : '', home_currency: trip.home_currency,
        tone: trip.tone, theme: trip.theme,
      })
    else
      setForm((f) => ({ ...f, name: '', destination: '', budget: '', start_date: todayISO(), end_date: addDays(todayISO(), 3) }))
  }, [open, trip])

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }))

  // เปลี่ยนวันไป (เช่น เลือกวันย้อนหลัง): ยังไม่ได้เลือกวันกลับเอง → เลื่อนวันกลับตามให้จำนวนวันเท่าเดิม
  // ไม่ให้วันกลับค้างอยู่ที่วันนี้ +3 จนทริปย้อนหลังยาวมาถึงปัจจุบัน
  function setStart(v: string) {
    setForm((f) => {
      if (!v) return { ...f, start_date: v }
      const length = f.start_date && f.end_date >= f.start_date ? Math.round((Date.parse(f.end_date) - Date.parse(f.start_date)) / 86_400_000) : 3
      const end = !endLocked ? addDays(v, length) : f.end_date < v ? v : f.end_date
      return { ...f, start_date: v, end_date: end }
    })
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (form.end_date < form.start_date) return setError('วันกลับต้องไม่ก่อนวันไป')
    setBusy(true)
    setError('')
    const payload = {
      name: form.name.trim(), destination: form.destination.trim() || null, start_date: form.start_date, end_date: form.end_date,
      companion: form.companion, budget: form.budget ? Number(form.budget) : null, home_currency: form.home_currency,
      tone: form.tone, theme: form.theme,
    }
    const q = trip ? supabase.from('trips').update(payload).eq('id', trip.id) : supabase.from('trips').insert(payload)
    const { data, error } = await q.select().single()
    setBusy(false)
    if (error) return setError(error.message)
    onSaved(data as Trip)
  }

  return (
    <Modal open={open} onClose={onClose} title={trip ? 'แก้ไขทริป' : 'สร้างทริปใหม่ ✈️'} wide>
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">ชื่อทริป *</label>
            <input className="input" required value={form.name} onChange={(e) => set('name')(e.target.value)} placeholder="เช่น Kansai ใบไม้แดง 🍁" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">ปลายทาง</label>
            <input className="input" value={form.destination} onChange={(e) => set('destination')(e.target.value)} placeholder="เช่น โอซาก้า - เกียวโต, ญี่ปุ่น" />
          </div>
          <div>
            <label className="label">วันไป *</label>
            <input className="input" type="date" required value={form.start_date} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <label className="label">วันกลับ *</label>
            <input className="input" type="date" required min={form.start_date} value={form.end_date} onChange={(e) => { setEndLocked(true); set('end_date')(e.target.value) }} />
          </div>
          <div>
            <label className="label">งบประมาณ (ไม่บังคับ)</label>
            <input className="input" type="number" min="0" inputMode="decimal" value={form.budget} onChange={(e) => set('budget')(e.target.value)} placeholder="30000" />
          </div>
          <div>
            <label className="label">สกุลเงินหลัก (ใช้สรุปยอด)</label>
            <select className="input" value={form.home_currency} onChange={(e) => set('home_currency')(e.target.value)}>
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">ไปกับใคร</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(COMPANIONS).map(([k, c]) => (
              <button type="button" key={k} onClick={() => set('companion')(k)}
                className={`chip !px-3.5 !py-2 text-sm ring-1 transition ${form.companion === k ? 'bg-espresso text-cream ring-espresso' : 'bg-white ring-cream-300 hover:ring-ink-muted'}`}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">โทนการเล่าเรื่องของ AI</label>
            <select className="input" value={form.tone} onChange={(e) => set('tone')(e.target.value)}>
              {Object.entries(TONES).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">ธีมสีของ Passport</label>
            <div className="flex gap-2 pt-1">
              {Object.entries(THEMES).map(([k, t]) => (
                <button type="button" key={k} title={t.label} onClick={() => set('theme')(k)}
                  className={`h-9 w-9 rounded-full ring-offset-2 ring-offset-cream transition ${form.theme === k ? 'ring-2 ring-espresso' : ''}`}
                  style={{ background: `linear-gradient(135deg, ${t.primary} 50%, ${t.secondary} 50%)` }} />
              ))}
            </div>
          </div>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>ยกเลิก</button>
          <button className="btn-primary" disabled={busy}>{busy && <Spinner />}{trip ? 'บันทึก' : 'สร้างทริป'}</button>
        </div>
      </form>
    </Modal>
  )
}
