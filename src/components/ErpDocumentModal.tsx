import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Printer, Receipt, FileText, QrCode, X } from 'lucide-react';

export interface ErpCompanyInfo {
  id: number;
  ownerUid: string;
  companyName: string;
  companyNameEn?: string | null;
  taxId: string;
  branchName: string;
  address: string;
  phone: string;
  email: string;
  website?: string | null;
  logoUrl?: string | null;
  vatRate: number;
  whtRate: number;
  currency: string;
  prefixConfigJson: string;
  bankInfoJson?: string | null;
}

export interface ErpRecordDoc {
  id: number;
  moduleKey: string;
  docNumber: string;
  title: string;
  partyName: string;
  categoryOrDept: string;
  status: string;
  amount: number;
  qty: number;
  dateStr: string;
  dueDateStr?: string | null;
  payloadJson: string;
  createdBy: string;
}

interface ErpDocumentModalProps {
  company: ErpCompanyInfo;
  record: ErpRecordDoc;
  initialFormat?: 'a4' | 'thermal80' | 'payslip' | 'qr_tag';
  onClose: () => void;
}

export function BarcodeSvg({ code }: { code: string }) {
  const safe = (code || '8859001000011').slice(0, 24);
  const bars: number[] = [];
  for (let i = 0; i < safe.length; i++) {
    const ch = safe.charCodeAt(i);
    bars.push((ch % 3) + 1, ((ch >> 2) % 2) + 1);
  }
  let x = 4;
  return (
    <svg viewBox="0 0 180 34" className="h-8 w-36 bg-white px-1 rounded border border-stone-200">
      {bars.map((w, idx) => {
        const rectX = x;
        x += w + 1.5;
        return idx % 2 === 0 ? (
          <rect key={idx} x={rectX} y={3} width={w} height={24} fill="#111827" />
        ) : null;
      })}
      <text x="90" y="32" textAnchor="middle" fontSize="6" fill="#374151" fontFamily="monospace">
        {safe}
      </text>
    </svg>
  );
}

export function ErpDocumentModal({
  company,
  record,
  initialFormat,
  onClose,
}: ErpDocumentModalProps) {
  const defaultFmt: 'a4' | 'thermal80' | 'payslip' | 'qr_tag' =
    initialFormat ||
    (record.moduleKey === 'hr_payroll'
      ? 'payslip'
      : record.moduleKey === 'pos'
        ? 'thermal80'
        : record.moduleKey === 'assets' || record.moduleKey === 'manufacturing'
          ? 'qr_tag'
          : 'a4');

  const [format, setFormat] = useState<'a4' | 'thermal80' | 'payslip' | 'qr_tag'>(defaultFmt);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  let payload: Record<string, any> = {};
  try {
    payload = JSON.parse(record.payloadJson || '{}');
  } catch {
    payload = {};
  }

  let bankInfo: Record<string, any> = {};
  try {
    bankInfo = JSON.parse(company.bankInfoJson || '{}');
  } catch {
    bankInfo = {};
  }

  useEffect(() => {
    const qrPayload = JSON.stringify({
      company: company.companyName,
      taxId: company.taxId,
      docNo: record.docNumber,
      module: record.moduleKey,
      amount: record.amount,
      date: record.dateStr,
    });
    QRCode.toDataURL(qrPayload, { width: 220, margin: 1 })
      .then((url) => setQrDataUrl(url))
      .catch(() => {});
  }, [company.companyName, company.taxId, record]);

  const docTypeHeading = () => {
    if (record.moduleKey === 'hr_payroll') return 'ใบแจ้งเงินเดือน / PAYSLIP (ต้นฉบับ)';
    if (record.moduleKey === 'purchasing') return 'ใบสั่งซื้อสินค้า / PURCHASE ORDER';
    if (record.moduleKey === 'pos') return 'ใบเสร็จรับเงิน / ใบกำกับภาษีอย่างย่อ';
    if (record.moduleKey === 'rental') return 'ใบแจ้งหนี้ค่าเช่า / RENTAL INVOICE';
    if (record.moduleKey === 'assets') return 'ป้ายรหัสทรัพย์สิน / ASSET TRACEABILITY TAG';
    if (record.moduleKey === 'manufacturing') return 'ใบกำกับล็อตผลิต & QR TRACEABILITY';
    if (payload.docType === 'Quotation') return 'ใบเสนอราคา / QUOTATION';
    if (payload.docType === 'Receipt') return 'ใบเสร็จรับเงิน / RECEIPT';
    if (payload.docType === 'Sales Order') return 'ใบสั่งขาย / SALES ORDER';
    return 'ใบกำกับภาษี / ใบแจ้งหนี้ (TAX INVOICE)';
  };

  const subtotal =
    typeof payload.subtotal === 'number'
      ? payload.subtotal
      : Number((record.amount / (1 + company.vatRate / 100)).toFixed(2));
  const vatAmount =
    typeof payload.vat === 'number'
      ? payload.vat
      : Number((record.amount - subtotal).toFixed(2));
  const discountAmount = Number(payload.discount || 0);
  const items: Array<{ name: string; sku?: string; qty: number; price?: number; unitPrice?: number }> =
    Array.isArray(payload.items) && payload.items.length > 0
      ? payload.items
      : [{ name: record.title, qty: record.qty || 1, unitPrice: subtotal }];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-[#1F1815] rounded-2xl border border-orange-200 dark:border-orange-900/50 shadow-2xl overflow-hidden my-auto">
        {/* Top Modal Controls (hidden on print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#FFF7ED] dark:bg-[#261D19] border-b border-orange-200/80 dark:border-orange-900/40">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFormat('a4')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap ${
                format === 'a4'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white dark:bg-[#1F1815] text-stone-700 dark:text-stone-300 border border-orange-200 dark:border-orange-900/40'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              ฟอร์ม A4 มาตรฐาน
            </button>
            <button
              type="button"
              onClick={() => setFormat('thermal80')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap ${
                format === 'thermal80'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white dark:bg-[#1F1815] text-stone-700 dark:text-stone-300 border border-orange-200 dark:border-orange-900/40'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              สลิป Thermal 80mm
            </button>
            <button
              type="button"
              onClick={() => setFormat('payslip')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap ${
                format === 'payslip'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white dark:bg-[#1F1815] text-stone-700 dark:text-stone-300 border border-orange-200 dark:border-orange-900/40'
              }`}
            >
              สลิปเงินเดือน (Payslip)
            </button>
            <button
              type="button"
              onClick={() => setFormat('qr_tag')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap ${
                format === 'qr_tag'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white dark:bg-[#1F1815] text-stone-700 dark:text-stone-300 border border-orange-200 dark:border-orange-900/40'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              QR Tag / ตรวจสอบย้อนกลับ
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-1.5 rounded-lg bg-[#1E1B18] hover:bg-orange-600 text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              พิมพ์ / บันทึก PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="ปิดตัวอย่างเอกสาร"
              className="p-1.5 rounded-lg text-stone-500 hover:bg-orange-100 dark:hover:bg-stone-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-4 sm:p-8 max-h-[82vh] overflow-y-auto bg-stone-100 dark:bg-stone-950/60">
          {/* FORMAT 1: THERMAL 80MM POS RECEIPT */}
          {format === 'thermal80' && (
            <div className="erp-print-area max-w-[340px] mx-auto bg-white text-stone-900 p-5 rounded-lg shadow-md border border-stone-200 font-mono text-xs space-y-3">
              <div className="text-center border-b border-dashed border-stone-300 pb-3">
                {company.logoUrl && (
                  <img
                    src={company.logoUrl}
                    alt={company.companyName}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 mx-auto object-contain rounded-lg mb-2"
                  />
                )}
                <p className="font-bold text-sm">{company.companyName}</p>
                <p className="text-[11px] text-stone-600">{company.address}</p>
                <p className="text-[11px] text-stone-600">
                  โทร: {company.phone} | TAX ID: {company.taxId}
                </p>
              </div>

              <div className="space-y-1 text-[11px] border-b border-dashed border-stone-300 pb-2">
                <div className="flex justify-between">
                  <span>เลขที่ใบเสร็จ:</span>
                  <span className="font-bold">{record.docNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>วันที่:</span>
                  <span>{record.dateStr}</span>
                </div>
                <div className="flex justify-between">
                  <span>ลูกค้า:</span>
                  <span className="truncate max-w-[170px]">{record.partyName}</span>
                </div>
                <div className="flex justify-between">
                  <span>ชำระโดย:</span>
                  <span>{payload.paymentMethod || record.categoryOrDept}</span>
                </div>
              </div>

              <div className="space-y-1.5 border-b border-dashed border-stone-300 pb-2">
                {items.map((it, idx) => {
                  const unitP = Number(it.price ?? it.unitPrice ?? 0);
                  return (
                    <div key={idx} className="flex justify-between gap-2">
                      <span className="flex-1">
                        {it.name} x{it.qty}
                      </span>
                      <span className="tabular-nums font-semibold">
                        ฿{(unitP * it.qty).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>ยอดรวมก่อนภาษี:</span>
                  <span className="tabular-nums">
                    ฿{subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>ส่วนลด:</span>
                    <span className="tabular-nums">-฿{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>VAT {company.vatRate}%:</span>
                  <span className="tabular-nums">
                    ฿{vatAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-stone-300">
                  <span>ยอดสุทธิ:</span>
                  <span className="tabular-nums">
                    ฿{record.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {qrDataUrl && (
                <div className="pt-2 text-center border-t border-dashed border-stone-300">
                  <img src={qrDataUrl} alt="Receipt QR" className="w-24 h-24 mx-auto" />
                  <p className="text-[10px] text-stone-500 mt-1">
                    ขอบคุณที่ใช้บริการ · {company.companyName}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* FORMAT 2: PAYSLIP A4 */}
          {format === 'payslip' && (
            <div className="erp-print-area bg-white text-stone-900 p-7 rounded-xl shadow-md border border-stone-200 space-y-5 max-w-3xl mx-auto">
              <div className="flex items-start justify-between gap-4 border-b-2 border-orange-500 pb-4">
                <div className="flex items-center gap-4">
                  {company.logoUrl && (
                    <img
                      src={company.logoUrl}
                      alt={company.companyName}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-contain rounded-xl border border-stone-200 p-1"
                    />
                  )}
                  <div>
                    <h2 className="font-display font-bold text-lg text-stone-900">
                      {company.companyName}
                    </h2>
                    {company.companyNameEn && (
                      <p className="text-xs text-stone-500">{company.companyNameEn}</p>
                    )}
                    <p className="text-xs text-stone-600 mt-0.5">{company.address}</p>
                    <p className="text-xs text-stone-600">
                      เลขประจำตัวผู้เสียภาษี: {company.taxId} ({company.branchName}) · โทร {company.phone}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display font-bold text-base text-orange-600">
                    ใบแจ้งเงินเดือน (PAYSLIP)
                  </p>
                  <p className="text-xs font-mono text-stone-600 mt-0.5">เลขที่: {record.docNumber}</p>
                  <p className="text-xs text-stone-600">วันที่จ่าย: {record.dateStr}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-orange-50/70 p-3.5 rounded-xl border border-orange-200 text-xs">
                <div>
                  <span className="text-stone-500 block">พนักงาน</span>
                  <span className="font-bold">{record.partyName}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">แผนก</span>
                  <span className="font-bold">{record.categoryOrDept}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">ตำแหน่ง</span>
                  <span className="font-bold">{payload.position || 'พนักงานประจำ'}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">บัญชีรับเงิน</span>
                  <span className="font-bold">{payload.bankAccount || bankInfo.bankName || '-'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <div className="bg-emerald-50 px-4 py-2 font-bold text-emerald-900 border-b border-stone-200">
                    รายการรายได้ (Earnings)
                  </div>
                  <div className="p-4 space-y-2 tabular-nums">
                    <div className="flex justify-between">
                      <span>เงินเดือนประจำ</span>
                      <span>฿{Number(payload.baseSalary || record.amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>เบี้ยขยัน / ค่าตำแหน่ง</span>
                      <span>฿{Number(payload.allowance || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ค่าล่วงเวลา (OT)</span>
                      <span>฿{Number(payload.otPay || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>โบนัส / อื่นๆ</span>
                      <span>฿{Number(payload.bonus || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <div className="bg-rose-50 px-4 py-2 font-bold text-rose-900 border-b border-stone-200">
                    รายการหัก (Deductions)
                  </div>
                  <div className="p-4 space-y-2 tabular-nums">
                    <div className="flex justify-between">
                      <span>ประกันสังคม (5%)</span>
                      <span>฿{Number(payload.sso || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ภาษีหัก ณ ที่จ่าย (ภ.ง.ด.1)</span>
                      <span>฿{Number(payload.tax || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>กองทุนสำรองเลี้ยงชีพ (PVD)</span>
                      <span>฿{Number(payload.pvd || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-900 text-white rounded-xl p-4">
                <div>
                  <p className="text-xs text-stone-300">เงินได้สุทธิโอนเข้าบัญชี (Net Pay)</p>
                  <p className="text-xs text-orange-300 mt-0.5">สถานะรายการ: {record.status.toUpperCase()}</p>
                </div>
                <p className="font-display font-bold text-2xl tabular-nums text-orange-400">
                  ฿{Number(payload.netPay ?? record.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}

          {/* FORMAT 3: QR TRACEABILITY / ASSET TAG */}
          {format === 'qr_tag' && (
            <div className="erp-print-area max-w-md mx-auto bg-white text-stone-900 p-6 rounded-xl shadow-md border-2 border-stone-800 space-y-4">
              <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
                {company.logoUrl && (
                  <img
                    src={company.logoUrl}
                    alt={company.companyName}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 object-contain rounded-lg"
                  />
                )}
                <div>
                  <p className="font-bold text-sm">{company.companyName}</p>
                  <p className="text-xs text-orange-600 font-semibold">{docTypeHeading()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="Traceability QR"
                    className="w-32 h-32 border border-stone-200 rounded-lg p-1 shrink-0"
                  />
                )}
                <div className="space-y-1.5 text-xs">
                  <p className="font-mono font-bold text-base text-stone-900">{record.docNumber}</p>
                  <p className="font-semibold text-stone-800">{record.title}</p>
                  <p className="text-stone-600">ผู้รับผิดชอบ / ลูกค้า: {record.partyName}</p>
                  <p className="text-stone-600">แผนก / เครื่องจักร: {record.categoryOrDept}</p>
                  <p className="text-stone-600">วันที่: {record.dateStr}</p>
                  <BarcodeSvg code={record.docNumber} />
                </div>
              </div>
            </div>
          )}

          {/* FORMAT 4: STANDARD A4 TAX INVOICE / QUOTATION / PO / RECEIPT */}
          {format === 'a4' && (
            <div className="erp-print-area bg-white text-stone-900 p-7 sm:p-9 rounded-xl shadow-md border border-stone-200 space-y-6 max-w-4xl mx-auto">
              {/* Dynamic Company Header + Uploaded Logo */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-orange-500 pb-5">
                <div className="flex items-start gap-4">
                  {company.logoUrl && (
                    <img
                      src={company.logoUrl}
                      alt={company.companyName}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 object-contain rounded-xl border border-stone-200 p-1.5 shrink-0 bg-white"
                    />
                  )}
                  <div className="space-y-0.5">
                    <h2 className="font-display font-bold text-xl text-stone-900">
                      {company.companyName}
                    </h2>
                    {company.companyNameEn && (
                      <p className="text-xs font-medium text-stone-500">{company.companyNameEn}</p>
                    )}
                    <p className="text-xs text-stone-600 max-w-md">{company.address}</p>
                    <p className="text-xs text-stone-600">
                      เลขประจำตัวผู้เสียภาษี: <strong className="font-mono">{company.taxId}</strong> ({company.branchName})
                    </p>
                    <p className="text-xs text-stone-600">
                      โทร: {company.phone} · อีเมล: {company.email}
                    </p>
                  </div>
                </div>

                <div className="sm:text-right shrink-0 space-y-1">
                  <p className="font-display font-bold text-lg text-orange-600">
                    {docTypeHeading()}
                  </p>
                  <p className="text-xs text-stone-600">
                    เลขที่เอกสาร: <strong className="font-mono text-stone-900">{record.docNumber}</strong>
                  </p>
                  <p className="text-xs text-stone-600">วันที่ออกเอกสาร: {record.dateStr}</p>
                  {record.dueDateStr && (
                    <p className="text-xs text-stone-600">ครบกำหนด: {record.dueDateStr}</p>
                  )}
                </div>
              </div>

              {/* Customer / Counterparty Box */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-stone-50 rounded-xl p-4 border border-stone-200 text-xs">
                <div className="sm:col-span-8 space-y-1">
                  <p className="text-stone-500 font-semibold">ลูกค้า / คู่ค้า (Customer / Vendor)</p>
                  <p className="font-bold text-sm text-stone-900">{record.partyName}</p>
                  {payload.customerAddress && (
                    <p className="text-stone-600">{payload.customerAddress}</p>
                  )}
                  {payload.customerTaxId && (
                    <p className="text-stone-600 font-mono">
                      Tax ID: {payload.customerTaxId}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-4 flex sm:justify-end items-center">
                  {qrDataUrl && (
                    <div className="text-center">
                      <img src={qrDataUrl} alt="Document QR" className="w-20 h-20 mx-auto" />
                      <span className="text-[10px] text-stone-500 font-mono">{record.docNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-[#1E1B18] text-white">
                    <th className="py-2.5 px-3 text-left rounded-tl-lg">#</th>
                    <th className="py-2.5 px-3 text-left">รายการสินค้า / บริการ</th>
                    <th className="py-2.5 px-3 text-right">จำนวน</th>
                    <th className="py-2.5 px-3 text-right">ราคาต่อหน่วย</th>
                    <th className="py-2.5 px-3 text-right rounded-tr-lg">จำนวนเงิน (฿)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
                    const total = unitPrice * (item.qty || 1);
                    return (
                      <tr key={idx} className="border-b border-stone-200">
                        <td className="py-3 px-3 tabular-nums text-stone-500">{idx + 1}</td>
                        <td className="py-3 px-3 font-medium text-stone-900">{item.name}</td>
                        <td className="py-3 px-3 text-right tabular-nums">{item.qty}</td>
                        <td className="py-3 px-3 text-right tabular-nums">
                          {unitPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums font-semibold">
                          {total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Totals + Bank Info */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                <div className="sm:col-span-7 bg-orange-50/60 border border-orange-200 rounded-xl p-4 text-xs space-y-1">
                  <p className="font-bold text-stone-900">ข้อมูลการโอนชำระเงิน</p>
                  <p>ธนาคาร: {bankInfo.bankName || 'ธนาคารกสิกรไทย (KBANK)'}</p>
                  <p>เลขที่บัญชี: {bankInfo.accountNo || '081-9-99888-8'}</p>
                  <p>ชื่อบัญชี: {bankInfo.accountName || company.companyName}</p>
                </div>

                <div className="sm:col-span-5 space-y-2 text-xs sm:text-sm tabular-nums">
                  <div className="flex justify-between">
                    <span className="text-stone-600">รวมเป็นเงิน (Subtotal)</span>
                    <span>฿{subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>ส่วนลด</span>
                      <span>-฿{discountAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-stone-600">ภาษีมูลค่าเพิ่ม ({company.vatRate}%)</span>
                    <span>฿{vatAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t-2 border-stone-900 text-orange-600">
                    <span>ยอดเงินสุทธิ (Grand Total)</span>
                    <span>฿{record.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs text-stone-600">
                <div>
                  <div className="border-b border-stone-400 w-48 mx-auto mb-2 h-8" />
                  <p>ผู้รับสินค้า / ผู้สั่งซื้อ</p>
                  <p>วันที่ ____/____/______</p>
                </div>
                <div>
                  <div className="border-b border-stone-400 w-48 mx-auto mb-2 h-8" />
                  <p>ผู้มีอำนาจลงนาม ({company.companyName})</p>
                  <p>ผู้ออกเอกสาร: {record.createdBy}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
