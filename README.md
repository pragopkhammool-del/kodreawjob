# กดแล้วจบ — Kodraewjob Digital Marketplace

แพลตฟอร์ม E-Commerce และชุมชนผู้ใช้งานสไตล์โซเชียลสำหรับจำหน่ายและแจกฟรีไฟล์ Excel Template พร้อมสูตรครบถ้วน, Google Sheets, VBA Automation, AppSheet และเครื่องมือ AI แก้โจทย์คำนวณวิศวกรรม (AI Solver)

## โครงสร้างหลักของระบบ (Full-Stack Architecture)
- **Frontend**: React 19 + TypeScript + Tailwind CSS v4 (โทนสี Orange Light Pastel พร้อม Dark Mode และ Responsive 375px / 768px / 1440px)
- **Community Forum (`/forum`)**: ฟอรั่มชุมชนแบบเรียลไทม์บน Firebase Firestore รองรับโพสต์ คอมเมนต์ รีแอคชั่น 5 อารมณ์ อัปโหลดรูปภาพ อัปไฟล์เสียง/อัดเสียงผ่านไมโครโฟน สร้างเพจ (Pages) สร้างและเข้าร่วมกลุ่ม (Groups) และส่งข้อความแชท 1-ต่อ-1 (Messenger)
- **Backend**: Express + TypeScript (`server.ts`)
- **Database**: Cloud SQL for PostgreSQL + Drizzle ORM (`src/db/schema.ts`, `src/db/seed.ts`) พร้อมระบบนับผู้เข้าชมแบบไม่นับซ้ำจากการรีเฟรช (`site_visitors`)
- **Authentication**: Firebase Authentication (Google Sign-In + Bearer Token Verification)
- **AI Engine**: `@google/genai` สำหรับ AI Solver, AI Assistant และ Admin AI Studio
- **Payment & Files**: EMVCo Dynamic Thai PromptPay QR (`src/services/promptpay.ts`) + Login-Gated Tokenized Excel Download (`src/services/excelGenerator.ts`)

## คู่มือผู้ดูแลระบบ (Admin Guide)
1. เข้าสู่ระบบด้วยบัญชีผู้ดูแล (`pragopkhammool@gmail.com`) แล้วเปิดเมนู **จัดการระบบ (Admin)** (`/admin`)
2. **ภาพรวม & กราฟ**: ตรวจสอบยอดขาย ออเดอร์ ยอดดาวน์โหลด และกด **Export รายงานยอดขาย (.xlsx)** ได้ทันที
3. **จัดการสินค้า & AI Studio**: เพิ่มสินค้าใหม่ อัปโหลดไฟล์ `.xlsx/.xlsm` (สูงสุด 50MB) หรือกดปุ่ม AI Studio เพื่อสร้างคำอธิบาย จุดเด่น และสคริปต์วิดีโอโปรโมทอัตโนมัติ
4. **คำสั่งซื้อ & อนุมัติสลิป**: ตรวจสอบคำสั่งซื้อและกดอนุมัติการชำระเงินเพื่อปลดล็อกลิงก์ดาวน์โหลดให้ลูกค้า
5. **ตั้งค่า PromptPay**: กำหนดหมายเลขพร้อมเพย์สำหรับสร้าง QR Code พร้อมยอดเงินอัตโนมัติ

## สิทธิ์การใช้งานไฟล์และการดาวน์โหลด
- ผู้ใช้งานต้องเข้าสู่ระบบก่อนดาวน์โหลดไฟล์ `.xlsx` ทุกไฟล์ (ทั้งไฟล์ฟรี 19 รายการและไฟล์ชำระเงิน)
- ไฟล์มาตรฐาน (99 บาท) และขั้นสูง (199-299 บาท) เมื่อชำระเงินแล้วระบบจะออก `downloadToken` ที่มีอายุ 24 ชั่วโมงและบันทึกประวัติลงตาราง `download_logs`

© 2027 Kodraewjob Digital Marketplace. สงวนลิขสิทธิ์ทุกประการ By Art Kitthana2027
