import { Link } from 'react-router-dom'
import { Stamp } from '../components/ui'

export default function NotFoundPassport() {
  return (
    <div className="grid min-h-screen place-items-center bg-espresso p-6 text-center text-cream">
      <div>
        <Stamp size={120} top="NOT" bottom="FOUND" className="mx-auto text-ember" />
        <h1 className="mt-6 text-2xl font-bold">ไม่พบ Passport นี้</h1>
        <p className="mt-2 text-cream/60">ลิงก์อาจไม่ถูกต้อง หรือเจ้าของปิดการแชร์ไปแล้ว</p>
        <Link to="/" className="btn-primary mt-6">ไปหน้าแรก Passport AI</Link>
      </div>
    </div>
  )
}
