export type FormulaCategory =
  | 'คำนวณ & สรุปยอด'
  | 'เงื่อนไข & ตรรกะ'
  | 'ค้นหา & อ้างอิง'
  | 'ข้อความ & จัดรูปแบบ'
  | 'วันที่ & เวลา'
  | 'การเงิน & ภาษี';

export interface ExcelFormulaItem {
  id: number;
  name: string;
  thaiName: string;
  category: FormulaCategory;
  level: 'เริ่มต้น' | 'ใช้งานบ่อย' | 'ระดับโปร';
  syntax: string;
  description: string;
  exampleFormula: string;
  exampleResult: string;
  sampleTable: {
    headers: string[];
    rows: string[][];
  };
  tip: string;
}

export const FORMULA_CATEGORIES: FormulaCategory[] = [
  'คำนวณ & สรุปยอด',
  'เงื่อนไข & ตรรกะ',
  'ค้นหา & อ้างอิง',
  'ข้อความ & จัดรูปแบบ',
  'วันที่ & เวลา',
  'การเงิน & ภาษี',
];

export const EXCEL_FORMULAS_50: ExcelFormulaItem[] = [
  // 1. คำนวณ & สรุปยอด (1-10)
  {
    id: 1,
    name: 'SUM',
    thaiName: 'บวกผลรวมทั้งหมด',
    category: 'คำนวณ & สรุปยอด',
    level: 'เริ่มต้น',
    syntax: '=SUM(ช่วงเซลล์)',
    description: 'ใช้หาผลรวมของตัวเลขทั้งหมดในช่วงที่เลือก เช่น ยอดขายรวมทั้งเดือน',
    exampleFormula: '=SUM(B2:B4)',
    exampleResult: '4,500 บาท',
    sampleTable: {
      headers: ['รายการ', 'ยอดขาย (B)'],
      rows: [
        ['สินค้า A', '1,500'],
        ['สินค้า B', '2,000'],
        ['สินค้า C', '1,000'],
      ],
    },
    tip: 'กดปุ่ม Alt + = ใน Excel เพื่อใส่สูตร SUM ให้อัตโนมัติทันที',
  },
  {
    id: 2,
    name: 'AVERAGE',
    thaiName: 'หาค่าเฉลี่ย',
    category: 'คำนวณ & สรุปยอด',
    level: 'เริ่มต้น',
    syntax: '=AVERAGE(ช่วงเซลล์)',
    description: 'คำนวณค่าเฉลี่ยเลขคณิตของตัวเลขในช่วงเซลล์ (ไม่นับเซลล์ว่าง)',
    exampleFormula: '=AVERAGE(B2:B4)',
    exampleResult: '1,500 บาท',
    sampleTable: {
      headers: ['วัน', 'ยอดขาย (B)'],
      rows: [
        ['จันทร์', '1,200'],
        ['อังคาร', '1,800'],
        ['พุธ', '1,500'],
      ],
    },
    tip: 'เซลล์ที่มีเลข 0 จะถูกนำมาหารเฉลี่ยด้วย แต่เซลล์ว่างจะถูกข้าม',
  },
  {
    id: 3,
    name: 'COUNT',
    thaiName: 'นับจำนวนช่องที่เป็นตัวเลข',
    category: 'คำนวณ & สรุปยอด',
    level: 'เริ่มต้น',
    syntax: '=COUNT(ช่วงเซลล์)',
    description: 'นับเฉพาะเซลล์ที่มีตัวเลขหรือวันที่ เหมาะสำหรับนับจำนวนบิลที่มีการกรอกยอดเงิน',
    exampleFormula: '=COUNT(B2:B5)',
    exampleResult: '3 รายการ',
    sampleTable: {
      headers: ['บิล', 'ยอดเงิน (B)'],
      rows: [
        ['#01', '500'],
        ['#02', 'ยกเลิก'],
        ['#03', '900'],
        ['#04', '1,200'],
      ],
    },
    tip: 'ถ้าต้องการนับทั้งตัวเลขและข้อความให้ใช้ COUNTA แทน',
  },
  {
    id: 4,
    name: 'COUNTA',
    thaiName: 'นับจำนวนช่องที่ไม่ว่าง',
    category: 'คำนวณ & สรุปยอด',
    level: 'เริ่มต้น',
    syntax: '=COUNTA(ช่วงเซลล์)',
    description: 'นับทุกเซลล์ที่มีข้อมูล (ข้อความ ตัวเลข วันที่) เพื่อดูจำนวนรายการทั้งหมด',
    exampleFormula: '=COUNTA(A2:A5)',
    exampleResult: '4 คน',
    sampleTable: {
      headers: ['ชื่อพนักงาน (A)', 'แผนก'],
      rows: [
        ['สมชาย', 'ขาย'],
        ['มานี', 'บัญชี'],
        ['ปิติ', 'คลัง'],
        ['วีณา', 'HR'],
      ],
    },
    tip: 'ใช้เช็กจำนวนพนักงานที่ลงชื่อเข้างานหรือจำนวนรายการสินค้าได้รวดเร็ว',
  },
  {
    id: 5,
    name: 'COUNTBLANK',
    thaiName: 'นับจำนวนช่องที่ยังว่างอยู่',
    category: 'คำนวณ & สรุปยอด',
    level: 'เริ่มต้น',
    syntax: '=COUNTBLANK(ช่วงเซลล์)',
    description: 'นับจำนวนเซลล์ที่ยังไม่มีการกรอกข้อมูล เหมาะสำหรับตรวจเช็กงานค้างกรอก',
    exampleFormula: '=COUNTBLANK(B2:B4)',
    exampleResult: '1 ช่อง',
    sampleTable: {
      headers: ['ลูกค้า', 'เลขพัสดุ (B)'],
      rows: [
        ['คุณเอ', 'TH0123'],
        ['คุณบี', ''],
        ['คุณซี', 'TH0125'],
      ],
    },
    tip: 'ใช้คู่กับการทำแจ้งเตือนว่ายังมีออเดอร์ที่ยังไม่ออกเลขพัสดุ',
  },
  {
    id: 6,
    name: 'MIN',
    thaiName: 'หาค่าต่ำสุด',
    category: 'คำนวณ & สรุปยอด',
    level: 'เริ่มต้น',
    syntax: '=MIN(ช่วงเซลล์)',
    description: 'ค้นหาตัวเลขที่น้อยที่สุดในช่วงข้อมูล เช่น ราคาต้นทุนวัตถุดิบที่ถูกที่สุด',
    exampleFormula: '=MIN(B2:B4)',
    exampleResult: '45 บาท',
    sampleTable: {
      headers: ['ซัพพลายเออร์', 'ราคาเสนอ (B)'],
      rows: [
        ['เจ้า A', '52'],
        ['เจ้า B', '45'],
        ['เจ้า C', '49'],
      ],
    },
    tip: 'ใช้คู่กับ INDEX+MATCH เพื่อหาชื่อร้านที่เสนอราคาต่ำสุดได้',
  },
  {
    id: 7,
    name: 'MAX',
    thaiName: 'หาค่าสูงสุด',
    category: 'คำนวณ & สรุปยอด',
    level: 'เริ่มต้น',
    syntax: '=MAX(ช่วงเซลล์)',
    description: 'ค้นหาตัวเลขที่มากที่สุดในช่วงข้อมูล เช่น ยอดขายสูงสุดประจำเดือน',
    exampleFormula: '=MAX(B2:B4)',
    exampleResult: '28,500 บาท',
    sampleTable: {
      headers: ['พนักงาน', 'ยอดขาย (B)'],
      rows: [
        ['ก้อย', '19,000'],
        ['เบิร์ด', '28,500'],
        ['ต้น', '22,100'],
      ],
    },
    tip: 'หากต้องการหาอันดับ 2 หรืออันดับ 3 ให้ใช้สูตร =LARGE(ช่วง, 2)',
  },
  {
    id: 8,
    name: 'ROUND',
    thaiName: 'ปัดเศษทศนิยมตามหลักคณิตศาสตร์',
    category: 'คำนวณ & สรุปยอด',
    level: 'เริ่มต้น',
    syntax: '=ROUND(ตัวเลข, จำนวนตำแหน่ง)',
    description: 'ปัดเศษทศนิยมให้เหลือจำนวนตำแหน่งที่ต้องการ (ตั้งแต่ 5 ขึ้นไปปัดขึ้น)',
    exampleFormula: '=ROUND(125.678, 2)',
    exampleResult: '125.68',
    sampleTable: {
      headers: ['ราคาก่อน VAT', 'VAT 7% (B)'],
      rows: [
        ['1,795.35', '=ROUND(1795.35*0.07, 2) -> 125.67'],
      ],
    },
    tip: 'งานบัญชีและใบกำกับภาษีควรใช้ ROUND(..., 2) เสมอ เพื่อไม่ให้ยอดสตางค์คลาดเคลื่อน',
  },
  {
    id: 9,
    name: 'ROUNDUP',
    thaiName: 'ปัดเศษขึ้นทุกกรณี',
    category: 'คำนวณ & สรุปยอด',
    level: 'ใช้งานบ่อย',
    syntax: '=ROUNDUP(ตัวเลข, จำนวนตำแหน่ง)',
    description: 'บังคับปัดตัวเลขขึ้นเสมอ เช่น คำนวณจำนวนกล่องบรรจุสินค้าหรือจำนวนแผ่นวัสดุ',
    exampleFormula: '=ROUNDUP(10.1, 0)',
    exampleResult: '11 กล่อง',
    sampleTable: {
      headers: ['สินค้าทั้งหมด', 'บรรจุกล่องละ 12 ชิ้น'],
      rows: [['121 ชิ้น', '=ROUNDUP(121/12, 0) -> 11 กล่อง']],
    },
    tip: 'ใส่เลข 0 ในตำแหน่งทศนิยมเพื่อปัดขึ้นเป็นจำนวนเต็ม',
  },
  {
    id: 10,
    name: 'ROUNDDOWN',
    thaiName: 'ปัดเศษลงทุกกรณี',
    category: 'คำนวณ & สรุปยอด',
    level: 'ใช้งานบ่อย',
    syntax: '=ROUNDDOWN(ตัวเลข, จำนวนตำแหน่ง)',
    description: 'ตัดเศษทศนิยมทิ้งโดยไม่ปัดขึ้น เช่น คำนวณอายุงานเต็มปีหรือคะแนนสะสม',
    exampleFormula: '=ROUNDDOWN(3.9, 0)',
    exampleResult: '3 ปี',
    sampleTable: {
      headers: ['ยอดซื้อ (บาท)', 'แต้มสะสม (ทุก 100 บาท)'],
      rows: [['590', '=ROUNDDOWN(590/100, 0) -> 5 แต้ม']],
    },
    tip: 'เหมาะกับระบบคำนวณแต้มสมาชิกหรือการปันส่วนที่ไม่ปัดเศษขึ้น',
  },

  // 2. เงื่อนไข & ตรรกะ (11-20)
  {
    id: 11,
    name: 'IF',
    thaiName: 'ตรวจสอบเงื่อนไข จริง/เท็จ',
    category: 'เงื่อนไข & ตรรกะ',
    level: 'เริ่มต้น',
    syntax: '=IF(เงื่อนไข, ค่าถ้าจริง, ค่าถ้าเท็จ)',
    description: 'ตัดสินใจเลือกแสดงผลลัพธ์ 2 ทางตามเงื่อนไขที่กำหนด เช่น ผ่าน/ไม่ผ่าน หรือ สต๊อกใกล้หมด',
    exampleFormula: '=IF(B2<10, "สั่งซื้อเพิ่ม", "ปกติ")',
    exampleResult: 'สั่งซื้อเพิ่ม',
    sampleTable: {
      headers: ['สินค้า', 'คงเหลือ (B)', 'สถานะ'],
      rows: [
        ['กาแฟเมล็ด', '5', 'สั่งซื้อเพิ่ม'],
        ['น้ำตาล', '24', 'ปกติ'],
      ],
    },
    tip: 'ข้อความในสูตร Excel ต้องใส่เครื่องหมายคำพูด "..." ครอบไว้เสมอ',
  },
  {
    id: 12,
    name: 'IFS',
    thaiName: 'ตรวจสอบหลายเงื่อนไขต่อเนื่อง',
    category: 'เงื่อนไข & ตรรกะ',
    level: 'ใช้งานบ่อย',
    syntax: '=IFS(เงื่อนไข1, ผล1, เงื่อนไข2, ผล2, TRUE, ผลอื่นๆ)',
    description: 'เขียนเงื่อนไขหลายระดับได้สั้นและอ่านง่ายกว่าการซ้อน IF หลายชั้น เช่น ตัดเกรดหรือค่าคอมมิชชัน',
    exampleFormula: '=IFS(B2>=80,"A", B2>=70,"B", B2>=60,"C", TRUE,"F")',
    exampleResult: 'B',
    sampleTable: {
      headers: ['ชื่อ', 'คะแนน (B)', 'เกรด'],
      rows: [
        ['ฟ้า', '75', 'B'],
        ['กานต์', '86', 'A'],
      ],
    },
    tip: 'ใส่เงื่อนไขสุดท้ายเป็น TRUE, "ค่าเริ่มต้น" เพื่อป้องกัน Error #N/A',
  },
  {
    id: 13,
    name: 'AND',
    thaiName: 'ต้องเป็นจริงครบทุกเงื่อนไข',
    category: 'เงื่อนไข & ตรรกะ',
    level: 'ใช้งานบ่อย',
    syntax: '=AND(เงื่อนไข1, เงื่อนไข2)',
    description: 'คืนค่า TRUE เมื่อทุกเงื่อนไขถูกต้องทั้งหมด มักใช้ร่วมกับ IF เพื่อตั้งเกณฑ์โบนัสหรือส่วนลด',
    exampleFormula: '=IF(AND(B2>=1000, C2="VIP"), "ลด 15%", "ปกติ")',
    exampleResult: 'ลด 15%',
    sampleTable: {
      headers: ['ลูกค้า', 'ยอดซื้อ (B)', 'ระดับ (C)'],
      rows: [['คุณพลอย', '1,500', 'VIP']],
    },
    tip: 'สามารถใส่เงื่อนไขใน AND ได้มากกว่า 2 เงื่อนไขคั่นด้วยเครื่องหมายจุลภาค',
  },
  {
    id: 14,
    name: 'OR',
    thaiName: 'เป็นจริงอย่างน้อย 1 เงื่อนไข',
    category: 'เงื่อนไข & ตรรกะ',
    level: 'ใช้งานบ่อย',
    syntax: '=OR(เงื่อนไข1, เงื่อนไข2)',
    description: 'คืนค่า TRUE เมื่อเงื่อนไขใดเงื่อนไขหนึ่งเป็นจริง เช่น วันเสาร์หรือวันอาทิตย์ให้คิดเรท OT',
    exampleFormula: '=IF(OR(A2="เสาร์", A2="อาทิตย์"), "OT 2x", "ปกติ")',
    exampleResult: 'OT 2x',
    sampleTable: {
      headers: ['วัน (A)', 'ชั่วโมง', 'เรท'],
      rows: [['เสาร์', '8', 'OT 2x']],
    },
    tip: 'นิยมใช้คู่กับ IF เพื่อกรองข้อมูลที่เข้าข่ายข้อใดข้อหนึ่ง',
  },
  {
    id: 15,
    name: 'NOT',
    thaiName: 'กลับค่าตรรกะ (ไม่ใช่)',
    category: 'เงื่อนไข & ตรรกะ',
    level: 'ใช้งานบ่อย',
    syntax: '=NOT(เงื่อนไข)',
    description: 'กลับค่าจาก TRUE เป็น FALSE หรือเช็กว่าข้อมูลไม่เท่ากับค่าที่กำหนด',
    exampleFormula: '=IF(NOT(B2="ยกเลิก"), "นับยอดขาย", 0)',
    exampleResult: 'นับยอดขาย',
    sampleTable: {
      headers: ['บิล', 'สถานะ (B)'],
      rows: [['#101', 'สำเร็จ']],
    },
    tip: 'อีกวิธีที่สั้นกว่าคือใช้เครื่องหมาย <> เช่น B2<>"ยกเลิก"',
  },
  {
    id: 16,
    name: 'SUMIF',
    thaiName: 'บวกผลรวมแบบมี 1 เงื่อนไข',
    category: 'เงื่อนไข & ตรรกะ',
    level: 'เริ่มต้น',
    syntax: '=SUMIF(ช่วงเงื่อนไข, เงื่อนไข, ช่วงตัวเลขที่บวก)',
    description: 'รวมตัวเลขเฉพาะแถวที่ตรงกับเงื่อนไข เช่น ยอดขายรวมเฉพาะสาขากรุงเทพฯ',
    exampleFormula: '=SUMIF(A2:A4, "กทม.", B2:B4)',
    exampleResult: '8,000 บาท',
    sampleTable: {
      headers: ['สาขา (A)', 'ยอดขาย (B)'],
      rows: [
        ['กทม.', '5,000'],
        ['เชียงใหม่', '4,000'],
        ['กทม.', '3,000'],
      ],
    },
    tip: 'สามารถใช้เครื่องหมาย * เป็น Wildcard ได้ เช่น "*ค่าไฟ*" เพื่อบวกคำที่มีคำว่าค่าไฟ',
  },
  {
    id: 17,
    name: 'SUMIFS',
    thaiName: 'บวกผลรวมแบบมีหลายเงื่อนไข',
    category: 'เงื่อนไข & ตรรกะ',
    level: 'ใช้งานบ่อย',
    syntax: '=SUMIFS(ช่วงบวก, ช่วงเงื่อนไข1, เงื่อนไข1, ช่วงเงื่อนไข2, เงื่อนไข2)',
    description: 'สุดยอดสูตรสรุปยอดขาย/รายจ่ายที่กรองได้พร้อมกันหลายเกณฑ์ เช่น สาขา + ช่องทางชำระเงิน',
    exampleFormula: '=SUMIFS(C2:C4, A2:A4, "Shopee", B2:B4, "ชำระแล้ว")',
    exampleResult: '3,200 บาท',
    sampleTable: {
      headers: ['ช่องทาง (A)', 'สถานะ (B)', 'ยอด (C)'],
      rows: [
        ['Shopee', 'ชำระแล้ว', '1,200'],
        ['Shopee', 'รอโอน', '900'],
        ['Shopee', 'ชำระแล้ว', '2,000'],
      ],
    },
    tip: 'สังเกตว่า SUMIFS จะเอา "ช่วงตัวเลขที่ต้องการบวก" ไว้เป็นตัวแรกสุดเสมอ (สลับกับ SUMIF)',
  },
  {
    id: 18,
    name: 'COUNTIF',
    thaiName: 'นับจำนวนตาม 1 เงื่อนไข',
    category: 'เงื่อนไข & ตรรกะ',
    level: 'เริ่มต้น',
    syntax: '=COUNTIF(ช่วงข้อมูล, เงื่อนไข)',
    description: 'นับว่ามีกี่รายการที่ตรงเงื่อนไข เช่น นับจำนวนวันลาป่วย หรือจำนวนออเดอร์ที่ค้างจ่าย',
    exampleFormula: '=COUNTIF(B2:B5, "ค้างชำระ")',
    exampleResult: '2 ห้อง',
    sampleTable: {
      headers: ['ห้อง', 'สถานะ (B)'],
      rows: [
        ['101', 'จ่ายแล้ว'],
        ['102', 'ค้างชำระ'],
        ['103', 'ค้างชำระ'],
        ['104', 'จ่ายแล้ว'],
      ],
    },
    tip: 'ใช้ COUNTIF(A:A, A2)>1 เพื่อตรวจหาข้อมูลซ้ำในคอลัมน์ได้ทันที',
  },
  {
    id: 19,
    name: 'COUNTIFS',
    thaiName: 'นับจำนวนตามหลายเงื่อนไข',
    category: 'เงื่อนไข & ตรรกะ',
    level: 'ใช้งานบ่อย',
    syntax: '=COUNTIFS(ช่วง1, เงื่อนไข1, ช่วง2, เงื่อนไข2)',
    description: 'นับจำนวนรายการที่เข้าเกณฑ์พร้อมกันหลายข้อ เช่น ลูกค้า VIP ที่ซื้อเกิน 1,000 บาท',
    exampleFormula: '=COUNTIFS(A2:A4, "VIP", B2:B4, ">=1000")',
    exampleResult: '2 คน',
    sampleTable: {
      headers: ['กลุ่ม (A)', 'ยอดซื้อ (B)'],
      rows: [
        ['VIP', '1,500'],
        ['VIP', '500'],
        ['VIP', '2,200'],
      ],
    },
    tip: 'เงื่อนไขมากกว่า/น้อยกว่า ต้องใส่เครื่องหมายคำพูดครอบ เช่น ">=1000"',
  },
  {
    id: 20,
    name: 'AVERAGEIF',
    thaiName: 'หาค่าเฉลี่ยเฉพาะกลุ่มที่ต้องการ',
    category: 'เงื่อนไข & ตรรกะ',
    level: 'ใช้งานบ่อย',
    syntax: '=AVERAGEIF(ช่วงเงื่อนไข, เงื่อนไข, ช่วงตัวเลขเฉลี่ย)',
    description: 'คำนวณค่าเฉลี่ยเฉพาะรายการที่ตรงเงื่อนไข เช่น ค่าเฉลี่ยยอดบิลของร้านสาขา 1',
    exampleFormula: '=AVERAGEIF(A2:A4, "สาขา 1", B2:B4)',
    exampleResult: '750 บาท',
    sampleTable: {
      headers: ['สาขา (A)', 'ยอดบิล (B)'],
      rows: [
        ['สาขา 1', '600'],
        ['สาขา 2', '1,200'],
        ['สาขา 1', '900'],
      ],
    },
    tip: 'ถ้ามีหลายเงื่อนไขให้ใช้ AVERAGEIFS ในรูปแบบเดียวกับ SUMIFS',
  },

  // 3. ค้นหา & อ้างอิง (21-28)
  {
    id: 21,
    name: 'VLOOKUP',
    thaiName: 'ค้นหาข้อมูลในแนวตั้งจากตารางอื่น',
    category: 'ค้นหา & อ้างอิง',
    level: 'เริ่มต้น',
    syntax: '=VLOOKUP(ค่าที่ค้นหา, ตารางข้อมูล, คอลัมน์ที่ดึง, 0)',
    description: 'สูตรยอดฮิต! พิมพ์รหัสสินค้าแล้วดึงชื่อสินค้าและราคามาแสดงอัตโนมัติในใบเสนอราคาหรือ POS',
    exampleFormula: '=VLOOKUP("P002", A2:C4, 3, 0)',
    exampleResult: '199 บาท',
    sampleTable: {
      headers: ['รหัส (A)', 'สินค้า (B)', 'ราคา (C)'],
      rows: [
        ['P001', 'ไฟล์สต๊อก', '99'],
        ['P002', 'ไฟล์บัญชี VBA', '199'],
        ['P003', 'ไฟล์หอพัก', '199'],
      ],
    },
    tip: 'ใส่เลข 0 (หรือ FALSE) ตัวสุดท้ายเสมอ เพื่อให้ค้นหาตรงตัวเป๊ะ และล็อกตารางด้วย $A$2:$C$4',
  },
  {
    id: 22,
    name: 'XLOOKUP',
    thaiName: 'ค้นหาข้อมูลรุ่นใหม่ (ซ้าย-ขวาได้หมด)',
    category: 'ค้นหา & อ้างอิง',
    level: 'ใช้งานบ่อย',
    syntax: '=XLOOKUP(ค่าค้นหา, คอลัมน์ค้นหา, คอลัมน์ผลลัพธ์, "ไม่พบ")',
    description: 'สูตรแทน VLOOKUP ที่เก่งกว่า ไม่ต้องนับเลขคอลัมน์ ค้นหาย้อนซ้ายได้ และกำหนดข้อความเมื่อไม่พบได้ทันที',
    exampleFormula: '=XLOOKUP("P002", A2:A4, C2:C4, "ไม่พบรหัส")',
    exampleResult: '199 บาท',
    sampleTable: {
      headers: ['รหัส (A)', 'ชื่อ (B)', 'ราคา (C)'],
      rows: [
        ['P001', 'Stock', '99'],
        ['P002', 'POS', '199'],
      ],
    },
    tip: 'ใช้ได้ใน Excel 2021/365 และ Google Sheets แนะนำมากสำหรับไฟล์ใหม่',
  },
  {
    id: 23,
    name: 'INDEX',
    thaiName: 'ดึงค่าจากตำแหน่งแถวและคอลัมน์',
    category: 'ค้นหา & อ้างอิง',
    level: 'ระดับโปร',
    syntax: '=INDEX(ตาราง, แถวที่, คอลัมน์ที่)',
    description: 'ดึงข้อมูลตามพิกัดแถวและคอลัมน์ที่ระบุ ใช้คู่กับ MATCH จะค้นหาได้ยืดหยุ่นมาก',
    exampleFormula: '=INDEX(B2:B4, 2)',
    exampleResult: 'ใบแจ้งหนี้',
    sampleTable: {
      headers: ['ลำดับ', 'เอกสาร (B)'],
      rows: [
        ['1', 'ใบเสนอราคา'],
        ['2', 'ใบแจ้งหนี้'],
        ['3', 'ใบเสร็จรับเงิน'],
      ],
    },
    tip: 'INDEX+MATCH ทำงานเร็วกว่า VLOOKUP เมื่อตารางมีหลายหมื่นแถว',
  },
  {
    id: 24,
    name: 'MATCH',
    thaiName: 'หาว่าข้อมูลอยู่ลำดับแถวที่เท่าไร',
    category: 'ค้นหา & อ้างอิง',
    level: 'ระดับโปร',
    syntax: '=MATCH(ค่าที่หา, ช่วงข้อมูล, 0)',
    description: 'ส่งกลับตัวเลขตำแหน่งลำดับของข้อมูลที่ค้นหา เพื่อส่งต่อให้ INDEX ดึงค่ามาแสดง',
    exampleFormula: '=MATCH("ใบแจ้งหนี้", B2:B4, 0)',
    exampleResult: 'ลำดับที่ 2',
    sampleTable: {
      headers: ['แถวที่', 'ชื่อเอกสาร (B)'],
      rows: [
        ['1', 'ใบเสนอราคา'],
        ['2', 'ใบแจ้งหนี้'],
        ['3', 'ใบเสร็จ'],
      ],
    },
    tip: 'ใส่ 0 ท้ายสูตรเสมอเมื่อค้นหาข้อความหรือรหัสที่ต้องการความตรงกัน 100%',
  },
  {
    id: 25,
    name: 'HLOOKUP',
    thaiName: 'ค้นหาข้อมูลในแนวนอน',
    category: 'ค้นหา & อ้างอิง',
    level: 'ใช้งานบ่อย',
    syntax: '=HLOOKUP(ค่าที่หา, ตาราง, แถวที่ดึง, 0)',
    description: 'เหมือน VLOOKUP แต่ค้นหาหัวตารางแนวนอนด้านบน แล้วดึงข้อมูลในแถวล่างลงมา',
    exampleFormula: '=HLOOKUP("ก.พ.", A1:C2, 2, 0)',
    exampleResult: '45,000 บาท',
    sampleTable: {
      headers: ['ม.ค. (A)', 'ก.พ. (B)', 'มี.ค. (C)'],
      rows: [['40,000', '45,000', '52,000']],
    },
    tip: 'เหมาะกับตารางสรุปยอดรายเดือนที่เรียงชื่อเดือนไว้แนวนอนด้านบน',
  },
  {
    id: 26,
    name: 'CHOOSE',
    thaiName: 'เลือกค่าตามเลขลำดับ (1, 2, 3...)',
    category: 'ค้นหา & อ้างอิง',
    level: 'ใช้งานบ่อย',
    syntax: '=CHOOSE(ลำดับ, ตัวเลือก1, ตัวเลือก2, ตัวเลือก3)',
    description: 'แปลงตัวเลขลำดับเป็นข้อความหรือช่วงข้อมูล เช่น แปลงเลข 1-4 เป็นไตรมาส Q1-Q4',
    exampleFormula: '=CHOOSE(2, "ไตรมาส 1", "ไตรมาส 2", "ไตรมาส 3")',
    exampleResult: 'ไตรมาส 2',
    sampleTable: {
      headers: ['เลขลำดับ', 'ผลลัพธ์'],
      rows: [['2', 'ไตรมาส 2']],
    },
    tip: 'ใช้สลับชุดตัวเลขสมมติฐาน Best Case / Base Case / Worst Case ในโมเดลการเงินได้ดีมาก',
  },
  {
    id: 27,
    name: 'OFFSET',
    thaiName: 'เลื่อนพิกัดเซลล์และสร้างช่วงยืดหยุ่น',
    category: 'ค้นหา & อ้างอิง',
    level: 'ระดับโปร',
    syntax: '=OFFSET(เซลล์เริ่ม, เลื่อนลงกี่แถว, เลื่อนขวา, สูง, กว้าง)',
    description: 'อ้างอิงเซลล์โดยนับก้าวจากจุดเริ่มต้น นิยมใช้ทำกราฟหรือยอดรวม N เดือนล่าสุดอัตโนมัติ',
    exampleFormula: '=SUM(OFFSET(B1, 1, 0, 3, 1))',
    exampleResult: 'ผลรวม 3 แถวถัดไป',
    sampleTable: {
      headers: ['เดือน', 'ยอดขาย (B)'],
      rows: [
        ['ม.ค.', '10,000'],
        ['ก.พ.', '12,000'],
        ['มี.ค.', '15,000'],
      ],
    },
    tip: 'OFFSET คำนวณใหม่ทุกครั้งที่มีการแก้ไข ควรใช้เฉพาะช่วงรายงานสรุปไม่ให้ไฟล์ช้า',
  },
  {
    id: 28,
    name: 'UNIQUE',
    thaiName: 'ดึงรายชื่อที่ไม่ซ้ำกันออกมาอัตโนมัติ',
    category: 'ค้นหา & อ้างอิง',
    level: 'ใช้งานบ่อย',
    syntax: '=UNIQUE(ช่วงข้อมูล)',
    description: 'คัดแยกรายชื่อลูกค้าหรือหมวดหมู่สินค้าที่ไม่ซ้ำกันจากตารางขายรายวันให้อัตโนมัติ',
    exampleFormula: '=UNIQUE(A2:A5)',
    exampleResult: 'กทม., เชียงใหม่',
    sampleTable: {
      headers: ['จังหวัด (A)'],
      rows: [['กทม.'], ['เชียงใหม่'], ['กทม.'], ['เชียงใหม่']],
    },
    tip: 'ใช้คู่กับ SUMIF เพื่อสร้างตารางสรุปยอดขายรายจังหวัดอัตโนมัติโดยไม่ต้องทำ PivotTable',
  },

  // 4. ข้อความ & จัดรูปแบบ (29-36)
  {
    id: 29,
    name: 'CONCAT',
    thaiName: 'รวมข้อความหลายช่องเข้าด้วยกัน',
    category: 'ข้อความ & จัดรูปแบบ',
    level: 'เริ่มต้น',
    syntax: '=CONCAT(ข้อความ1, " ", ข้อความ2)',
    description: 'นำข้อความจากหลายเซลล์มาต่อกัน เช่น รวมคำนำหน้า + ชื่อ + นามสกุล หรือรหัสเอกสาร',
    exampleFormula: '=CONCAT(A2, " ", B2)',
    exampleResult: 'คุณสมชาย ใจดี',
    sampleTable: {
      headers: ['ชื่อ (A)', 'นามสกุล (B)'],
      rows: [['คุณสมชาย', 'ใจดี']],
    },
    tip: 'หรือใช้เครื่องหมาย & เชื่อมแบบสั้นได้เช่น =A2 & " " & B2',
  },
  {
    id: 30,
    name: 'TEXTJOIN',
    thaiName: 'เชื่อมข้อความพร้อมตัวคั่นและข้ามช่องว่าง',
    category: 'ข้อความ & จัดรูปแบบ',
    level: 'ใช้งานบ่อย',
    syntax: '=TEXTJOIN(ตัวคั่น, TRUE, ช่วงเซลล์)',
    description: 'รวมข้อความทั้งช่วงหรือที่อยู่ (บ้านเลขที่ ตำบล อำเภอ จังหวัด) โดยข้ามช่องที่ว่างให้เอง',
    exampleFormula: '=TEXTJOIN(" / ", TRUE, A2:C2)',
    exampleResult: 'Excel / VBA / Cloud',
    sampleTable: {
      headers: ['คอลัมน์ A', 'คอลัมน์ B', 'คอลัมน์ C'],
      rows: [['Excel', 'VBA', 'Cloud']],
    },
    tip: 'ใส่ TRUE ในอาร์กิวเมนต์ที่ 2 เพื่อไม่ให้แสดงตัวคั่นซ้อนเมื่อมีช่องว่าง',
  },
  {
    id: 31,
    name: 'LEFT',
    thaiName: 'ตัดเอาข้อความจากด้านซ้าย',
    category: 'ข้อความ & จัดรูปแบบ',
    level: 'เริ่มต้น',
    syntax: '=LEFT(ข้อความ, จำนวนตัวอักษร)',
    description: 'ดึงอักษร N ตัวแรกจากฝั่งซ้าย เช่น แยกรหัสหมวดหมู่สินค้าหรือคำนำหน้าบิล',
    exampleFormula: '=LEFT("INV-2026-001", 3)',
    exampleResult: 'INV',
    sampleTable: {
      headers: ['เลขที่เอกสาร', 'ประเภท'],
      rows: [['INV-2026-001', 'INV']],
    },
    tip: 'ใช้ร่วมกับ =VALUE(LEFT(...)) หากต้องการแปลงข้อความที่ตัดได้ให้เป็นตัวเลขคำนวณต่อ',
  },
  {
    id: 32,
    name: 'RIGHT',
    thaiName: 'ตัดเอาข้อความจากด้านขวา',
    category: 'ข้อความ & จัดรูปแบบ',
    level: 'เริ่มต้น',
    syntax: '=RIGHT(ข้อความ, จำนวนตัวอักษร)',
    description: 'ดึงอักษร N ตัวสุดท้ายจากฝั่งขวา เช่น ดึงเลขรันนิ่ง 4 หลักท้ายของบิล หรือปี พ.ศ.',
    exampleFormula: '=RIGHT("INV-2026-0045", 4)',
    exampleResult: '0045',
    sampleTable: {
      headers: ['เลขที่เอกสาร', 'เลขรัน'],
      rows: [['INV-2026-0045', '0045']],
    },
    tip: 'เหมาะสำหรับการจัดหมวดหมู่ตามรหัสลงท้ายหรือเลขท้ายใบกำกับภาษี',
  },
  {
    id: 33,
    name: 'MID',
    thaiName: 'ตัดข้อความจากตรงกลาง',
    category: 'ข้อความ & จัดรูปแบบ',
    level: 'ใช้งานบ่อย',
    syntax: '=MID(ข้อความ, ตำแหน่งเริ่ม, จำนวนตัว)',
    description: 'ดึงอักษรเฉพาะช่วงกลางของรหัส เช่น ดึงปี/เดือนจากเลขที่บิล INV-202611-01',
    exampleFormula: '=MID("INV-202611-01", 5, 6)',
    exampleResult: '202611',
    sampleTable: {
      headers: ['รหัสเอกสาร', 'ปี-เดือน'],
      rows: [['INV-202611-01', '202611']],
    },
    tip: 'นับตำแหน่งตัวแรกทางซ้ายสุดเป็น 1 (รวมเครื่องหมายขีดและเว้นวรรค)',
  },
  {
    id: 34,
    name: 'LEN',
    thaiName: 'นับความยาวตัวอักษร',
    category: 'ข้อความ & จัดรูปแบบ',
    level: 'เริ่มต้น',
    syntax: '=LEN(ข้อความ)',
    description: 'นับจำนวนตัวอักษรทั้งหมดในเซลล์ ใช้ตรวจสอบเลขบัตรประชาชน 13 หลัก หรือเบอร์โทร 10 หลัก',
    exampleFormula: '=LEN("0819998888")',
    exampleResult: '10 ตัวอักษร',
    sampleTable: {
      headers: ['ข้อมูล', 'ความยาว'],
      rows: [['0819998888', '10']],
    },
    tip: 'ใช้คู่กับ IF(LEN(A2)=13, "ถูกต้อง", "ตรวจสอบเลขผู้เสียภาษี")',
  },
  {
    id: 35,
    name: 'TRIM',
    thaiName: 'ลบช่องว่างส่วนเกินหัว-ท้าย',
    category: 'ข้อความ & จัดรูปแบบ',
    level: 'เริ่มต้น',
    syntax: '=TRIM(ข้อความ)',
    description: 'ล้างช่องว่างที่เผลอเคาะเกินก่อนใช้ VLOOKUP เพื่อแก้ปัญหาหาข้อมูลเจอด้วยตาแต่สูตรบอก #N/A',
    exampleFormula: '=TRIM("  สมชาย   ใจดี ")',
    exampleResult: 'สมชาย ใจดี',
    sampleTable: {
      headers: ['ข้อมูลดิบ', 'หลัง TRIM'],
      rows: [['  สมชาย   ใจดี ', 'สมชาย ใจดี']],
    },
    tip: 'ก่อนนำข้อมูลจากระบบอื่นมาทำรายงาน แนะนำให้ผ่าน TRIM ก่อนเสมอ',
  },
  {
    id: 36,
    name: 'TEXT',
    thaiName: 'จัดรูปแบบตัวเลข/วันที่เป็นข้อความสวยๆ',
    category: 'ข้อความ & จัดรูปแบบ',
    level: 'ใช้งานบ่อย',
    syntax: '=TEXT(ค่า, "รูปแบบ")',
    description: 'แปลงตัวเลขให้มีลูกน้ำหรือทศนิยมเมื่อนำไปเชื่อมกับข้อความแจ้งเตือน LINE หรือหัวรายงาน',
    exampleFormula: '="ยอดค้างชำระ " & TEXT(12500, "#,##0") & " บาท"',
    exampleResult: 'ยอดค้างชำระ 12,500 บาท',
    sampleTable: {
      headers: ['ยอดเงิน', 'ข้อความพร้อมส่ง'],
      rows: [['12500', 'ยอดค้างชำระ 12,500 บาท']],
    },
    tip: 'ใช้ =TEXT(TODAY(), "dd/mm/yyyy") เพื่อแทรกวันที่ปัจจุบันลงในประโยคข้อความ',
  },

  // 5. วันที่ & เวลา (37-43)
  {
    id: 37,
    name: 'TODAY',
    thaiName: 'แสดงวันที่ปัจจุบันอัตโนมัติ',
    category: 'วันที่ & เวลา',
    level: 'เริ่มต้น',
    syntax: '=TODAY()',
    description: 'แสดงวันที่ของวันนี้และอัปเดตเองทุกวัน ใช้คำนวณวันค้างชำระหรืออายุสินค้าใกล้หมดอายุ',
    exampleFormula: '=TODAY()',
    exampleResult: '26/11/2026',
    sampleTable: {
      headers: ['วันครบกำหนด', 'เกินกำหนด (วัน)'],
      rows: [['20/11/2026', '=TODAY()-A2 -> 6 วัน']],
    },
    tip: 'หากต้องการลงวันที่แบบคงที่ (ไม่เปลี่ยนตามวัน) ให้กดปุ่ม Ctrl + ; แทน',
  },
  {
    id: 38,
    name: 'NOW',
    thaiName: 'แสดงวันที่และเวลาปัจจุบัน',
    category: 'วันที่ & เวลา',
    level: 'เริ่มต้น',
    syntax: '=NOW()',
    description: 'แสดงทั้งวันที่และเวลา ณ ปัจจุบัน เหมาะสำหรับหัวรายงานพิมพ์ใบสรุปยอดประจำกะ',
    exampleFormula: '=NOW()',
    exampleResult: '26/11/2026 09:30',
    sampleTable: {
      headers: ['หัวเอกสาร'],
      rows: [['พิมพ์เมื่อ: 26/11/2026 09:30']],
    },
    tip: 'กด F9 ใน Excel เพื่อรีเฟรชเวลาปัจจุบันทันที',
  },
  {
    id: 39,
    name: 'DATEDIF',
    thaiName: 'คำนวณอายุคน หรืออายุงาน (ปี/เดือน/วัน)',
    category: 'วันที่ & เวลา',
    level: 'ใช้งานบ่อย',
    syntax: '=DATEDIF(วันเริ่ม, วันสิ้นสุด, "Y")',
    description: 'คำนวณความต่างระหว่าง 2 วันที่เป็นจำนวนปีเต็ม ("Y"), เดือน ("M") หรือวัน ("D")',
    exampleFormula: '=DATEDIF("2020-01-01", TODAY(), "Y")',
    exampleResult: '6 ปี',
    sampleTable: {
      headers: ['วันเริ่มงาน', 'อายุงาน (ปี)'],
      rows: [['01/01/2020', '6 ปี']],
    },
    tip: 'ใช้ "YM" เพื่อหาจำนวนเดือนที่เหลือหลังจากหักปีเต็มแล้ว เช่น 6 ปี 10 เดือน',
  },
  {
    id: 40,
    name: 'EDATE',
    thaiName: 'บวก/ลบจำนวนเดือนจากวันที่',
    category: 'วันที่ & เวลา',
    level: 'ใช้งานบ่อย',
    syntax: '=EDATE(วันที่เริ่ม, จำนวนเดือน)',
    description: 'หาวันครบกำหนดสัญญาเช่า วันหมดประกัน หรือวันทดลองงาน 4 เดือน (120 วัน) อัตโนมัติ',
    exampleFormula: '=EDATE("2026-11-26", 12)',
    exampleResult: '26/11/2027',
    sampleTable: {
      headers: ['วันทำสัญญา', 'ครบสัญญา 12 เดือน'],
      rows: [['26/11/2026', '26/11/2027']],
    },
    tip: 'ใส่จำนวนเดือนติดลบ (เช่น -3) เพื่อย้อนหลังไป 3 เดือน',
  },
  {
    id: 41,
    name: 'EOMONTH',
    thaiName: 'หาวันสุดท้ายของเดือนอัตโนมัติ',
    category: 'วันที่ & เวลา',
    level: 'ใช้งานบ่อย',
    syntax: '=EOMONTH(วันที่, 0)',
    description: 'คืนค่าวันสิ้นเดือนของเดือนที่กำหนด (28, 29, 30 หรือ 31 เอง) สำหรับวางบิลสิ้นเดือนและจ่ายเงินเดือน',
    exampleFormula: '=EOMONTH("2026-11-01", 0)',
    exampleResult: '30/11/2026',
    sampleTable: {
      headers: ['วันที่', 'วันสิ้นเดือน'],
      rows: [['01/11/2026', '30/11/2026']],
    },
    tip: 'ใส่เลข 1 แทน 0 เพื่อหาวันสิ้นเดือนถัดไป (เช่น เครดิต 30 วันสิ้นเดือน)',
  },
  {
    id: 42,
    name: 'NETWORKDAYS',
    thaiName: 'นับจำนวนวันทำงาน (ไม่รวมเสาร์-อาทิตย์)',
    category: 'วันที่ & เวลา',
    level: 'ระดับโปร',
    syntax: '=NETWORKDAYS(วันเริ่ม, วันจบ, [ช่วงวันหยุด])',
    description: 'นับเฉพาะวันจันทร์–ศุกร์ และสามารถระบุตารางวันหยุดนักขัตฤกษ์ให้หักออกได้ด้วย เหมาะกับงาน HR & Project',
    exampleFormula: '=NETWORKDAYS("2026-11-02", "2026-11-13")',
    exampleResult: '10 วันทำงาน',
    sampleTable: {
      headers: ['เริ่ม', 'สิ้นสุด', 'วันทำงาน'],
      rows: [['02/11/2026', '13/11/2026', '10 วัน']],
    },
    tip: 'ถ้าบริษัทหยุดเฉพาะวันอาทิตย์วันเดียว ให้ใช้ NETWORKDAYS.INTL(..., 11)',
  },
  {
    id: 43,
    name: 'YEARFRAC',
    thaiName: 'คำนวณสัดส่วนปีเป็นทศนิยม',
    category: 'วันที่ & เวลา',
    level: 'ระดับโปร',
    syntax: '=YEARFRAC(วันเริ่ม, วันจบ)',
    description: 'หาจำนวนปีแบบมีทศนิยม เช่น 1.5 ปี สำหรับคำนวณดอกเบี้ยรายวัน ค่าเสื่อมราคา หรือโบนัสตามสัดส่วน',
    exampleFormula: '=YEARFRAC("2026-01-01", "2026-07-01")',
    exampleResult: '0.50 ปี',
    sampleTable: {
      headers: ['เริ่ม', 'สิ้นสุด', 'สัดส่วนปี'],
      rows: [['01/01/2026', '01/07/2026', '0.50']],
    },
    tip: 'ใช้ร่วมกับเงินเดือนเพื่อคิดสิทธิลาพักร้อนหรือโบนัสเฉลี่ยตามวันทำงานจริง',
  },

  // 6. การเงิน & ภาษี (44-50)
  {
    id: 44,
    name: 'BAHTTEXT',
    thaiName: 'แปลงตัวเลขเงินเป็นคำอ่านภาษาไทย',
    category: 'การเงิน & ภาษี',
    level: 'เริ่มต้น',
    syntax: '=BAHTTEXT(จำนวนเงิน)',
    description: 'สูตรสำคัญสำหรับใบเสนอราคา ใบแจ้งหนี้ และใบเสร็จไทย แปลง 1250 เป็น "หนึ่งพันสองร้อยห้าสิบบาทถ้วน" ทันที',
    exampleFormula: '=BAHTTEXT(1250)',
    exampleResult: 'หนึ่งพันสองร้อยห้าสิบบาทถ้วน',
    sampleTable: {
      headers: ['ยอดรวมสุทธิ', 'ตัวอักษรไทย'],
      rows: [['1,250.00', 'หนึ่งพันสองร้อยห้าสิบบาทถ้วน']],
    },
    tip: 'มีใน Excel และ Google Sheets แท้ๆ ใช้ได้เลยไม่ต้องลงปลั๊กอินเพิ่ม',
  },
  {
    id: 45,
    name: 'PMT',
    thaiName: 'คำนวณค่างวดผ่อนชำระรายเดือน',
    category: 'การเงิน & ภาษี',
    level: 'ใช้งานบ่อย',
    syntax: '=PMT(ดอกเบี้ยต่อปี/12, จำนวนเดือนทั้งหมด, -ยอดกู้)',
    description: 'คำนวณยอดผ่อนบ้าน ผ่อนรถ หรือสินเชื่อธุรกิจต่อเดือนแบบคงที่ (Effective Rate)',
    exampleFormula: '=PMT(6%/12, 36, -300000)',
    exampleResult: '9,126.58 บาท/เดือน',
    sampleTable: {
      headers: ['ยอดกู้', 'ดอกเบี้ย/ปี', 'งวด (เดือน)'],
      rows: [['300,000', '6%', '36']],
    },
    tip: 'ใส่เครื่องหมายลบ (-) หน้ายอดเงินกู้ เพื่อให้ผลลัพธ์ค่างวดแสดงเป็นค่าบวก',
  },
  {
    id: 46,
    name: 'FV',
    thaiName: 'คำนวณเงินออมในอนาคต (ดอกเบี้ยทบต้น)',
    category: 'การเงิน & ภาษี',
    level: 'ใช้งานบ่อย',
    syntax: '=FV(ผลตอบแทน/12, จำนวนเดือน, -ออมต่อเดือน, -เงินตั้งต้น)',
    description: 'วางแผนเกษียณ! ดูว่าหากออมเงินเดือนละ 5,000 บาท เป็นเวลา 20 ปี ที่ผลตอบแทน 6% จะมีเงินรวมกี่ล้าน',
    exampleFormula: '=FV(6%/12, 240, -5000, 0)',
    exampleResult: '2,310,204 บาท',
    sampleTable: {
      headers: ['ออม/เดือน', 'ระยะเวลา', 'ผลตอบแทน/ปี'],
      rows: [['5,000', '20 ปี (240 ด.)', '6%']],
    },
    tip: 'ใส่ลบ (-) หน้ายอดเงินออม เพื่อให้ยอดเงินในอนาคตออกมาเป็นบวก',
  },
  {
    id: 47,
    name: 'PV',
    thaiName: 'คำนวณมูลค่าปัจจุบันของเงินก้อน',
    category: 'การเงิน & ภาษี',
    level: 'ระดับโปร',
    syntax: '=PV(อัตราคิดลด, งวด, ค่างวด)',
    description: 'หามูลค่าปัจจุบันของเงินที่จะได้รับในอนาคต เช่น วางแผนว่าต้องมีเงินก้อนเท่าไร ณ วันเกษียณเพื่อให้ถอนใช้ได้ 25 ปี',
    exampleFormula: '=PV(4%/12, 300, -25000)',
    exampleResult: '4,736,315 บาท',
    sampleTable: {
      headers: ['ต้องการใช้/เดือน', 'ใช้กี่ปี', 'ผลตอบแทนหลังเกษียณ'],
      rows: [['25,000', '25 ปี (300 ด.)', '4%']],
    },
    tip: 'ช่วยตอบโจทย์วางแผนเกษียณคู่กับสูตร FV ได้อย่างแม่นยำ',
  },
  {
    id: 48,
    name: 'NPV',
    thaiName: 'ประเมินความคุ้มค่าโครงการลงทุน',
    category: 'การเงิน & ภาษี',
    level: 'ระดับโปร',
    syntax: '=NPV(อัตราผลตอบแทนขั้นต่ำ, กระแสเงินสดปี1:ปีN) - เงินลงทุนเริ่ม',
    description: 'เช็กว่าโครงการหรือการเปิดสาขาใหม่คุ้มค่าลงทุนหรือไม่ (ถ้า NPV > 0 แสดงว่าคุ้มค่าและได้ผลตอบแทนเกินเป้า)',
    exampleFormula: '=NPV(10%, B2:B4) - 100000',
    exampleResult: '+24,343 บาท (คุ้มลงทุน)',
    sampleTable: {
      headers: ['ปีที่', 'กระแสเงินสดสุทธิ'],
      rows: [
        ['ปี 1', '45,000'],
        ['ปี 2', '50,000'],
        ['ปี 3', '55,000'],
      ],
    },
    tip: 'ระวัง! เงินลงทุนปีที่ 0 ห้ามใส่ในวงเล็บ NPV ให้เอามาลบด้านนอกแทน',
  },
  {
    id: 49,
    name: 'IRR',
    thaiName: 'หาอัตราผลตอบแทนจริงของโครงการ (%)',
    category: 'การเงิน & ภาษี',
    level: 'ระดับโปร',
    syntax: '=IRR(ช่วงกระแสเงินสดตั้งแต่ปี 0 ถึงปี N)',
    description: 'คำนวณผลตอบแทนเฉลี่ยต่อปีที่โครงการทำได้จริง เพื่อเปรียบเทียบกับการฝากเงินหรือดอกเบี้ยเงินกู้',
    exampleFormula: '=IRR(B2:B5)',
    exampleResult: '22.4% ต่อปี',
    sampleTable: {
      headers: ['ช่วงเวลา', 'กระแสเงินสด (B)'],
      rows: [
        ['ลงทุนเริ่ม', '-100,000'],
        ['ปี 1', '45,000'],
        ['ปี 2', '50,000'],
        ['ปี 3', '55,000'],
      ],
    },
    tip: 'ช่องแรกของ IRR ต้องเป็นค่าติดลบ (เงินลงทุนตั้งต้น) เสมอ',
  },
  {
    id: 50,
    name: 'IFERROR',
    thaiName: 'ดักจับ Error (#N/A, #DIV/0!) ให้ดูสวยงาม',
    category: 'การเงิน & ภาษี',
    level: 'เริ่มต้น',
    syntax: '=IFERROR(สูตรเดิม, ค่าที่แสดงเมื่อ Error)',
    description: 'สูตรกันตาย! ครอบไว้หน้า VLOOKUP หรือการหาร เพื่อไม่ให้เอกสารใบเสนอราคาแสดง #N/A หรือ #DIV/0! น่าเกลียด',
    exampleFormula: '=IFERROR(B2/C2, 0)',
    exampleResult: '0 (เมื่อตัวหารเป็น 0)',
    sampleTable: {
      headers: ['กำไร (B)', 'ยอดขาย (C)', 'Margin %'],
      rows: [['500', '0', '=IFERROR(B2/C2, 0) -> 0%']],
    },
    tip: 'ในใบเสนอราคา นิยมใส่ =IFERROR(VLOOKUP(...), "") เพื่อให้ช่องที่ยังไม่เลือกสินค้าว่างสะอาดตา',
  },
];

function escapeXml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function downloadFormulasWorkbook(mode: 'all50' | 'ebook30' | 'single', singleFormula?: ExcelFormulaItem): void {
  const list =
    mode === 'single' && singleFormula
      ? [singleFormula]
      : mode === 'ebook30'
        ? EXCEL_FORMULAS_50.slice(0, 30)
        : EXCEL_FORMULAS_50;

  const title =
    mode === 'single' && singleFormula
      ? `แบบฝึกหัดสูตร ${singleFormula.name} (${singleFormula.thaiName})`
      : mode === 'ebook30'
        ? 'Ebook คู่มือ 30 สูตร Excel ใช้จริงสำหรับธุรกิจไทย (Kodraewjob)'
        : 'ชุดฝึกปฏิบัติ 50 สูตร Excel เบื้องต้นพร้อมตัวอย่างใช้งานจริง (Kodraewjob)';

  const filename =
    mode === 'single' && singleFormula
      ? `practice-${singleFormula.name.toLowerCase()}.xls`
      : mode === 'ebook30'
        ? 'ebook-30-excel-formulas-kodraewjob.xls'
        : 'practice-50-excel-formulas-kodraewjob.xls';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Title"><Font ss:Bold="1" ss:Size="14" ss:Color="#1E1B18"/></Style>
  <Style ss:ID="Header"><Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="11"/><Interior ss:Color="#EA580C" ss:Pattern="Solid"/></Style>
  <Style ss:ID="Formula"><Font ss:Bold="1" ss:Color="#0F766E"/><Interior ss:Color="#F0FDFA" ss:Pattern="Solid"/></Style>
  <Style ss:ID="Num"><NumberFormat ss:Format="#,##0.00"/></Style>
  <Style ss:ID="Total"><Font ss:Bold="1" ss:Color="#1E1B18"/><Interior ss:Color="#FFEDD5" ss:Pattern="Solid"/><NumberFormat ss:Format="#,##0.00"/></Style>
 </Styles>
 <Worksheet ss:Name="50_Formulas_Guide">
  <Table>
   <Column ss:Width="45"/><Column ss:Width="110"/><Column ss:Width="150"/><Column ss:Width="200"/><Column ss:Width="250"/><Column ss:Width="280"/><Column ss:Width="240"/>
   <Row><Cell ss:StyleID="Title"><Data ss:Type="String">${escapeXml(title)}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">จัดทำโดย กดแล้วจบ (Kodraewjob Digital Marketplace) · LINE @556fsrdw</Data></Cell></Row>
   <Row/>
   <Row>
    <Cell ss:StyleID="Header"><Data ss:Type="String">ข้อ</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">สูตร Excel</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">หมวดหมู่</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">หน้าที่ภาษาไทย</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">รูปแบบไวยากรณ์ (Syntax)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">ตัวอย่างสูตรจริง</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">คำแนะนำการใช้งาน</Data></Cell>
   </Row>
   ${list
     .map(
       (f) => `<Row>
    <Cell><Data ss:Type="Number">${f.id}</Data></Cell>
    <Cell ss:StyleID="Formula"><Data ss:Type="String">${escapeXml(f.name)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(f.category)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(f.thaiName)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(f.syntax)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(f.exampleFormula)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(f.tip)}</Data></Cell>
   </Row>`
     )
     .join('\n   ')}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Live_Practice_Sheet">
  <Table>
   <Column ss:Width="180"/><Column ss:Width="100"/><Column ss:Width="110"/><Column ss:Width="130"/><Column ss:Width="140"/>
   <Row><Cell ss:StyleID="Title"><Data ss:Type="String">สนามฝึกเขียนสูตร Excel จริง (มีสูตรผูกไว้พร้อมทดลองแก้ตัวเลข)</Data></Cell></Row>
   <Row/>
   <Row>
    <Cell ss:StyleID="Header"><Data ss:Type="String">รายการสินค้า</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">สาขา</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">จำนวน</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">ราคา/หน่วย</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">ยอดรวม (=C*D)</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">เทมเพลตสต๊อกสินค้า</Data></Cell><Cell><Data ss:Type="String">กทม.</Data></Cell>
    <Cell><Data ss:Type="Number">5</Data></Cell><Cell ss:StyleID="Num"><Data ss:Type="Number">199</Data></Cell>
    <Cell ss:StyleID="Num" ss:Formula="=RC[-2]*RC[-1]"><Data ss:Type="Number">995</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">เทมเพลตบัญชี POS</Data></Cell><Cell><Data ss:Type="String">เชียงใหม่</Data></Cell>
    <Cell><Data ss:Type="Number">3</Data></Cell><Cell ss:StyleID="Num"><Data ss:Type="Number">199</Data></Cell>
    <Cell ss:StyleID="Num" ss:Formula="=RC[-2]*RC[-1]"><Data ss:Type="Number">597</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">เทมเพลตใบเสนอราคา</Data></Cell><Cell><Data ss:Type="String">กทม.</Data></Cell>
    <Cell><Data ss:Type="Number">8</Data></Cell><Cell ss:StyleID="Num"><Data ss:Type="Number">99</Data></Cell>
    <Cell ss:StyleID="Num" ss:Formula="=RC[-2]*RC[-1]"><Data ss:Type="Number">792</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="Total"><Data ss:Type="String">รวมทั้งหมด (SUM)</Data></Cell>
    <Cell ss:StyleID="Total"><Data ss:Type="String">-</Data></Cell>
    <Cell ss:StyleID="Total" ss:Formula="=SUM(R[-3]C:R[-1]C)"><Data ss:Type="Number">16</Data></Cell>
    <Cell ss:StyleID="Total" ss:Formula="=AVERAGE(R[-3]C:R[-1]C)"><Data ss:Type="Number">165.67</Data></Cell>
    <Cell ss:StyleID="Total" ss:Formula="=SUM(R[-3]C:R[-1]C)"><Data ss:Type="Number">2384</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="Total"><Data ss:Type="String">เฉพาะสาขา กทม. (SUMIF)</Data></Cell>
    <Cell><Data ss:Type="String">กทม.</Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell ss:StyleID="Total" ss:Formula="=SUMIF(R[-4]C[-3]:R[-2]C[-3],&quot;กทม.&quot;,R[-4]C:R[-2]C)"><Data ss:Type="Number">1787</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="Total"><Data ss:Type="String">ตัวอักษรไทย (BAHTTEXT)</Data></Cell>
    <Cell ss:Formula="=BAHTTEXT(R[-2]C[3])"><Data ss:Type="String">สองพันสามร้อยแปดสิบสี่บาทถ้วน</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
