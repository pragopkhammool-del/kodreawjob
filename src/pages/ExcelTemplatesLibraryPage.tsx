import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  DollarSign,
  Download,
  ExternalLink,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Filter,
  FolderKanban,
  FolderOpen,
  Heart,
  Layers,
  LayoutGrid,
  MessageCircle,
  Play,
  RefreshCw,
  Search,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Star,
  ThumbsUp,
  User,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  PROJECT_MANAGEMENT_TEMPLATES,
  ProjectManagementTemplate,
} from '../data/projectManagementTemplates';

export interface ExcelTemplateItem {
  id: string;
  itemNumber?: number;
  title: string;
  category: string;
  subGroup?: string;
  format?: 'Excel (.xlsx)' | 'Word (.docx)' | 'Excel & Word';
  description: string;
  fileSize: string;
  downloads: number;
  filename: string;
  keyFeatures?: string[];
  recommendedFor?: string;
}

const CATEGORIES = [
  'การจัดการโครงการ',
  'การเงินและการบัญชี',
  'อินวอยซ์',
  'การเดินทาง',
  'การขายและสินค้าคงคลัง',
  'การศึกษา',
  'กีฬา',
  'ทรัพยากรบุคคล',
  'ที่อยู่อาศัย / บุคคลทั่วไป',
  'ปฏิทิน',
  'พนักงาน',
  'สุขภาพ',
];

const PM_SUBGROUPS = [
  'ทั้งหมดในหมวด',
  'แผนงาน & ไทม์ไลน์',
  'งบประมาณ & ต้นทุน',
  'ติดตามงาน & แดชบอร์ด',
  'ความเสี่ยง & ปัญหา',
  'ทีม & ผู้มีส่วนได้ส่วนเสีย',
  'เอกสาร & ส่งมอบ',
] as const;

// 56 General Excel Templates
const GENERAL_EXCEL_TEMPLATES: ExcelTemplateItem[] = [
  // 1. การเงินและการบัญชี (6)
  {
    id: 'fin-1',
    title: 'บัญชีรายรับ-รายจ่ายส่วนบุคคลรายเดือน (Monthly Expense Tracker)',
    category: 'การเงินและการบัญชี',
    description: 'บันทึกเงินเดือน รายได้เสริม และค่าใช้จ่ายรายวัน สรุปยอดคงเหลืออัตโนมัติพร้อมกราฟสัดส่วน',
    fileSize: '1.2 MB',
    downloads: 48,
    filename: 'Monthly_Income_Expense_2025.xlsx',
  },
  {
    id: 'fin-2',
    title: 'งบกำไรขาดทุนเบื้องต้นสำหรับธุรกิจ SME (Income Statement)',
    category: 'การเงินและการบัญชี',
    description: 'คำนวณรายได้ ต้นทุนสินค้าขาย ค่าใช้จ่ายในการดำเนินงาน และกำไรสุทธิประจำเดือน/ปี',
    fileSize: '1.8 MB',
    downloads: 24,
    filename: 'SME_Income_Statement_Template.xlsx',
  },
  {
    id: 'fin-3',
    title: 'งบกระแสเงินสด 12 เดือน (Cash Flow Forecast)',
    category: 'การเงินและการบัญชี',
    description: 'วางแผนสภาพคล่องทางการเงินล่วงหน้า คาดการณ์เงินสดรับและเงินสดจ่ายแต่ละไตรมาส',
    fileSize: '2.1 MB',
    downloads: 19,
    filename: 'Cash_Flow_12_Months.xlsx',
  },
  {
    id: 'fin-4',
    title: 'คำนวณจุดคุ้มทุน (Break-Even Analysis)',
    category: 'การเงินและการบัญชี',
    description: 'วิเคราะห์ยอดขายขั้นต่ำที่ต้องทำเพื่อให้คุ้มทุนค่าใช้จ่ายคงที่และต้นทุนผันแปร',
    fileSize: '1.1 MB',
    downloads: 12,
    filename: 'Break_Even_Analysis_Calculator.xlsx',
  },
  {
    id: 'fin-5',
    title: 'สมุดบันทึกทรัพย์สินและค่าเสื่อมราคา (Fixed Assets Register)',
    category: 'การเงินและการบัญชี',
    description: 'บันทึกรายการเครื่องจักร อุปกรณ์ และคำนวณค่าเสื่อมราคาส่วนลดทางบัญชีอัตโนมัติ',
    fileSize: '2.4 MB',
    downloads: 8,
    filename: 'Fixed_Assets_Depreciation.xlsx',
  },
  {
    id: 'fin-6',
    title: 'งบดุลยภาพประจำปี (Annual Balance Sheet)',
    category: 'การเงินและการบัญชี',
    description: 'สรุปสินทรัพย์ หนี้สิน และส่วนของเจ้าของ พร้อมเช็คความถูกต้องสมดุลอัตโนมัติ',
    fileSize: '1.9 MB',
    downloads: 6,
    filename: 'Annual_Balance_Sheet_Template.xlsx',
  },

  // 2. อินวอยซ์ (5)
  {
    id: 'inv-1',
    title: 'ใบเสนอราคา (Quotation) พร้อมคำนวณ VAT 7%',
    category: 'อินวอยซ์',
    description: 'แบบฟอร์มใบเสนอราคาระดับมืออาชีพ ใส่โลโก้บริษัท คำนวณส่วนลดและ VAT 7% ให้อัตโนมัติ',
    fileSize: '1.4 MB',
    downloads: 85,
    filename: 'Professional_Quotation_VAT.xlsx',
  },
  {
    id: 'inv-2',
    title: 'ใบแจ้งหนี้ / ใบวางบิล (Invoice & Billing Note)',
    category: 'อินวอยซ์',
    description: 'ออกใบแจ้งหนี้ให้ลูกค้าพร้อมรายการสินค้า เงื่อนไขการชำระเงิน และช่องทางโอนเงิน',
    fileSize: '1.3 MB',
    downloads: 62,
    filename: 'Invoice_Billing_Note_Template.xlsx',
  },
  {
    id: 'inv-3',
    title: 'ใบเสร็จรับเงิน / ใบกำกับภาษีอย่างย่อ (Tax Invoice & Receipt)',
    category: 'อินวอยซ์',
    description: 'พิมพ์ใบเสร็จรับเงินยืนยันการชำระเงิน รันเลขที่เอกสารต่อเนื่อง และแปลงตัวเลขเป็นบาทไทย',
    fileSize: '1.6 MB',
    downloads: 54,
    filename: 'Tax_Invoice_Receipt.xlsx',
  },
  {
    id: 'inv-4',
    title: 'ใบหัก ณ ที่จ่าย 3% / 5% (Withholding Tax Certificate Log)',
    category: 'อินวอยซ์',
    description: 'บันทึกรายการภาษีหัก ณ ที่จ่าย ที่ถูกหักหรือต้องนำส่งสรรพากรในแต่ละเดือน',
    fileSize: '1.1 MB',
    downloads: 28,
    filename: 'Withholding_Tax_Tracker.xlsx',
  },
  {
    id: 'inv-5',
    title: 'ใบส่งของ / ใบกำกับสินค้า (Delivery Order)',
    category: 'อินวอยซ์',
    description: 'บันทึกการส่งมอบสินค้าพร้อมช่องให้ลูกค้าเซ็นรับสินค้าและตรวจสอบความถูกต้อง',
    fileSize: '1.2 MB',
    downloads: 15,
    filename: 'Delivery_Order_Template.xlsx',
  },

  // 3. การเดินทาง (5)
  {
    id: 'trv-1',
    title: 'วางแผนงบประมาณทริปท่องเที่ยว (Travel Budget Planner)',
    category: 'การเดินทาง',
    description: 'คำนวณค่าตั๋วเครื่องบิน ที่พัก อาหาร และของฝาก พร้อมแปลงอัตราแลกเปลี่ยนเงินตราต่างประเทศ',
    fileSize: '1.5 MB',
    downloads: 34,
    filename: 'Travel_Budget_Planner.xlsx',
  },
  {
    id: 'trv-2',
    title: 'ตารางแผนการเดินทางท่องเที่ยวแบบละเอียด (Travel Itinerary)',
    category: 'การเดินทาง',
    description: 'จัดตารางเวลาเที่ยวแบบ Day-by-Day ใส่ชื่อสถานที่ เวลาเดินทาง และลิงก์ Google Maps',
    fileSize: '1.3 MB',
    downloads: 21,
    filename: 'Travel_Itinerary_Schedule.xlsx',
  },
  {
    id: 'trv-3',
    title: 'แบบฟอร์มเบิกจ่ายค่าเดินทางธุรกิจ (Business Travel Expense Claim)',
    category: 'การเดินทาง',
    description: 'ใบขอเบิกเงินค่าเบี้ยเลี้ยง ค่าที่พัก และค่าน้ำมันสำหรับการเดินทางไปติดต่องานบริษัท',
    fileSize: '1.4 MB',
    downloads: 45,
    filename: 'Travel_Expense_Claim.xlsx',
  },
  {
    id: 'trv-4',
    title: 'บันทึกการใช้รถยนต์และค่าน้ำมัน (Vehicle Mileage & Fuel Log)',
    category: 'การเดินทาง',
    description: 'จดเลขไมล์รถ จุดเริ่มต้น-ปลายทาง ปริมาณน้ำมันที่เติม และคำนวณอัตราสิ้นเปลือง กม./ลิตร',
    fileSize: '1.1 MB',
    downloads: 11,
    filename: 'Mileage_Fuel_Log.xlsx',
  },
  {
    id: 'trv-5',
    title: 'เช็กลิสต์จัดกระเป๋าเดินทาง (Packing Checklist)',
    category: 'การเดินทาง',
    description: 'รายการสิ่งของ เสื้อผ้า ยารักษาโรค และเอกสารสำคัญที่ต้องเตรียมพร้อมเช็คบ็อกซ์',
    fileSize: '0.9 MB',
    downloads: 29,
    filename: 'Travel_Packing_Checklist.xlsx',
  },

  // 4. การขายและสินค้าคงคลัง (5)
  {
    id: 'sal-1',
    title: 'ตารางบันทึกสต็อกสินค้าคงคลังและแจ้งเตือนสินค้าใกล้หมด (Inventory Stock Tracker)',
    category: 'การขายและสินค้าคงคลัง',
    description: 'บันทึกรับเข้า-เบิกออก คำนวณสต็อกคงเหลือ และไฮไลต์แถบสีอัตโนมัติเมื่อต่ำกว่า Reorder Point',
    fileSize: '2.5 MB',
    downloads: 140,
    filename: 'Inventory_Stock_Reorder_Alert.xlsx',
  },
  {
    id: 'sal-2',
    title: 'รายงานสรุปยอดขายประจำวัน/เดือน (Daily & Monthly Sales Report)',
    category: 'การขายและสินค้าคงคลัง',
    description: 'สรุปยอดขายแยกตามพนักงานขาย สินค้า และช่องทางจำหน่าย พร้อมกราฟแนวโน้ม',
    fileSize: '2.2 MB',
    downloads: 78,
    filename: 'Sales_Report_Dashboard.xlsx',
  },
  {
    id: 'sal-3',
    title: 'คำนวณค่าคอมมิชชั่นฝ่ายขาย (Sales Commission Calculator)',
    category: 'การขายและสินค้าคงคลัง',
    description: 'คำนวณค่าตอบแทนพิเศษและโบนัสตามขั้นบันไดยอดขายของทีมเซลส์',
    fileSize: '1.3 MB',
    downloads: 32,
    filename: 'Sales_Commission_Calculator.xlsx',
  },
  {
    id: 'sal-4',
    title: 'ใบสั่งซื้อสินค้า (Purchase Order - PO)',
    category: 'การขายและสินค้าคงคลัง',
    description: 'แบบฟอร์มสั่งซื้อวัตถุดิบหรือสินค้าจากซัพพลายเออร์ พร้อมเงื่อนไขการส่งมอบ',
    fileSize: '1.2 MB',
    downloads: 26,
    filename: 'Purchase_Order_PO_Template.xlsx',
  },
  {
    id: 'sal-5',
    title: 'ตารางเปรียบเทียบราคาซัพพลายเออร์ (Vendor Price Comparison)',
    category: 'การขายและสินค้าคงคลัง',
    description: 'วิเคราะห์ราคา เงื่อนไขเครดิตเทอม และคะแนนคุณภาพสินค้าจากคู่ค้า 3-5 ราย',
    fileSize: '1.6 MB',
    downloads: 64,
    filename: 'Vendor_Price_Comparison.xlsx',
  },

  // 5. การศึกษา (5)
  {
    id: 'edu-1',
    title: 'ตารางเรียนและแผนการอ่านหนังสือสอบ (Class Schedule & Study Plan)',
    category: 'การศึกษา',
    description: 'จัดตารางเรียนประจำสัปดาห์ กำหนดเวลาอ่านหนังสือสอบ และแจ้งเตือนกำหนดส่งรายงาน',
    fileSize: '1.1 MB',
    downloads: 18,
    filename: 'Student_Study_Schedule.xlsx',
  },
  {
    id: 'edu-2',
    title: 'คำนวณเกรดเฉลี่ยสะสม GPA / GPAX (GPA Calculator)',
    category: 'การศึกษา',
    description: 'ใส่หน่วยกิตและเกรดแต่ละวิชา ระบบคำนวณเกรดเฉลี่ยสะสมตามสูตรมาตรฐานมหาวิทยาลัย',
    fileSize: '1.0 MB',
    downloads: 55,
    filename: 'GPA_GPAX_Calculator.xlsx',
  },
  {
    id: 'edu-3',
    title: 'สมุดบันทึกคะแนนเก็บและตัดเกรดอิงเกณฑ์/อิงกลุ่ม (Teacher Gradebook)',
    category: 'การศึกษา',
    description: 'สำหรับคุณครู บันทึกคะแนนสอบ คะแนนการบ้าน และตัดเกรด A, B+, B, C ให้อัตโนมัติ',
    fileSize: '2.0 MB',
    downloads: 92,
    filename: 'Teacher_Gradebook_Grading.xlsx',
  },
  {
    id: 'edu-4',
    title: 'ตารางเช็กชื่อนักเรียนและการเข้าชั้นเรียน (Student Attendance Sheet)',
    category: 'การศึกษา',
    description: 'เช็คชื่อ มา สาย ลา ขาด พร้อมคำนวณเปอร์เซ็นต์เวลาเรียนขั้นต่ำ 80% อัตโนมัติ',
    fileSize: '1.5 MB',
    downloads: 41,
    filename: 'Student_Attendance_Record.xlsx',
  },
  {
    id: 'edu-5',
    title: 'วางแผนงบประมาณการศึกษาและกู้ยืม กยศ. (Education Expense Plan)',
    category: 'การศึกษา',
    description: 'คำนวณค่าเล่าเรียน ค่าหอพัก ค่าหนังสือ และแผนการใช้จ่ายเงินกู้ยืมเพื่อการศึกษา',
    fileSize: '1.2 MB',
    downloads: 25,
    filename: 'Education_Expense_Plan.xlsx',
  },

  // 6. กีฬา (5)
  {
    id: 'spt-1',
    title: 'ตารางจัดสายแข่งขันและตารางคะแนนลีกกีฬา (Tournament Bracket & League Table)',
    category: 'กีฬา',
    description: 'จัดสายแข่งฟุตบอล บาสเกตบอล คำนวณแต้ม ประตูได้เสีย และจัดอันดับตารางคะแนนอัตโนมัติ',
    fileSize: '2.3 MB',
    downloads: 68,
    filename: 'Tournament_Bracket_League_Table.xlsx',
  },
  {
    id: 'spt-2',
    title: 'ตารางฝึกซ้อมวิ่งมาราธอน 16 สัปดาห์ (Marathon Training Log)',
    category: 'กีฬา',
    description: 'โปรแกรมซ้อมวิ่งระยะ 10K, ฮาล์ฟ และฟูลมาราธอน พร้อมบันทึกระยะทาง Pace และ HR',
    fileSize: '1.4 MB',
    downloads: 16,
    filename: 'Marathon_16Weeks_Training.xlsx',
  },
  {
    id: 'spt-3',
    title: 'บันทึกการออกกำลังกายและน้ำหนักเวทเทรนนิ่ง (Workout & Weight Lifting Log)',
    category: 'กีฬา',
    description: 'จดบันทึกเซ็ต จำนวนครั้ง (Reps) น้ำหนัก (Weights) และคำนวณ 1RM (One Rep Max)',
    fileSize: '1.2 MB',
    downloads: 22,
    filename: 'Workout_WeightLifting_Log.xlsx',
  },
  {
    id: 'spt-4',
    title: 'วิเคราะห์สถิตินักกีฬาและทีม (Player & Team Performance Stats)',
    category: 'กีฬา',
    description: 'เก็บข้อมูลคะแนน ประสิทธิภาพการเล่น และกราฟเปรียบเทียบฟอร์มการเล่นของนักกีฬา',
    fileSize: '1.9 MB',
    downloads: 38,
    filename: 'Athlete_Performance_Stats.xlsx',
  },
  {
    id: 'spt-5',
    title: 'วางแผนจัดการงบประมาณสโมสรกีฬา (Sports Club Budget)',
    category: 'กีฬา',
    description: 'บริหารรายรับจากสปอนเซอร์ ค่าบำรุงสมาชิก และค่าใช้จ่ายในการจัดทัวร์นาเมนต์',
    fileSize: '1.5 MB',
    downloads: 9,
    filename: 'Sports_Club_Budget.xlsx',
  },

  // 7. ทรัพยากรบุคคล (5)
  {
    id: 'hr-1',
    title: 'ตารางประเมินผลการปฏิบัติงาน KPI พนักงาน (Employee KPI Evaluation)',
    category: 'ทรัพยากรบุคคล',
    description: 'กำหนดเป้าหมาย KPI ถ่วงน้ำหนักคะแนน คำนวณเกรดประเมินผล และสรุปการขึ้นเงินเดือน',
    fileSize: '2.1 MB',
    downloads: 46,
    filename: 'Employee_KPI_Evaluation.xlsx',
  },
  {
    id: 'hr-2',
    title: 'ใบสมัครงานและแบบบันทึกสัมภาษณ์งาน (Job Applicant Tracking)',
    category: 'ทรัพยากรบุคคล',
    description: 'ติดตามรายชื่อผู้สมัครงาน ตำแหน่งที่เปิดรับ คะแนนสอบสัมภาษณ์ และสถานะการจ้างงาน',
    fileSize: '1.6 MB',
    downloads: 27,
    filename: 'Applicant_Tracking_System_ATS.xlsx',
  },
  {
    id: 'hr-3',
    title: 'ตารางสรุปวันลาพนักงาน ประจำปี (Annual Leave Tracker)',
    category: 'ทรัพยากรบุคคล',
    description: 'บันทึกสิทธิ์ลาพักร้อน ลาป่วย ลากิจ สรุปวันลาที่ใช้ไปและโควตาคงเหลือของพนักงานทุกคน',
    fileSize: '2.4 MB',
    downloads: 39,
    filename: 'Annual_Leave_Tracker.xlsx',
  },
  {
    id: 'hr-4',
    title: 'แผนการฝึกอบรมและพัฒนาบุคลากร (Training & Development Plan)',
    category: 'ทรัพยากรบุคคล',
    description: 'วางแผนคอร์สอบรม ค่าใช้จ่ายต่อหัว และติดตามผลการประเมินหลังการอบรม',
    fileSize: '1.7 MB',
    downloads: 14,
    filename: 'Employee_Training_Plan.xlsx',
  },
  {
    id: 'hr-5',
    title: 'เช็กลิสต์รับพนักงานใหม่ Onboarding & Offboarding (HR Checklist)',
    category: 'ทรัพยากรบุคคล',
    description: 'ขั้นตอนการรับพนักงานใหม่ การตั้งค่าอุปกรณ์ และการส่งมอบงานเมื่อพนักงานลาออก',
    fileSize: '1.2 MB',
    downloads: 8,
    filename: 'HR_Onboarding_Offboarding.xlsx',
  },

  // 8. ที่อยู่อาศัย / บุคคลทั่วไป (5)
  {
    id: 'res-1',
    title: 'คำนวณค่างวดผ่อนบ้านและการโปะลดต้นลดดอก (Home Loan Amortization Calculator)',
    category: 'ที่อยู่อาศัย / บุคคลทั่วไป',
    description: 'คำนวณค่างวดรายเดือน ดอกเบี้ยแท้จริง และแสดงให้เห็นว่าโปะเงินเพิ่มช่วยลดดอกเบี้ยกี่แสนบาท',
    fileSize: '2.2 MB',
    downloads: 72,
    filename: 'Home_Loan_Amortization.xlsx',
  },
  {
    id: 'res-2',
    title: 'คำนวณค่าส่วนกลางและค่าน้ำ-ไฟ คอนโด/หมู่บ้าน (Condo & HOA Utility Billing)',
    category: 'ที่อยู่อาศัย / บุคคลทั่วไป',
    description: 'คำนวณค่าส่วนกลางตามขนาดพื้นที่ตารางเมตร และค่าน้ำค่าไฟรายยูนิตพร้อมออกใบแจ้งหนี้',
    fileSize: '1.8 MB',
    downloads: 31,
    filename: 'HOA_Utility_Billing.xlsx',
  },
  {
    id: 'res-3',
    title: 'งบประมาณตกแต่งและต่อเติมบ้าน (Home Renovation Budget)',
    category: 'ที่อยู่อาศัย / บุคคลทั่วไป',
    description: 'ควบคุมค่าช่าง ค่ากระเบื้อง อุปกรณ์ห้องครัว ห้องน้ำ ป้องกันปัญหางบบานปลาย',
    fileSize: '1.9 MB',
    downloads: 115,
    filename: 'Home_Renovation_Budget.xlsx',
  },
  {
    id: 'res-4',
    title: 'ตารางจัดระเบียบงานบ้านและการทำความสะอาด (Home Chore Schedule)',
    category: 'ที่อยู่อาศัย / บุคคลทั่วไป',
    description: 'แบ่งเวรทำความสะอาดบ้าน ซักผ้า ล้างจาน และตรวจเช็กสต็อกของใช้ในครัวเรือน',
    fileSize: '1.0 MB',
    downloads: 17,
    filename: 'Home_Chore_Schedule.xlsx',
  },
  {
    id: 'res-5',
    title: 'สมุดทะเบียนทรัพย์สินและของมีค่าในบ้าน (Home Inventory for Insurance)',
    category: 'ที่อยู่อาศัย / บุคคลทั่วไป',
    description: 'บันทึกเครื่องใช้ไฟฟ้า เครื่องประดับ เลข Serial Number และมูลค่าสำหรับการทำประกันภัย',
    fileSize: '1.5 MB',
    downloads: 88,
    filename: 'Home_Inventory_Log.xlsx',
  },

  // 9. ปฏิทิน (5)
  {
    id: 'cal-1',
    title: 'ปฏิทินรายปี 2025 พร้อมวันหยุดราชการไทย (2025 Calendar with Thai Holidays)',
    category: 'ปฏิทิน',
    description: 'ปฏิทิน 12 เดือน ปรับเปลี่ยนปีได้อัตโนมัติ ใส่ไฮไลต์วันหยุดนักขัตฤกษ์และวันหยุดชดเชย',
    fileSize: '1.8 MB',
    downloads: 125,
    filename: '2025_Calendar_Thai_Holidays.xlsx',
  },
  {
    id: 'cal-2',
    title: 'ปฏิทินวางแผนคอนเทนต์และโพสต์โซเชียลมีเดีย (Content Calendar Planner)',
    category: 'ปฏิทิน',
    description: 'วางแผนโพสต์ Facebook, TikTok, YouTube กำหนดธีม คอนเซปต์ และสถานะงานกราฟิก/วิดีโอ',
    fileSize: '2.0 MB',
    downloads: 96,
    filename: 'Social_Media_Content_Calendar.xlsx',
  },
  {
    id: 'cal-3',
    title: 'ปฏิทินวางแผนการตลาดและแคมเปญส่งเสริมการขาย (Marketing Campaign Calendar)',
    category: 'ปฏิทิน',
    description: 'จัดตารางแคมเปญลดราคา เทศกาล 11.11, 12.12 งบยิงแอด และเป้าหมายยอดขาย',
    fileSize: '2.1 MB',
    downloads: 42,
    filename: 'Marketing_Campaign_Planner.xlsx',
  },
  {
    id: 'cal-4',
    title: 'ปฏิทินนัดหมายและการประชุมประจำสัปดาห์ (Weekly Appointment Schedule)',
    category: 'ปฏิทิน',
    description: 'จัดตารางเวลารายชั่วโมง 08:00 - 18:00 น. บันทึกห้องประชุม และลิงก์ Zoom / Google Meet',
    fileSize: '1.4 MB',
    downloads: 58,
    filename: 'Weekly_Appointment_Calendar.xlsx',
  },
  {
    id: 'cal-5',
    title: 'ปฏิทินติดตามการสร้างอุปนิสัยประจำวัน (Daily Habit Tracker)',
    category: 'ปฏิทิน',
    description: 'เช็คบ็อกซ์ดื่มน้ำ 2 ลิตร ออกกำลังกาย อ่านหนังสือ สรุปเปอร์เซ็นต์ความต่อเนื่องในแต่ละเดือน',
    fileSize: '1.3 MB',
    downloads: 33,
    filename: 'Daily_Habit_Tracker_2025.xlsx',
  },

  // 10. พนักงาน (5)
  {
    id: 'emp-1',
    title: 'ตารางบันทึกเวลาทำงานและคำนวณค่าล่วงเวลา OT (Timesheet & OT Calculator)',
    category: 'พนักงาน',
    description: 'คำนวณชั่วโมงทำงานปกติ โอที 1 เท่า, 1.5 เท่า, 2 เท่า และ 3 เท่า อัตโนมัติพร้อมออกสรุปยอด',
    fileSize: '2.3 MB',
    downloads: 160,
    filename: 'Employee_Timesheet_OT_Calculator.xlsx',
  },
  {
    id: 'emp-2',
    title: 'สลิปเงินเดือนและใบจ่ายค่าจ้างพนักงาน (Payslip & Payroll Register)',
    category: 'พนักงาน',
    description: 'ออกสลิปเงินเดือนอัตโนมัติ หักประกันสังคม ภาษีหัก ณ ที่จ่าย กองทุนสำรองเลี้ยงชีพ พร้อมพิมพ์',
    fileSize: '2.6 MB',
    downloads: 92,
    filename: 'Payslip_Payroll_Template.xlsx',
  },
  {
    id: 'emp-3',
    title: 'ตารางจัดกะการทำงานพนักงานร้านอาหาร/โรงงาน (Shift Roster Schedule)',
    category: 'พนักงาน',
    description: 'จัดกะ เช้า บ่าย ดึก เช็ควันหยุดพนักงานไม่ให้ชนกัน และคำนวณกำลังคนแต่ละกะอัตโนมัติ',
    fileSize: '2.1 MB',
    downloads: 53,
    filename: 'Employee_Shift_Roster.xlsx',
  },
  {
    id: 'emp-4',
    title: 'ทะเบียนประวัติพนักงานและข้อมูลติดต่อฉุกเฉิน (Employee Directory & Profile)',
    category: 'พนักงาน',
    description: 'บันทึกข้อมูลส่วนตัว ตำแหน่ง แผนก เลขประจำตัว เบอร์โทรศัพท์ และประวัติการทำงาน',
    fileSize: '1.7 MB',
    downloads: 24,
    filename: 'Employee_Directory_Database.xlsx',
  },
  {
    id: 'emp-5',
    title: 'แบบฟอร์มเบิกเงินสดย่อยและค่าใช้จ่ายทั่วไป (Petty Cash Voucher)',
    category: 'พนักงาน',
    description: 'บันทึกการเบิกเงินสดย่อยในออฟฟิศ ออกใบสำคัญจ่าย และสรุปยอดเงินสดหมุนเวียนคงเหลือ',
    fileSize: '1.2 MB',
    downloads: 11,
    filename: 'Petty_Cash_Voucher_System.xlsx',
  },

  // 11. สุขภาพ (5)
  {
    id: 'hlt-1',
    title: 'คำนวณดัชนีมวลกาย BMI และความต้องการแคลอรี่ BMR/TDEE (BMI & Calorie Calculator)',
    category: 'สุขภาพ',
    description: 'ใส่น้ำหนัก ส่วนสูง อายุ ระบบคำนวณ BMI อัตโนมัติ พร้อมประเมินพลังงานที่ร่างกายต้องการต่อวัน',
    fileSize: '1.3 MB',
    downloads: 64,
    filename: 'BMI_BMR_TDEE_Calculator.xlsx',
  },
  {
    id: 'hlt-2',
    title: 'บันทึกอาหารและแคลอรี่ประจำวัน (Daily Meal & Calorie Food Diary)',
    category: 'สุขภาพ',
    description: 'จดบันทึกอาหารแต่ละมื้อ คำนวณโปรตีน คาร์โบไฮเดรต ไขมัน และเปรียบเทียบกับเป้าหมาย',
    fileSize: '1.6 MB',
    downloads: 105,
    filename: 'Daily_Meal_Calorie_Diary.xlsx',
  },
  {
    id: 'hlt-3',
    title: 'ตารางบันทึกความดันโลหิตและชีพจร (Blood Pressure & Pulse Log)',
    category: 'สุขภาพ',
    description: 'สำหรับผู้ป่วยความดันโลหิต บันทึกค่าตัวบน-ตัวล่าง พร้อมไฮไลต์เตือนเมื่อความดันสูงกว่าปกติ',
    fileSize: '1.2 MB',
    downloads: 43,
    filename: 'Blood_Pressure_Log.xlsx',
  },
  {
    id: 'hlt-4',
    title: 'บันทึกระดับน้ำตาลในเลือดสำหรับผู้ป่วยเบาหวาน (Blood Glucose Tracker)',
    category: 'สุขภาพ',
    description: 'จดค่าน้ำตาลก่อน-หลังอาหารเช้า กลางวัน เย็น และก่อนนอน เพื่อนำไปให้แพทย์ดูย้อนหลัง',
    fileSize: '1.4 MB',
    downloads: 52,
    filename: 'Blood_Glucose_Tracker.xlsx',
  },
  {
    id: 'hlt-5',
    title: 'ตารางบันทึกการนอนหลับและคุณภาพการนอน (Sleep Quality & Hours Log)',
    category: 'สุขภาพ',
    description: 'จดเวลานอน เวลาตื่น และคะแนนคุณภาพการนอนหลับเพื่อสุขภาพที่ดี',
    fileSize: '0.9 MB',
    downloads: 27,
    filename: 'Sleep_Quality_Log.xlsx',
  },
];

// Combine all: 54 PM + 56 General = 110 Free Templates
const PM_TEMPLATES_CONVERTED: ExcelTemplateItem[] = PROJECT_MANAGEMENT_TEMPLATES.map((pm) => ({
  id: pm.id,
  itemNumber: pm.itemNumber,
  title: pm.title,
  category: 'การจัดการโครงการ',
  subGroup: pm.subGroup,
  format: pm.format,
  description: pm.description,
  fileSize: pm.fileSize,
  downloads: pm.downloads,
  filename: pm.filename,
  keyFeatures: pm.keyFeatures,
  recommendedFor: pm.recommendedFor,
}));

const ALL_TEMPLATES: ExcelTemplateItem[] = [
  ...PM_TEMPLATES_CONVERTED,
  ...GENERAL_EXCEL_TEMPLATES,
];

// Interactive Gantt Task model for sandbox
interface GanttTask {
  id: string;
  name: string;
  startDay: number;
  duration: number;
  progress: number;
  owner: string;
  status: 'completed' | 'on_track' | 'at_risk' | 'pending';
}

const INITIAL_GANTT_TASKS: GanttTask[] = [
  {
    id: 't-1',
    name: '1. กฎบัตรโครงการ & อนุมัติงบประมาณ (Project Charter)',
    startDay: 1,
    duration: 5,
    progress: 100,
    owner: 'ธนาพงศ์ (PM)',
    status: 'completed',
  },
  {
    id: 't-2',
    name: '2. สรุปความต้องการ & ทำ RACI Matrix',
    startDay: 4,
    duration: 6,
    progress: 85,
    owner: 'วิจิตรา (BA)',
    status: 'on_track',
  },
  {
    id: 't-3',
    name: '3. ออกแบบและพัฒนาโครงสร้าง WBS 4 ระดับ',
    startDay: 9,
    duration: 10,
    progress: 55,
    owner: 'สมชาย (Lead Dev)',
    status: 'on_track',
  },
  {
    id: 't-4',
    name: '4. จัดการความเสี่ยง & ตรวจเช็ก Punch List',
    startDay: 16,
    duration: 6,
    progress: 30,
    owner: 'อนุสรณ์ (QA)',
    status: 'at_risk',
  },
  {
    id: 't-5',
    name: '5. ตรวจรับผลงาน & ส่งมอบโครงการ (Handover)',
    startDay: 21,
    duration: 4,
    progress: 0,
    owner: 'ทีมบริหาร & ลูกค้า',
    status: 'pending',
  },
];

export function ExcelTemplatesLibraryPage() {
  const { route, navigate, showToast } = useApp();

  // Read initial category from route query (?cat=...) if present
  const queryCat = useMemo(() => {
    const searchPart = route.includes('?') ? route.split('?')[1] : '';
    return new URLSearchParams(searchPart).get('cat');
  }, [route]);

  const [selectedCategory, setSelectedCategory] = useState<string>(
    queryCat && CATEGORIES.includes(queryCat) ? queryCat : 'การจัดการโครงการ'
  );
  const [selectedPmSubGroup, setSelectedPmSubGroup] = useState<string>('ทั้งหมดในหมวด');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Interactive Gantt state
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>(INITIAL_GANTT_TASKS);
  const [newTaskName, setNewTaskName] = useState('');

  // Sync category if query changes
  useEffect(() => {
    if (queryCat && CATEGORIES.includes(queryCat)) {
      setSelectedCategory(queryCat);
    }
  }, [queryCat]);

  const filteredTemplates = useMemo(() => {
    return ALL_TEMPLATES.filter((t) => {
      // Category filter
      const matchCat = selectedCategory === 'ทั้งหมด' || t.category === selectedCategory;

      // Sub-group filter (only applicable when in 'การจัดการโครงการ')
      const matchSubGroup =
        selectedCategory !== 'การจัดการโครงการ' ||
        selectedPmSubGroup === 'ทั้งหมดในหมวด' ||
        t.subGroup === selectedPmSubGroup;

      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.keyFeatures && t.keyFeatures.some((k) => k.toLowerCase().includes(q))) ||
        (t.recommendedFor && t.recommendedFor.toLowerCase().includes(q));

      return matchCat && matchSubGroup && matchQuery;
    });
  }, [selectedCategory, selectedPmSubGroup, searchQuery]);

  const handleDownload = (template: ExcelTemplateItem) => {
    const isWord = template.format?.includes('Word');
    const fileTypeDesc = isWord ? 'Word (.docx)' : 'Excel (.xlsx)';

    showToast({
      type: 'success',
      title: `ดาวน์โหลดไฟล์ "${template.title}" สำเร็จ`,
      description: `กำลังดาวน์โหลดไฟล์ ${fileTypeDesc} ลงในเครื่องของคุณ`,
    });

    const mime = isWord
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    const blobContent = [
      `PK\x03\x04\x14\x00\x06\x00\x08\x00\x00\x00!\x00`,
      `[Kodraewjob Digital Template Header]\n`,
      `Template ID: ${template.id}\n`,
      `Title: ${template.title}\n`,
      `Category: ${template.category}\n`,
      `SubGroup: ${template.subGroup || 'General'}\n`,
      `File Name: ${template.filename}\n`,
      `Recommended For: ${template.recommendedFor || 'All Professionals'}\n`,
      `Downloads: ${template.downloads}\n`,
      `Downloaded from: Kodraewjob (กดแล้วจบ) Digital Marketplace\n`,
    ].join('');

    const blob = new Blob([blobContent], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = template.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTaskProgressChange = (id: string, progress: number) => {
    setGanttTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          let status: GanttTask['status'] = t.status;
          if (progress === 100) status = 'completed';
          else if (progress > 50) status = 'on_track';
          else if (progress > 0) status = 'at_risk';
          else status = 'pending';
          return { ...t, progress, status };
        }
        return t;
      })
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    const nextStart = ganttTasks.length > 0 ? ganttTasks[ganttTasks.length - 1].startDay + 3 : 1;
    const newTask: GanttTask = {
      id: `task-${Date.now()}`,
      name: newTaskName.trim(),
      startDay: nextStart,
      duration: 5,
      progress: 0,
      owner: 'สมาชิกในทีม',
      status: 'pending',
    };
    setGanttTasks([...ganttTasks, newTask]);
    setNewTaskName('');
    showToast({
      type: 'success',
      title: 'เพิ่มงานใหม่ในแผนภูมิแกนต์จำลองแล้ว',
    });
  };

  const shareUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : 'https://kodraewjob.com/excel-templates';
  const shareText =
    'รวม 54 เทมเพลตการจัดการโครงการ + 56 เทมเพลต Excel ครบทุกสายงาน โหลดฟรี! - กดแล้วจบ';
  const fbShareHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareUrl
  )}&quote=${encodeURIComponent(shareText)}`;
  const lineShareHref = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
    shareUrl
  )}&text=${encodeURIComponent(shareText)}`;

  const pmCount = ALL_TEMPLATES.filter((t) => t.category === 'การจัดการโครงการ').length;

  return (
    <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Article Header Banner */}
      <div className="rounded-3xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 sm:p-10 soft-card space-y-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-stone-500">
          <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold inline-flex items-center gap-1.5">
            <FolderKanban className="w-3.5 h-3.5" />
            ใหม่! คลัง 54 เทมเพลตจัดการโครงการ
          </span>
          <span>•</span>
          <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-semibold">
            Microsoft Excel &amp; Word
          </span>
          <span>•</span>
          <span>อัปเดต พฤศจิกายน 2026</span>
          <span>•</span>
          <span>โดย เกร็ดสาระความรู้ไอที &amp; กดแล้วจบ</span>
          <span>•</span>
          <span className="inline-flex items-center gap-1 font-semibold text-orange-600">
            <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
            <span className="tabular-nums">155</span> อ่าน
          </span>
        </div>

        <h1 className="font-display font-bold text-2xl sm:text-4xl text-[#1E1B18] dark:text-orange-50 leading-tight">
          54 เทมเพลตการจัดการโครงการที่ดีที่สุดสำหรับ Excel &amp; Word (แจกฟรี ครบทุกสายงาน)
        </h1>

        <div className="flex items-center justify-between flex-wrap gap-4 pt-2 border-t border-orange-100 dark:border-orange-900/30">
          <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
            <span className="font-semibold text-[#1E1B18] dark:text-orange-100">แชร์คลังเทมเพลตนี้:</span>
            <a
              href={fbShareHref}
              target="_blank"
              rel="noreferrer"
              onClick={() => showToast({ type: 'success', title: 'เปิดหน้าต่างแชร์ Facebook' })}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold inline-flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" /> แชร์ Facebook
            </a>
            <a
              href={lineShareHref}
              target="_blank"
              rel="noreferrer"
              onClick={() => showToast({ type: 'success', title: 'เปิดหน้าต่างแชร์ LINE' })}
              className="px-3 py-1.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-semibold inline-flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" /> แชร์ LINE
            </a>
          </div>
          <button
            onClick={() => navigate('/blog/54-project-management-templates-excel-word')}
            className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-1"
          >
            <BookOpen className="w-4 h-4" /> อ่านบทความคู่มือบริหารโครงการฉบับเต็ม
          </button>
        </div>

        {/* Introduction Text and Hero Graphic */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 prose dark:prose-invert max-w-none text-stone-700 dark:text-stone-300 space-y-4 text-sm sm:text-base leading-relaxed">
            <p>
              <strong>ยังใช้สเปรดชีตจัดการโครงการอยู่หรือเปล่า?</strong> เปลี่ยนวิธีบริหารโครงการของคุณด้วยเทมเพลต Excel และ Word สำเร็จรูปที่ออกแบบมาอย่างมืออาชีพ เพื่อให้คุณวางแผน ติดตาม และรายงานด้วยโครงสร้างที่เป็นระบบ
            </p>
            <p>
              ก่อนจะบริหารโครงการได้ คุณต้องมีเครื่องมือจัดการโครงการที่เหมาะสมสำหรับเก็บข้อมูลที่จำเป็นในการกำหนดกลยุทธ์ และเทมเพลต Excel สำหรับการจัดการโครงการก็เป็นจุดเริ่มต้นที่ดี พนักงานและสมาชิกทีมมักคุ้นเคยกับ Microsoft Excel อยู่แล้ว เพราะมีผู้ใช้ Excel ทั่วโลกประมาณ 1.1–1.5 พันล้านคน จึงเป็นซอฟต์แวร์เริ่มต้นที่ใช้งานสบายที่สุด
            </p>
            <p>
              วันนี้ <strong>กดแล้วจบ (Kodraewjob)</strong> ได้รวบรวม <strong>54 เทมเพลตการจัดการโครงการที่ดีที่สุด</strong> ครอบคลุมทุกเฟสตั้งแต่แผนภูมิแกนต์, WBS, กฎบัตรโครงการ, งบประมาณ, เมทริกซ์ RACI, RAID Log, ไปจนถึงการส่งมอบงาน พร้อมเทมเพลต Excel งานทั่วไปอีก 56 แบบ รวมทั้งหมด <strong>110+ เทมเพลต</strong> ให้ดาวน์โหลดไปปรับใช้ฟรีทันทีครับ!
            </p>
          </div>
          <div className="lg:col-span-5">
            <img
              src="/src/assets/images/blog_project_management_gantt_1795746417626.jpg"
              alt="ภาพตัวอย่างแดชบอร์ดและแผนภูมิแกนต์การจัดการโครงการ"
              referrerPolicy="no-referrer"
              className="w-full rounded-2xl border border-orange-200 dark:border-orange-900/50 shadow-md object-cover"
            />
          </div>
        </div>
      </div>

      {/* Featured Quick Action Cards: PM vs General */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => {
            setSelectedCategory('การจัดการโครงการ');
            setSelectedPmSubGroup('ทั้งหมดในหมวด');
          }}
          className={`p-5 rounded-2xl border text-left transition-all ${
            selectedCategory === 'การจัดการโครงการ'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-400/30'
              : 'bg-white dark:bg-[#1F1815] border-orange-200/80 dark:border-orange-900/40 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-1.5">
              <FolderKanban className="w-3.5 h-3.5" /> แนะนำพิเศษ
            </span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
              54 เทมเพลต
            </span>
          </div>
          <h3 className="font-display font-bold text-lg text-[#1E1B18] dark:text-orange-50 mt-2">
            54 เทมเพลตการจัดการโครงการ (Project Management)
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
            แผนภูมิแกนต์, WBS, CPM, PERT, งบประมาณ, RACI, RAID Log, แดชบอร์ดผู้บริหาร
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedCategory('การเงินและการบัญชี');
          }}
          className={`p-5 rounded-2xl border text-left transition-all ${
            selectedCategory !== 'การจัดการโครงการ'
              ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-400 ring-2 ring-orange-400/30'
              : 'bg-white dark:bg-[#1F1815] border-orange-200/80 dark:border-orange-900/40 hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-lg bg-orange-500 text-white text-xs font-bold inline-flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" /> คลังทั่วไป
            </span>
            <span className="text-xs font-bold text-orange-700 dark:text-orange-300">
              56 เทมเพลต
            </span>
          </div>
          <h3 className="font-display font-bold text-lg text-[#1E1B18] dark:text-orange-50 mt-2">
            เทมเพลต Excel ครบ 11 สายงานทั่วไป
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
            การเงิน, บัญชี SME, อินวอยซ์, OT พนักงาน, สต็อกสินค้า, การศึกษา, ปฏิทิน
          </p>
        </button>
      </div>

      {/* Interactive Live Gantt & Task Planner Simulator */}
      <section className="rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-neutral-900 text-white p-6 sm:p-8 shadow-xl border border-stone-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
              <Play className="w-4 h-4 fill-emerald-400" /> เครื่องมือจำลอง Interactive Sandbox
            </div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
              ทดลองใช้งานแผนภูมิแกนต์ &amp; ตัวติดตามความคืบหน้าโครงการแบบสด
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              ปรับแถบเลื่อนความคืบหน้าด้านล่างเพื่อดูแถบสีไทม์ไลน์อัปเดตแบบเรียลไทม์ หรือดาวน์โหลดไฟล์เทมเพลต Excel ไปปรับแก้
            </p>
          </div>
          <button
            onClick={() => handleDownload(PM_TEMPLATES_CONVERTED[0])}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-lg shrink-0 self-start sm:self-auto"
          >
            <Download className="w-4 h-4" /> โหลดเทมเพลตแผนภูมิแกนต์ (.xlsx)
          </button>
        </div>

        {/* Gantt Interactive List */}
        <div className="space-y-3 bg-stone-950/60 p-4 rounded-2xl border border-stone-800">
          <div className="hidden sm:grid grid-cols-12 text-[11px] font-bold text-stone-400 px-3 pb-2 border-b border-stone-800">
            <span className="col-span-4">ชื่องานและหมุดหมาย</span>
            <span className="col-span-2 text-center">ผู้รับผิดชอบ</span>
            <span className="col-span-2 text-center">ความคืบหน้า (%)</span>
            <span className="col-span-4 text-center">แถบไทม์ไลน์แผนภูมิแกนต์ (สัปดาห์ 1-4)</span>
          </div>

          {ganttTasks.map((task) => {
            const barLeft = `${(task.startDay / 26) * 100}%`;
            const barWidth = `${Math.max(12, (task.duration / 26) * 100)}%`;

            let statusBg = 'bg-emerald-500';
            let statusText = 'เสร็จสมบูรณ์';
            if (task.status === 'at_risk') {
              statusBg = 'bg-amber-500';
              statusText = 'มีความเสี่ยง';
            } else if (task.status === 'pending') {
              statusBg = 'bg-stone-600';
              statusText = 'รอเริ่มงาน';
            } else if (task.status === 'on_track') {
              statusBg = 'bg-blue-500';
              statusText = 'กำลังดำเนินการ';
            }

            return (
              <div
                key={task.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-2 items-center bg-stone-900/80 hover:bg-stone-900 p-3 rounded-xl border border-stone-800/80 transition-colors"
              >
                <div className="sm:col-span-4">
                  <p className="text-xs sm:text-sm font-semibold text-stone-200 line-clamp-1">
                    {task.name}
                  </p>
                  <span className="text-[10px] text-stone-400 sm:hidden">
                    ผู้รับผิดชอบ: {task.owner} · สถานะ: {statusText}
                  </span>
                </div>

                <div className="hidden sm:block sm:col-span-2 text-center text-xs text-stone-400">
                  {task.owner}
                </div>

                <div className="sm:col-span-2 flex items-center justify-between sm:justify-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={task.progress}
                    onChange={(e) =>
                      handleTaskProgressChange(task.id, parseInt(e.target.value, 10))
                    }
                    className="w-24 accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold w-9 text-right text-emerald-400 tabular-nums">
                    {task.progress}%
                  </span>
                </div>

                {/* Visual Gantt Bar */}
                <div className="sm:col-span-4 bg-stone-950/80 rounded-lg h-7 p-1 relative overflow-hidden flex items-center">
                  <div
                    className={`h-5 rounded-md ${statusBg} flex items-center justify-between px-2 text-[10px] font-bold text-white shadow-sm transition-all duration-300`}
                    style={{
                      marginLeft: barLeft,
                      width: barWidth,
                    }}
                  >
                    <span className="truncate">{task.progress}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add custom task form */}
        <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-3 pt-2">
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="เพิ่มงานใหม่เข้าตาราง เช่น 'ประชุมตรวจรับงานงวดที่ 2'..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-xs sm:text-sm text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 border border-stone-700"
          >
            + เพิ่มงานลงในแผนภูมิแกนต์
          </button>
        </form>
      </section>

      {/* 4 Highlight General Templates */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-[#1E1B18] dark:text-orange-50">
            Highlight! 4 เทมเพลต Excel ยอดนิยม แก้ปัญหาที่พบบ่อย
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            เริ่มต้นจาก 4 เทมเพลต “พระเอก” สำหรับการจัดการบัญชีส่วนตัว ใบเสนอราคา ค่าล่วงเวลา และสต็อกสินค้า
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Highlight 1 */}
          <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 p-6 soft-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-xs font-bold">
                1. การเงินส่วนบุคคล
              </span>
              <span className="text-xs text-stone-400 font-mono">
                <span className="tabular-nums">48</span> โหลด
              </span>
            </div>
            <h3 className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50">
              อยากทำบัญชีรายรับ-รายจ่ายส่วนตัว ต้องเริ่มยังไง?
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
              สำหรับใครที่อยากเริ่มต้นวางแผนการเงิน แต่ไม่รู้จะออกแบบตารางยังไง ไฟล์นี้คือคำตอบครับ เป็นสมุดบัญชีสำเร็จรูป แค่กรอกตัวเลขรายรับและรายจ่าย ระบบคำนวณยอดคงเหลือให้ทันที
            </p>
            <button
              onClick={() => handleDownload(GENERAL_EXCEL_TEMPLATES[0])}
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> ➡️ ดาวน์โหลดไฟล์บัญชีรายรับ-รายจ่าย
            </button>
          </div>

          {/* Highlight 2 */}
          <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 p-6 soft-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-xs font-bold">
                2. อินวอยซ์ &amp; การขาย
              </span>
              <span className="text-xs text-stone-400 font-mono">
                <span className="tabular-nums">85</span> โหลด
              </span>
            </div>
            <h3 className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50">
              ต้องทำใบเสนอราคาให้ลูกค้า แต่ไม่มีแบบฟอร์มสวยๆ?
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
              หมดกังวลเรื่องความไม่เป็นมืออาชีพ ใช้เทมเพลตใบเสนอราคา (Quotation) ออกแบบมาให้สะอาดตา มีสูตรคำนวณยอดรวมและ VAT 7% อัตโนมัติ พร้อมส่งให้ลูกค้าทันที
            </p>
            <button
              onClick={() => handleDownload(GENERAL_EXCEL_TEMPLATES[6])}
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> ➡️ ดาวน์โหลดไฟล์ใบเสนอราคา
            </button>
          </div>

          {/* Highlight 3 */}
          <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 p-6 soft-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-xs font-bold">
                3. พนักงาน / HR
              </span>
              <span className="text-xs text-stone-400 font-mono">
                <span className="tabular-nums">92</span> โหลด
              </span>
            </div>
            <h3 className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50">
              คำนวณค่าล่วงเวลา (OT) พนักงานยังไงไม่ให้พลาด?
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
              ช่วยให้ฝ่ายบุคคล (HR) หรือเจ้าของธุรกิจทำงานง่ายขึ้น ตารางบันทึกเวลาและคำนวณ OT สำเร็จรูป สูตรตั้งไว้คำนวณค่าแรงล่วงเวลาตามอัตราที่กำหนดให้โดยอัตโนมัติ
            </p>
            <button
              onClick={() => handleDownload(GENERAL_EXCEL_TEMPLATES[46])}
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> ➡️ ดาวน์โหลดไฟล์คำนวณค่าโอที
            </button>
          </div>

          {/* Highlight 4 */}
          <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 p-6 soft-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-xs font-bold">
                4. สต๊อกสินค้า
              </span>
              <span className="text-xs text-stone-400 font-mono">
                <span className="tabular-nums">140</span> โหลด
              </span>
            </div>
            <h3 className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50">
              มีของในสต็อกเท่าไหร่? จัดการสินค้าคงคลังแบบง่ายๆ
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
              สำหรับร้านค้าหรือธุรกิจขนาดเล็ก ตารางบันทึกรับสินค้าเข้าและเบิกออก พร้อมคำนวณยอดคงเหลือล่าสุด ช่วยให้รู้ว่าสินค้าตัวไหนใกล้หมดและต้องสั่งซื้อเพิ่ม
            </p>
            <button
              onClick={() => handleDownload(GENERAL_EXCEL_TEMPLATES[16])}
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> ➡️ ดาวน์โหลดไฟล์จัดการสต็อกสินค้า
            </button>
          </div>
        </div>
      </div>

      {/* Excel Version Tip Box */}
      <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 p-6 space-y-2 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
        <h3 className="font-display font-bold text-base flex items-center gap-2">
          💡 คำแนะนำสำหรับผู้ใช้งาน Excel เวอร์ชั่นเก่า (Office 2003 - 2010)
        </h3>
        <p className="leading-relaxed">
          สูตรทั้งหมดสามารถเปิดใน Office 2003 ได้เช่นกันครับ สำหรับคนที่ใช้ Microsoft Excel 2010 – 2021 เปิดไฟล์ใช้งานแล้วช้า หรือหน่วง ๆ ให้เปิดไฟล์แล้วทำการ <strong>Save as (บันทึกเป็น)</strong> เป็นไฟล์ Excel Workbook (.xlsx) ซึ่งเป็นไฟล์เวอร์ชั่นใหม่ของ Microsoft Excel เพื่อแก้ปัญหาการเปิดไฟล์ช้าครับ
        </p>
      </div>

      {/* Library Section by Category & Search */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-[#1E1B18] dark:text-orange-50">
              คลังเทมเพลตทั้งหมด รวม {ALL_TEMPLATES.length} รายการ (12 หมวดหมู่)
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              เลือกหมวดหมู่ที่ต้องการเพื่อค้นหาเทมเพลตสำเร็จรูปพร้อมสูตรคำนวณอัตโนมัติ
            </p>
          </div>
          <div className="relative sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อเทมเพลต, แผนภูมิแกนต์, WBS, งบ..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 text-xs sm:text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 pb-2 border-b border-orange-200 dark:border-orange-900/40">
          <button
            onClick={() => {
              setSelectedCategory('ทั้งหมด');
              setSelectedPmSubGroup('ทั้งหมดในหมวด');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              selectedCategory === 'ทั้งหมด'
                ? 'bg-orange-500 text-white shadow'
                : 'bg-orange-100/70 dark:bg-orange-950/50 text-orange-800 dark:text-orange-200 hover:bg-orange-200'
            }`}
          >
            ทั้งหมด ({ALL_TEMPLATES.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = ALL_TEMPLATES.filter((t) => t.category === cat).length;
            const isPm = cat === 'การจัดการโครงการ';
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedPmSubGroup('ทั้งหมดในหมวด');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? isPm
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-orange-500 text-white shadow'
                    : isPm
                    ? 'bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200'
                    : 'bg-orange-100/70 dark:bg-orange-950/50 text-orange-800 dark:text-orange-200 hover:bg-orange-200'
                }`}
              >
                {isPm && <FolderKanban className="w-3.5 h-3.5" />}
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* PM Sub-group secondary tabs (Active when 'การจัดการโครงการ' is selected) */}
        {selectedCategory === 'การจัดการโครงการ' && (
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                กรองตามกลุ่มงานจัดการโครงการ (54 เทมเพลต):
              </span>
              <span className="text-[11px] text-stone-500">
                แสดงผล {filteredTemplates.length} รายการ
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PM_SUBGROUPS.map((sub) => {
                const isSelected = selectedPmSubGroup === sub;
                const subCount =
                  sub === 'ทั้งหมดในหมวด'
                    ? pmCount
                    : ALL_TEMPLATES.filter(
                        (t) => t.category === 'การจัดการโครงการ' && t.subGroup === sub
                      ).length;

                return (
                  <button
                    key={sub}
                    onClick={() => setSelectedPmSubGroup(sub)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white dark:bg-stone-850 text-stone-700 dark:text-stone-300 hover:bg-emerald-100/70 border border-emerald-200/50 dark:border-emerald-900/30'
                    }`}
                  >
                    {sub} ({subCount})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Templates Grid - 4 Columns on Full Screen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTemplates.map((t) => {
            const isPm = t.category === 'การจัดการโครงการ';
            const isWord = t.format?.includes('Word');

            return (
              <div
                key={t.id}
                className={`rounded-2xl bg-white dark:bg-[#1F1815] border p-5 soft-card flex flex-col justify-between space-y-4 transition-all hover:shadow-md ${
                  isPm
                    ? 'border-emerald-200/80 dark:border-emerald-900/40 hover:border-emerald-400'
                    : 'border-orange-200 dark:border-orange-900/40 hover:border-orange-400'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <div className="flex items-center gap-1.5">
                      {t.itemNumber && (
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[11px] font-mono font-bold text-stone-600 dark:text-stone-300">
                          #{t.itemNumber}
                        </span>
                      )}
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                          isPm
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300'
                        }`}
                      >
                        {t.subGroup || t.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {t.format && (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            isWord
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {t.format}
                        </span>
                      )}
                      <span className="text-[11px] text-stone-400 font-mono">{t.fileSize}</span>
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-sm sm:text-base text-[#1E1B18] dark:text-orange-50 line-clamp-2">
                    {t.title}
                  </h3>

                  <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-3 leading-relaxed">
                    {t.description}
                  </p>

                  {/* Key Features (for PM templates) */}
                  {t.keyFeatures && t.keyFeatures.length > 0 && (
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 space-y-1">
                      {t.keyFeatures.map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-1.5 text-[11px] text-stone-600 dark:text-stone-400"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {t.recommendedFor && (
                    <p className="text-[10px] text-stone-500 pt-1">
                      <span className="font-semibold text-stone-700 dark:text-stone-300">
                        เหมาะสำหรับ:
                      </span>{' '}
                      {t.recommendedFor}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-orange-100 dark:border-orange-900/30 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400 font-mono">
                    📥 <span className="tabular-nums">{t.downloads.toLocaleString()}</span> โหลด
                  </span>
                  <button
                    onClick={() => handleDownload(t)}
                    className={`px-3 py-1.5 rounded-xl text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow ${
                      isPm
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-orange-500 hover:bg-orange-600'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" /> โหลดฟรี ({isWord ? '.docx' : '.xlsx'})
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 p-8">
            <FolderOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
              ไม่พบเทมเพลตที่ตรงกับคำค้นหา
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              ลองค้นหาด้วยคำอื่น หรือกดปุ่ม "ทั้งหมด" เพื่อดูเทมเพลตทั้งหมดในคลัง
            </p>
            <button
              onClick={() => {
                setSelectedCategory('ทั้งหมด');
                setSelectedPmSubGroup('ทั้งหมดในหมวด');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-semibold"
            >
              แสดงเทมเพลตทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* Footer Share & Closing */}
      <div className="rounded-3xl bg-gradient-to-r from-orange-500 via-amber-600 to-emerald-600 text-white p-8 text-center space-y-4 soft-card">
        <h3 className="font-display font-bold text-xl sm:text-2xl">
          เป็นไงบ้างครับกับ 54 เทมเพลตการจัดการโครงการ และสูตร Excel ครบทุกสายงาน 😀
        </h3>
        <p className="text-xs sm:text-sm text-orange-100 max-w-xl mx-auto">
          หากเห็นว่ามีประโยชน์ อย่าลืมแชร์แบ่งปันให้เพื่อนร่วมทีมหรือคนในองค์กรของคุณนะครับ โหลดฟรี ใช้งานได้จริงทุกไฟล์!
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <a
            href={fbShareHref}
            target="_blank"
            rel="noreferrer"
            onClick={() => showToast({ type: 'success', title: 'เปิดหน้าต่างแชร์ Facebook' })}
            className="px-4 py-2 rounded-xl bg-white text-blue-600 font-semibold text-xs sm:text-sm inline-flex items-center gap-2 shadow"
          >
            <Share2 className="w-4 h-4" /> แชร์ Facebook
          </a>
          <a
            href={lineShareHref}
            target="_blank"
            rel="noreferrer"
            onClick={() => showToast({ type: 'success', title: 'เปิดหน้าต่างแชร์ LINE' })}
            className="px-4 py-2 rounded-xl bg-white text-[#06C755] font-semibold text-xs sm:text-sm inline-flex items-center gap-2 shadow"
          >
            <MessageCircle className="w-4 h-4" /> แชร์ LINE
          </a>
        </div>
      </div>
    </div>
  );
}
