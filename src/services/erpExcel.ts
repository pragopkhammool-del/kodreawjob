import ExcelJS from 'exceljs';

export async function generateErpInventoryExcelBuffer(
  companyName: string,
  items: Array<{
    sku: string;
    barcode: string;
    name: string;
    category: string;
    unit: string;
    warehouse: string;
    supplier: string;
    costPrice: number;
    sellPrice: number;
    stockQty: number;
    minStock: number;
    reorderPoint: number;
  }>
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'กดแล้วจบ (Kodraewjob Digital Marketplace)';

  const ws = wb.addWorksheet('Stock Balance');
  ws.mergeCells('A1:L1');
  ws.getCell('A1').value = `${companyName} — รายงานสินค้าคงเหลือและมูลค่าสต๊อก (Stock Balance)`;
  ws.getCell('A1').font = { name: 'Sarabun', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEA580C' } };
  ws.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left' };
  ws.getRow(1).height = 30;

  ws.getRow(2).values = [
    'SKU',
    'Barcode',
    'ชื่อสินค้า',
    'หมวดหมู่',
    'หน่วย',
    'คลังสินค้า',
    'Supplier',
    'ต้นทุนเฉลี่ย (฿)',
    'ราคาขาย (฿)',
    'คงเหลือ',
    'Reorder Point',
    'มูลค่าสต๊อกรวม (฿)',
  ];
  ws.getRow(2).eachCell((cell) => {
    cell.font = { name: 'Sarabun', bold: true, color: { argb: 'FF1E1B18' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEDD5' } };
  });

  items.forEach((p, idx) => {
    const r = idx + 3;
    ws.getRow(r).values = [
      p.sku,
      p.barcode,
      p.name,
      p.category,
      p.unit,
      p.warehouse,
      p.supplier,
      p.costPrice,
      p.sellPrice,
      p.stockQty,
      p.reorderPoint,
      { formula: `H${r}*J${r}` },
    ];
    ws.getCell(`H${r}`).numFmt = '#,##0.00';
    ws.getCell(`I${r}`).numFmt = '#,##0.00';
    ws.getCell(`L${r}`).numFmt = '#,##0.00';
  });

  const lastRow = Math.max(3, items.length + 2);
  const sumRow = lastRow + 1;
  ws.getCell(`A${sumRow}`).value = 'รวมทั้งหมด';
  ws.getCell(`A${sumRow}`).font = { bold: true };
  ws.getCell(`J${sumRow}`).value = { formula: `SUM(J3:J${lastRow})` };
  ws.getCell(`L${sumRow}`).value = { formula: `SUM(L3:L${lastRow})` };
  ws.getCell(`L${sumRow}`).numFmt = '#,##0.00';
  ws.getCell(`L${sumRow}`).font = { bold: true };

  ws.columns.forEach((col, i) => {
    col.width = i === 2 ? 32 : i === 5 || i === 6 ? 22 : 16;
  });

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function generateErpModuleExcelBuffer(
  companyName: string,
  moduleTitle: string,
  rows: Array<{
    docNumber: string;
    title: string;
    partyName: string;
    categoryOrDept: string;
    status: string;
    qty: number;
    amount: number;
    dateStr: string;
  }>
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'กดแล้วจบ (Kodraewjob Digital Marketplace)';

  const ws = wb.addWorksheet('ERP Export');
  ws.mergeCells('A1:H1');
  ws.getCell('A1').value = `${companyName} — ${moduleTitle}`;
  ws.getCell('A1').font = { name: 'Sarabun', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E1B18' } };
  ws.getRow(1).height = 28;

  ws.getRow(2).values = [
    'เลขที่เอกสาร',
    'รายการ',
    'คู่ค้า / พนักงาน',
    'หมวด / แผนก',
    'สถานะ',
    'จำนวน',
    'มูลค่า (บาท)',
    'วันที่',
  ];
  ws.getRow(2).eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEDD5' } };
  });

  rows.forEach((row, idx) => {
    const r = idx + 3;
    ws.getRow(r).values = [
      row.docNumber,
      row.title,
      row.partyName,
      row.categoryOrDept,
      row.status,
      row.qty,
      row.amount,
      row.dateStr,
    ];
    ws.getCell(`G${r}`).numFmt = '#,##0.00';
  });

  const lastRow = Math.max(3, rows.length + 2);
  const totalRow = lastRow + 1;
  ws.getCell(`A${totalRow}`).value = 'รวมยอดสุทธิ';
  ws.getCell(`A${totalRow}`).font = { bold: true };
  ws.getCell(`F${totalRow}`).value = { formula: `SUM(F3:F${lastRow})` };
  ws.getCell(`G${totalRow}`).value = { formula: `SUM(G3:G${lastRow})` };
  ws.getCell(`G${totalRow}`).numFmt = '#,##0.00';
  ws.getCell(`G${totalRow}`).font = { bold: true };

  ws.columns.forEach((col, i) => {
    col.width = i === 1 ? 36 : i === 2 ? 26 : 16;
  });

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function generateVbaMacroPackWorkbook(type: 'tax-invoice' | 'payroll-payslip'): Promise<{
  xlsxBuffer: Buffer;
  basCode: string;
}> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'กดแล้วจบ VBA Automation';

  const isTax = type === 'tax-invoice';
  const wsData = wb.addWorksheet(isTax ? 'TaxInvoice_Form' : 'Payroll_Payslip');
  const wsCode = wb.addWorksheet('VBA_Macro_Code');

  wsData.mergeCells('A1:F1');
  wsData.getCell('A1').value = isTax
    ? 'เทมเพลตระบบออกใบกำกับภาษี + ภ.พ.30 อัตโนมัติ (VBA Automation Standard)'
    : 'เทมเพลตระบบเงินเดือน + สลิป PDF อัตโนมัติ (VBA Automation Standard)';
  wsData.getCell('A1').font = { name: 'Sarabun', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  wsData.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF166534' } };
  wsData.getRow(1).height = 30;

  if (isTax) {
    wsData.getRow(3).values = ['รหัสสินค้า', 'รายการสินค้า/บริการ', 'จำนวน', 'ราคาต่อหน่วย', 'ยอดรวม', 'VAT 7%'];
    wsData.getRow(4).values = ['SRV-01', 'พัฒนาระบบ Excel VBA Automation', 1, 15000, { formula: 'C4*D4' }, { formula: 'E4*0.07' }];
    wsData.getRow(5).values = ['SRV-02', 'วางระบบเชื่อมต่อ Cloud ERP', 1, 9500, { formula: 'C5*D5' }, { formula: 'E5*0.07' }];
    wsData.getRow(7).values = ['', '', '', 'รวมสุทธิพร้อม VAT 7%', { formula: 'SUM(E4:E5)+SUM(F4:F5)' }, ''];
  } else {
    wsData.getRow(3).values = ['รหัสพนักงาน', 'ชื่อ-นามสกุล', 'ฐานเงินเดือน', 'ค่าล่วงเวลา OT', 'ประกันสังคม 5%', 'เงินสุทธิโอนเข้าบัญชี'];
    wsData.getRow(4).values = ['EMP-001', 'กิตติธนา วัฒนชัย', 32000, 2250, { formula: 'MIN(C4*0.05,750)' }, { formula: 'C4+D4-E4' }];
    wsData.getRow(5).values = ['EMP-002', 'ณัฐวดี สุขใจ', 26000, 1500, { formula: 'MIN(C5*0.05,750)' }, { formula: 'C5+D5-E5' }];
    wsData.getRow(7).values = ['', 'รวมงวดจ่ายทั้งเดือน', { formula: 'SUM(C4:C5)' }, { formula: 'SUM(D4:D5)' }, { formula: 'SUM(E4:E5)' }, { formula: 'SUM(F4:F5)' }];
  }

  const basCode = isTax
    ? `Attribute VB_Name = "Mod_TaxInvoice_PDF"
' ================================================================
' กดแล้วจบ (Kodraewjob) Standard Excel VBA Automation
' Module: Auto Export Thai Tax Invoice PDF + Running Number
' ================================================================
Option Explicit

Public Sub Generate_ThaiTaxInvoice_PDF()
    Dim ws As Worksheet
    Dim invNo As String
    Dim savePath As String
    
    Set ws = ThisWorkbook.Sheets("TaxInvoice_Form")
    invNo = "INV-" & Format(Date, "yyyymm") & "-" & Format(ws.Range("B2").Value, "0000")
    savePath = ThisWorkbook.Path & "\\" & invNo & ".pdf"
    
    ws.PageSetup.PaperSize = xlPaperA4
    ws.PageSetup.Orientation = xlPortrait
    ws.ExportAsFixedFormat Type:=xlTypePDF, Filename:=savePath, Quality:=xlQualityStandard
    
    ws.Range("B2").Value = Val(ws.Range("B2").Value) + 1
    MsgBox "สร้างใบกำกับภาษี PDF สำเร็จ: " & savePath, vbInformation, "กดแล้วจบ VBA"
End Sub`
    : `Attribute VB_Name = "Mod_Payroll_BatchPDF"
' ================================================================
' กดแล้วจบ (Kodraewjob) Standard Excel VBA Automation
' Module: Batch Generate Employee Payslip PDF
' ================================================================
Option Explicit

Public Sub Batch_Export_Payslips()
    Dim wsList As Worksheet
    Dim lastRow As Long, i As Long
    Dim empCode As String, pdfFile As String
    
    Set wsList = ThisWorkbook.Sheets("Payroll_Payslip")
    lastRow = wsList.Cells(wsList.Rows.Count, "A").End(xlUp).Row
    
    For i = 4 To lastRow - 1
        empCode = Trim(wsList.Cells(i, 1).Value)
        If empCode <> "" Then
            pdfFile = ThisWorkbook.Path & "\\Payslip_" & empCode & "_" & Format(Date, "yyyymm") & ".pdf"
            wsList.Rows(i).ExportAsFixedFormat Type:=xlTypePDF, Filename:=pdfFile
        End If
    Next i
    MsgBox "ส่งออกสลิปเงินเดือน PDF ครบทุกคนเรียบร้อยแล้ว", vbInformation, "กดแล้วจบ VBA"
End Sub`;

  wsCode.getCell('A1').value = 'Standard VBA Module Source Code (คัดลอกวางใน Alt+F11 -> Insert Module)';
  wsCode.getCell('A1').font = { bold: true, size: 12 };
  basCode.split('\n').forEach((line, idx) => {
    wsCode.getCell(`A${idx + 3}`).value = line;
    wsCode.getCell(`A${idx + 3}`).font = { name: 'Consolas', size: 10 };
  });
  wsData.columns.forEach((col, i) => (col.width = i === 1 ? 34 : 18));
  wsCode.getColumn(1).width = 90;

  const buffer = await wb.xlsx.writeBuffer();
  return { xlsxBuffer: Buffer.from(buffer), basCode };
}
