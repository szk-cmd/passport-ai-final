import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { PassportRow } from './types'

// อ่าน Passport จาก slug: เจ้าของเห็นของตัวเองเสมอ คนอื่นเห็นเฉพาะที่เปิดแชร์สาธารณะ (RLS คุมให้)
// undefined = กำลังโหลด, null = ไม่พบ / ไม่มีสิทธิ์
export function usePassportBySlug(slug: string | undefined) {
  const [row, setRow] = useState<PassportRow | null | undefined>(undefined)
  useEffect(() => {
    if (!slug) return setRow(null)
    supabase
      .from('passports')
      .select('*')
      .eq('share_slug', slug)
      .maybeSingle()
      .then(({ data }) => setRow((data as PassportRow) ?? null))
  }, [slug])
  return row
}
