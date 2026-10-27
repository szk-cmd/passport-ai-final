import QRCode from 'qrcode'
import { useEffect, useState } from 'react'

// QR สร้างในเบราว์เซอร์จากลิงก์เต็ม (เปลี่ยนตามโดเมนที่เปิดอยู่เอง)
export default function QrCode({ url, dark = '#2C2119', light = '#FFFFFF', className = '' }: { url: string; dark?: string; light?: string; className?: string }) {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    QRCode.toDataURL(url, { margin: 1, width: 600, color: { dark, light } }).then(setSrc)
  }, [url, dark, light])
  return (
    <div className={`aspect-square w-full ${className}`} style={{ background: light }}>
      {src && <img src={src} alt="QR code เปิดหน้า Passport" className="h-full w-full" />}
    </div>
  )
}
