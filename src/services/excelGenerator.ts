import ExcelJS from 'exceljs';

export interface ProductExportSpec {
  title: string;
  slug: string;
  level: string;
  categoryName: string;
  price: number;
}

function styleHeaderCell(cell: ExcelJS.Cell, bgHex: string) {
  cell.font = { name: 'Tahoma', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgHex } };
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  cell.border = {
    top: { style: 'thin', color: { argb: 'FFFDBA74' } },
    bottom: { style: 'thin', color: { argb: 'FFFDBA74' } },
    left: { style: 'thin', color: { argb: 'FFFDBA74' } },
    right: { style: 'thin', color: { argb: 'FFFDBA74' } },
  };
}

function styleBodyCell(cell: ExcelJS.Cell, altRow: boolean) {
  cell.font = { name: 'Tahoma', size: 10, color: { argb: 'FF1E293B' } };
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: altRow ? 'FFFFF7ED' : 'FFFFFFFF' },
  };
  cell.border = {
    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  };
}

export async function generateProductWorkbookBuffer(
  product: ProductExportSpec
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'กดแล้วจบ (Kodraewjob Digital Marketplace)';
  workbook.created = new Date();

  const slug = product.slug.toLowerCase();
  const isPayroll = slug.includes('payroll') || slug.includes('wage') || slug.includes('ot') || slug.includes('welfare') || slug.includes('pvd');
  const isInventory = slug.includes('stock') || slug.includes('inventory') || slug.includes('bom') || slug.includes('pos') || slug.includes('production') || slug.includes('asset');
  const isGrade = slug.includes('grad') || slug.includes('attendance') || slug.includes('homework') || slug.includes('characteristics');

  // ==================== SHEET 1: DASHBOARD ====================
  const dash = workbook.addWorksheet('Dashboard สรุปผล', {
    views: [{ showGridLines: true }],
  });

  dash.mergeCells('A1:G1');
  const banner = dash.getCell('A1');
  banner.value = `กดแล้วจบ (Kodraewjob) — ${product.title}`;
  banner.font = { name: 'Tahoma', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
  banner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEA580C' } };
  banner.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  dash.getRow(1).height = 38;

  dash.mergeCells('A2:G2');
  const subBanner = dash.getCell('A2');
  subBanner.value = `หมวดหมู่: ${product.categoryName} | ระดับ: ${product.level.toUpperCase()} | สูตรอัตโนมัติพร้อมใช้งานเชิงพาณิชย์ | LINE @556fsrdw`;
  subBanner.font = { name: 'Tahoma', size: 10, italic: true, color: { argb: 'FF9A3412' } };
  subBanner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEDD5' } };
  subBanner.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  dash.getRow(2).height = 24;

  // KPI Summary Cards linking dynamically to Sheet 2 ('ฐานข้อมูลและคำนวณ')
  const kpiHeaders = ['ตัวชี้วัดหลัก (KPI)', 'ค่าสรุปอัตโนมัติ', 'หน่วย / สถานะ', 'สูตรอ้างอิงในระบบ'];
  const kpiHeaderRow = dash.getRow(4);
  kpiHeaderRow.values = kpiHeaders;
  kpiHeaderRow.height = 26;
  kpiHeaderRow.eachCell((c) => styleHeaderCell(c, 'FF0F172A'));

  const kpiRows: Array<[string, ExcelJS.CellFormulaValue, string, string]> = [
    ['จำนวนรายการทั้งหมดในตาราง', { formula: "COUNTA('ฐานข้อมูลและคำนวณ'!B5:B14)" }, 'รายการ', '=COUNTA(B5:B14)'],
    ['ยอดรวมสุทธิทั้งหมด', { formula: "SUM('ฐานข้อมูลและคำนวณ'!G5:G14)" }, 'บาท / หน่วย', '=SUM(G5:G14)'],
    ['ค่าเฉลี่ยต่อรายการ', { formula: "AVERAGE('ฐานข้อมูลและคำนวณ'!G5:G14)" }, 'บาท / หน่วย', '=AVERAGE(G5:G14)'],
    ['ยอดสูงสุดในตาราง', { formula: "MAX('ฐานข้อมูลและคำนวณ'!G5:G14)" }, 'บาท / หน่วย', '=MAX(G5:G14)'],
    ['สถานะการตรวจสอบสูตร', { formula: 'IF(B6>0,"พร้อมใช้งาน 100%","รอป้อนข้อมูล")' }, 'ตรวจสอบอัตโนมัติ', '=IF(B6>0,...)'],
  ];

  kpiRows.forEach((kr, idx) => {
    const r = dash.getRow(5 + idx);
    r.values = kr;
    r.height = 24;
    r.eachCell((c) => styleBodyCell(c, idx % 2 === 1));
    r.getCell(2).font = { name: 'Tahoma', size: 11, bold: true, color: { argb: 'FFEA580C' } };
    if (idx >= 1 && idx <= 3) r.getCell(2).numFmt = '#,##0.00';
  });

  dash.columns = [
    { width: 32 },
    { width: 24 },
    { width: 20 },
    { width: 28 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
  ];

  // ==================== SHEET 2: DATA & FORMULAS ====================
  const dataSheet = workbook.addWorksheet('ฐานข้อมูลและคำนวณ', {
    views: [{ state: 'frozen', ySplit: 4 }],
  });

  dataSheet.mergeCells('A1:H1');
  const dTitle = dataSheet.getCell('A1');
  dTitle.value = `ตารางปฏิบัติการ: ${product.title}`;
  dTitle.font = { name: 'Tahoma', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  dTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
  dTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  dataSheet.getRow(1).height = 32;

  dataSheet.mergeCells('A2:H2');
  const dHint = dataSheet.getCell('A2');
  dHint.value = 'คำแนะนำ: แก้ไขข้อมูลในคอลัมน์สีขาว/ส้มอ่อน ส่วนคอลัมน์ผลลัพธ์มีสูตรคำนวณอัตโนมัติครบถ้วน';
  dHint.font = { name: 'Tahoma', size: 10, color: { argb: 'FF065F46' } };
  dHint.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
  dataSheet.getRow(2).height = 22;

  const headerRow = dataSheet.getRow(4);
  headerRow.height = 28;

  if (isPayroll) {
    headerRow.values = [
      'รหัสพนักงาน',
      'ชื่อ-นามสกุล',
      'แผนก',
      'เงินเดือนฐาน',
      'OT / เบี้ยขยัน',
      'ประกันสังคม 5%',
      'รายรับสุทธิ (บาท)',
      'สถานะจ่าย',
    ];
    headerRow.eachCell((c) => styleHeaderCell(c, 'FFEA580C'));

    const employees = [
      ['EMP-001', 'นายสมชาย ใจดี', 'บัญชีและการเงิน', 28000, 2400],
      ['EMP-002', 'นางสาวศิริพร รัตนกุล', 'ฝ่ายขายและตลาด', 24000, 3800],
      ['EMP-003', 'นายธนากร สุขสวัสดิ์', 'คลังสินค้า', 18500, 3200],
      ['EMP-004', 'นางสาวพิมพ์ชนก แก้วมณี', 'ฝ่ายผลิต', 16500, 4100],
      ['EMP-005', 'นายวรพล ตั้งจิตต์', 'วิศวกรรม', 35000, 1500],
      ['EMP-006', 'นางสาวกัลยา มั่นคง', 'บุคคล (HR)', 22000, 1800],
    ];
    employees.forEach((emp, idx) => {
      const rNum = 5 + idx;
      const row = dataSheet.getRow(rNum);
      row.values = [
        emp[0],
        emp[1],
        emp[2],
        emp[3],
        emp[4],
        { formula: `MIN(D${rNum}*0.05, 750)` },
        { formula: `D${rNum}+E${rNum}-F${rNum}` },
        { formula: `IF(G${rNum}>0,"พร้อมโอน","ตรวจสอบ")` },
      ];
      row.height = 22;
      row.eachCell((c) => styleBodyCell(c, idx % 2 === 1));
      [4, 5, 6, 7].forEach((col) => (row.getCell(col).numFmt = '#,##0.00'));
    });

    const sumRow = dataSheet.getRow(12);
    sumRow.getCell(3).value = 'รวมยอดทั้งบริษัท';
    sumRow.getCell(4).value = { formula: 'SUM(D5:D10)' };
    sumRow.getCell(5).value = { formula: 'SUM(E5:E10)' };
    sumRow.getCell(6).value = { formula: 'SUM(F5:F10)' };
    sumRow.getCell(7).value = { formula: 'SUM(G5:G10)' };
    [3, 4, 5, 6, 7].forEach((col) => {
      sumRow.getCell(col).font = { name: 'Tahoma', size: 10, bold: true };
      sumRow.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEDD5' } };
      if (col >= 4) sumRow.getCell(col).numFmt = '#,##0.00';
    });
  } else if (isInventory) {
    headerRow.values = [
      'รหัส SKU',
      'ชื่อสินค้า / วัตถุดิบ',
      'หมวด',
      'ยอดยกมา + รับเข้า',
      'จ่ายออก / ใช้ผลิต',
      'จุดสั่งซื้อซ้ำ',
      'คงเหลือสุทธิ',
      'แจ้งเตือนสต๊อก',
    ];
    headerRow.eachCell((c) => styleHeaderCell(c, 'FFEA580C'));

    const items = [
      ['SKU-101', 'กล่องบรรจุภัณฑ์ Size M', 'บรรจุภัณฑ์', 450, 320, 150],
      ['SKU-102', 'อะไหล่มอเตอร์เกรด A', 'วัตถุดิบหลัก', 120, 95, 40],
      ['SKU-103', 'สติกเกอร์บาร์โค้ด 50x30mm', 'วัสดุสิ้นเปลือง', 800, 410, 200],
      ['SKU-104', 'แผ่นอะลูมิเนียม 2mm', 'วัตถุดิบหลัก', 90, 40, 30],
      ['SKU-105', 'ชุดอุปกรณ์แพ็คกิ้ง', 'บรรจุภัณฑ์', 300, 125, 100],
      ['SKU-106', 'สายไฟ THW 2.5 sq.mm', 'งานระบบ', 220, 185, 50],
    ];
    items.forEach((it, idx) => {
      const rNum = 5 + idx;
      const row = dataSheet.getRow(rNum);
      row.values = [
        it[0],
        it[1],
        it[2],
        it[3],
        it[4],
        it[5],
        { formula: `D${rNum}-E${rNum}` },
        { formula: `IF(G${rNum}<=F${rNum},"สั่งซื้อด่วน!","ปกติ")` },
      ];
      row.height = 22;
      row.eachCell((c) => styleBodyCell(c, idx % 2 === 1));
      [4, 5, 6, 7].forEach((col) => (row.getCell(col).numFmt = '#,##0'));
    });

    const sumRow = dataSheet.getRow(12);
    sumRow.getCell(3).value = 'รวมจำนวนทั้งหมด';
    sumRow.getCell(4).value = { formula: 'SUM(D5:D10)' };
    sumRow.getCell(5).value = { formula: 'SUM(E5:E10)' };
    sumRow.getCell(7).value = { formula: 'SUM(G5:G10)' };
    [3, 4, 5, 7].forEach((col) => {
      sumRow.getCell(col).font = { name: 'Tahoma', size: 10, bold: true };
      sumRow.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEDD5' } };
      if (col >= 4) sumRow.getCell(col).numFmt = '#,##0';
    });
  } else if (isGrade) {
    headerRow.values = [
      'รหัสนักเรียน',
      'ชื่อ-นามสกุล',
      'ห้อง',
      'คะแนนเก็บ (60)',
      'กลางภาค (20)',
      'ปลายภาค (20)',
      'คะแนนรวม (100)',
      'เกรดอัตโนมัติ',
    ];
    headerRow.eachCell((c) => styleHeaderCell(c, 'FFEA580C'));

    const students = [
      ['ST-01', 'ด.ช.กิตติศักดิ์ วงศ์ดี', 'ม.3/1', 54, 18, 17],
      ['ST-02', 'ด.ญ.ปวริศา สุขใจ', 'ม.3/1', 49, 15, 14],
      ['ST-03', 'ด.ช.ณัฐพล แก้วใส', 'ม.3/1', 42, 13, 12],
      ['ST-04', 'ด.ญ.อรวรรณ ศรีสม', 'ม.3/1', 56, 19, 18],
      ['ST-05', 'ด.ช.ธนวัฒน์ อ่อนน้อม', 'ม.3/1', 38, 12, 11],
    ];
    students.forEach((st, idx) => {
      const rNum = 5 + idx;
      const row = dataSheet.getRow(rNum);
      row.values = [
        st[0],
        st[1],
        st[2],
        st[3],
        st[4],
        st[5],
        { formula: `SUM(D${rNum}:F${rNum})` },
        {
          formula: `IF(G${rNum}>=80,4,IF(G${rNum}>=75,3.5,IF(G${rNum}>=70,3,IF(G${rNum}>=65,2.5,IF(G${rNum}>=60,2,IF(G${rNum}>=55,1.5,IF(G${rNum}>=50,1,0)))))))`,
        },
      ];
      row.height = 22;
      row.eachCell((c) => styleBodyCell(c, idx % 2 === 1));
      row.getCell(8).numFmt = '0.0';
    });
  } else {
    // Accounting / Financial / Tax / Quotation / General Business Template
    headerRow.values = [
      'ลำดับ',
      'รายการ / รายละเอียดธุรกิจ',
      'หมวดบัญชี',
      'จำนวน',
      'ราคา/หน่วย (บาท)',
      'ส่วนลด (%)',
      'ยอดสุทธิ (บาท)',
      'VAT 7% (บาท)',
    ];
    headerRow.eachCell((c) => styleHeaderCell(c, 'FFEA580C'));

    const bizRows = [
      [1, 'บริการวางระบบและปรับแต่งเทมเพลตองค์กร', 'รายได้หลัก', 2, 4500, 0.05],
      [2, 'แพ็กเกจไฟล์บัญชี & ภาษี ภ.พ.30', 'ซอฟต์แวร์', 5, 199, 0],
      [3, 'ค่าจัดซื้อวัสดุสำนักงานและอุปกรณ์', 'ค่าใช้จ่าย', 12, 350, 0],
      [4, 'งานที่ปรึกษาวิเคราะห์ข้อมูล Dashboard', 'บริการ', 1, 8900, 0.1],
      [5, 'ค่าบำรุงรักษาและอัปเดตสูตรรายปี', 'บริการ', 3, 1200, 0],
      [6, 'ค่าจัดส่งและโลจิสติกส์', 'ขนส่ง', 8, 180, 0],
    ];

    bizRows.forEach((br, idx) => {
      const rNum = 5 + idx;
      const row = dataSheet.getRow(rNum);
      row.values = [
        br[0],
        br[1],
        br[2],
        br[3],
        br[4],
        br[5],
        { formula: `ROUND(D${rNum}*E${rNum}*(1-F${rNum}),2)` },
        { formula: `ROUND(G${rNum}*0.07,2)` },
      ];
      row.height = 22;
      row.eachCell((c) => styleBodyCell(c, idx % 2 === 1));
      row.getCell(1).alignment = { horizontal: 'center' };
      row.getCell(4).numFmt = '#,##0';
      row.getCell(5).numFmt = '#,##0.00';
      row.getCell(6).numFmt = '0%';
      row.getCell(7).numFmt = '#,##0.00';
      row.getCell(8).numFmt = '#,##0.00';
    });

    const subRow = dataSheet.getRow(12);
    subRow.getCell(6).value = 'รวมก่อน VAT';
    subRow.getCell(7).value = { formula: 'SUM(G5:G10)' };
    subRow.getCell(8).value = { formula: 'SUM(H5:H10)' };
    [6, 7, 8].forEach((c) => {
      subRow.getCell(c).font = { name: 'Tahoma', size: 10, bold: true };
      if (c >= 7) subRow.getCell(c).numFmt = '#,##0.00';
    });

    const grandRow = dataSheet.getRow(13);
    grandRow.getCell(6).value = 'ยอดรวมสุทธิ (รวม VAT 7%)';
    grandRow.getCell(7).value = { formula: 'G12+H12' };
    grandRow.getCell(8).value = { formula: 'BAHTTEXT(G13)' };
    [6, 7, 8].forEach((c) => {
      grandRow.getCell(c).font = { name: 'Tahoma', size: 11, bold: true, color: { argb: 'FF9A3412' } };
      grandRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEDD5' } };
    });
    grandRow.getCell(7).numFmt = '#,##0.00';
  }

  dataSheet.columns = [
    { width: 14 },
    { width: 38 },
    { width: 18 },
    { width: 16 },
    { width: 18 },
    { width: 16 },
    { width: 20 },
    { width: 24 },
  ];

  // ==================== SHEET 3: FORMULA MANUAL ====================
  const guide = workbook.addWorksheet('คู่มือสูตรและวิธีใช้');
  guide.mergeCells('A1:C1');
  guide.getCell('A1').value = `คู่มือการใช้งานและสูตรสำคัญ — ${product.title}`;
  guide.getCell('A1').font = { name: 'Tahoma', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  guide.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
  guide.getRow(1).height = 32;

  const tips = [
    ['1. การกรอกข้อมูล', 'กรอกข้อมูลในชีต "ฐานข้อมูลและคำนวณ" เท่านั้น ระบบจะส่งผลลัพธ์ไปยัง Dashboard อัตโนมัติ'],
    ['2. สูตรที่ใช้ในไฟล์นี้', 'SUM, AVERAGE, COUNTA, IF, MIN, ROUND, BAHTTEXT เชื่อมโยงข้ามชีตแบบเรียลไทม์'],
    ['3. การเพิ่มแถวข้อมูล', 'คลิกขวาแทรกแถวเหนือแถวสรุปยอด เพื่อให้สูตร SUM ขยายขอบเขตตามอัตโนมัติ'],
    ['4. สนับสนุนหลังการขาย', 'เข้ากลุ่ม LINE @556fsrdw หรือฟอรั่มชุมชนเว็บ กดแล้วจบ (Kodraewjob) ได้ตลอด 24 ชม.'],
  ];
  tips.forEach((t, i) => {
    const r = guide.getRow(3 + i);
    r.values = t;
    r.height = 24;
    r.getCell(1).font = { name: 'Tahoma', size: 10, bold: true, color: { argb: 'FFEA580C' } };
    r.getCell(2).font = { name: 'Tahoma', size: 10 };
  });
  guide.getColumn(1).width = 28;
  guide.getColumn(2).width = 80;

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

export async function generateAdminSalesReportBuffer(
  ordersList: Array<{
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    createdAt: Date;
  }>
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Sales Report');

  sheet.mergeCells('A1:G1');
  const title = sheet.getCell('A1');
  title.value = 'กดแล้วจบ (Kodraewjob Digital Marketplace) — รายงานยอดขาย';
  title.font = { name: 'Tahoma', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEA580C' } };
  sheet.getRow(1).height = 32;

  const headerRow = sheet.getRow(3);
  headerRow.values = ['เลขที่คำสั่งซื้อ', 'ชื่อลูกค้า', 'อีเมล', 'ช่องทางชำระเงิน', 'สถานะ', 'ยอดรวม (บาท)', 'วันที่สั่งซื้อ'];
  headerRow.eachCell((cell) => styleHeaderCell(cell, 'FF0F172A'));

  ordersList.forEach((o, i) => {
    const row = sheet.getRow(4 + i);
    row.values = [
      o.orderNumber,
      o.customerName,
      o.customerEmail,
      o.paymentMethod,
      o.status,
      o.totalAmount,
      new Date(o.createdAt).toLocaleString('th-TH'),
    ];
    row.getCell(6).numFmt = '#,##0';
  });

  sheet.columns = [
    { width: 22 },
    { width: 24 },
    { width: 28 },
    { width: 18 },
    { width: 14 },
    { width: 16 },
    { width: 22 },
  ];

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
