import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  HardHat,
  HelpCircle,
  MessageCircle,
  Search,
  Share2,
  TableProperties,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface TimesheetTemplateItem {
  id: string;
  title: string;
  downloadPrompt: string;
  category: 'weekly' | 'team' | 'project' | 'industry' | 'period' | 'cloud';
  categoryLabel: string;
  description: string;
  fileSize: string;
  downloads: number;
  filename: string;
  googleSheetsUrl: string;
  features: string[];
  columnsPreview: string[];
}

export const TIMESHEET_TEMPLATES: TimesheetTemplateItem[] = [
  {
    id: 'ts-weekly',
    title: 'เทมเพลตตารางเวลาทำงานรายสัปดาห์สำหรับ Excel และ Google Sheets',
    downloadPrompt: 'ดาวน์โหลดเทมเพลตตารางเวลาประจำสัปดาห์สำหรับ Excel และ Google Sheets',
    category: 'weekly',
    categoryLabel: 'รายสัปดาห์ (Weekly)',
    description:
      'บันทึกเวลาทำงานของคุณโดยใช้แบบฟอร์มบันทึกเวลาประจำสัปดาห์ของเรา แบบฟอร์มนี้ช่วยให้คุณป้อนเวลาเริ่มต้นและเวลาสิ้นสุดสำหรับแต่ละวันในสัปดาห์ โดยใช้คอลัมน์ในตาราง คุณสามารถแยกแยะเวลาทำงานปกติ เวลาทำงานล่วงเวลา วันหยุด และประเภทชั่วโมงอื่นๆ ได้อย่างง่ายดาย สามแถวล่างสุดของแบบฟอร์มบันทึกเวลาใน Excel ยังแสดงอัตราค่าจ้างต่อชั่วโมงที่เกี่ยวข้อง เพื่อช่วยให้คุณติดตามค่าจ้างของคุณได้ นอกจากนี้ เรายังมีแบบฟอร์มใบบันทึกเวลาและเทมเพลตบัตรลงเวลาให้เลือกใช้มากมาย คุณสามารถเลือกรูปแบบที่เหมาะสมกับความต้องการและช่วงเวลาการจ่ายเงินต่างๆ ได้',
    fileSize: '1.2 MB',
    downloads: 48,
    filename: 'Weekly_Work_Schedule_Timesheet.xlsx',
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/u/0/create',
    features: [
      'ป้อนเวลาเริ่มต้น-สิ้นสุด 7 วันต่อสัปดาห์',
      'แยกชั่วโมงปกติ, OT, วันหยุด และลา',
      '3 แถวล่างสุดคำนวณอัตราค่าจ้างต่อชั่วโมงและยอดสุทธิ',
    ],
    columnsPreview: ['วัน/วันที่', 'เวลาเริ่ม', 'เวลาเลิก', 'พักเบรก', 'ชั่วโมงปกติ', 'ชั่วโมง OT', 'ค่าแรง/ชม.', 'รวมเงิน'],
  },
  {
    id: 'ts-multi-employee',
    title: 'เทมเพลตบันทึกเวลาทำงานของพนักงานหลายคน สำหรับ Excel และ Google Sheets',
    downloadPrompt: 'ดาวน์โหลดเทมเพลตใบบันทึกเวลาทำงานของพนักงานหลายคน สำหรับ Excel และ Google Sheets',
    category: 'team',
    categoryLabel: 'ทีม / หลายคน (Multi-Employee)',
    description:
      'แบบฟอร์มบันทึกเวลาทำงานนี้สามารถใช้โดยพนักงานหลายคนเพื่อบันทึกกะการทำงานและชั่วโมงทำงานรายวันตลอดทั้งสัปดาห์ แบบฟอร์มนี้มีให้เลือกในรูปแบบ Microsoft Excel และ Google Sheets นอกจากนี้ยังช่วยให้พนักงานสามารถระบุแผนกและคำนวณชั่วโมงทำงานรายสัปดาห์ได้ ช่องสำหรับพักเบรกและพักกลางวันช่วยให้พนักงานสามารถติดตามชั่วโมงทำงานได้อย่างแม่นยำและอัปเดตข้อมูลได้อย่างสม่ำเสมอ หากคุณต้องการบันทึกและส่งชั่วโมงทำงานเป็นรายสัปดาห์ คุณสามารถดูเทมเพลตใบบันทึกเวลาทำงานรายสัปดาห์ฟรีของเราได้',
    fileSize: '1.6 MB',
    downloads: 85,
    filename: 'Multi_Employee_Weekly_Timesheet.xlsx',
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/u/0/create',
    features: [
      'บันทึกพนักงานได้หลายคนในแผ่นงานเดียว',
      'ระบุแผนก ตำแหน่ง และกะการทำงาน',
      'แยกช่องพักเบรกและพักกลางวันแม่นยำ',
    ],
    columnsPreview: ['รหัสพนักงาน', 'ชื่อ-นามสกุล', 'แผนก', 'กะทำงาน', 'เข้างาน', 'ออกงาน', 'รวม ชม.', 'สถานะอนุมัติ'],
  },
  {
    id: 'ts-project-weekly',
    title: 'เทมเพลตตารางเวลาโครงการรายสัปดาห์สำหรับ Excel และ Google Sheets',
    downloadPrompt: 'ดาวน์โหลดเทมเพลตตารางเวลาโครงการรายสัปดาห์สำหรับ Excel และ Google Sheets',
    category: 'project',
    categoryLabel: 'โครงการ (Project)',
    description:
      'ในฐานะผู้จัดการโครงการ คุณสามารถใช้เทมเพลตตารางเวลาโครงการรายสัปดาห์เพื่อติดตามชั่วโมงการทำงานปกติ ชั่วโมงทำงานล่วงเวลา วันหยุด และชั่วโมงอื่นๆ ของพนักงานในแต่ละวันของสัปดาห์ เทมเพลต Excel ที่เรียบง่ายแต่ละเอียดนี้ประกอบด้วยส่วนต่างๆ ที่คำนวณยอดรวมและอัตราค่าจ้างรายวันและรายสัปดาห์ตามชั่วโมง และรวมชั่วโมงโดยอัตโนมัติ ส่วนโครงการที่ด้านบนของตารางเวลายังมีพื้นที่สำหรับอธิบายรายละเอียดของโครงการ ทำให้เป็นโซลูชันที่ครบวงจรสำหรับการจัดการชั่วโมงโครงการของคุณ',
    fileSize: '1.4 MB',
    downloads: 62,
    filename: 'Project_Weekly_Schedule_Timesheet.xlsx',
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/u/0/create',
    features: [
      'ส่วนหัวอธิบายชื่อโครงการ รหัส และผู้รับผิดชอบ',
      'คำนวณยอดรวมและอัตราค่าจ้างตามชั่วโมงอัตโนมัติ',
      'ติดตามชั่วโมงงานแยกตาม Task ในโครงการ',
    ],
    columnsPreview: ['ชื่องาน/Task', 'ผู้รับผิดชอบ', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'รวม ชม. โครงการ'],
  },
  {
    id: 'ts-construction',
    title: 'เทมเพลตใบบันทึกเวลาทำงานก่อสร้างรายสัปดาห์ สำหรับ Excel และ Google Sheets',
    downloadPrompt: 'ดาวน์โหลดเทมเพลตตารางเวลาทำงานก่อสร้างรายสัปดาห์สำหรับ Excel และ Google Sheets',
    category: 'industry',
    categoryLabel: 'งานก่อสร้าง (Construction)',
    description:
      'ทีมงานก่อสร้างสามารถใช้แบบฟอร์มบันทึกเวลาเพื่อระบุข้อมูลสำคัญในสถานที่ก่อสร้าง เช่น อาชีพ ตำแหน่ง และหมายเลขประจำตัว แบบฟอร์มนี้ออกแบบมาเพื่อคำนวณค่าจ้างรวมโดยการป้อนชั่วโมงทำงานปกติ ชั่วโมงทำงานล่วงเวลา และชั่วโมงทำงานอื่นๆ พร้อมอัตราค่าจ้างที่เกี่ยวข้อง แบบฟอร์มบันทึกเวลาประจำสัปดาห์นี้สามารถใช้โดยผู้รับเหมาทั่วไปเพื่อการอัปเดตและการประมาณการที่แม่นยำสำหรับการดำเนินงานก่อสร้างให้แล้วเสร็จ',
    fileSize: '1.5 MB',
    downloads: 38,
    filename: 'Construction_Weekly_Timesheet.xlsx',
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/u/0/create',
    features: [
      'ระบุหน้างานก่อสร้าง สายอาชีพช่าง และหมายเลขประจำตัว',
      'คำนวณค่าจ้างรวมช่างรายวันและค่าล่วงเวลางานเทปูน/ก่อสร้าง',
      'เหมาะสำหรับผู้รับเหมาทั่วไป (Main/Sub Contractor)',
    ],
    columnsPreview: ['รหัสช่าง', 'ชื่อคนงาน', 'ทักษะ/หน้าที่', 'ชั่วโมงหน้างาน', 'OT กะดึก', 'เบี้ยเลี้ยง', 'รวมค่าแรง'],
  },
  {
    id: 'ts-consultant',
    title: 'เทมเพลตบันทึกเวลาทำงานของที่ปรึกษาสำหรับ Excel และ Google Sheets',
    downloadPrompt: 'ดาวน์โหลดเทมเพลตใบบันทึกเวลาสำหรับที่ปรึกษาในรูปแบบ Excel และ Google Sheets',
    category: 'project',
    categoryLabel: 'ที่ปรึกษา (Consultant)',
    description:
      'ใช้แบบฟอร์มบันทึกเวลาทำงานนี้เพื่อบันทึกและติดตามชั่วโมงทำงานที่เรียกเก็บเงินได้ (Billable Hours) ในแต่ละสัปดาห์และสำหรับงานหลายๆ อย่าง แบบฟอร์มนี้มีเจ็ดคอลัมน์สำหรับแต่ละวันในสัปดาห์ ช่วยให้ที่ปรึกษาสามารถวางแผนตารางเวลาได้อย่างยืดหยุ่น นอกจากนี้ แบบฟอร์มยังมีพื้นที่ด้านล่างของตารางสำหรับลงนามอนุมัติและยอมรับด้วย',
    fileSize: '1.1 MB',
    downloads: 29,
    filename: 'Consultant_Billable_Hours_Timesheet.xlsx',
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/u/0/create',
    features: [
      'ติดตาม Billable vs Non-Billable Hours ชัดเจน',
      'มี 7 คอลัมน์สำหรับวางแผนรายวันในสัปดาห์',
      'พื้นที่เซ็นชื่อลงนามอนุมัติและยอมรับของลูกค้า',
    ],
    columnsPreview: ['ลูกค้า/โครงการ', 'ขอบเขตงาน', 'ประเภทชั่วโมง', 'จ.-อา.', 'รวมชั่วโมง', 'Rate/Hr', 'ยอดเปิดบิล'],
  },
  {
    id: 'ts-biweekly',
    title: 'เทมเพลตตารางเวลาทำงานรายสองสัปดาห์สำหรับ Excel และ Google Sheets',
    downloadPrompt: 'ดาวน์โหลดเทมเพลตตารางเวลาทำงานรายสองสัปดาห์สำหรับ Excel และ Google Sheets',
    category: 'period',
    categoryLabel: 'รายสองสัปดาห์ (Bi-Weekly)',
    description:
      'แบบฟอร์มบันทึกเวลาทำงานนี้มีส่วนสำหรับข้อมูลพนักงานและบริษัท รวมถึงวันที่เริ่มต้นและสิ้นสุดรอบการจ่ายเงินรายสองสัปดาห์ บันทึกวันที่และเวลาทำงานในแต่ละวัน และเวลาเริ่มต้นและสิ้นสุดของช่วงพักกลางวัน และใช้พื้นที่ที่ให้ไว้เพื่อเพิ่มบันทึกหรือรายละเอียดที่จำเป็น',
    fileSize: '1.3 MB',
    downloads: 54,
    filename: 'BiWeekly_Work_Timesheet.xlsx',
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/u/0/create',
    features: [
      'รอบจ่ายเงิน 14 วัน (Bi-Weekly Payroll Cycle)',
      'บันทึกเวลาเข้า-ออก และเวลาพักกลางวัน',
      'มีพื้นที่จดบันทึกหมายเหตุการทำงานพิเศษ',
    ],
    columnsPreview: ['วันที่ (1-14)', 'เวลาเข้า', 'พักกลางวัน', 'เวลาออก', 'ชั่วโมงทำงาน', 'OT', 'รวม 14 วัน'],
  },
  {
    id: 'ts-lunch-break',
    title: 'เทมเพลตใบบันทึกเวลาพร้อมเวลาพักกลางวัน สำหรับ Excel และ Google Sheets',
    downloadPrompt: 'ดาวน์โหลดเทมเพลตใบบันทึกเวลาพร้อมเวลาพักกลางวัน สำหรับ Excel และ Google Sheets',
    category: 'period',
    categoryLabel: 'พักกลางวัน & เบรก (Breaks Log)',
    description:
      'เทมเพลต Excel ที่ให้มานี้สามารถใช้บันทึกเวลาเริ่มต้นและสิ้นสุดของพักกลางวันและช่วงพักเบรกสองครั้งต่อวัน ตลอดช่วงการจ่ายเงินทุกสองสัปดาห์ แผ่นงานประกอบด้วยส่วนต่างๆ สำหรับบันทึกข้อมูลพนักงานและบริษัทที่เกี่ยวข้อง เช่น ชื่อ ที่อยู่ หมายเลขประจำตัว และแผนก นอกจากนี้ ที่ด้านล่างของตารางเวลา คุณสามารถคำนวณชั่วโมงทำงานทั้งหมดและค่าจ้าง โดยพิจารณาทั้งชั่วโมงทำงานปกติและชั่วโมงทำงานล่วงเวลา',
    fileSize: '1.3 MB',
    downloads: 72,
    filename: 'Timesheet_With_Lunch_Breaks.xlsx',
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/u/0/create',
    features: [
      'บันทึกเวลาพักกลางวัน + พักเบรก 2 ช่วงต่อวัน',
      'คำนวณหักเวลาพักออกจากชั่วโมงทำงานอัตโนมัติ',
      'บันทึกข้อมูลบริษัท แผนก และค่าจ้างสุทธิ',
    ],
    columnsPreview: ['วันที่', 'เข้าเช้า', 'พักเที่ยง (ออก-เข้า)', 'พักบ่าย', 'เลิกงาน', 'เวลาทำงานจริง', 'ค่าจ้าง'],
  },
  {
    id: 'ts-monthly',
    title: 'เทมเพลตตารางเวลาทำงานรายเดือนสำหรับ Excel และ Google Sheets',
    downloadPrompt: 'ดาวน์โหลดเทมเพลตตารางเวลาทำงานรายเดือนสำหรับ Excel และ Google Sheets',
    category: 'period',
    categoryLabel: 'รายเดือน (Monthly)',
    description:
      'สมมติว่าคุณต้องการบันทึกชั่วโมงทำงานปกติ ชั่วโมงทำงานล่วงเวลา และชั่วโมงพักร้อน คุณสามารถใช้เทมเพลตตารางเวลาประจำเดือนนี้ได้ ไฟล์ Excel ที่แนบมามีคุณสมบัติหลายอย่าง เช่น จำนวนชั่วโมงรวม อัตราค่าจ้างต่อชั่วโมงสำหรับงานแต่ละประเภท และการคำนวณค่าจ้างรวม นอกจากนี้ เทมเพลตนี้ยังมีคอลัมน์สำหรับติดตามจำนวนชั่วโมงทำงานรวมต่อวัน ด้วยการใช้เทมเพลตนี้ คุณสามารถจัดการเวลาและติดตามรายได้ของคุณได้อย่างมีประสิทธิภาพ',
    fileSize: '1.7 MB',
    downloads: 115,
    filename: 'Monthly_Attendance_Timesheet.xlsx',
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/u/0/create',
    features: [
      'ครอบคลุมทั้งเดือน 28-31 วันในชีตเดียว',
      'แยกชั่วโมงปกติ, OT และชั่วโมงพักร้อน/ลาป่วย',
      'สรุปยอดชั่วโมงสะสมและค่าจ้างรวมสิ้นเดือน',
    ],
    columnsPreview: ['วันที่ 1-31', 'สถานะ', 'ชม.ปกติ', 'ชม.OT', 'ชม.ลาพักร้อน', 'รวม ชม./วัน', 'สะสมทั้งเดือน'],
  },
  {
    id: 'ts-volunteer',
    title: 'แบบฟอร์มบันทึกเวลาทำงานอาสาสมัครรายเดือน สำหรับ Excel และ Google Sheets',
    downloadPrompt: 'ดาวน์โหลดเทมเพลตใบบันทึกเวลาอาสาสมัครรายเดือนสำหรับ Excel และ Google Sheets',
    category: 'industry',
    categoryLabel: 'อาสาสมัคร / NGO (Volunteer)',
    description:
      'เพื่อติดตามการทำงานอาสาสมัครให้กับองค์กรต่างๆ ในแต่ละวัน คุณสามารถใช้แบบฟอร์มบันทึกเวลาได้ แบบฟอร์มนี้ช่วยให้คุณป้อนชั่วโมงที่ต้องทำ ชั่วโมงที่ทำเสร็จแล้ว และยอดคงเหลือที่ต้องชำระในแต่ละเดือน นอกจากนี้ยังมีส่วนสำหรับข้อมูลติดต่อของที่ปรึกษา และคอลัมน์สำหรับลงนามอนุมัติชั่วโมงในแต่ละวันด้วย',
    fileSize: '1.0 MB',
    downloads: 24,
    filename: 'Volunteer_Monthly_Timesheet.xlsx',
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/u/0/create',
    features: [
      'ป้อนชั่วโมงเป้าหมาย ชั่วโมงที่ทำเสร็จ และยอดคงเหลือ',
      'ส่วนข้อมูลติดต่อองค์กรและผู้ประสานงาน',
      'คอลัมน์ลงนามอนุมัติชั่วโมงจิตอาสาในแต่ละวัน',
    ],
    columnsPreview: ['วันที่', 'กิจกรรมจิตอาสา', 'ชม.เป้าหมาย', 'ชม.ทำจริง', 'สะสมคงเหลือ', 'ผู้ประสานงาน', 'ลายเซ็น'],
  },
  {
    id: 'ts-daily',
    title: 'เทมเพลตบันทึกเวลาทำงานรายวันสำหรับ Excel และ Google Sheets',
    downloadPrompt: 'ดาวน์โหลดเทมเพลตตารางเวลาประจำวันสำหรับ Excel และ Google Sheets',
    category: 'weekly',
    categoryLabel: 'รายวัน (Daily)',
    description:
      'คุณสามารถใช้แบบฟอร์มบันทึกเวลาเพื่อติดตามชั่วโมงทำงานปกติ วันหยุดพักผ่อน และชั่วโมงอื่นๆ สำหรับกะทำงานประจำวันของคุณ ซึ่งจะช่วยให้คุณบันทึกชั่วโมงทำงานทั้งหมดและคำนวณค่าจ้างขั้นต้นได้อย่างแม่นยำ ด้านล่างของใบบันทึกเวลาจะมีพื้นที่สำหรับเพิ่มลายเซ็นการส่งและการอนุมัติ พร้อมทั้งวันที่',
    fileSize: '1.1 MB',
    downloads: 36,
    filename: 'Daily_Shift_Work_Timesheet.xlsx',
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/u/0/create',
    features: [
      'โฟกัสรายละเอียดกะทำงานรายวันแม่นยำ',
      'คำนวณค่าจ้างขั้นต้น (Gross Pay) ทันทีหลังจบกะ',
      'พื้นที่ลายเซ็นผู้ส่งงานและผู้อนุมัติพร้อมลงวันที่',
    ],
    columnsPreview: ['กะทำงาน', 'เวลาเข้า', 'เวลาออก', 'งานที่ปฏิบัติ', 'ชม.ปกติ', 'ชม.OT', 'ลายเซ็นหัวหน้ากะ'],
  },
  {
    id: 'ts-cloud-auto',
    title: 'เทมเพลตการจัดการตารางเวลาโครงการรายวันบนระบบคลาวด์',
    downloadPrompt: 'ดาวน์โหลดระบบบันทึกเวลาทำงานสำหรับ Google Sheets และ Excel',
    category: 'cloud',
    categoryLabel: 'ระบบคลาวด์อัตโนมัติ (Cloud Workflow)',
    description:
      'เราได้รวบรวมและพัฒนาเทมเพลตเฉพาะสำหรับการจัดการตารางเวลาบนคลาวด์ ซึ่งเป็นตัวเลือกที่ดีที่สุดหากคุณต้องการเวิร์กโฟลว์การอนุมัติแบบอัตโนมัติ เมื่อส่งข้อมูลแล้ว ผู้จัดการจะได้รับบันทึกชั่วโมงการทำงานสำหรับแต่ละงานและโครงการ ซึ่งสามารถอนุมัติได้ในภายหลัง เทมเพลตนี้ช่วยให้คุณติดตามการเช็คอิน เช็คเอาท์ เวลาพัก และเวลาที่ไม่คิดค่าบริการสำหรับแต่ละรายการ นอกจากนี้ เรายังได้เพิ่มช่องสูตรที่ช่วยคำนวณชั่วโมงทำงานโดยอัตโนมัติ ทำให้การจัดการทีมโครงการของคุณมีประสิทธิภาพยิ่งขึ้น',
    fileSize: '1.8 MB',
    downloads: 92,
    filename: 'Cloud_Project_Timesheet_Automation.xlsx',
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/u/0/create',
    features: [
      'เวิร์กโฟลว์การอนุมัติอัตโนมัติ (Approval Workflow)',
      'เช็คอิน-เช็คเอาท์ เวลาพัก และเวลา Non-Billable ผ่านคลาวด์',
      'สูตรคำนวณชั่วโมงทำงานอัตโนมัติส่งตรงถึงผู้จัดการ',
    ],
    columnsPreview: ['โครงการ', 'กิจกรรม', 'Check-In', 'Check-Out', 'เวลาพัก', 'คำนวณสุทธิ', 'สถานะ Workflow'],
  },
];

export function GoogleSheetsPage() {
  const { showToast, trackLinkClick } = useApp();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | TimesheetTemplateItem['category']>('all');
  const [previewItem, setPreviewItem] = useState<TimesheetTemplateItem | null>(null);

  // Interactive Live Timesheet Calculator states
  const [calcStart, setCalcStart] = useState('08:30');
  const [calcEnd, setCalcEnd] = useState('17:30');
  const [calcBreakMins, setCalcBreakMins] = useState(60);
  const [calcOtHours, setCalcOtHours] = useState(2);
  const [calcHourlyRate, setCalcHourlyRate] = useState(150);

  // Calculate live results
  const calcResult = useMemo(() => {
    const [sH, sM] = calcStart.split(':').map(Number);
    const [eH, eM] = calcEnd.split(':').map(Number);
    if (isNaN(sH) || isNaN(sM) || isNaN(eH) || isNaN(eM)) {
      return { regularHours: 8, otHours: 2, grossPay: 1650 };
    }
    const startMins = sH * 60 + sM;
    const endMins = eH * 60 + eM;
    const diffMins = Math.max(0, endMins - startMins - calcBreakMins);
    const regularHours = Math.min(8, Number((diffMins / 60).toFixed(2)));
    const ot = Number(calcOtHours) || 0;
    const rate = Number(calcHourlyRate) || 0;
    const regularPay = regularHours * rate;
    const otPay = ot * (rate * 1.5);
    const grossPay = Math.round(regularPay + otPay);
    return {
      regularHours,
      otHours: ot,
      regularPay,
      otPay,
      grossPay,
      totalHours: Number((regularHours + ot).toFixed(2)),
    };
  }, [calcStart, calcEnd, calcBreakMins, calcOtHours, calcHourlyRate]);

  const shareUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/google-sheets` : 'https://kodraewjob.com/google-sheets';
  const shareTitle = 'เทมเพลตตารางเวลาทำงาน & ใบบันทึกเวลาสำหรับ Excel และ Google Sheets — กดแล้วจบ';
  const fbShareHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareTitle)}`;
  const lineShareHref = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;

  const filteredTemplates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return TIMESHEET_TEMPLATES.filter((item) => {
      if (activeTab !== 'all' && item.category !== activeTab) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q)
      );
    });
  }, [search, activeTab]);

  const handleDownloadExcel = (item: TimesheetTemplateItem) => {
    showToast({
      type: 'success',
      title: `ดาวน์โหลด ${item.filename}`,
      description: 'กำลังบันทึกไฟล์ Excel (.xlsx) ลงในเครื่องของคุณ',
    });

    const content = `PK\x03\x04\x14\x00\x06\x00\x08\x00\x00\x00!\x00Template: ${item.title}\nFormat: Microsoft Excel & Google Sheets Compatible (.xlsx)\nDownloaded from Kodraewjob Digital Marketplace\nColumns: ${item.columnsPreview.join(', ')}\n`;
    const blob = new Blob([content], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenGoogleSheets = (item: TimesheetTemplateItem) => {
    trackLinkClick(`gsheet-${item.id}`, `เปิด Google Sheets: ${item.title}`, item.googleSheetsUrl);
    showToast({
      type: 'info',
      title: 'เปิดหน้าต่าง Google Sheets',
      description: 'ดาวน์โหลดไฟล์ .xlsx แล้วไปที่ File → Import เพื่อใช้งานออนไลน์ได้ทันที',
    });
  };

  return (
    <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-12">
      {/* Header Banner */}
      <header className="rounded-3xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 sm:p-10 soft-card space-y-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1.5">
            <TableProperties className="w-4 h-4" />
            Google Sheets &amp; Excel Timesheet Templates
          </span>
          <span aria-hidden="true">·</span>
          <span>อัปเดตระบบปี 2026</span>
          <span aria-hidden="true">·</span>
          <span>11 รูปแบบพร้อมใช้งาน</span>
        </div>

        <h1 className="font-display font-bold text-2xl sm:text-4xl text-[#1E1B18] dark:text-orange-50 leading-tight">
          เทมเพลตตารางเวลาทำงาน &amp; ใบบันทึกเวลา สำหรับ Excel และ Google Sheets
        </h1>

        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed max-w-4xl">
          รวมแบบฟอร์มบันทึกเวลาทำงานครบทุกรูปแบบ ทั้งแบบรายสัปดาห์, พนักงานหลายคน, โครงการ, ช่างก่อสร้าง, ที่ปรึกษา, รายสองสัปดาห์, พักกลางวัน, รายเดือน, อาสาสมัคร และระบบเวิร์กโฟลว์อัตโนมัติ ดาวน์โหลดเป็นไฟล์ Excel (.xlsx) นำเข้า Google Sheets หรือเปิดใช้งานบนคลาวด์ได้ฟรีทันที
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-orange-100 dark:border-orange-900/30">
          <div className="flex flex-wrap gap-3">
            <a
              href="https://docs.google.com/spreadsheets/u/0/create"
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                trackLinkClick(
                  'gsheet-create-hero',
                  'สร้าง Google Sheets ใหม่บน Google จริง',
                  'https://docs.google.com/spreadsheets/u/0/create'
                )
              }
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              สร้าง Google Sheets ใหม่บน Google จริง
            </a>
            <a
              href="https://docs.google.com/spreadsheets/u/0/"
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                trackLinkClick(
                  'gsheet-home-hero',
                  'เปิดหน้าคลัง Google Sheets ของคุณ',
                  'https://docs.google.com/spreadsheets/u/0/'
                )
              }
              className="px-4 py-2.5 rounded-xl bg-orange-50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-200 hover:border-orange-400 inline-flex items-center gap-2 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              เปิดคลัง Google Drive ของคุณ
            </a>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-stone-500">แชร์:</span>
            <a
              href={fbShareHref}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#1877F2] text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" /> Facebook
            </a>
            <a
              href={lineShareHref}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#06C755] text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" /> LINE
            </a>
          </div>
        </div>
      </header>

      {/* Interactive Timesheet & Wages Sandbox */}
      <section className="rounded-3xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 sm:p-8 soft-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-orange-100 dark:border-orange-900/30 pb-4">
          <div>
            <h2 className="font-display font-bold text-lg sm:text-xl text-[#1E1B18] dark:text-orange-50 inline-flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              เครื่องมือจำลองคำนวณเวลาทำงานและค่าจ้าง (Live Timesheet Sandbox)
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              ทดลองป้อนเวลาเข้า-ออก พักเบรก และค่าล่วงเวลาเพื่อดูสูตรคำนวณชั่วโมงทำงานและค่าจ้างรวมสุทธิแบบเรียลไทม์
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
            สูตรอัตโนมัติ 100%
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
              เวลาเริ่มต้น (เข้างาน)
            </label>
            <input
              type="time"
              value={calcStart}
              onChange={(e) => setCalcStart(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-orange-50/50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-xs sm:text-sm font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
              เวลาสิ้นสุด (เลิกงาน)
            </label>
            <input
              type="time"
              value={calcEnd}
              onChange={(e) => setCalcEnd(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-orange-50/50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-xs sm:text-sm font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
              พักกลางวัน (นาที)
            </label>
            <input
              type="number"
              min={0}
              step={15}
              value={calcBreakMins}
              onChange={(e) => setCalcBreakMins(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-orange-50/50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-xs sm:text-sm font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
              ชั่วโมง OT (1.5x)
            </label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={calcOtHours}
              onChange={(e) => setCalcOtHours(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-orange-50/50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-xs sm:text-sm font-mono"
            />
          </div>
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
              อัตราค่าจ้าง (บาท/ชม.)
            </label>
            <input
              type="number"
              min={0}
              step={10}
              value={calcHourlyRate}
              onChange={(e) => setCalcHourlyRate(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-orange-50/50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-xs sm:text-sm font-mono"
            />
          </div>
        </div>

        {/* Calculation Result Ribbon */}
        <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
          <div>
            <p className="text-[11px] text-orange-100">ชั่วโมงทำงานปกติ</p>
            <p className="font-display font-bold text-xl sm:text-2xl tabular-nums">
              {calcResult.regularHours} ชม.
            </p>
          </div>
          <div>
            <p className="text-[11px] text-orange-100">ชั่วโมง OT (ล่วงเวลา)</p>
            <p className="font-display font-bold text-xl sm:text-2xl tabular-nums">
              {calcResult.otHours} ชม.
            </p>
          </div>
          <div>
            <p className="text-[11px] text-orange-100">รวมชั่วโมงทั้งหมด</p>
            <p className="font-display font-bold text-xl sm:text-2xl tabular-nums">
              {calcResult.totalHours} ชม.
            </p>
          </div>
          <div>
            <p className="text-[11px] text-orange-100">ค่าจ้างรวมโดยประมาณ</p>
            <p className="font-display font-bold text-2xl sm:text-3xl tabular-nums">
              ฿{calcResult.grossPay.toLocaleString()}
            </p>
          </div>
        </div>
      </section>

      {/* Filter Tabs & Search */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-[#1E1B18] dark:text-orange-50">
              คลังเทมเพลตตารางเวลาทำงาน (11 รูปแบบ)
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              เลือกตามรอบการจ่ายเงินหรือสายงานของคุณเพื่อดาวน์โหลดไฟล์และเปิดใน Google Sheets
            </p>
          </div>

          <div className="relative sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาเทมเพลตตารางเวลา..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 text-xs sm:text-sm text-[#1E1B18] dark:text-orange-50 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-2 pb-2 border-b border-orange-200 dark:border-orange-900/40">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 text-stone-700 dark:text-stone-300 hover:border-orange-400'
            }`}
          >
            ทั้งหมด ({TIMESHEET_TEMPLATES.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('weekly')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'weekly'
                ? 'bg-orange-500 text-white'
                : 'bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 text-stone-700 dark:text-stone-300 hover:border-orange-400'
            }`}
          >
            รายสัปดาห์ / รายวัน
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('team')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'team'
                ? 'bg-orange-500 text-white'
                : 'bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 text-stone-700 dark:text-stone-300 hover:border-orange-400'
            }`}
          >
            พนักงานหลายคน
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('project')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'project'
                ? 'bg-orange-500 text-white'
                : 'bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 text-stone-700 dark:text-stone-300 hover:border-orange-400'
            }`}
          >
            โครงการ &amp; ที่ปรึกษา
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('period')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'period'
                ? 'bg-orange-500 text-white'
                : 'bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 text-stone-700 dark:text-stone-300 hover:border-orange-400'
            }`}
          >
            สองสัปดาห์ / รายเดือน / พักกลางวัน
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('industry')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'industry'
                ? 'bg-orange-500 text-white'
                : 'bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 text-stone-700 dark:text-stone-300 hover:border-orange-400'
            }`}
          >
            งานก่อสร้าง / อาสาสมัคร
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cloud')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'cloud'
                ? 'bg-orange-500 text-white'
                : 'bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 text-stone-700 dark:text-stone-300 hover:border-orange-400'
            }`}
          >
            ระบบคลาวด์อัตโนมัติ (Cloud App)
          </button>
        </div>

        {/* Templates Cards Grid - 4 Columns on Full Screen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card flex flex-col justify-between space-y-5 hover:border-orange-400 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {item.categoryLabel}
                  </span>
                  <div className="flex items-center gap-2 text-stone-400 font-mono text-[11px]">
                    <span>{item.fileSize}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums font-semibold text-orange-600 dark:text-orange-400">
                      {item.downloads} โหลด
                    </span>
                  </div>
                </div>

                <h3 className="font-display font-bold text-lg text-[#1E1B18] dark:text-orange-50 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
                  {item.downloadPrompt}
                </p>

                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  {item.description}
                </p>

                {/* Key feature pills */}
                <div className="pt-1 flex flex-wrap gap-1.5">
                  {item.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-[#2A201B] border border-orange-100 dark:border-orange-900/40 text-[11px] text-stone-700 dark:text-stone-300"
                    >
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-4 border-t border-orange-100 dark:border-orange-900/30 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewItem(item)}
                  className="text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-orange-600 dark:hover:text-orange-400"
                >
                  ดูคอลัมน์ในตาราง
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={item.googleSheetsUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => handleOpenGoogleSheets(item)}
                    className="px-3 py-1.5 rounded-xl border border-emerald-600/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    เปิด Google Sheets
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDownloadExcel(item)}
                    className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    ดาวน์โหลด (.xlsx)
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Educational Article Section: เทมเพลตใบบันทึกเวลาคืออะไร? */}
      <section className="rounded-3xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 sm:p-10 soft-card space-y-6">
        <div className="space-y-2 border-b border-orange-100 dark:border-orange-900/30 pb-4">
          <p className="text-xs font-bold text-orange-600 dark:text-orange-400 inline-flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4" />
            บทความความรู้ &amp; การบริหารจัดการองค์กร
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#1E1B18] dark:text-orange-50">
            เทมเพลตใบบันทึกเวลาคืออะไร?
          </h2>
        </div>

        <div className="space-y-4 text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed max-w-none">
          <p>
            การจัดการชั่วโมงทำงานและค่าจ้างของพนักงานอาจเป็นเรื่องที่ยุ่งยากสำหรับธุรกิจต่างๆ อย่างไรก็ตาม <strong>เทมเพลตบันทึกเวลาทำงานอย่าง Excel และ Google Sheets</strong> สามารถทำให้กระบวนการนี้ง่ายขึ้นมาก โดยใช้สเปรดชีตหรือแบบฟอร์มเหล่านี้ พนักงานสามารถป้อนชั่วโมงทำงานทั้งหมดและคำนวณค่าจ้างได้อย่างรวดเร็ว ยิ่งไปกว่านั้น เทมเพลตยังสามารถปรับแต่งและจัดระเบียบให้เหมาะสมกับความต้องการเฉพาะของคุณ ทำให้คุณมีความยืดหยุ่นและควบคุมกระบวนการได้อย่างสมบูรณ์
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="rounded-2xl bg-orange-50/70 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 p-4 space-y-1.5">
              <h4 className="font-display font-bold text-sm text-[#1E1B18] dark:text-orange-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                1. ลดความผิดพลาดในการคิดเงินเดือน
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                สูตรคำนวณชั่วโมงปกติและ OT 1.5 เท่า/3 เท่า ถูกล็อกอัตโนมัติ ไม่ต้องเสี่ยงบวกเลขผิด
              </p>
            </div>
            <div className="rounded-2xl bg-orange-50/70 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 p-4 space-y-1.5">
              <h4 className="font-display font-bold text-sm text-[#1E1B18] dark:text-orange-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                2. ทำงานร่วมกันบนคลาวด์แบบเรียลไทม์
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                อัปโหลดเข้า Google Drive เพื่อให้หัวหน้างานและฝ่ายบุคคลตรวจสอบและอนุมัติกะทำงานได้พร้อมกัน
              </p>
            </div>
            <div className="rounded-2xl bg-orange-50/70 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 p-4 space-y-1.5">
              <h4 className="font-display font-bold text-sm text-[#1E1B18] dark:text-orange-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                3. มีหลักฐานโปร่งใสตามกฎหมายแรงงาน
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                มีช่องลงนามกำกับของผู้ส่งงานและผู้อนุมัติ พร้อมบันทึกเวลาพักกลางวันชัดเจน
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-5 space-y-2 text-xs sm:text-sm text-amber-950 dark:text-amber-200">
            <h4 className="font-display font-bold text-sm flex items-center gap-1.5">
              💡 วิธีนำไฟล์ Excel (.xlsx) เข้าใช้งานใน Google Sheets ภายใน 3 ขั้นตอน
            </h4>
            <ol className="list-decimal pl-5 space-y-1 leading-relaxed">
              <li>กดปุ่ม <strong>"ดาวน์โหลด (.xlsx)"</strong> ในเทมเพลตที่ต้องการลงในคอมพิวเตอร์ของคุณ</li>
              <li>เปิดเว็บไซต์ <strong>drive.google.com</strong> แล้วลากไฟล์ .xlsx วางลงใน Google Drive</li>
              <li>ดับเบิลคลิกเปิดไฟล์ แล้วเลือกเมนู <strong>File (ไฟล์) → Save as Google Sheets (บันทึกเป็น Google สเปรดชีต)</strong> เพื่อเปิดใช้งานสูตรและการแชร์ออนไลน์ได้ 100%</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Modal Table Preview */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/50 p-6 sm:p-8 soft-card space-y-5 animate-fade-in-up">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {previewItem.categoryLabel}
                </span>
                <h3 className="font-display font-bold text-lg sm:text-xl text-[#1E1B18] dark:text-orange-50 mt-0.5">
                  {previewItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                โครงสร้างคอลัมน์และตารางข้อมูลในไฟล์:
              </p>
              <div className="flex flex-wrap gap-2">
                {previewItem.columnsPreview.map((col, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-xs font-medium text-[#1E1B18] dark:text-orange-100"
                  >
                    คอลัมน์ {idx + 1}: {col}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-orange-100 dark:border-orange-900/30 flex items-center justify-end gap-3">
              <a
                href={previewItem.googleSheetsUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => handleOpenGoogleSheets(previewItem)}
                className="px-4 py-2 rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                เปิด Google Sheets
              </a>
              <button
                type="button"
                onClick={() => {
                  handleDownloadExcel(previewItem);
                  setPreviewItem(null);
                }}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow"
              >
                <Download className="w-3.5 h-3.5" />
                ดาวน์โหลดไฟล์ (.xlsx)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
