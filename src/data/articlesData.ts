export type ArticleSectionGroup = 'latest' | 'recommended';

export interface ArticleStep {
  stepNumber: number;
  title: string;
  detail: string;
  subPoints?: string[];
  command?: string;
  tip?: string;
}

export interface ArticleTable {
  caption: string;
  headers: string[];
  rows: string[][];
}

export interface ArticleContentSection {
  id: string;
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  steps?: ArticleStep[];
  table?: ArticleTable;
  commandBlock?: {
    label: string;
    code: string;
  };
  callout?: {
    title: string;
    body: string;
    variant: 'tip' | 'warning';
  };
}

export interface ArticleItem {
  slug: string;
  section: ArticleSectionGroup;
  category: string;
  title: string;
  date: string;
  readTime: string;
  author: string;
  views: string;
  coverImage: string;
  summary: string;
  highlights: string[];
  contentSections: ArticleContentSection[];
  relatedAction?: {
    label: string;
    path: string;
  };
}

export const ARTICLES_DATA: ArticleItem[] = [
  // ==================== บทความล่าสุด (4 บทความ) ====================
  {
    slug: 'cloud-server-free-tier-2026',
    section: 'latest',
    category: 'Cloud & Server',
    title: 'Cloud Server ฟรี คืออะไร? แนะนำ 4 Free Tier ที่น่าใช้งานที่สุดในปี 2026',
    date: '25 พฤศจิกายน 2026',
    readTime: '7 นาที',
    author: 'ทีมวิชาการ กดแล้วจบ',
    views: "84",
    coverImage: '/src/assets/images/blog_cloud_server_freetier_1795744393436.jpg',
    summary:
      'ทำความเข้าใจ Cloud Server แบบ Free Tier ทั้ง Always Free และ Free Trial พร้อมเทียบสเปก CPU, RAM, Bandwidth ของ 4 ผู้ให้บริการระดับโลกแบบละเอียด',
    highlights: [
      'เข้าใจความแตกต่างระหว่าง Always Free (ฟรีตลอดชีพ) กับ Free Trial (เครดิตทดลองใช้)',
      'เปรียบเทียบ 4 ค่ายใหญ่: Oracle Cloud, Google Cloud, AWS และ Cloudflare / Vercel',
      'วิธีตั้งค่า Budget Alert ป้องกันบิลค่าใช้จ่ายเด้งโดยไม่รู้ตัว',
    ],
    contentSections: [
      {
        id: 'what-is-cloud-free-tier',
        heading: 'Cloud Server ฟรี (Free Tier) คืออะไร?',
        paragraphs: [
          'Cloud Server คือเครื่องเซิร์ฟเวอร์เสมือน (Virtual Machine / VPS) หรือระบบประมวลผลบนอินเทอร์เน็ตที่เราสามารถเช่าใช้เพื่อรันเว็บไซต์, API, ระบบ ERP หรือฐานข้อมูลออนไลน์ได้ตลอด 24 ชั่วโมงโดยไม่ต้องซื้อเครื่องเซิร์ฟเวอร์จริงมาตั้งเอง',
          'ผู้ให้บริการ Cloud ระดับโลกหลายรายเปิดโหมด "Free Tier" ให้บุคคลทั่วไป นักพัฒนา และธุรกิจ SME เข้ามาทดลองใช้งานได้ฟรี ซึ่งแบ่งออกเป็น 2 รูปแบบหลักที่ต้องแยกให้ออกก่อนสมัครใช้งาน:',
        ],
        bullets: [
          'Always Free (ฟรีถาวรตามโควตา): ใช้งานได้ต่อเนื่องไม่มีวันหมดอายุตราบใดที่ยังใช้ทรัพยากรไม่เกินเพดานที่กำหนด เช่น RAM 1 GB, Storage 30 GB',
          'Free Trial (เครดิตทดลองใช้): มอบเครดิตเงินจำลองให้ใช้ฟรีช่วงแรก (เช่น $200 – $300 ใน 30–90 วัน) เมื่อหมดเครดิตหรือหมดระยะเวลาจะเริ่มคิดค่าบริการจริงหากไม่ปิดเครื่อง',
        ],
      },
      {
        id: 'compare-4-free-tiers',
        heading: 'เปรียบเทียบ 4 Cloud Free Tier ที่น่าใช้งานที่สุดในปี 2026',
        table: {
          caption: 'ตารางเปรียบเทียบสเปก Always Free และข้อควรระวังของแต่ละค่าย',
          headers: ['ผู้ให้บริการ', 'สเปกฟรีเด่น (Always Free)', 'Bandwidth ออกเน็ต', 'เหมาะกับงานแบบไหน'],
          rows: [
            [
              'Oracle Cloud (OCI)',
              'ARM Ampere สูงสุด 4 vCPU + RAM 24 GB + Storage 200 GB (และ AMD 2 เครื่องเล็ก)',
              '10 TB / เดือน',
              'โฮสต์ระบบ ERP, Docker, Database, Web App เต็มรูปแบบ คุ้มที่สุด',
            ],
            [
              'Google Cloud (GCP)',
              'e2-micro (2 vCPU shared, 1 GB RAM) + HDD 30 GB (โซน US ที่กำหนด)',
              '1 GB / เดือน (US)',
              'รันสคริปต์อัตโนมัติ, Line Bot, API ขนาดเล็ก เชื่อมต่อง่ายกับ Firebase',
            ],
            [
              'Amazon AWS',
              'EC2 t2.micro / t3.micro ฟรี 750 ชม./เดือน (เฉพาะ 12 เดือนแรก) + Lambda ฟรีถาวร',
              '100 GB / เดือน',
              'ฝึกสกิล Cloud ระดับองค์กร, รัน Serverless Lambda และ S3 เก็บไฟล์',
            ],
            [
              'Cloudflare Workers / Pages',
              '100,000 Requests/วัน + D1 SQLite 5 GB + R2 Storage 10 GB ฟรีถาวร',
              'ไม่จำกัด Bandwidth (Pages)',
              'เว็บองค์กร, Frontend React/Vite, API Edge ความเร็วสูง ไม่ต้องดูแล OS',
            ],
          ],
        },
      },
      {
        id: 'step-by-step-launch',
        heading: 'ขั้นตอนเริ่มต้นเปิดใช้งาน Cloud Server ฟรีอย่างปลอดภัยใน 5 ขั้นตอน',
        steps: [
          {
            stepNumber: 1,
            title: 'เตรียมบัตรเดบิต/เครดิตสำหรับยืนยันตัวตน (KYC)',
            detail:
              'ผู้ให้บริการ Cloud เกือบทุกค่าย (ยกเว้น Cloudflare สำหรับแผนพื้นฐาน) จะขอยืนยันตัวตนด้วยบัตรที่มีวงเงินจริงประมาณ 35–40 บาท และจะคืนวงเงินให้ภายหลังเพื่อป้องกันการสมัครบัญชีสแปม',
          },
          {
            stepNumber: 2,
            title: 'เลือก Region ให้อยู่ใกล้ผู้ใช้งานจริงและอยู่ในเงื่อนไขฟรี',
            detail:
              'สำหรับผู้ใช้งานในไทย หากใช้แพ็กเกจฟรีแบบเสียบ Region เฉพาะ (เช่น GCP Always Free ที่จำกัดเฉพาะ us-west1, us-central1, us-east1) ต้องเลือกให้ตรงโซน มิฉะนั้นจะถูกคิดค่าบริการ',
          },
          {
            stepNumber: 3,
            title: 'ตั้งค่า SSH Key และปิดการล็อกอินด้วยรหัสผ่าน',
            detail:
              'ดาวน์โหลดไฟล์ Private Key (.pem / .key) เก็บไว้ให้ปลอดภัย และเปิดเฉพาะพอร์ตที่จำเป็นใน Firewall / Security Group ได้แก่พอร์ต 22 (SSH), 80 (HTTP) และ 443 (HTTPS)',
          },
          {
            stepNumber: 4,
            title: 'สร้าง Billing Alert แจ้งเตือนทันทีหากค่าใช้จ่ายเกิน 1 ดอลลาร์',
            detail:
              'เข้าไปที่เมนู Billing & Cost Management แล้วตั้ง Budget Threshold ไว้ที่ $1 หรือ 35 บาท เพื่อรับอีเมลแจ้งเตือนทันทีหากเผลอเปิดบริการนอกโควตาฟรี',
            tip: 'แนะนำตั้ง 2FA (Two-Factor Authentication) ทันทีหลังสมัคร เพื่อป้องกันแฮกเกอร์ขโมยบัญชีไปขุดบิตคอยน์จนเกิดบิลค่าเช่ามหาศาล',
          },
          {
            stepNumber: 5,
            title: 'อัปเดตแพ็กเกจระบบปฏิบัติการและติดตั้ง Firewall',
            detail: 'เมื่อล็อกอินเข้า Ubuntu Server ครั้งแรก ให้รันคำสั่งอัปเดตความปลอดภัยและเปิด UFW ทันที',
            command: 'sudo apt update && sudo apt upgrade -y && sudo ufw allow OpenSSH && sudo ufw allow 80,443/tcp && sudo ufw enable',
          },
        ],
      },
    ],
    relatedAction: {
      label: 'ดูระบบ Web App ERP 20 ระบบพร้อมใช้บน Cloud',
      path: '/webapp',
    },
  },
  {
    slug: 'add-watermark-pdf-5-steps-adobe-acrobat',
    section: 'latest',
    category: 'PDF & เอกสาร',
    title: 'วิธีใส่ลายน้ำ PDF ง่ายๆ ใน 5 ขั้นตอน ด้วย Adobe Acrobat',
    date: '23 พฤศจิกายน 2026',
    readTime: '4 นาที',
    author: 'ทีมวิชาการ กดแล้วจบ',
    views: "42",
    coverImage: '/src/assets/images/blog_pdf_watermark_guide_1795744395016.jpg',
    summary:
      'สอนวิธีประทับตราลายน้ำ (Watermark) ทั้งแบบข้อความ "สำเนาถูกต้อง / ห้ามคัดลอก" และแบบโลโก้บริษัทลงในไฟล์ PDF ด้วย Adobe Acrobat พร้อมตั้งค่าความโปร่งใสและตำแหน่งครบถ้วน',
    highlights: [
      'ใส่ได้ทั้งลายน้ำข้อความภาษาไทยและไฟล์รูปภาพโลโก้บริษัท (.png พื้นหลังโปร่งใส)',
      'ปรับความโปร่งใส (Opacity) องศาเอียง และเลือกช่วงหน้าที่ต้องการใส่ได้',
      'บันทึกเป็น Preset ไว้ใช้ซ้ำกับใบเสนอราคาและเอกสารสำคัญได้ในคลิกเดียว',
    ],
    contentSections: [
      {
        id: 'why-watermark',
        heading: 'ทำไมเอกสารธุรกิจถึงควรใส่ลายน้ำก่อนส่งไฟล์ PDF',
        paragraphs: [
          'ในการส่งใบเสนอราคา, เอกสารสัญญา, แบบแปลน, หรือสำเนาบัตรประชาชนผ่านช่องทางออนไลน์ การใส่ลายน้ำ (Watermark) ช่วยระบุความเป็นเจ้าของ ป้องกันการนำไปแอบอ้างใช้งานผิดวัตถุประสงค์ และแสดงสถานะเอกสารอย่างชัดเจน เช่น "DRAFT", "CONFIDENTIAL" หรือ "ใช้สำหรับยื่นสมัครงานเท่านั้น"',
        ],
      },
      {
        id: 'five-steps-acrobat',
        heading: '5 ขั้นตอนใส่ลายน้ำ PDF ด้วย Adobe Acrobat (ฉบับทำตามได้ทันที)',
        steps: [
          {
            stepNumber: 1,
            title: 'เปิดไฟล์ PDF และเลือกเครื่องมือ Edit PDF',
            detail:
              'เปิดไฟล์ PDF ที่ต้องการในโปรแกรม Adobe Acrobat จากนั้นคลิกที่แท็บ All Tools (หรือ Tools ด้านบน) แล้วเลือกเมนู Edit a PDF / Edit PDF',
          },
          {
            stepNumber: 2,
            title: 'เข้าสู่เมนู Watermark → Add',
            detail:
              'ในแถบเครื่องมือด้านซ้ายหรือด้านบน คลิกที่หัวข้อ More → Watermark → Add... เพื่อเปิดหน้าต่างตั้งค่าลายน้ำ',
          },
          {
            stepNumber: 3,
            title: 'เลือกรูปแบบลายน้ำ: ข้อความ (Text) หรือ โลโก้รูปภาพ (File)',
            detail: 'คุณสามารถเลือกใส่ได้ 2 รูปแบบตามลักษณะงาน:',
            subPoints: [
              'Text: พิมพ์ข้อความที่ต้องการ เช่น "เอกสารลับเฉพาะ" หรือ "สำเนาถูกต้อง" เลือกฟอนต์ภาษาไทยที่รองรับ (เช่น TH Sarabun New หรือ Tahoma) และปรับขนาดตัวอักษร',
              'File: กด Browse... เพื่อเลือกไฟล์โลโก้ของบริษัท แนะนำใช้ไฟล์ .PNG พื้นหลังโปร่งใส เพื่อความสวยงามไม่บังตัวหนังสือในเอกสาร',
            ],
          },
          {
            stepNumber: 4,
            title: 'ปรับความโปร่งใส องศา และตำแหน่ง (Appearance & Position)',
            detail: 'ตั้งค่าให้ลายน้ำอ่านง่ายแต่ไม่รบกวนเนื้อหาหลักของเอกสารตามค่าแนะนำนี้:',
            subPoints: [
              'Rotation (การเอียง): ตั้ง 45 องศา แบบทแยงมุมกลางหน้ากระดาษ',
              'Opacity (ความโปร่งใส): ปรับไว้ที่ 20% – 35% จะดูสุภาพและอ่านข้อความด้านหลังได้ชัด',
              'Location: เลือก Appear behind page เพื่อให้ลายน้ำซ้อนอยู่ด้านหลังตัวอักษร (ไม่บังตารางและตัวเลข)',
              'Page Range Options (มุมขวาบน): กำหนดให้ใส่ทุกหน้า หรือเลือกเฉพาะบางหน้าได้',
            ],
          },
          {
            stepNumber: 5,
            title: 'กด Save Settings (ถ้าใช้บ่อย) แล้วกด OK เพื่อบันทึกไฟล์',
            detail:
              'หากต้องใช้ลายน้ำเดิมซ้ำกับเอกสารชุดอื่น ให้กดปุ่ม Save Settings... ด้านบนเพื่อเก็บเป็นค่ามาตรฐาน แล้วกด OK จากนั้นกด File → Save As เพื่อบันทึกเป็นไฟล์ PDF ฉบับใส่ลายน้ำเรียบร้อย',
            tip: 'หากต้องการลบหรือแก้ไขลายน้ำในภายหลัง ให้กลับมาที่เมนู Watermark → Update หรือ Remove ได้ทันทีตราบใดที่ยังไม่ได้สั่ง Flatten PDF',
          },
        ],
      },
      {
        id: 'acrobat-shortcuts',
        heading: 'ข้อควรระวังเมื่อส่งไฟล์ที่มีลายน้ำให้ลูกค้า',
        callout: {
          title: 'ป้องกันการลบลายน้ำออกด้วย Security Password',
          body: 'หากเป็นไฟล์สำคัญมาก ควรตั้งรหัสผ่านป้องกันการแก้ไข (Protect a PDF → Restrict Editing) ใน Adobe Acrobat ร่วมด้วย เพื่อไม่ให้ผู้รับเปิดเข้ามาลบ Watermark ออกได้ง่ายๆ',
          variant: 'warning',
        },
      },
    ],
    relatedAction: {
      label: 'ทดลองออกใบเสนอราคา / ใบแจ้งหนี้ PDF ฟรี',
      path: '/webapps-demo?app=invoice',
    },
  },
  {
    slug: 'synology-vs-qnap-nas-2026',
    section: 'latest',
    category: 'IT Infrastructure',
    title: 'Synology vs QNAP เลือก NAS ตัวไหนดีสำหรับองค์กร (เทียบจากการใช้งานจริง ปี 2026)',
    date: '20 พฤศจิกายน 2026',
    readTime: '8 นาที',
    author: 'ทีมวิชาการ กดแล้วจบ',
    views: "69",
    coverImage: '/src/assets/images/blog_nas_storage_office_1795744395134.jpg',
    summary:
      'เจาะลึกข้อดีข้อเสียระหว่าง Synology และ QNAP ทั้งด้านซอฟต์แวร์ (DSM vs QTS), สเปกฮาร์ดแวร์, การป้องกัน Ransomware, ระบบสำรองข้อมูล 3-2-1 และความคุ้มค่าต่อราคาในปี 2026',
    highlights: [
      'เปรียบเทียบ OS (DSM vs QTS/QuTS hero) ความเสถียรและความยากง่ายในการดูแล',
      'เทียบสเปกพอร์ต 2.5GbE / 10GbE และข้อกำหนดเรื่อง Hard Disk Compatibility',
      'สรุปคำแนะนำ: องค์กรแบบไหนควรเลือก Synology และแบบไหนเหมาะกับ QNAP',
    ],
    contentSections: [
      {
        id: 'nas-overview',
        heading: 'ทำไมองค์กรปี 2026 ยังต้องมี NAS (Network Attached Storage)',
        paragraphs: [
          'แม้บริการ Cloud Drive อย่าง Google Workspace หรือ OneDrive จะสะดวก แต่เมื่อองค์กรมีไฟล์งานขนาดใหญ่ (ไฟล์ออกแบบ, วิดีโอ, แบบ CAD, ฐานข้อมูลบัญชี และไฟล์ Excel สำคัญหลายสิบ GB) การจ่ายค่าเช่า Cloud รายเดือนสำหรับพนักงานหลายคนจะแพงขึ้นเรื่อยๆ',
          'NAS จึงทำหน้าที่เป็น "คลาวด์ส่วนตัวภายในออฟฟิศ" ที่เข้าถึงผ่าน LAN ความเร็วสูงได้ทันที ควบคุมสิทธิ์การเข้าถึงระดับโฟลเดอร์ได้ละเอียด และมีระบบ Snapshot ป้องกันไวรัสเรียกค่าไถ่ (Ransomware)',
        ],
      },
      {
        id: 'synology-vs-qnap-table',
        heading: 'ตารางเปรียบเทียบ Synology vs QNAP จากการใช้งานจริงในองค์กร',
        table: {
          caption: 'เปรียบเทียบ 6 มิติสำคัญสำหรับการตัดสินใจจัดซื้อเข้าองค์กร',
          headers: ['หัวข้อเปรียบเทียบ', 'Synology (DSM 7.2+)', 'QNAP (QTS / QuTS hero)'],
          rows: [
            [
              'ความเสถียรและหน้าตา UI',
              'ใช้ง่ายมาก เสถียรสูง เหมาะกับบริษัทที่ไม่มีทีม IT ประจำ',
              'ฟีเจอร์เยอะ ละเอียด เหมาะกับทีม IT ที่ชอบปรับแต่งลึก',
            ],
            [
              'สเปกฮาร์ดแวร์ต่อราคา',
              'สเปก CPU/พอร์ต LAN ให้มาพอดีตัว (หลายรุ่นยังต้องซื้อการ์ด 10GbE เพิ่ม)',
              'จัดเต็มกว่าในราคาเท่ากัน มักได้พอร์ต 2.5GbE และสล็อต M.2 NVMe มาเลย',
            ],
            [
              'ซอฟต์แวร์สำรองข้อมูล',
              'Active Backup for Business (ฟรีถาวร ไม่ต้องซื้อ License เพิ่ม)',
              'Hybrid Backup Sync (HBS 3) รองรับ Cloud หลากหลายเจ้ามาก',
            ],
            [
              'แอปทำงานร่วมกัน (Office)',
              'Synology Drive + Synology Office ใช้งานแทน Google Drive ได้ลื่นมาก',
              'Qsync + File Station เน้นซิงค์ไฟล์และจัดการสื่อมัลติมีเดีย',
            ],
            [
              'ข้อจำกัดเรื่องฮาร์ดดิสก์',
              'รุ่นระดับองค์กร/Rack เริ่มบังคับใช้ HDD ของ Synology เองมากขึ้น',
              'ยืดหยุ่นกว่า รองรับ HDD/SSD หลากหลายแบรนด์ (Seagate, WD, Toshiba)',
            ],
            [
              'การรับประกัน & ซัพพอร์ตในไทย',
              'ศูนย์ตัวแทนในไทยแข็งแรง เปลี่ยนเคลมไว',
              'ตัวแทนจำหน่ายในไทยมีหลายราย อะไหล่และรุ่นให้เลือกเยอะ',
            ],
          ],
        },
      },
      {
        id: 'decision-guide',
        heading: 'สรุป: องค์กรของคุณควรเลือกซื้อยี่ห้อไหนดี?',
        steps: [
          {
            stepNumber: 1,
            title: 'เลือก Synology เมื่อเน้นความเสถียร ใช้งานง่าย และ Backup เครื่องพนักงานฟรี',
            detail:
              'หากบริษัทมีพนักงาน 5–100 คน ต้องการแชร์ไฟล์ Excel/เอกสาร, ซิงค์งานนอกสถานที่ด้วย Synology Drive และอยากได้ระบบ Backup คอมพิวเตอร์ Windows/Mac ทุกเครื่องอัตโนมัติโดยไม่ต้องเสียค่า License รายปี แนะนำซีรีส์ Plus เช่น DS923+ หรือ DS1522+',
          },
          {
            stepNumber: 2,
            title: 'เลือก QNAP เมื่อต้องการความแรงต่อราคา งานตัดต่อวิดีโอ 4K/8K และพอร์ต 2.5GbE/10GbE',
            detail:
              'หากเป็นบริษัทโปรดักชั่น ครีเอทีฟ หรือมีทีม IT ที่ต้องการทำ Virtual Machine (VM), Docker และต้องการพอร์ตเครือข่ายความเร็วสูงโดยไม่อยากจ่ายเพิ่มค่าอัปเกรดการ์ดแลน รวมถึงต้องการเลือกยี่ห้อฮาร์ดดิสก์ได้อิสระ QNAP ซีรีส์ TS-x64 หรือ TVS-h ให้ความคุ้มค่าสูงกว่า',
          },
          {
            stepNumber: 3,
            title: 'อย่าลืมตั้งค่า Immutable Snapshot และกฎสำรองข้อมูล 3-2-1',
            detail:
              'ไม่ว่าจะเลือกยี่ห้อไหน ห้ามคิดว่าทำ RAID 5/RAID 10 แล้วข้อมูลจะปลอดภัย 100% ควรเปิดใช้ Snapshot แบบล็อกเวลาห้ามลบ (WriteOnce / Immutable) และซิงค์ข้อมูลสำคัญออกไปยัง External HDD หรือ Cloud อีกชุดเสมอ',
          },
        ],
      },
    ],
  },
  {
    slug: 'fix-slow-internet-one-pc-8-steps',
    section: 'latest',
    category: 'Network & Windows',
    title: 'วิธีแก้เน็ตช้าเฉพาะบางเครื่อง เครื่องอื่นเร็วปกติ (ไล่เช็ก 8 ขั้นตอน)',
    date: '18 พฤศจิกายน 2026',
    readTime: '6 นาที',
    author: 'ทีมวิชาการ กดแล้วจบ',
    views: "95",
    coverImage: '/src/assets/images/blog_windows_network_fix_1795744394814.jpg',
    summary:
      'ปัญหาโลกแตกในออฟฟิศและที่บ้าน: มือถือหรือเครื่องข้างๆ วิ่งเต็มสปีด แต่คอมพิวเตอร์ของเราโหลดช้า หมุนติ้ว หรือปิงสูง ไล่ตรวจและแก้ตาม 8 ขั้นตอนนี้หายขาดใน 10 นาที',
    highlights: [
      'แยกแยะอาการเบื้องต้น: ช้าจาก Wi-Fi 2.4GHz, สาย LAN วิ่งแค่ 100 Mbps, หรือ Windows Update แอบโหลด',
      'ชุดคำสั่ง CMD ล้างแคช DNS และรีเซ็ต Winsock / TCP-IP ที่ใช้งานได้จริง',
      'วิธีเปลี่ยน DNS เป็น Cloudflare (1.1.1.1) และเช็กโปรแกรมแอบดึง Bandwidth',
    ],
    contentSections: [
      {
        id: 'diagnose-8-steps',
        heading: 'ไล่เช็กและแก้ไขเน็ตช้าเฉพาะเครื่องตามลำดับ 8 ขั้นตอน',
        steps: [
          {
            stepNumber: 1,
            title: 'เช็กคลื่น Wi-Fi ว่าเกาะ 2.4 GHz หรือ 5 GHz (สำหรับโน้ตบุ๊ก/PC Wi-Fi)',
            detail:
              'คลื่น 2.4 GHz มักทำความเร็วได้แค่ 40–70 Mbps และถูกรบกวนง่าย หากเราเตอร์ปล่อย 2 ชื่อ ให้สลับไปเกาะสัญญาณ 5 GHz (5G) จะได้ความเร็ว 300–800 Mbps ทันที',
          },
          {
            stepNumber: 2,
            title: 'ตรวจสอบสาย LAN ว่าวิ่งที่ Link Speed 1000 Mbps หรือตกลงเหลือ 100 Mbps',
            detail:
              'คลิกขวาที่ไอคอนเน็ต → Network & Internet settings → Properties ดูตรง Link speed (Receive/Transmit) หากขึ้น 100/100 Mbps ทั้งที่ใช้เน็ต 500–1000 Mbps แปลว่าสาย LAN (ต่ำกว่า Cat5e), หัว RJ45 หลวม หรือพอร์ต Switch เก่า ให้ลองถอดเสียบใหม่หรือเปลี่ยนสาย Cat6',
          },
          {
            stepNumber: 3,
            title: 'เปิด Task Manager ดูว่ามีโปรแกรมแอบดึง Bandwidth อยู่หรือไม่',
            detail:
              'กด Ctrl + Shift + Esc เปิด Task Manager → คลิกหัวคอลัมน์ Network เพื่อเรียงจากมากไปน้อย บ่อยครั้งที่ Windows Update, OneDrive Sync, Steam หรือ Adobe Creative Cloud กำลังโหลดไฟล์ขนาดใหญ่เบื้องหลัง',
          },
          {
            stepNumber: 4,
            title: 'ล้างแคช DNS และรีเซ็ต Network Stack ด้วย Command Prompt (Admin)',
            detail: 'เปิด Start พิมพ์ cmd คลิกขวาเลือก Run as administrator แล้ววางคำสั่งชุดนี้ทีละบรรทัด จากนั้นรีสตาร์ทเครื่อง 1 ครั้ง:',
            command: 'ipconfig /flushdns\nnetsh winsock reset\nnetsh int ip reset',
          },
          {
            stepNumber: 5,
            title: 'เปลี่ยน DNS เป็น 1.1.1.1 (Cloudflare) หรือ 8.8.8.8 (Google)',
            detail:
              'บางครั้ง DNS ของค่ายเน็ตตอบสนองช้า ทำให้เปิดเว็บติดๆ ดับๆ เข้า Control Panel → Network Connections → คลิกขวาการ์ดแลน/Wi-Fi → Properties → Internet Protocol Version 4 (TCP/IPv4) แล้วตั้ง Preferred DNS เป็น 1.1.1.1 และ Alternate เป็น 8.8.8.8',
          },
          {
            stepNumber: 6,
            title: 'ปิดโหมดประหยัดพลังงานของการ์ด Wi-Fi / LAN (Power Management)',
            detail:
              'คลิกขวา Start → Device Manager → Network adapters → คลิกขวาการ์ดเน็ตของคุณ → Properties → แท็บ Power Management แล้วเอาติ๊กถูกหน้า "Allow the computer to turn off this device to save power" ออก',
          },
          {
            stepNumber: 7,
            title: 'ตรวจสอบ Browser Extension และ Proxy / VPN ที่ค้างอยู่',
            detail:
              'ลองเปิดเว็บในโหมดไม่ระบุตัวตน (Incognito: Ctrl+Shift+N) หากเร็วปกติ แสดงว่าส่วนขยาย (Extension) หรือแคชในเบราว์เซอร์มีปัญหา และเช็กใน Settings → Network → Proxy ว่าไม่มี Proxy แปลกปลอมเปิดค้างไว้',
          },
          {
            stepNumber: 8,
            title: 'อัปเดต Driver การ์ด LAN/Wi-Fi จากเว็บไซต์ผู้ผลิตโดยตรง',
            detail:
              'ไม่ควรใช้ Driver มาตรฐานเก่าๆ ที่ติดมากับ Windows 10/11 ให้โหลด Driver ล่าสุดของ Intel, Realtek หรือรุ่นเมนบอร์ด/โน้ตบุ๊กมาติดตั้งใหม่ ซึ่งแก้ปัญหาเน็ตหลุดและความเร็วตกได้ดีที่สุด',
          },
        ],
      },
    ],
  },

  // ==================== บทความแนะนำ (7 บทความ) ====================
  {
    slug: 'free-excel-formulas-templates-2025',
    section: 'recommended',
    category: 'Microsoft Excel',
    title: 'รวมสูตร Excel พร้อมใช้ โหลดฟรี! ครบทุกสายงาน อัปเดต 2025',
    date: '7 กันยายน 2025',
    readTime: '6 นาที',
    author: 'เกร็ดสาระความรู้ไอที · กดแล้วจบ',
    views: "142",
    coverImage: '/src/assets/images/hero_excel_workstation_1795676830070.jpg',
    summary:
      'รวมเทมเพลต Excel สำเร็จรูปพร้อมสูตรคำนวณพื้นฐานครบ 11 สายงาน ทั้งบัญชีรายรับ-รายจ่าย, ใบเสนอราคา VAT 7%, คำนวณ OT พนักงาน และระบบสต๊อกสินค้า โหลดใช้งานได้ทันที',
    highlights: [
      '4 เทมเพลตยอดนิยม: บัญชีรับ-จ่าย, ใบเสนอราคา VAT, คำนวณ OT, สต๊อกสินค้า',
      'แบ่งตามสายงาน 11 หมวดหมู่ (การเงิน, อินวอยซ์, การขาย, HR, การศึกษา, ปฏิทิน, สุขภาพ)',
      'เทคนิคแก้ปัญหาเปิดไฟล์ Excel เวอร์ชั่นเก่าแล้วหน่วงด้วย Save As (.xlsx)',
    ],
    contentSections: [
      {
        id: 'excel-overview',
        heading: 'ประหยัดเวลาสร้างตารางใหม่ด้วยเทมเพลต Excel สำเร็จรูป',
        paragraphs: [
          'เคยไหมครับ? ต้องนั่งทำรายงานการเงิน สรุปยอดขาย หรือทำบัญชีรายรับ-รายจ่าย แต่ไม่รู้จะเริ่มออกแบบตารางหรือเขียนสูตร Excel ยังไงดี กว่าจะจัดคอลัมน์และผูกสูตรเสร็จก็หมดเวลาไปครึ่งวัน',
          'เราจึงรวบรวมเทมเพลต Excel พร้อมสูตรคำนวณที่จำเป็นสำหรับทุกสายงาน ให้คุณดาวน์โหลดไปกรอกข้อมูลและปรับแก้โลโก้บริษัทใช้งานได้ทันที พร้อมคู่มือการฝึกใช้ 50 สูตร Excel พื้นฐาน',
        ],
      },
      {
        id: 'four-hero-templates',
        heading: '4 เทมเพลต Excel "พระเอก" ที่คนใช้งานมากที่สุด',
        steps: [
          {
            stepNumber: 1,
            title: 'บัญชีรายรับ-รายจ่ายส่วนบุคคล (Monthly Expense Tracker)',
            detail:
              'กรอกรายรับ (เงินเดือน/รายได้เสริม) และรายจ่ายประจำวัน ระบบคำนวณยอดเงินคงเหลือและแสดงกราฟสัดส่วนค่าใช้จ่ายอัตโนมัติ',
          },
          {
            stepNumber: 2,
            title: 'ใบเสนอราคาพร้อมสูตรคำนวณ VAT 7% (Quotation)',
            detail:
              'กรอกรายการสินค้า จำนวน และราคาต่อหน่วย พร้อมสูตร SUM, ส่วนลด และภาษีมูลค่าเพิ่ม 7% แค่เปลี่ยนโลโก้ก็ส่งลูกค้าได้ทันที',
          },
          {
            stepNumber: 3,
            title: 'ตารางบันทึกเวลาทำงานและคำนวณค่า OT พนักงาน',
            detail:
              'ใส่เวลาเข้า-ออกงานปกติ และชั่วโมงล่วงเวลา สูตรคำนวณค่าแรง OT 1.5x และ 3x อัตโนมัติ ลดความผิดพลาดจากการคิดมือ',
          },
          {
            stepNumber: 4,
            title: 'ระบบสต๊อกสินค้าคงคลังอย่างง่าย (Inventory Control)',
            detail:
              'บันทึกรับสินค้าเข้า (In) และเบิกออก (Out) เพื่อคำนวณยอดคงเหลือล่าสุด พร้อมแถบแจ้งเตือนเมื่อสินค้าใกล้หมด',
          },
        ],
      },
      {
        id: 'excel-2003-tip',
        heading: 'วิธีแก้ปัญหาเปิดไฟล์ Excel แล้วช้าหรือหน่วงใน Office 2010–2021',
        callout: {
          title: 'เคล็ดลับ: แปลงไฟล์เก่าเป็น .xlsx เพื่อความเร็วสูงสุด',
          body: 'หากเปิดไฟล์ที่ทำไว้สำหรับ Office 2003 (.xls) ใน Microsoft Excel 2010–2021 แล้วรู้สึกช้า ให้กด File → Save As แล้วเลือกชนิดไฟล์เป็น Excel Workbook (.xlsx) จากนั้นปิดแล้วเปิดไฟล์ .xlsx ใหม่อีกครั้ง ไฟล์จะเล็กลงและคำนวณเร็วขึ้นทันที',
          variant: 'tip',
        },
      },
    ],
    relatedAction: {
      label: 'เปิดคลังแจกไฟล์ Excel ฟรี 50+ แบบ (11 หมวดหมู่)',
      path: '/excel-templates',
    },
  },
  {
    slug: 'install-th-sarabun-psk-windows-complete-guide',
    section: 'recommended',
    category: 'Windows & Fonts',
    title: 'วิธีการติดตั้งและใช้งานฟอนต์ TH Sarabun PSK ใน Windows: คู่มือฉบับสมบูรณ์สำหรับฟอนต์ราชการและเอกสารทางการ',
    date: '14 พฤศจิกายน 2026',
    readTime: '5 นาที',
    author: 'ทีมวิชาการ กดแล้วจบ',
    views: "148",
    coverImage: '/src/assets/images/template_education_grading_1795680578102.jpg',
    summary:
      'คู่มือดาวน์โหลดและติดตั้งฟอนต์ TH Sarabun PSK / TH Sarabun New ให้ใช้ได้ทั้งเครื่อง (Install for all users) แก้ปัญหาสระลอย วรรณยุกต์ซ้อน และตั้งค่าเป็นฟอนต์เริ่มต้นใน Word',
    highlights: [
      'ความแตกต่างระหว่าง TH Sarabun PSK (รุ่นดั้งเดิม) กับ TH Sarabun New (แก้สระลอย)',
      'วิธีติดตั้งแบบ Install for all users ให้แสดงครบใน Word, Excel และโปรแกรมออกแบบ',
      'วิธีตั้งค่า TH Sarabun PSK ขนาด 16 pt เป็นค่าเริ่มต้นใน Microsoft Word',
    ],
    contentSections: [
      {
        id: 'psk-vs-new',
        heading: 'TH Sarabun PSK ต่างจาก TH Sarabun New อย่างไร?',
        paragraphs: [
          'ฟอนต์ TH Sarabun PSK เป็นฟอนต์มาตรฐานของระบบราชการไทยและงานวิชาการทั้ง 13 ฟอนต์แห่งชาติ (SIPA) ส่วน TH Sarabun New เป็นรุ่นปรับปรุงเพิ่มเติมเพื่อแก้ไขปัญหาสระลอยและเพิ่มเครื่องหมายบางตัวในโปรแกรมรุ่นใหม่',
          'แนะนำให้ติดตั้งครบทั้ง 4 น้ำหนักในชุด ได้แก่ Regular (ตัวปกติ), Bold (ตัวหนา), Italic (ตัวเอียง) และ Bold Italic (ตัวหนาเอียง) เพื่อไม่ให้ Word แปลงตัวหนาแบบเทียมที่ทำให้ขอบตัวอักษรเบลอเวลาสั่งพิมพ์',
        ],
      },
      {
        id: 'install-steps',
        heading: 'ขั้นตอนติดตั้งฟอนต์ TH Sarabun PSK บน Windows 10 และ Windows 11',
        steps: [
          {
            stepNumber: 1,
            title: 'แตกไฟล์ .ZIP ให้เรียบร้อยก่อนติดตั้ง',
            detail:
              'เมื่อดาวน์โหลดชุดฟอนต์ (.zip) มาแล้ว ให้คลิกขวาที่ไฟล์ เลือก Extract All... เพื่อแตกไฟล์ออกมาเป็นโฟลเดอร์ จะเห็นไฟล์นามสกุล .ttf จำนวน 4 ไฟล์ (THSarabun.ttf, THSarabun Bold.ttf, THSarabun Italic.ttf, THSarabun BoldItalic.ttf)',
          },
          {
            stepNumber: 2,
            title: 'เลือกไฟล์ฟอนต์ทั้งหมดแล้วคลิกขวา "Install for all users"',
            detail:
              'กด Ctrl + A เพื่อเลือกไฟล์ .ttf ทั้งหมด จากนั้นคลิกขวาแล้วเลือก Show more options (บน Windows 11) → Install for all users (ห้ามกดแค่ Install เฉยๆ หากต้องใช้ในบางโปรแกรมที่รันสิทธิ์ Admin)',
            tip: 'หากขึ้นหน้าต่างแจ้งว่า "Font is already installed. Do you want to replace it?" สามารถติ๊ก Do this for all current items แล้วกด Yes ได้เลย',
          },
          {
            stepNumber: 3,
            title: 'รีสตาร์ทโปรแกรม Microsoft Word / Excel และตั้งค่าฟอนต์เริ่มต้น (16 pt)',
            detail:
              'เปิด Microsoft Word กด Ctrl + D เพื่อเปิดหน้าต่าง Font → เลือกฟอนต์ TH Sarabun PSK, ขนาด 16 → กดปุ่ม Set As Default ด้านล่างซ้าย แล้วเลือก All documents based on the Normal template',
          },
        ],
      },
      {
        id: 'fix-floating-vowels',
        heading: 'วิธีแก้ปัญหาสระลอยหรือวรรณยุกต์เพี้ยนเมื่อแปลงเป็น PDF',
        callout: {
          title: 'ฝังฟอนต์ (Embed Fonts) ก่อนส่งไฟล์ให้ผู้อื่น',
          body: 'หากส่งไฟล์ Word ให้เครื่องอื่นที่ไม่มีฟอนต์ TH Sarabun PSK รูปแบบหน้ากระดาษจะเพี้ยนทั้งหมด แก้ได้โดยเข้า File → Options → Save แล้วติ๊กถูกที่ "Embed fonts in the file" (หรือบันทึกส่งออกเป็น PDF ตรงจาก File → Save As → PDF)',
          variant: 'tip',
        },
      },
    ],
  },
  {
    slug: 'fix-windows-10-thai-language-switch-twice-v1803',
    section: 'recommended',
    category: 'Windows Tips',
    title: '[Fix issue] วิธีแก้ไข Windows 10 กดเปลี่ยนภาษาไทย 2 ครั้งหลังอัปเดต v1803',
    date: '10 พฤศจิกายน 2026',
    readTime: '4 นาที',
    author: 'ทีมวิชาการ กดแล้วจบ',
    views: "230",
    coverImage: '/src/assets/images/vba_automation_excel_1795679554655.jpg',
    summary:
      'วิธีแก้ปัญหาคลาสสิกบน Windows 10 ที่ต้องกดปุ่ม Grave Accent (` / ~) ถึง 2 ครั้งกว่าจะเปลี่ยนจากไทยเป็นอังกฤษ หรือสลับภาษาไม่ได้ในบางโปรแกรม ทำตามจบใน 2 นาที',
    highlights: [
      'สาเหตุ: Windows มีภาษาเกิน 2 ตัว (เช่น ENG-US, ENG-UK, THA) หรือตั้งค่า Language Bar ซ้อนกัน',
      'วิธีตั้งค่า Advanced Keyboard Settings ให้ใช้ปุ่มตัวหนอน (~) กดครั้งเดียวสลับได้ทันที',
      'วิธีลบภาษาที่ไม่ได้ใช้งานออกจาก Settings เพื่อไม่ให้วนลูปเปลี่ยน 2-3 รอบ',
    ],
    contentSections: [
      {
        id: 'why-twice',
        heading: 'ทำไมถึงต้องกดเปลี่ยนภาษาถึง 2 ครั้ง?',
        paragraphs: [
          'ตั้งแต่ Windows 10 เวอร์ชัน 1803 เป็นต้นมา Microsoft ได้เปลี่ยนตำแหน่งการตั้งค่า Language Bar และบางครั้งระบบจะเพิ่มคีย์บอร์ด "English (United Kingdom)" หรือ "Thai Pattachote" เข้ามาให้อัตโนมัติ ทำให้การกดปุ่มเปลี่ยนภาษา 1 ครั้ง กลายเป็นการสลับระหว่างภาษาที่ 1 → 2 → 3 แทนที่จะสลับแค่ ไทย ↔ อังกฤษ',
        ],
      },
      {
        id: 'fix-steps',
        heading: 'วิธีแก้ไขให้กดครั้งเดียวเปลี่ยนภาษาได้ 100%',
        steps: [
          {
            stepNumber: 1,
            title: 'ลบภาษาหรือแป้นพิมพ์ที่เกินออกให้เหลือแค่ ENG (US) และ ไทย (Kedmanee)',
            detail:
              'ไปที่ Settings → Time & Language → Language ตรวจสอบรายการ Preferred languages ให้เหลือเพียง English (United States) และ ไทย เท่านั้น ถ้ามี English (UK) ให้กด Remove ออก และคลิกที่ภาษาไทย → Options ตรวจดูว่ามีแค่ Thai Kedmanee',
          },
          {
            stepNumber: 2,
            title: 'ตั้งค่า Input language hot keys ใน Advanced keyboard settings',
            detail:
              'ในหน้า Language คลิก "Choose an input method to always use as default" หรือค้นหาคำว่า Advanced keyboard settings จากช่อง Search ของ Windows',
            subPoints: [
              'เอาติ๊กถูกหน้า "Let me use a different input method for each app window" ออก (สำคัญมาก! เพราะถ้าเปิดไว้แต่ละหน้าต่างจะจำภาษาไม่เหมือนกัน)',
              'คลิกข้อความสีฟ้า "Input language hot keys"',
            ],
          },
          {
            stepNumber: 3,
            title: 'กำหนดปุ่ม Grave Accent (~) ในหน้า Text Services and Input Languages',
            detail:
              'เลือก "Between input languages" → กด Change Key Sequence... → ช่องซ้าย (Switch Input Language) เลือก Grave Accent (`) ส่วนช่องขวา (Switch Keyboard Layout) เลือก Not Assigned → กด OK และ Apply',
            tip: 'เมื่อกด OK เสร็จแล้ว ให้ลองทดสอบกดปุ่มตัวหนอน (~) ใน Notepad หรือช่องค้นหา ถ้ายังค้างให้ Sign out แล้ว Sign in ใหม่ 1 ครั้ง',
          },
        ],
      },
    ],
  },
  {
    slug: 'google-drive-ocr-image-to-thai-text',
    section: 'recommended',
    category: 'Google Workspace',
    title: 'ใช้ Google Drive แปลงข้อความไฟล์รูปภาพ เป็นข้อความ ภาษาไทยใช้ได้',
    date: '5 พฤศจิกายน 2026',
    readTime: '4 นาที',
    author: 'ทีมวิชาการ กดแล้วจบ',
    views: "76",
    coverImage: '/src/assets/images/google_sheets_cloud_1795679554880.jpg',
    summary:
      'ไม่ต้องเสียเวลาพิมพ์เอกสารใหม่จากรูปถ่ายหรือไฟล์สแกน PDF! ใช้ฟีเจอร์ OCR ฟรีใน Google Drive แปลงภาพหน้าหนังสือ เอกสารราชการ และใบเสร็จเป็นตัวหนังสือภาษาไทยที่คัดลอกแก้ไขได้ทันที',
    highlights: [
      'ใช้งานฟรี 100% ผ่าน Google Drive + Google Docs ไม่ต้องลงโปรแกรมเสริม',
      'รองรับทั้งไฟล์รูปภาพ (.jpg, .png) และไฟล์ PDF แบบสแกนภาษาไทย-อังกฤษปนกัน',
      'เทคนิคเตรียมรูปภาพให้ระบบ OCR อ่านภาษาไทยได้แม่นยำกว่า 95%',
    ],
    contentSections: [
      {
        id: 'ocr-steps',
        heading: 'ขั้นตอนแปลงรูปภาพ/PDF สแกนเป็นข้อความภาษาไทยด้วย Google Drive',
        steps: [
          {
            stepNumber: 1,
            title: 'เตรียมรูปภาพให้คมชัดและตั้งตรง',
            detail:
              'ถ่ายรูปเอกสารในที่มีแสงสว่างสม่ำเสมอ ไม่เอียงหรือกลับหัว หากเป็นไฟล์ PDF ที่มีหลายหน้า แนะนำให้แยกเฉพาะหน้าที่ต้องการหรือใช้ไฟล์ PDF ขนาดไม่เกิน 2 MB เพื่อความแม่นยำสูงสุด',
          },
          {
            stepNumber: 2,
            title: 'อัปโหลดไฟล์รูปภาพหรือ PDF ขึ้น Google Drive',
            detail:
              'เปิดเว็บไซต์ drive.google.com ล็อกอินบัญชี Google ของคุณ แล้วลากไฟล์รูปภาพ (.jpg, .png) หรือ .pdf วางลงในโฟลเดอร์ที่ต้องการ',
          },
          {
            stepNumber: 3,
            title: 'คลิกขวาที่ไฟล์ → Open with → Google Docs',
            detail:
              'คลิกขวาที่ไฟล์ที่เพิ่งอัปโหลด เลือก Open with (เปิดด้วย) → Google Docs (Google เอกสาร) จากนั้นรอประมาณ 5–15 วินาที',
          },
          {
            stepNumber: 4,
            title: 'คัดลอกข้อความภาษาไทยที่ถูกถอดออกมาใช้งาน',
            detail:
              'Google Docs จะสร้างเอกสารใหม่โดยด้านบนจะแสดงภาพต้นฉบับ และด้านล่างของภาพคือข้อความทั้งหมดที่ถูกแปลงเป็น Text เรียบร้อยแล้ว สามารถแก้ไข คัดลอก หรือส่งออกเป็น Microsoft Word (.docx) ได้เลย',
            tip: 'หากข้อความที่แปลงมามีสีตัวอักษรหรือขนาดไม่เท่ากัน ให้กด Ctrl + A เพื่อเลือกทั้งหมด แล้วกด Ctrl + \\ (Clear Formatting) เพื่อล้างการจัดรูปแบบให้เป็นข้อความสะอาดในคลิกเดียว',
          },
        ],
      },
    ],
  },
  {
    slug: 'dictate-microsoft-word-via-google-docs-voice-typing',
    section: 'recommended',
    category: 'Google Workspace',
    title: 'ทำรายงานใน Microsoft Word โดยพิมพ์งานด้วยเสียงผ่าน Google Docs',
    date: '1 พฤศจิกายน 2026',
    readTime: '5 นาที',
    author: 'ทีมวิชาการ กดแล้วจบ',
    views: "54",
    coverImage: '/src/assets/images/appsheet_nocode_mobile_1795679555658.jpg',
    summary:
      'พิมพ์รายงาน บทความ หรือถอดเทปการประชุมให้เร็วขึ้น 3 เท่า! ใช้ Voice Typing ภาษาไทยของ Google Docs ที่แม่นยำสูง แล้วส่งออกเป็นไฟล์ Word (.docx) ได้ทันที',
    highlights: [
      'รองรับการพิมพ์ด้วยเสียงภาษาไทยและภาษาอังกฤษได้แม่นยำสูงกว่าการพิมพ์ด้วยมือ',
      'รู้จักคำสั่งเสียงเว้นวรรค ขึ้นบรรทัดใหม่ และแก้คำผิดไวๆ',
      'วิธี Export จาก Google Docs ออกมาจัดหน้าต่อใน Microsoft Word แบบไม่เพี้ยน',
    ],
    contentSections: [
      {
        id: 'voice-typing-steps',
        heading: 'วิธีพิมพ์รายงานด้วยเสียงภาษาไทยและส่งต่อไปยัง Microsoft Word',
        steps: [
          {
            stepNumber: 1,
            title: 'เปิด Google Docs ด้วยเบราว์เซอร์ Google Chrome',
            detail:
              'ฟีเจอร์ Voice Typing ของ Google Docs ทำงานได้ดีที่สุดบน Google Chrome (ทั้ง Windows และ Mac) และต้องต่อไมโครโฟนหรือใช้ไมค์โน้ตบุ๊ก/สมอลทอล์ค',
          },
          {
            stepNumber: 2,
            title: 'เปิดเมนู Tools → Voice typing (หรือกด Ctrl + Shift + S)',
            detail:
              'สร้างเอกสารใหม่ จากนั้นคลิกเมนู Tools (เครื่องมือ) → Voice typing... (พิมพ์ด้วยเสียง) จะมีไอคอนรูปไมโครโฟนลอยขึ้นมาทางด้านซ้าย',
          },
          {
            stepNumber: 3,
            title: 'เปลี่ยนภาษาเป็น "ไทย" แล้วกดไมโครโฟนเพื่อเริ่มพูด',
            detail:
              'คลิกที่เมนูเลือกภาษาเหนือรูปไมโครโฟน เลือก "ไทย" จากนั้นกดปุ่มไมโครโฟน (หาก Chrome ถามสิทธิ์ Allow Microphone ให้กดอนุญาต) แล้วพูดตามปกติด้วยน้ำเสียงชัดเจน ระบบจะพิมพ์เป็นตัวอักษรไทยให้แบบเรียลไทม์',
            tip: 'หากต้องเปิดไฟล์เสียงการประชุมหรือคลิปบรรยายให้ถอดคำอัตโนมัติ สามารถต่อสายลำโพง/ใช้ Virtual Audio Cable หรือเปิดลำโพงจ่อไมโครโฟนในห้องที่เงียบได้เช่นกัน',
          },
          {
            stepNumber: 4,
            title: 'ดาวน์โหลดเป็น Microsoft Word (.docx) เพื่อจัดหน้าสวยๆ',
            detail:
              'เมื่อพิมพ์เนื้อหาเสร็จแล้ว ให้กด File (ไฟล์) → Download (ดาวน์โหลด) → Microsoft Word (.docx) แล้วนำไปเปิดจัดฟอนต์ TH Sarabun PSK, สารบัญ และเลขหน้าใน Microsoft Word ได้ทันที',
          },
        ],
      },
    ],
  },
  {
    slug: 'install-windows-10-usb-dvd-step-by-step',
    section: 'recommended',
    category: 'ติดตั้งระบบปฏิบัติการ',
    title: 'สอนวิธีติดตั้ง Windows 10 ล่าสุดด้วย USB/DVD แบบ Step by Step',
    date: '25 ตุลาคม 2026',
    readTime: '9 นาที',
    author: 'ทีมวิชาการ กดแล้วจบ',
    views: "162",
    coverImage: '/src/assets/images/erp_saas_suite_preview_1795679556912.jpg',
    summary:
      'คู่มือลง Windows 10 ใหม่ด้วยตัวเองตั้งแต่ขั้นตอนดาวน์โหลดไฟล์แท้จาก Microsoft (Media Creation Tool), สร้างตัวบูต USB Flash Drive, ตั้งค่า Boot BIOS ไปจนถึงการแบ่ง Drive และลงไดรเวอร์ให้ครบ',
    highlights: [
      'สร้าง USB Boot ของแท้จาก Microsoft Media Creation Tool (ใช้ Flash Drive 8 GB ขึ้นไป)',
      'ตารางปุ่มเข้า Boot Menu ยี่ห้อยอดนิยม (ASUS, Acer, Lenovo, Dell, HP, MSI)',
      'วิธีเลือกพาร์ติชัน Format เฉพาะ Drive C: อย่างปลอดภัยไม่ให้ข้อมูล Drive D: หาย',
    ],
    contentSections: [
      {
        id: 'prep-win10',
        heading: 'สิ่งที่ต้องเตรียมก่อนเริ่มติดตั้ง Windows 10',
        bullets: [
          'Flash Drive ขนาดอย่างน้อย 8 GB ขึ้นไป (ข้อมูลใน Flash Drive จะถูกล้างทั้งหมดระหว่างสร้างตัวติดตั้ง)',
          'สำรองข้อมูลสำคัญใน Drive C:, Desktop, Documents และ Downloads ไปไว้ใน Drive อื่นหรือ External HDD ก่อนเสมอ',
          'ต่อสายชาร์จแบตเตอรี่ให้เรียบร้อย (สำหรับโน้ตบุ๊ก) ห้ามเครื่องดับระหว่างลงเด็ดขาด',
        ],
      },
      {
        id: 'boot-menu-keys',
        heading: 'ปุ่มกดเข้า Boot Menu ของคอมพิวเตอร์แต่ละยี่ห้อ',
        table: {
          caption: 'กดปุ่มนี้ย้ำๆ ทันทีหลังจากกดปุ่มเปิดเครื่อง',
          headers: ['ยี่ห้อ (Brand)', 'ปุ่ม Boot Menu', 'ปุ่มเข้า BIOS / UEFI'],
          rows: [
            ['ASUS', 'F8 หรือ Esc', 'F2 หรือ Del'],
            ['Acer', 'F12 (อาจต้องเปิด F12 Boot Menu ใน BIOS)', 'F2'],
            ['Lenovo', 'F12 หรือปุ่ม Novo เล็กๆ ข้างเครื่อง', 'F2 หรือ Fn+F2'],
            ['Dell', 'F12', 'F2'],
            ['HP', 'F9 หรือ Esc', 'F10'],
            ['MSI / Gigabyte', 'F11 (MSI) / F12 (Gigabyte)', 'Del'],
          ],
        },
      },
      {
        id: 'steps-win10',
        heading: 'ขั้นตอนการติดตั้ง Windows 10 แบบ Step by Step',
        steps: [
          {
            stepNumber: 1,
            title: 'ดาวน์โหลด Windows 10 Media Creation Tool จากเว็บ Microsoft',
            detail:
              'ค้นหา "Download Windows 10 Microsoft" แล้วโหลดเครื่องมือ MediaCreationTool.exe เปิดขึ้นมา กด Accept → เลือก "Create installation media (USB flash drive, DVD, or ISO file)" → เลือกภาษา English (US), รุ่น Windows 10, 64-bit → เลือก USB flash drive ของคุณแล้วรอโหลดจนเสร็จ',
          },
          {
            stepNumber: 2,
            title: 'เสียบ USB แล้วบูตเข้าตัวติดตั้ง Windows 10',
            detail:
              'รีสตาร์ทเครื่องแล้วกดปุ่ม Boot Menu รัวๆ เลือกชื่อ USB Flash Drive (แนะนำตัวที่ขึ้นต้นด้วย UEFI: ...) หน้าจอจะขึ้นโลโก้ Windows ให้เลือก Language: English, Time and currency format: Thai (Thailand), Keyboard: US แล้วกด Next → Install now',
          },
          {
            stepNumber: 3,
            title: 'เลือก "Custom: Install Windows only (advanced)" และเลือก Drive C:',
            detail:
              'หากมีหน้าถาม Product Key และเครื่องเคยมีลิขสิทธิ์แท้แล้ว ให้กด "I don\'t have a product key" → เลือก Windows 10 Home หรือ Pro ให้ตรงกับสิทธิ์เดิม → ยอมรับเงื่อนไข → เลือก Custom เพื่อจัดการพาร์ติชัน',
            subPoints: [
              'สังเกตขนาดความจุ (Total size) ให้แน่ใจว่าอันไหนคือ Drive C: เดิม',
              'กด Format เฉพาะพาร์ติชันที่ต้องการลง Windows (ห้ามไป Format Drive D: ที่มีงานสำคัญ) แล้วกด Next',
            ],
          },
          {
            stepNumber: 4,
            title: 'ตั้งค่าเริ่มต้นหลังติดตั้ง (OOBE) และเช็ก Windows Update',
            detail:
              'รอเครื่องคัดลอกไฟล์และรีสตาร์ท 1–2 รอบ (ให้ถอด USB ออกเมื่อรีสตาร์ทรอบแรกเสร็จ) จากนั้นเลือก Region: Thailand, Keyboard: US (เพิ่ม Thai Kedmanee ทีหลังได้) ตั้งชื่อผู้ใช้และรหัสผ่าน เมื่อเข้าหน้า Desktop ให้ต่อเน็ตแล้วรัน Settings → Update & Security → Check for updates เพื่อดึงไดรเวอร์ให้ครบ',
          },
        ],
      },
    ],
  },
  {
    slug: 'install-windows-11-2025-step-by-step',
    section: 'recommended',
    category: 'ติดตั้งระบบปฏิบัติการ',
    title: 'วิธีลง Windows 11 ใหม่ (2025) ฉบับจับมือทำ Step-by-Step',
    date: '15 ตุลาคม 2026',
    readTime: '9 นาที',
    author: 'ทีมวิชาการ กดแล้วจบ',
    views: "189",
    coverImage: '/src/assets/images/template_accounting_pos_1795676831169.jpg',
    summary:
      'ขั้นตอนติดตั้ง Windows 11 เวอร์ชั่นล่าสุด (24H2 / 2025) ให้เสถียรและเร็วที่สุด ตั้งแต่เช็ก TPM 2.0 & Secure Boot, สร้างตัวบูต USB, เทคนิคตั้งชื่อบัญชี Local ไม่ต้องบังคับต่อเน็ต/Microsoft Account',
    highlights: [
      'ตรวจสอบความพร้อมของเครื่อง: UEFI, Secure Boot และ TPM 2.0',
      'วิธีสร้าง USB Boot ด้วย Rufus หรือ Media Creation Tool',
      'เทคนิค Bypass บัญชีออนไลน์ (oobe\\bypassnro) เพื่อใช้ Local Account ได้เหมือนเดิม',
    ],
    contentSections: [
      {
        id: 'requirements-win11',
        heading: 'เช็กสเปกขั้นต่ำก่อนติดตั้ง Windows 11 (อัปเดต 2025)',
        bullets: [
          'CPU: 64-bit ความเร็ว 1 GHz ขึ้นไป (Intel Gen 8+ หรือ AMD Ryzen 2000+)',
          'RAM: ขั้นต่ำ 4 GB (แนะนำ 8–16 GB ขึ้นไปสำหรับทำงานลื่นๆ)',
          'พื้นที่ว่าง SSD: อย่างน้อย 64 GB ขึ้นไป (ต้องใช้ GPT Partition + UEFI Boot)',
          'ความปลอดภัย: เปิด TPM 2.0 (Intel PTT / AMD fTPM) และ Secure Boot ใน BIOS',
        ],
      },
      {
        id: 'steps-win11',
        heading: 'วิธีลง Windows 11 ใหม่แบบจับมือทำทุกขั้นตอน',
        steps: [
          {
            stepNumber: 1,
            title: 'สร้าง USB ตัวติดตั้ง Windows 11 (Media Creation Tool หรือ Rufus)',
            detail:
              'โหลด "Windows 11 Installation Media" จากเว็บทางการ Microsoft หรือโหลดไฟล์ ISO มาเขียนลง Flash Drive 8 GB ด้วยโปรแกรม Rufus (Partition scheme: GPT, Target system: UEFI)',
          },
          {
            stepNumber: 2,
            title: 'ตั้งค่า UEFI / TPM 2.0 ใน BIOS และบูตจาก USB',
            detail:
              'เข้า BIOS ตรวจสอบว่า Boot Mode เป็น UEFI และเปิดใช้งาน Security Device / TPM 2.0 แล้ว จากนั้นกด Boot Menu เลือกบูตจาก UEFI USB Flash Drive',
          },
          {
            stepNumber: 3,
            title: 'เลือกภาษาไทย/คีย์บอร์ด US และติดตั้งลงบน SSD (Custom Install)',
            detail:
              'หน้า Install Windows เลือก Language: English (United States), Time format: Thai (Thailand) → กด Next → เลือก Install Windows 11 → กด I don\'t have a product key (ระบบจะ Activate อัตโนมัติหากเครื่องเคยมี License) → เลือก Drive ที่จะลง Windows แล้วกด Next',
          },
          {
            stepNumber: 4,
            title: 'ตั้งค่า Local Account แบบไม่ต้องใช้ Microsoft Account (กรณีต้องการใช้บัญชีออฟไลน์)',
            detail:
              'เมื่อเข้าหน้าจอตั้งค่าเริ่มต้น "Let\'s connect you to a network" หากไม่อยากผูกบัญชี Microsoft ออนไลน์ ให้ถอดสายแลน/ไม่ต่อ Wi-Fi แล้วกด Shift + F10 เพื่อเปิด CMD จากนั้นพิมพ์คำสั่งด้านล่างนี้แล้วกด Enter เครื่องจะรีสตาร์ทและมีปุ่ม "I don\'t have internet" ให้ตั้งชื่อ Local Account ได้ทันที:',
            command: 'oobe\\bypassnro',
            tip: 'เมื่อเข้าหน้า Desktop แล้ว แนะนำเข้า Settings → Windows Update เพื่ออัปเดตแพตช์ล่าสุด และเข้าไปเพิ่มภาษาไทยใน Time & Language → Language & region ครับ',
          },
        ],
      },
    ],
    relatedAction: {
      label: 'ดูวิธีแก้ Windows เปลี่ยนภาษา 2 ครั้งหลังลงเครื่องใหม่',
      path: '/blog/fix-windows-10-thai-language-switch-twice-v1803',
    },
  },
  {
    slug: '54-project-management-templates-excel-word',
    section: 'recommended',
    category: 'การจัดการโครงการ',
    title: '54 เทมเพลตการจัดการโครงการที่ดีที่สุดสำหรับ Excel และ Word (แจกฟรี ครบทุกเฟส)',
    date: '26 พฤศจิกายน 2026',
    readTime: '12 นาที',
    author: 'ทีมวิชาการ กดแล้วจบ',
    views: '164',
    coverImage: '/src/assets/images/blog_project_management_gantt_1795746417626.jpg',
    summary:
      'ยังใช้สเปรดชีตจัดการโครงการอยู่หรือเปล่า? รวม 54 เทมเพลตการจัดการโครงการสำหรับ Excel และ Word ที่จำเป็นที่สุด ตั้งแต่ระยะเริ่มโครงการ แผนภูมิแกนต์ WBS งบประมาณ ความเสี่ยง ไปจนถึงส่งมอบงาน พร้อมดาวน์โหลดฟรีและปรับแก้ได้ทันที',
    highlights: [
      'ครอบคลุม 54 เทมเพลตสำคัญตั้งแต่ระยะวางแผน ดำเนินการ จนถึงปิดโครงการ',
      'รองรับทั้งรูปแบบ Excel (.xlsx) พร้อมสูตรคำนวณอัตโนมัติ และ Word (.docx) ตามมาตรฐานสากล',
      'มีเทมเพลตแผนภูมิแกนต์, WBS, CPM, PERT, งบประมาณ, เมทริกซ์ RACI, RAID Log และแดชบอร์ดผู้บริหาร',
    ],
    contentSections: [
      {
        id: 'why-excel-for-pm',
        heading: 'การใช้ Excel สำหรับการจัดการโครงการ: ข้อดีและจุดเริ่มต้น',
        paragraphs: [
          'ก่อนจะบริหารโครงการได้ คุณต้องมีเครื่องมือจัดการโครงการที่เหมาะสมสำหรับเก็บข้อมูลที่จำเป็นในการกำหนดกลยุทธ์ และเทมเพลต Excel สำหรับการจัดการโครงการก็เป็นจุดเริ่มต้นที่ดี พนักงานและสมาชิกทีมมักคุ้นเคยกับ Microsoft Excel อยู่แล้ว เพราะมีผู้ใช้ Excel ทั่วโลกประมาณ 1.1–1.5 พันล้านคน จึงเป็นซอฟต์แวร์เริ่มต้นที่ใช้งานสบายสำหรับการจัดการโครงการ',
          'ไม่ว่าคุณจะต้องวางแผนโครงการ ติดตามความคืบหน้า จัดทำรายงานสถานะ หรือบริหารงบประมาณให้สมดุล เทมเพลต Excel สำเร็จรูปจะช่วยย่นระยะเวลาการตั้งค่าระบบลงได้อย่างมหาศาล',
          'Microsoft Excel ทำหลายสิ่งได้ดี เช่น การคำนวณ การวิเคราะห์ และการจัดระเบียบข้อมูล แต่เริ่มต้นจากหน้ากระดาษเปล่า ดังนั้นหากไม่ใช้เทมเพลตหรือสเปรดชีตสำเร็จรูป การทำโปรเจกต์บน Excel ก็ทำได้ยาก โดยเฉพาะเมื่อต้องประสานงานเป็นทีม',
        ],
      },
      {
        id: 'pm-phases-structure',
        heading: '6 กลุ่มงานหลักของการบริหารโครงการด้วย 54 เทมเพลต',
        paragraphs: [
          'เพื่อช่วยให้ค้นหาและหยิบไปใช้งานได้ตรงกับสถานการณ์ เราได้จัดแบ่ง 54 เทมเพลตการจัดการโครงการออกเป็น 6 กลุ่มงานสำคัญตามวงจรชีวิตโครงการ (Project Life Cycle):',
        ],
        bullets: [
          '1. แผนงาน & ไทม์ไลน์ (15 เทมเพลต): แผนภูมิแกนต์, WBS, แผนโครงการ, Critical Path Method (CPM), แผนภูมิ PERT, ไทม์ไลน์ และปฏิทินโครงการ',
          '2. งบประมาณ & ต้นทุน (5 เทมเพลต): งบประมาณโครงการ, การประมาณราคา, Cost-Benefit Analysis (CBA) และแดชบอร์ดการเงิน',
          '3. ติดตามงาน & แดชบอร์ด (8 เทมเพลต): แดชบอร์ดรวมโครงการ, ตัวติดตามงานย่อย, คัมบังบอร์ด (Kanban), และ To-Do List',
          '4. ความเสี่ยง & ปัญหา (7 เทมเพลต): Risk Register, เมทริกซ์ความเสี่ยง 5x5, RAID Log, Issue Tracker และแบบฟอร์มบันทึกการเปลี่ยนแปลง (Change Log)',
          '5. ทีม & ผู้มีส่วนได้ส่วนเสีย (9 เทมเพลต): เมทริกซ์ RACI / RASCI, แผนภูมิบทบาทหน้าที่, ทะเบียนผู้มีส่วนได้ส่วนเสีย และตารางกะทำงานรายสัปดาห์',
          '6. เอกสาร & ส่งมอบ (10 เทมเพลต): กฎบัตรโครงการ (Charter), รายงานสถานะผู้บริหาร, เอกสารแผนโครงการ Word, บันทึกบทเรียนที่ได้เรียนรู้ และ Punch List',
        ],
      },
      {
        id: 'top-pm-templates-guide',
        heading: 'เจาะลึก 5 เทมเพลตระดับท็อปที่ทุกทีมต้องมี',
        steps: [
          {
            stepNumber: 1,
            title: 'เทมเพลตแผนภูมิแกนต์สำหรับ Excel (Gantt Chart)',
            detail:
              'แสดงภาพตารางเวลาของงานและการพึ่งพากันตลอดไทม์ไลน์โครงการในพริบตา เพียงเพิ่มงาน วันเริ่มต้น และระยะเวลา สเปรดชีตจะพล็อตแถบสีแสดงระยะเวลาของแต่ละกิจกรรมให้อัตโนมัติ',
            tip: 'เหมาะสำหรับใช้ในที่ประชุม Kickoff หรือส่งสรุปไทม์ไลน์ให้ลูกค้าดูภาพรวม',
          },
          {
            stepNumber: 2,
            title: 'เทมเพลตโครงสร้างการแบ่งงาน (Work Breakdown Structure - WBS)',
            detail:
              'จัดโครงสร้างการแบ่งโครงการใหญ่เป็นชิ้นงานย่อยและผลส่งมอบ (Deliverables) ระดับ 1-4 ช่วยให้ประมาณต้นทุน กำหนดผู้รับผิดชอบ และตรวจรับงานได้อย่างแม่นยำ 100%',
          },
          {
            stepNumber: 3,
            title: 'เทมเพลตงบประมาณและควบคุมต้นทุน (Project Budget & Cost Control)',
            detail:
              'ครอบคลุมทั้งค่าแรง ค่าวัสดุ เครื่องจักร และผู้รับเหมาช่วง มีระบบรหัสสีเตือนเมื่องบประมาณใช้จริงสูงเกินเกณฑ์ที่ตั้งไว้ และคำนวณส่วนต่าง (Variance) อัตโนมัติ',
          },
          {
            stepNumber: 4,
            title: 'เทมเพลตเมทริกซ์ RACI (Responsible, Accountable, Consulted, Informed)',
            detail:
              'กำหนดความรับผิดชอบของทุกคนในโครงการให้ชัดเจน ลดการเกี่ยงงานหรือความสับสน โดยแต่ละงานจะต้องมีผู้รับผิดชอบหลัก (Accountable) เพียงคนเดียวเสมอ',
          },
          {
            stepNumber: 5,
            title: 'เทมเพลต RAID Log (Risks, Assumptions, Issues, Dependencies)',
            detail:
              'ศูนย์กลางรวบรวม 4 องค์ประกอบความไม่แน่นอนที่ผู้จัดการโครงการมืออาชีพต้องตรวจเช็กเป็นประจำทุกสัปดาห์เพื่อป้องกันไม่ให้โครงการสะดุด',
          },
        ],
      },
      {
        id: 'excel-vs-software',
        heading: 'เมื่อไหร่ควรใช้ Excel Template และเมื่อไหร่ควรใช้ซอฟต์แวร์บริหารโครงการ?',
        paragraphs: [
          'แม้ว่า Excel จะเป็นเครื่องมือเริ่มต้นที่ยืดหยุ่นและทุกคนใช้งานเป็นอยู่แล้ว แต่เมื่อโครงการมีขนาดใหญ่ขึ้น มีทีมงานร่วมหลายสิบคน หรือต้องอัปเดตแบบเรียลไทม์ผ่านมือถือ การใช้ซอฟต์แวร์บริหารโครงการออนไลน์ (เช่น ProjectManager, Asana, Jira หรือ AppSheet) จะช่วยให้ทำงานร่วมกันได้อัตโนมัติยิ่งขึ้น',
          'อย่างไรก็ตาม เทมเพลต Excel ยังคงเป็นมาตรฐานสากลที่ยอดเยี่ยมที่สุดสำหรับการร่างแผนแรก การทำงบประมาณ และการส่งออกรายงานนำเสนอผู้บริหารหรือแนบประกอบสัญญาจ้าง',
        ],
      },
    ],
    relatedAction: {
      label: 'ไปยังคลังดาวน์โหลด 54 เทมเพลตการจัดการโครงการฟรี',
      path: '/excel-templates?cat=การจัดการโครงการ',
    },
  },
];

