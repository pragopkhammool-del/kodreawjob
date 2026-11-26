import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Building2,
  Check,
  Copy,
  Download,
  MessageCircle,
  Minus,
  Plus,
  Printer,
  Share2,
  ShoppingCart,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

type DemoAppId =
  | 'stock'
  | 'pos'
  | 'invoice'
  | 'dorm'
  | 'online_seller'
  | 'tax2569'
  | 'payroll'
  | 'foodcost'
  | 'ar_ap'
  | 'retire';

interface DemoAppMeta {
  id: DemoAppId;
  emoji: string;
  title: string;
  desc: string;
}

const DEMO_APPS: DemoAppMeta[] = [
  {
    id: 'stock',
    emoji: '📦',
    title: 'ระบบสต๊อกสินค้า',
    desc: 'รับเข้า จ่ายออก คงเหลือ ของใกล้หมด ยอดขาย กำไร ใช้บนมือถือได้',
  },
  {
    id: 'pos',
    emoji: '🖥️',
    title: 'ระบบขายหน้าร้าน POS',
    desc: 'กดสินค้าลงบิล คิดเงินทอน แยกเงินสด/โอน/QR ตัดสต๊อกเอง ปิดยอดและนับเงินลิ้นชัก',
  },
  {
    id: 'invoice',
    emoji: '🧾',
    title: 'ใบเสนอราคา / ใบแจ้งหนี้ / ใบเสร็จ',
    desc: 'VAT 7% หัก ณ ที่จ่าย ตัวอักษรไทย เลขที่รันเอง ยกเลิกใบกำกับได้ รายงานภาษีขาย ภ.พ.30 พิมพ์ PDF ได้ทันที',
  },
  {
    id: 'dorm',
    emoji: '🏢',
    title: 'ระบบหอพัก / ห้องเช่า',
    desc: 'จดมิเตอร์น้ำไฟ คิดค่าเช่ารายห้อง ติดตามค้างชำระ พิมพ์ใบแจ้งหนี้ทุกห้อง',
  },
  {
    id: 'online_seller',
    emoji: '🛒',
    title: 'ออเดอร์แม่ค้าออนไลน์ + กำไร',
    desc: 'หักค่าธรรมเนียม Shopee / Lazada / TikTok ต้นทุน ค่าส่ง เห็นกำไรจริงทุกออเดอร์',
  },
  {
    id: 'tax2569',
    emoji: '🧮',
    title: 'คำนวณภาษีเงินได้ 2569',
    desc: 'ใส่ค่าลดหย่อน ระบบตัดตามเพดาน เห็นภาษีทีละขั้น รู้ว่าจ่ายเพิ่มหรือได้คืน',
  },
  {
    id: 'payroll',
    emoji: '👥',
    title: 'เงินเดือน + ประกันสังคม + สลิป',
    desc: 'คิด OT ประกันสังคม 2569 ภาษีหัก ณ ที่จ่าย ยอดนำส่ง พิมพ์สลิปทุกคน',
  },
  {
    id: 'foodcost',
    emoji: '🍜',
    title: 'ต้นทุนเมนู + ตั้งราคาขาย',
    desc: 'ต้นทุนต่อจาน food cost % กำไรต่อจาน ราคาแนะนำ วัตถุดิบขึ้นราคารู้ทันที',
  },
  {
    id: 'ar_ap',
    emoji: '📒',
    title: 'ลูกหนี้ / เจ้าหนี้ ติดตามยอดค้าง',
    desc: 'ใครค้างเท่าไร เกินกำหนดกี่วัน อายุหนี้ รับเงินบางส่วน และคัดลอกข้อความทวงถามส่งใน LINE',
  },
  {
    id: 'retire',
    emoji: '🏖️',
    title: 'วางแผนเกษียณ + ดอกเบี้ยทบต้น',
    desc: 'เงินที่ต้องมีตอนเกษียณ ออมเพิ่มเดือนละเท่าไร เงินพอใช้ถึงอายุเท่าไร',
  },
];

function bahtText(amount: number): string {
  if (!Number.isFinite(amount)) return 'ศูนย์บาทถ้วน';
  const digits = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
  const readInt = (numStr: string): string => {
    let out = '';
    const len = numStr.length;
    for (let i = 0; i < len; i++) {
      const d = Number(numStr[i]);
      const pos = len - i - 1;
      if (d === 0) continue;
      if (pos === 1 && d === 1) out += 'สิบ';
      else if (pos === 1 && d === 2) out += 'ยี่สิบ';
      else if (pos === 0 && d === 1 && len > 1 && numStr[len - 2] !== '0') out += 'เอ็ด';
      else out += digits[d] + units[pos];
    }
    return out || 'ศูนย์';
  };
  const fixed = Math.abs(amount).toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  const prefix = amount < 0 ? 'ลบ' : '';
  let intText = '';
  if (intPart.length > 6) {
    const high = intPart.slice(0, intPart.length - 6);
    const low = intPart.slice(intPart.length - 6);
    intText = `${readInt(high)}ล้าน${Number(low) > 0 ? readInt(low) : ''}`;
  } else {
    intText = readInt(intPart);
  }
  const satang = Number(decPart);
  if (satang === 0) return `${prefix}${intText}บาทถ้วน`;
  return `${prefix}${intText}บาท${readInt(decPart)}สตางค์`;
}

export function WebAppsDemoPage() {
  const { route, navigate, showToast, trackLinkClick } = useApp();
  const [activeApp, setActiveApp] = useState<DemoAppId>('stock');

  useEffect(() => {
    const query = route.split('?')[1] || '';
    const params = new URLSearchParams(query);
    const appParam = params.get('app') as DemoAppId | null;
    if (appParam && DEMO_APPS.some((a) => a.id === appParam)) {
      setActiveApp(appParam);
    }
  }, [route]);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return 'https://kodraewjob.com/webapps-demo';
    return `${window.location.origin}/webapps-demo`;
  }, []);

  const lineOrderHref = 'https://line.me/R/ti/p/@556fsrdw';

  const openDemoWorkspace = (id: DemoAppId) => {
    setActiveApp(id);
    const el = document.getElementById('live-webapp-workspace');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* ==================== 1. STOCK STATE ==================== */
  const [stockItems, setStockItems] = useState([
    { id: 1, sku: 'SKU-001', name: 'แก้วเก็บความเย็น 30oz', cost: 145, price: 290, qty: 24, min: 10, sold: 42 },
    { id: 2, sku: 'SKU-002', name: 'หลอดสแตนเลสชุดพกพา', cost: 25, price: 69, qty: 6, min: 12, sold: 65 },
    { id: 3, sku: 'SKU-003', name: 'กระเป๋าผ้าแคนวาสหนา', cost: 75, price: 189, qty: 18, min: 8, sold: 31 },
    { id: 4, sku: 'SKU-004', name: 'กล่องข้าวแบ่งช่องพรีเมียม', cost: 110, price: 249, qty: 4, min: 10, sold: 19 },
  ]);
  const [newSkuName, setNewSkuName] = useState('');
  const [newSkuCost, setNewSkuCost] = useState(80);
  const [newSkuPrice, setNewSkuPrice] = useState(199);
  const [newSkuQty, setNewSkuQty] = useState(15);

  const adjustStock = (id: number, delta: number) => {
    setStockItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextQty = Math.max(0, item.qty + delta);
        const soldDelta = delta < 0 && item.qty > 0 ? Math.abs(delta) : 0;
        return { ...item, qty: nextQty, sold: item.sold + soldDelta };
      })
    );
  };

  const addStockSku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkuName.trim()) return;
    setStockItems((prev) => [
      {
        id: Date.now(),
        sku: `SKU-${String(prev.length + 1).padStart(3, '0')}`,
        name: newSkuName.trim(),
        cost: Math.max(0, newSkuCost),
        price: Math.max(0, newSkuPrice),
        qty: Math.max(0, newSkuQty),
        min: 8,
        sold: 0,
      },
      ...prev,
    ]);
    setNewSkuName('');
    showToast({ type: 'success', title: 'เพิ่มสินค้าลงสต๊อกตัวอย่างแล้ว' });
  };

  const stockStats = useMemo(() => {
    const lowCount = stockItems.filter((i) => i.qty <= i.min).length;
    const stockValue = stockItems.reduce((s, i) => s + i.qty * i.cost, 0);
    const totalSales = stockItems.reduce((s, i) => s + i.sold * i.price, 0);
    const totalProfit = stockItems.reduce((s, i) => s + i.sold * (i.price - i.cost), 0);
    return { lowCount, stockValue, totalSales, totalProfit };
  }, [stockItems]);

  /* ==================== 2. POS STATE ==================== */
  const [posMenu, setPosMenu] = useState([
    { id: 1, name: 'อเมริกาโน่เย็น', price: 65, stock: 50 },
    { id: 2, name: 'ชาไทยเย็นพรีเมียม', price: 60, stock: 38 },
    { id: 3, name: 'มัทฉะลาเต้', price: 85, stock: 24 },
    { id: 4, name: 'ครัวซองต์เนยสด', price: 75, stock: 16 },
    { id: 5, name: 'เค้กส้มหน้านิ่ม', price: 95, stock: 12 },
    { id: 6, name: 'น้ำแร่ธรรมชาติ', price: 20, stock: 80 },
  ]);
  const [posCart, setPosCart] = useState<Array<{ id: number; name: string; price: number; qty: number }>>([
    { id: 1, name: 'อเมริกาโน่เย็น', price: 65, qty: 2 },
    { id: 4, name: 'ครัวซองต์เนยสด', price: 75, qty: 1 },
  ]);
  const [posPayMethod, setPosPayMethod] = useState<'cash' | 'transfer' | 'qr'>('cash');
  const [posCashReceived, setPosCashReceived] = useState(500);
  const [drawerOpeningCash] = useState(2000);
  const [drawerCountedCash, setDrawerCountedCash] = useState(3250);
  const [posSalesHistory, setPosSalesHistory] = useState([
    { billNo: 'POS-001', method: 'cash' as const, total: 1250 },
    { billNo: 'POS-002', method: 'qr' as const, total: 840 },
    { billNo: 'POS-003', method: 'transfer' as const, total: 620 },
  ]);

  const posBillTotal = posCart.reduce((s, i) => s + i.price * i.qty, 0);
  const posChange = posPayMethod === 'cash' ? Math.max(0, posCashReceived - posBillTotal) : 0;

  const addToPosCart = (item: { id: number; name: string; price: number; stock: number }) => {
    if (item.stock <= 0) {
      showToast({ type: 'error', title: 'สินค้าหมดสต๊อก' });
      return;
    }
    setPosCart((prev) => {
      const exists = prev.find((p) => p.id === item.id);
      if (exists) {
        return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  };

  const checkoutPos = () => {
    if (posCart.length === 0) return;
    if (posPayMethod === 'cash' && posCashReceived < posBillTotal) {
      showToast({ type: 'error', title: 'จำนวนเงินรับมายังไม่พอชำระ' });
      return;
    }
    setPosMenu((prev) =>
      prev.map((m) => {
        const inCart = posCart.find((c) => c.id === m.id);
        return inCart ? { ...m, stock: Math.max(0, m.stock - inCart.qty) } : m;
      })
    );
    const nextNo = `POS-${String(posSalesHistory.length + 1).padStart(3, '0')}`;
    setPosSalesHistory((prev) => [{ billNo: nextNo, method: posPayMethod, total: posBillTotal }, ...prev]);
    if (posPayMethod === 'cash') {
      setDrawerCountedCash((prev) => prev + posBillTotal);
    }
    setPosCart([]);
    showToast({ type: 'success', title: `ปิดบิล ${nextNo} สำเร็จ ตัดสต๊อกเรียบร้อย` });
  };

  const posShiftSummary = useMemo(() => {
    const cash = posSalesHistory.filter((s) => s.method === 'cash').reduce((a, b) => a + b.total, 0);
    const transfer = posSalesHistory.filter((s) => s.method === 'transfer').reduce((a, b) => a + b.total, 0);
    const qr = posSalesHistory.filter((s) => s.method === 'qr').reduce((a, b) => a + b.total, 0);
    const expectedCash = drawerOpeningCash + cash;
    return {
      cash,
      transfer,
      qr,
      grandTotal: cash + transfer + qr,
      expectedCash,
      variance: drawerCountedCash - expectedCash,
    };
  }, [posSalesHistory, drawerOpeningCash, drawerCountedCash]);

  /* ==================== 3. TAX INVOICE / PP30 STATE ==================== */
  const [docType, setDocType] = useState<'QT' | 'INV' | 'RC'>('RC');
  const [docSequence, setDocSequence] = useState(42);
  const [docCustomer, setDocCustomer] = useState('บริษัท สยามเทรดดิ้ง จำกัด (สำนักงานใหญ่)');
  const [docTaxId, setDocTaxId] = useState('0105561098765');
  const [useVat, setUseVat] = useState(true);
  const [useWht, setUseWht] = useState(true);
  const [docVoided, setDocVoided] = useState(false);
  const [docItems, setDocItems] = useState([
    { id: 1, desc: 'ค่าบริการวางระบบบัญชีและสต๊อกรายปี', qty: 1, price: 15000 },
    { id: 2, desc: 'อบรมพนักงานใช้งานระบบหน้าร้าน POS', qty: 2, price: 2500 },
  ]);
  const [docTab, setDocTab] = useState<'editor' | 'pp30'>('editor');

  const docNo = `${docType}-2569-${String(docSequence).padStart(4, '0')}`;
  const docSubtotal = docItems.reduce((s, i) => s + i.qty * i.price, 0);
  const docVat = useVat ? Math.round(docSubtotal * 0.07 * 100) / 100 : 0;
  const docTotalInclVat = docSubtotal + docVat;
  const docWht = useWht ? Math.round(docSubtotal * 0.03 * 100) / 100 : 0;
  const docNetPayable = docTotalInclVat - docWht;

  const pp30Rows = [
    { docNo: 'RC-2569-0040', customer: 'บจก. ก้าวหน้า ออโต้พาร์ท', base: 24000, vat: 1680, status: 'ปกติ' },
    { docNo: 'RC-2569-0041', customer: 'ร้านบ้านกาแฟ คาเฟ่', base: 8500, vat: 595, status: 'ปกติ' },
    {
      docNo,
      customer: docCustomer,
      base: docVoided ? 0 : docSubtotal,
      vat: docVoided ? 0 : docVat,
      status: docVoided ? 'ยกเลิก' : 'ปกติ',
    },
  ];

  /* ==================== 4. DORMITORY STATE ==================== */
  const [dormRooms, setDormRooms] = useState([
    { room: '101', tenant: 'กิตติศักดิ์', rent: 4200, wPrev: 120, wCurr: 128, ePrev: 1040, eCurr: 1155, paid: true },
    { room: '102', tenant: 'พิมพ์ชนก', rent: 4200, wPrev: 88, wCurr: 95, ePrev: 820, eCurr: 940, paid: false },
    { room: '201', tenant: 'ธนากร', rent: 4500, wPrev: 210, wCurr: 219, ePrev: 1510, eCurr: 1680, paid: false },
    { room: '202', tenant: 'สุพัตรา', rent: 4500, wPrev: 145, wCurr: 151, ePrev: 990, eCurr: 1082, paid: true },
  ]);
  const [selectedDormRoom, setSelectedDormRoom] = useState('102');
  const waterRate = 18;
  const elecRate = 7;

  const calcDormTotal = (r: (typeof dormRooms)[number]) => {
    const wUnits = Math.max(0, r.wCurr - r.wPrev);
    const eUnits = Math.max(0, r.eCurr - r.ePrev);
    return r.rent + wUnits * waterRate + eUnits * elecRate;
  };

  /* ==================== 5. ONLINE SELLER STATE ==================== */
  const [onlineOrders, setOnlineOrders] = useState([
    { id: 1, channel: 'Shopee' as const, item: 'เซตกระบอกน้ำ 2 ชิ้น', sell: 490, cost: 210, ship: 28, feePct: 11.5 },
    { id: 2, channel: 'TikTok' as const, item: 'ชุดกระเป๋าเดินทางมินิมอล', sell: 650, cost: 270, ship: 35, feePct: 12.0 },
    { id: 3, channel: 'Lazada' as const, item: 'กล่องเก็บอุปกรณ์พับได้', sell: 390, cost: 165, ship: 25, feePct: 10.5 },
  ]);
  const [newOrderChannel, setNewOrderChannel] = useState<'Shopee' | 'Lazada' | 'TikTok'>('Shopee');
  const [newOrderItem, setNewOrderItem] = useState('');
  const [newOrderSell, setNewOrderSell] = useState(390);
  const [newOrderCost, setNewOrderCost] = useState(160);
  const [newOrderShip, setNewOrderShip] = useState(28);

  const channelDefaultFee = { Shopee: 11.5, Lazada: 10.5, TikTok: 12.0 };
  const onlineSummary = useMemo(() => {
    return onlineOrders.reduce(
      (acc, o) => {
        const fee = Math.round(o.sell * (o.feePct / 100));
        const net = o.sell - fee - o.cost - o.ship;
        return {
          revenue: acc.revenue + o.sell,
          fees: acc.fees + fee,
          netProfit: acc.netProfit + net,
        };
      },
      { revenue: 0, fees: 0, netProfit: 0 }
    );
  }, [onlineOrders]);

  /* ==================== 6. TAX 2569 STATE ==================== */
  const [salaryMonthly, setSalaryMonthly] = useState(48000);
  const [bonusAnnual, setBonusAnnual] = useState(48000);
  const [ssoPaid, setSsoPaid] = useState(10500);
  const [lifeInsurance, setLifeInsurance] = useState(35000);
  const [pvdRmf, setPvdRmf] = useState(60000);
  const [easyEReceipt, setEasyEReceipt] = useState(30000);
  const [homeLoanInterest, setHomeLoanInterest] = useState(24000);
  const [taxWithheldAlready, setTaxWithheldAlready] = useState(12000);

  const tax2569Calc = useMemo(() => {
    const grossIncome = salaryMonthly * 12 + bonusAnnual;
    const expenseDed = Math.min(100000, Math.round(grossIncome * 0.5));
    const personalAllow = 60000;
    const capSso = Math.min(10500, Math.max(0, ssoPaid));
    const capIns = Math.min(100000, Math.max(0, lifeInsurance));
    const capPvd = Math.min(500000, Math.round(grossIncome * 0.15), Math.max(0, pvdRmf));
    const capEasy = Math.min(50000, Math.max(0, easyEReceipt));
    const capHome = Math.min(100000, Math.max(0, homeLoanInterest));
    const totalAllowance = personalAllow + capSso + capIns + capPvd + capEasy + capHome;
    const netIncome = Math.max(0, grossIncome - expenseDed - totalAllowance);

    const brackets = [
      { label: '0 – 150,000', min: 0, max: 150000, rate: 0 },
      { label: '150,001 – 300,000', min: 150000, max: 300000, rate: 0.05 },
      { label: '300,001 – 500,000', min: 300000, max: 500000, rate: 0.1 },
      { label: '500,001 – 750,000', min: 500000, max: 750000, rate: 0.15 },
      { label: '750,001 – 1,000,000', min: 750000, max: 1000000, rate: 0.2 },
      { label: '1,000,001 – 2,000,000', min: 1000000, max: 2000000, rate: 0.25 },
      { label: '2,000,001 – 5,000,000', min: 2000000, max: 5000000, rate: 0.3 },
      { label: '5,000,001 ขึ้นไป', min: 5000000, max: Infinity, rate: 0.35 },
    ];

    let totalTax = 0;
    const steps = brackets.map((b) => {
      const taxableInStep = Math.max(0, Math.min(netIncome, b.max) - b.min);
      const stepTax = Math.round(taxableInStep * b.rate);
      totalTax += stepTax;
      return { ...b, taxableInStep, stepTax };
    });

    const diff = totalTax - taxWithheldAlready;
    return {
      grossIncome,
      expenseDed,
      totalAllowance,
      netIncome,
      totalTax,
      diff,
      steps,
      caps: { capSso, capIns, capPvd, capEasy, capHome },
    };
  }, [salaryMonthly, bonusAnnual, ssoPaid, lifeInsurance, pvdRmf, easyEReceipt, homeLoanInterest, taxWithheldAlready]);

  /* ==================== 7. PAYROLL + SSO 2569 STATE ==================== */
  const [staffList, setStaffList] = useState([
    { id: 1, name: 'สมชาย ใจดี', role: 'หัวหน้าคลังสินค้า', base: 24000, otHours: 8, wht: 420 },
    { id: 2, name: 'มานี ศรีสุข', role: 'เจ้าหน้าที่บัญชี', base: 21000, otHours: 4, wht: 250 },
    { id: 3, name: 'ปิติ รักงาน', role: 'พนักงานขายหน้าร้าน', base: 16500, otHours: 12, wht: 0 },
  ]);
  const [selectedStaffId, setSelectedStaffId] = useState(1);

  const calcStaffPay = (s: (typeof staffList)[number]) => {
    const otRate = (s.base / 30 / 8) * 1.5;
    const otPay = Math.round(otRate * s.otHours);
    const ssoWageBase = Math.min(17500, s.base); // ฐานเพดานประกันสังคม 2569 (17,500 บาท -> สูงสุด 875 บาท)
    const sso = Math.round(ssoWageBase * 0.05);
    const gross = s.base + otPay;
    const net = gross - sso - s.wht;
    return { otPay, sso, gross, net };
  };

  const totalSsoRemit = staffList.reduce((acc, s) => acc + calcStaffPay(s).sso * 2, 0);

  /* ==================== 8. FOOD COST STATE ==================== */
  const [menuName, setMenuName] = useState('ข้าวกะเพราเนื้อวากิวไข่ดาว');
  const [targetFoodCostPct, setTargetFoodCostPct] = useState(32);
  const [inflationPct, setInflationPct] = useState(0);
  const [ingredients, setIngredients] = useState([
    { id: 1, name: 'เนื้อสไลด์ (กก.)', packPrice: 480, packQty: 1000, usedQty: 120 },
    { id: 2, name: 'ข้าวหอมมะลิหุงสุก (กก.)', packPrice: 45, packQty: 1000, usedQty: 200 },
    { id: 3, name: 'ใบกะเพรา + พริกกระเทียม + ซอส', packPrice: 120, packQty: 1000, usedQty: 60 },
    { id: 4, name: 'ไข่ไก่ + น้ำมัน + บรรจุภัณฑ์', packPrice: 12, packQty: 1, usedQty: 1 },
  ]);

  const foodCostSummary = useMemo(() => {
    const baseCost = ingredients.reduce((s, ing) => {
      const unitCost = ing.packQty > 0 ? ing.packPrice / ing.packQty : 0;
      return s + unitCost * ing.usedQty;
    }, 0);
    const adjustedCost = baseCost * (1 + inflationPct / 100);
    const suggestedPrice =
      targetFoodCostPct > 0 ? Math.ceil(adjustedCost / (targetFoodCostPct / 100)) : 0;
    const profitPerDish = suggestedPrice - adjustedCost;
    return { baseCost, adjustedCost, suggestedPrice, profitPerDish };
  }, [ingredients, targetFoodCostPct, inflationPct]);

  /* ==================== 9. AR / AP LEDGER STATE ==================== */
  const [ledgerMode, setLedgerMode] = useState<'AR' | 'AP'>('AR');
  const [ledgerRows, setLedgerRows] = useState([
    { id: 1, type: 'AR' as const, party: 'บจก. สยามอาหารไทย', invoiceNo: 'INV-6901', total: 28000, paid: 10000, overdueDays: 18, phone: '081-234-5678' },
    { id: 2, type: 'AR' as const, party: 'ร้านเจ๊นิด ค้าส่ง', invoiceNo: 'INV-6904', total: 14500, paid: 0, overdueDays: 42, phone: '089-998-1122' },
    { id: 3, type: 'AP' as const, party: 'บจก. บรรจุภัณฑ์เอเชีย', invoiceNo: 'BILL-882', total: 19200, paid: 5000, overdueDays: 7, phone: '02-555-8800' },
  ]);

  const recordPartialPayment = (id: number, amount: number) => {
    setLedgerRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, paid: Math.min(r.total, r.paid + amount) } : r))
    );
    showToast({ type: 'success', title: `บันทึกชำระบางส่วน ฿${amount.toLocaleString()} แล้ว` });
  };

  const copyLineReminder = (r: (typeof ledgerRows)[number]) => {
    const remaining = Math.max(0, r.total - r.overdueDays * 0 - r.paid);
    const msg = `สวัสดีครับคุณลูกค้า (${r.party})\nขออนุญาตแจ้งยอดค้างชำระเอกสารเลขที่ ${r.invoiceNo}\nยอดคงเหลือสุทธิ ${remaining.toLocaleString()} บาท (เลยกำหนด ${r.overdueDays} วัน)\nสามารถโอนผ่าน PromptPay และส่งสลิปในแชทนี้ได้เลยครับ ขอบคุณครับ`;
    navigator.clipboard?.writeText(msg);
    showToast({
      type: 'success',
      title: 'คัดลอกข้อความทวงถามสำหรับส่ง LINE แล้ว',
      description: 'นำไปวางใน LINE ลูกค้าได้ทันที',
    });
  };

  /* ==================== 10. RETIREMENT STATE ==================== */
  const [curAge, setCurAge] = useState(32);
  const [retireAge, setRetireAge] = useState(60);
  const [monthlySpendWanted, setMonthlySpendWanted] = useState(30000);
  const [curSavings, setCurSavings] = useState(250000);
  const [monthlySaving, setMonthlySaving] = useState(8000);
  const [annualReturnPct, setAnnualReturnPct] = useState(6);
  const [inflationRetirePct, setInflationRetirePct] = useState(2.5);

  const retireCalc = useMemo(() => {
    const yearsToRetire = Math.max(1, retireAge - curAge);
    const monthsToRetire = yearsToRetire * 12;
    const realAnnualRate = Math.max(0.005, (annualReturnPct - inflationRetirePct) / 100);
    const monthlyRate = annualReturnPct / 100 / 12;
    const futureSpendMonthly =
      monthlySpendWanted * Math.pow(1 + inflationRetirePct / 100, yearsToRetire);
    // Nest egg for 25 years post-retirement
    const yearsInRetirement = 25;
    const requiredAtRetire = Math.round(
      futureSpendMonthly * 12 * ((1 - Math.pow(1 + realAnnualRate, -yearsInRetirement)) / realAnnualRate)
    );
    const projectedAtRetire = Math.round(
      curSavings * Math.pow(1 + monthlyRate, monthsToRetire) +
        monthlySaving * ((Math.pow(1 + monthlyRate, monthsToRetire) - 1) / monthlyRate)
    );
    const shortfall = Math.max(0, requiredAtRetire - projectedAtRetire);
    const extraMonthlyNeeded =
      shortfall === 0
        ? 0
        : Math.round(
            (shortfall * monthlyRate) / (Math.pow(1 + monthlyRate, monthsToRetire) - 1)
          );

    // Simulate how many years money lasts after retirement
    let balance = projectedAtRetire;
    let yearsLasts = 0;
    const postRate = Math.max(0, annualReturnPct / 100 - 0.02); // conservative post-retire
    let annualDraw = futureSpendMonthly * 12;
    while (balance > 0 && yearsLasts < 45) {
      balance = balance * (1 + postRate) - annualDraw;
      annualDraw *= 1 + inflationRetirePct / 100;
      if (balance >= 0) yearsLasts++;
    }

    return {
      futureSpendMonthly: Math.round(futureSpendMonthly),
      requiredAtRetire,
      projectedAtRetire,
      shortfall,
      extraMonthlyNeeded,
      lastsUntilAge: retireAge + yearsLasts,
    };
  }, [curAge, retireAge, monthlySpendWanted, curSavings, monthlySaving, annualReturnPct, inflationRetirePct]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <section className="rounded-2xl bg-gradient-to-br from-[#231915] via-[#2C1F1A] to-orange-950 text-white p-6 sm:p-10 soft-card border border-orange-900/50 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-bold tracking-wider uppercase text-orange-400">
              ตัวอย่าง WEB APP พร้อมใช้งานจริง · กดแล้วจบ
            </p>
            <h1 className="font-display font-bold text-2xl sm:text-4xl">
              ตัวอย่าง Web App 10 ระบบธุรกิจ ทดลองกดใช้งานได้ทันที
            </h1>
            <p className="text-sm sm:text-base text-stone-200 leading-relaxed">
              ทุกแอปมีข้อมูลตัวอย่างให้ลองกดได้ทันที ใช้ฟรีบนเว็บนี้ ถ้าอยากได้ระบบแบบนี้เป็นของร้านคุณเอง (ชื่อร้าน โลโก้ ใช้หลายเครื่อง ฟีเจอร์เฉพาะธุรกิจ) ทักมาคุยได้เลย
            </p>
          </div>

          <div className="flex flex-col gap-2.5 shrink-0">
            <a
              href={lineOrderHref}
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                trackLinkClick(
                  'line-webapp-demo-hero',
                  'อยากได้ของจริง ทัก LINE (หน้าตัวอย่าง Web App)',
                  lineOrderHref
                )
              }
              className="px-5 py-3 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-sm font-bold inline-flex items-center justify-center gap-2 whitespace-nowrap shadow-lg"
            >
              <MessageCircle className="w-4 h-4" />
              อยากได้ของจริง ทัก LINE @556fsrdw
            </a>
            <button
              type="button"
              onClick={() => navigate('/webapp')}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Building2 className="w-4 h-4" />
              เปิดระบบ SaaS ERP 20 ระบบเต็มรูปแบบ
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-orange-900/40 flex flex-wrap items-center gap-2.5">
          <span className="text-xs text-stone-300 inline-flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-orange-400" />
            แชร์หน้าตัวอย่าง Web App:
          </span>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noreferrer"
            onClick={() =>
              trackLinkClick('share-fb-webapps-demo', 'แชร์ Facebook ตัวอย่าง Web App', shareUrl)
            }
            className="px-3 py-1.5 rounded-lg bg-[#1877F2] text-white text-xs font-bold"
          >
            แชร์ Facebook
          </a>
          <a
            href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noreferrer"
            onClick={() =>
              trackLinkClick('share-line-webapps-demo', 'แชร์ LINE ตัวอย่าง Web App', shareUrl)
            }
            className="px-3 py-1.5 rounded-lg bg-[#06C755] text-white text-xs font-bold"
          >
            แชร์ LINE
          </a>
        </div>
      </section>

      {/* 10 App Cards Directory */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {DEMO_APPS.map((app) => {
          const isCurrent = activeApp === app.id;
          return (
            <div
              key={app.id}
              className={`rounded-2xl p-5 soft-card flex flex-col justify-between transition-all ${
                isCurrent
                  ? 'bg-[#1E1B18] text-white border-2 border-orange-500'
                  : 'bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 hover:border-orange-400'
              }`}
            >
              <div className="space-y-2">
                <div className="text-3xl leading-none" aria-hidden="true">
                  {app.emoji}
                </div>
                <h2 className="font-display font-bold text-base leading-snug">{app.title}</h2>
                <p
                  className={`text-xs leading-relaxed ${
                    isCurrent ? 'text-stone-300' : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {app.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-orange-200/20 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => openDemoWorkspace(app.id)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-colors ${
                    isCurrent
                      ? 'bg-orange-500 text-white'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  {isCurrent ? 'กำลังทดลองใช้งาน' : 'ลองใช้ฟรี'}
                </button>
                <a
                  href={lineOrderHref}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() =>
                    trackLinkClick(
                      `line-demo-card-${app.id}`,
                      `อยากได้ของจริง ทัก LINE: ${app.title}`,
                      lineOrderHref
                    )
                  }
                  className={`w-full py-2 rounded-xl text-center text-xs font-semibold border transition-colors ${
                    isCurrent
                      ? 'border-emerald-400/60 text-emerald-300 hover:bg-emerald-950/60'
                      : 'border-emerald-500/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                  }`}
                >
                  อยากได้ของจริง ทัก LINE
                </a>
              </div>
            </div>
          );
        })}
      </section>

      {/* LIVE INTERACTIVE WORKSPACE */}
      <section
        id="live-webapp-workspace"
        className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 sm:p-8 soft-card space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-orange-100 dark:border-orange-900/40 pb-4">
          <div>
            <p className="text-xs font-bold text-orange-600 dark:text-orange-400">
              LIVE INTERACTIVE SANDBOX · กดทดลองคำนวณและแก้ไขข้อมูลได้จริง
            </p>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-[#1E1B18] dark:text-orange-50 mt-0.5">
              {DEMO_APPS.find((a) => a.id === activeApp)?.emoji}{' '}
              {DEMO_APPS.find((a) => a.id === activeApp)?.title}
            </h2>
          </div>

          <a
            href={lineOrderHref}
            target="_blank"
            rel="noreferrer"
            onClick={() =>
              trackLinkClick(
                `line-demo-workspace-${activeApp}`,
                `ทัก LINE สั่งทำแอป: ${activeApp}`,
                lineOrderHref
              )
            }
            className="px-4 py-2 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <MessageCircle className="w-4 h-4" />
            อยากได้ระบบนี้เป็นของร้านตัวเอง ทัก LINE
          </a>
        </div>

        {/* 1. STOCK APP */}
        {activeApp === 'stock' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
              <div className="rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] p-4">
                <p className="text-xs text-stone-500">มูลค่าสินค้าคงคลัง</p>
                <p className="font-display font-bold text-2xl mt-1">฿{stockStats.stockValue.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] p-4">
                <p className="text-xs text-stone-500">ของใกล้หมด (ต่ำกว่าจุดสั่ง)</p>
                <p className="font-display font-bold text-2xl text-rose-600 mt-1">{stockStats.lowCount} รายการ</p>
              </div>
              <div className="rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] p-4">
                <p className="text-xs text-stone-500">ยอดขายสะสม</p>
                <p className="font-display font-bold text-2xl text-orange-600 mt-1">฿{stockStats.totalSales.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] p-4">
                <p className="text-xs text-stone-500">กำไรสุทธิสะสม</p>
                <p className="font-display font-bold text-2xl text-emerald-600 mt-1">฿{stockStats.totalProfit.toLocaleString()}</p>
              </div>
            </div>

            <form onSubmit={addStockSku} className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-4 rounded-xl bg-orange-50/70 dark:bg-[#2A201B]">
              <input
                type="text"
                required
                value={newSkuName}
                onChange={(e) => setNewSkuName(e.target.value)}
                placeholder="ชื่อสินค้าใหม่..."
                className="sm:col-span-2 px-3 py-2 rounded-lg bg-white dark:bg-[#14100E] border border-orange-200 dark:border-orange-900/50 text-sm"
              />
              <input
                type="number"
                value={newSkuCost}
                onChange={(e) => setNewSkuCost(Number(e.target.value))}
                placeholder="ทุน"
                className="px-3 py-2 rounded-lg bg-white dark:bg-[#14100E] border border-orange-200 dark:border-orange-900/50 text-sm"
              />
              <input
                type="number"
                value={newSkuPrice}
                onChange={(e) => setNewSkuPrice(Number(e.target.value))}
                placeholder="ราคาขาย"
                className="px-3 py-2 rounded-lg bg-white dark:bg-[#14100E] border border-orange-200 dark:border-orange-900/50 text-sm"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newSkuQty}
                  onChange={(e) => setNewSkuQty(Number(e.target.value))}
                  className="w-20 px-2 py-2 rounded-lg bg-white dark:bg-[#14100E] border border-orange-200 dark:border-orange-900/50 text-sm"
                />
                <button type="submit" className="flex-1 px-3 py-2 rounded-lg bg-orange-500 text-white text-xs font-bold">
                  + เพิ่ม SKU
                </button>
              </div>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left tabular-nums">
                <thead>
                  <tr className="border-b border-orange-200 dark:border-orange-900/40 text-stone-500">
                    <th className="py-2.5 pr-3">รหัส</th>
                    <th className="py-2.5 pr-3">ชื่อสินค้า</th>
                    <th className="py-2.5 pr-3">ทุน / ขาย</th>
                    <th className="py-2.5 pr-3">คงเหลือ</th>
                    <th className="py-2.5 pr-3">ขายแล้ว</th>
                    <th className="py-2.5 text-right">รับเข้า / จ่ายออก</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100 dark:divide-orange-900/30">
                  {stockItems.map((item) => {
                    const isLow = item.qty <= item.min;
                    return (
                      <tr key={item.id}>
                        <td className="py-3 pr-3 font-mono text-xs">{item.sku}</td>
                        <td className="py-3 pr-3 font-medium">
                          {item.name}
                          {isLow && (
                            <span className="ml-2 text-[11px] font-bold text-rose-600">
                              (ใกล้หมด &le; {item.min})
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-3">฿{item.cost} / ฿{item.price}</td>
                        <td className={`py-3 pr-3 font-bold ${isLow ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {item.qty}
                        </td>
                        <td className="py-3 pr-3">{item.sold}</td>
                        <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => adjustStock(item.id, 1)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                          >
                            +1 รับเข้า
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustStock(item.id, -1)}
                            className="px-2.5 py-1 rounded-lg bg-orange-500 text-white text-xs font-bold"
                          >
                            -1 ขายออก
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. POS APP */}
        {activeApp === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <p className="text-xs font-bold text-stone-500">กดเลือกสินค้าเพื่อเพิ่มลงบิลขายหน้าร้าน (ตัดสต๊อกอัตโนมัติ):</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {posMenu.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => addToPosCart(m)}
                    className="p-4 rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 hover:border-orange-500 text-left transition-all"
                  >
                    <p className="font-display font-bold text-sm">{m.name}</p>
                    <div className="flex items-center justify-between mt-2 text-xs tabular-nums">
                      <span className="font-bold text-orange-600">฿{m.price}</span>
                      <span className="text-stone-500">เหลือ {m.stock}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Drawer Shift Close Summary */}
              <div className="rounded-xl bg-[#1E1B18] text-white p-4 space-y-3 tabular-nums">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-orange-400">สรุปปิดยอดกะ &amp; นับเงินลิ้นชัก (Shift Closing)</p>
                  <span className="text-xs text-stone-400">เงินทอนตั้งต้น ฿{drawerOpeningCash.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-stone-400">เงินสด</p>
                    <p className="font-bold text-sm">฿{posShiftSummary.cash.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-stone-400">เงินโอน</p>
                    <p className="font-bold text-sm">฿{posShiftSummary.transfer.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-stone-400">PromptPay QR</p>
                    <p className="font-bold text-sm">฿{posShiftSummary.qr.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-stone-400">ยอดขายรวม</p>
                    <p className="font-bold text-sm text-emerald-400">฿{posShiftSummary.grandTotal.toLocaleString()}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-stone-700 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span>นับเงินสดในลิ้นชักจริง:</span>
                    <input
                      type="number"
                      value={drawerCountedCash}
                      onChange={(e) => setDrawerCountedCash(Number(e.target.value) || 0)}
                      className="w-28 px-2 py-1 rounded bg-black/50 border border-stone-600 text-white font-mono"
                    />
                  </div>
                  <span className={posShiftSummary.variance === 0 ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'}>
                    เงินในลิ้นชักควรมี ฿{posShiftSummary.expectedCash.toLocaleString()} · ผลต่าง{' '}
                    {posShiftSummary.variance >= 0 ? `+${posShiftSummary.variance}` : posShiftSummary.variance} บ.
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base inline-flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-orange-500" />
                    บิลปัจจุบัน
                  </h3>
                  <button
                    type="button"
                    onClick={() => setPosCart([])}
                    className="text-xs text-rose-600 hover:underline"
                  >
                    ล้างบิล
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {posCart.length === 0 ? (
                    <p className="text-xs text-stone-500 py-4 text-center">ยังไม่มีสินค้าในบิล</p>
                  ) : (
                    posCart.map((c) => (
                      <div key={c.id} className="flex items-center justify-between text-xs sm:text-sm bg-white dark:bg-[#14100E] px-3 py-2 rounded-lg">
                        <div>
                          <p className="font-semibold">{c.name}</p>
                          <p className="text-xs text-stone-500 tabular-nums">฿{c.price} × {c.qty}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setPosCart((prev) =>
                                prev
                                  .map((p) => (p.id === c.id ? { ...p, qty: p.qty - 1 } : p))
                                  .filter((p) => p.qty > 0)
                              )
                            }
                            className="p-1 rounded bg-orange-100 dark:bg-orange-950"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold tabular-nums w-6 text-center">{c.qty}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setPosCart((prev) =>
                                prev.map((p) => (p.id === c.id ? { ...p, qty: p.qty + 1 } : p))
                              )
                            }
                            className="p-1 rounded bg-orange-100 dark:bg-orange-950"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-orange-200 dark:border-orange-900/40 space-y-3 tabular-nums">
                <div className="flex justify-between font-display font-bold text-xl">
                  <span>ยอดรวมสุทธิ</span>
                  <span className="text-orange-600">฿{posBillTotal.toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cash', label: 'เงินสด' },
                    { id: 'transfer', label: 'เงินโอน' },
                    { id: 'qr', label: 'QR พร้อมเพย์' },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPosPayMethod(pm.id as any)}
                      className={`py-2 rounded-lg text-xs font-bold ${
                        posPayMethod === pm.id
                          ? 'bg-orange-500 text-white'
                          : 'bg-white dark:bg-[#14100E] border border-orange-200 dark:border-orange-900/50'
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>

                {posPayMethod === 'cash' && (
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span>รับเงินมา:</span>
                      <input
                        type="number"
                        value={posCashReceived}
                        onChange={(e) => setPosCashReceived(Number(e.target.value) || 0)}
                        className="w-24 px-2 py-1 rounded bg-white dark:bg-[#14100E] border border-orange-200 font-bold"
                      />
                    </div>
                    <span className="font-bold text-emerald-600">
                      เงินทอน: ฿{posChange.toLocaleString()}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={checkoutPos}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold"
                >
                  รับชำระเงิน &amp; ตัดสต๊อกทันที
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. QUOTATION / INVOICE / RECEIPT + PP30 */}
        {activeApp === 'invoice' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'QT', label: 'ใบเสนอราคา (QT)' },
                  { id: 'INV', label: 'ใบแจ้งหนี้ (INV)' },
                  { id: 'RC', label: 'ใบเสร็จ / ใบกำกับภาษี (RC)' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setDocType(t.id as any);
                      setDocTab('editor');
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold ${
                      docTab === 'editor' && docType === t.id
                        ? 'bg-orange-500 text-white'
                        : 'bg-orange-50 dark:bg-[#2A201B]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setDocTab('pp30')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold ${
                    docTab === 'pp30' ? 'bg-orange-500 text-white' : 'bg-orange-50 dark:bg-[#2A201B]'
                  }`}
                >
                  รายงานภาษีขาย ภ.พ.30
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setDocSequence((s) => s + 1)}
                  className="px-3 py-2 rounded-xl border border-orange-200 dark:border-orange-900/50 text-xs font-semibold"
                >
                  รันเลขที่ใหม่ ({docNo})
                </button>
                <button
                  type="button"
                  onClick={() => setDocVoided((v) => !v)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold ${
                    docVoided ? 'bg-rose-600 text-white' : 'border border-rose-300 text-rose-600'
                  }`}
                >
                  {docVoided ? 'ยกเลิกสถานะ VOID' : 'ยกเลิกใบกำกับ (VOID)'}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#1E1B18] text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  พิมพ์ / บันทึก PDF
                </button>
              </div>
            </div>

            {docTab === 'editor' ? (
              <div className="erp-print-area rounded-2xl border border-orange-200 dark:border-orange-900/40 p-6 bg-white dark:bg-[#14100E] space-y-5 relative">
                {docVoided && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 text-rose-700 dark:text-rose-300 text-xs font-bold text-center">
                    เอกสารนี้ถูกยกเลิก (VOID) — ยอดภาษีขายถูกปรับเป็น 0 ในรายงาน ภ.พ.30 อัตโนมัติ
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-stone-500 mb-1">ชื่อลูกค้า / บริษัท</label>
                    <input
                      type="text"
                      value={docCustomer}
                      onChange={(e) => setDocCustomer(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-stone-500 mb-1">เลขผู้เสียภาษี</label>
                      <input
                        type="text"
                        value={docTaxId}
                        onChange={(e) => setDocTaxId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-500 mb-1">เลขที่เอกสาร</label>
                      <div className="px-3 py-2 rounded-lg bg-orange-50 dark:bg-[#2A201B] font-mono text-sm font-bold text-orange-600">
                        {docNo}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {docItems.map((it) => (
                    <div key={it.id} className="grid grid-cols-12 gap-2 items-center text-xs sm:text-sm">
                      <input
                        type="text"
                        value={it.desc}
                        onChange={(e) =>
                          setDocItems((prev) =>
                            prev.map((x) => (x.id === it.id ? { ...x, desc: e.target.value } : x))
                          )
                        }
                        className="col-span-6 px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40"
                      />
                      <input
                        type="number"
                        value={it.qty}
                        onChange={(e) =>
                          setDocItems((prev) =>
                            prev.map((x) =>
                              x.id === it.id ? { ...x, qty: Math.max(1, Number(e.target.value) || 1) } : x
                            )
                          )
                        }
                        className="col-span-2 px-2 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-center tabular-nums"
                      />
                      <input
                        type="number"
                        value={it.price}
                        onChange={(e) =>
                          setDocItems((prev) =>
                            prev.map((x) =>
                              x.id === it.id ? { ...x, price: Math.max(0, Number(e.target.value) || 0) } : x
                            )
                          )
                        }
                        className="col-span-3 px-2 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-right tabular-nums"
                      />
                      <button
                        type="button"
                        onClick={() => setDocItems((prev) => prev.filter((x) => x.id !== it.id))}
                        className="col-span-1 p-2 text-rose-500 flex justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setDocItems((prev) => [
                        ...prev,
                        { id: Date.now(), desc: 'รายการเพิ่มเติมใหม่', qty: 1, price: 3000 },
                      ])
                    }
                    className="text-xs font-bold text-orange-600 hover:underline"
                  >
                    + เพิ่มบรรทัดรายการ
                  </button>
                </div>

                <div className="pt-4 border-t border-orange-200 dark:border-orange-900/40 flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2 text-xs">
                    <label className="flex items-center gap-2 font-semibold cursor-pointer">
                      <input type="checkbox" checked={useVat} onChange={(e) => setUseVat(e.target.checked)} />
                      คิดภาษีมูลค่าเพิ่ม VAT 7%
                    </label>
                    <label className="flex items-center gap-2 font-semibold cursor-pointer">
                      <input type="checkbox" checked={useWht} onChange={(e) => setUseWht(e.target.checked)} />
                      หักภาษี ณ ที่จ่าย 3% (WHT)
                    </label>
                    <p className="pt-1 font-semibold text-orange-700 dark:text-orange-300">
                      ตัวอักษรไทย: ({bahtText(docNetPayable)})
                    </p>
                  </div>

                  <div className="space-y-1.5 text-sm tabular-nums min-w-[260px]">
                    <div className="flex justify-between">
                      <span>รวมเป็นเงิน</span>
                      <span>฿{docSubtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-stone-500">
                      <span>ภาษีมูลค่าเพิ่ม 7%</span>
                      <span>฿{docVat.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-rose-600">
                      <span>หัก ณ ที่จ่าย 3%</span>
                      <span>-฿{docWht.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between font-display font-bold text-lg border-t pt-1.5 text-orange-600">
                      <span>ยอดชำระสุทธิ</span>
                      <span>฿{docNetPayable.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm text-left tabular-nums">
                  <thead>
                    <tr className="border-b border-orange-200 dark:border-orange-900/40 text-stone-500">
                      <th className="py-2.5">เลขที่ใบกำกับ</th>
                      <th className="py-2.5">ชื่อผู้ซื้อสินค้า/บริการ</th>
                      <th className="py-2.5 text-right">มูลค่าสินค้า/บริการ</th>
                      <th className="py-2.5 text-right">ภาษีขาย 7%</th>
                      <th className="py-2.5 text-right">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100 dark:divide-orange-900/30">
                    {pp30Rows.map((row) => (
                      <tr key={row.docNo}>
                        <td className="py-3 font-mono font-bold">{row.docNo}</td>
                        <td className="py-3">{row.customer}</td>
                        <td className="py-3 text-right">฿{row.base.toLocaleString()}</td>
                        <td className="py-3 text-right font-bold text-orange-600">฿{row.vat.toLocaleString()}</td>
                        <td className="py-3 text-right font-semibold">{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 4. DORMITORY APP */}
        {activeApp === 'dorm' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-stone-500">
                ค่าน้ำ ฿{waterRate}/หน่วย · ค่าไฟ ฿{elecRate}/หน่วย · แก้ไขตัวเลขมิเตอร์ปัจจุบันได้ทันที
              </p>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#1E1B18] text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                พิมพ์ใบแจ้งหนี้ห้อง {selectedDormRoom}
              </button>
            </div>

            <div className="overflow-x-auto erp-print-area">
              <table className="w-full text-xs sm:text-sm text-left tabular-nums">
                <thead>
                  <tr className="border-b border-orange-200 dark:border-orange-900/40 text-stone-500">
                    <th className="py-2.5 pr-3">ห้อง</th>
                    <th className="py-2.5 pr-3">ผู้เช่า</th>
                    <th className="py-2.5 pr-3">ค่าเช่า</th>
                    <th className="py-2.5 pr-3">มิเตอร์น้ำ (เก่า→ใหม่)</th>
                    <th className="py-2.5 pr-3">มิเตอร์ไฟ (เก่า→ใหม่)</th>
                    <th className="py-2.5 pr-3 text-right">รวมสุทธิ</th>
                    <th className="py-2.5 text-right">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100 dark:divide-orange-900/30">
                  {dormRooms.map((r) => (
                    <tr
                      key={r.room}
                      onClick={() => setSelectedDormRoom(r.room)}
                      className={selectedDormRoom === r.room ? 'bg-orange-50/70 dark:bg-orange-950/25' : ''}
                    >
                      <td className="py-3 pr-3 font-bold">{r.room}</td>
                      <td className="py-3 pr-3">{r.tenant}</td>
                      <td className="py-3 pr-3">฿{r.rent.toLocaleString()}</td>
                      <td className="py-3 pr-3">
                        <span className="text-stone-400">{r.wPrev} → </span>
                        <input
                          type="number"
                          value={r.wCurr}
                          onChange={(e) =>
                            setDormRooms((prev) =>
                              prev.map((x) =>
                                x.room === r.room ? { ...x, wCurr: Number(e.target.value) || 0 } : x
                              )
                            )
                          }
                          className="w-16 px-1.5 py-1 rounded border border-orange-200 dark:bg-[#14100E]"
                        />
                      </td>
                      <td className="py-3 pr-3">
                        <span className="text-stone-400">{r.ePrev} → </span>
                        <input
                          type="number"
                          value={r.eCurr}
                          onChange={(e) =>
                            setDormRooms((prev) =>
                              prev.map((x) =>
                                x.room === r.room ? { ...x, eCurr: Number(e.target.value) || 0 } : x
                              )
                            )
                          }
                          className="w-20 px-1.5 py-1 rounded border border-orange-200 dark:bg-[#14100E]"
                        />
                      </td>
                      <td className="py-3 pr-3 text-right font-bold text-orange-600">
                        ฿{calcDormTotal(r).toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setDormRooms((prev) =>
                              prev.map((x) => (x.room === r.room ? { ...x, paid: !x.paid } : x))
                            )
                          }
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            r.paid ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                          }`}
                        >
                          {r.paid ? 'ชำระแล้ว' : 'ค้างชำระ'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. ONLINE SELLER APP */}
        {activeApp === 'online_seller' && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4 tabular-nums">
              <div className="rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] p-4">
                <p className="text-xs text-stone-500">ยอดขายรวม</p>
                <p className="font-display font-bold text-2xl mt-1">฿{onlineSummary.revenue.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] p-4">
                <p className="text-xs text-stone-500">ค่าธรรมเนียมแพลตฟอร์ม</p>
                <p className="font-display font-bold text-2xl text-rose-600 mt-1">-฿{onlineSummary.fees.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] p-4">
                <p className="text-xs text-stone-500">กำไรสุทธิเข้ากระเป๋าจริง</p>
                <p className="font-display font-bold text-2xl text-emerald-600 mt-1">฿{onlineSummary.netProfit.toLocaleString()}</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newOrderItem.trim()) return;
                setOnlineOrders((prev) => [
                  {
                    id: Date.now(),
                    channel: newOrderChannel,
                    item: newOrderItem.trim(),
                    sell: newOrderSell,
                    cost: newOrderCost,
                    ship: newOrderShip,
                    feePct: channelDefaultFee[newOrderChannel],
                  },
                  ...prev,
                ]);
                setNewOrderItem('');
              }}
              className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 p-4 rounded-xl bg-orange-50/70 dark:bg-[#2A201B]"
            >
              <select
                value={newOrderChannel}
                onChange={(e) => setNewOrderChannel(e.target.value as any)}
                className="px-2.5 py-2 rounded-lg bg-white dark:bg-[#14100E] border border-orange-200 text-xs font-bold"
              >
                <option value="Shopee">Shopee (11.5%)</option>
                <option value="Lazada">Lazada (10.5%)</option>
                <option value="TikTok">TikTok (12.0%)</option>
              </select>
              <input
                type="text"
                required
                value={newOrderItem}
                onChange={(e) => setNewOrderItem(e.target.value)}
                placeholder="ชื่อสินค้าในออเดอร์"
                className="sm:col-span-2 px-3 py-2 rounded-lg bg-white dark:bg-[#14100E] border border-orange-200 text-xs"
              />
              <input
                type="number"
                value={newOrderSell}
                onChange={(e) => setNewOrderSell(Number(e.target.value) || 0)}
                placeholder="ราคาขาย"
                className="px-2.5 py-2 rounded-lg bg-white dark:bg-[#14100E] border border-orange-200 text-xs"
              />
              <input
                type="number"
                value={newOrderCost}
                onChange={(e) => setNewOrderCost(Number(e.target.value) || 0)}
                placeholder="ทุนสินค้า"
                className="px-2.5 py-2 rounded-lg bg-white dark:bg-[#14100E] border border-orange-200 text-xs"
              />
              <button type="submit" className="px-3 py-2 rounded-lg bg-orange-500 text-white text-xs font-bold">
                + เพิ่มออเดอร์
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left tabular-nums">
                <thead>
                  <tr className="border-b border-orange-200 dark:border-orange-900/40 text-stone-500">
                    <th className="py-2.5">ช่องทาง</th>
                    <th className="py-2.5">สินค้า</th>
                    <th className="py-2.5 text-right">ราคาขาย</th>
                    <th className="py-2.5 text-right">ค่า GP</th>
                    <th className="py-2.5 text-right">ทุน + ค่าส่ง</th>
                    <th className="py-2.5 text-right">กำไรสุทธิ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100 dark:divide-orange-900/30">
                  {onlineOrders.map((o) => {
                    const gp = Math.round(o.sell * (o.feePct / 100));
                    const net = o.sell - gp - o.cost - o.ship;
                    return (
                      <tr key={o.id}>
                        <td className="py-3 font-bold text-orange-600">{o.channel}</td>
                        <td className="py-3">{o.item}</td>
                        <td className="py-3 text-right">฿{o.sell}</td>
                        <td className="py-3 text-right text-rose-600">-฿{gp} ({o.feePct}%)</td>
                        <td className="py-3 text-right">฿{o.cost + o.ship}</td>
                        <td className={`py-3 text-right font-bold ${net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          ฿{net.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. TAX 2569 APP */}
        {activeApp === 'tax2569' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-500 mb-1">เงินเดือน (ต่อเดือน)</label>
                  <input
                    type="number"
                    value={salaryMonthly}
                    onChange={(e) => setSalaryMonthly(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 mb-1">โบนัสทั้งปี</label>
                  <input
                    type="number"
                    value={bonusAnnual}
                    onChange={(e) => setBonusAnnual(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 mb-1">ประกันสังคม (เพดาน 10,500)</label>
                  <input
                    type="number"
                    value={ssoPaid}
                    onChange={(e) => setSsoPaid(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 mb-1">เบี้ยประกันชีวิต (เพดาน 100,000)</label>
                  <input
                    type="number"
                    value={lifeInsurance}
                    onChange={(e) => setLifeInsurance(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 mb-1">PVD / RMF (เพดาน 15%)</label>
                  <input
                    type="number"
                    value={pvdRmf}
                    onChange={(e) => setPvdRmf(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 mb-1">Easy E-Receipt (เพดาน 50,000)</label>
                  <input
                    type="number"
                    value={easyEReceipt}
                    onChange={(e) => setEasyEReceipt(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 mb-1">ดอกเบี้ยบ้าน (เพดาน 100,000)</label>
                  <input
                    type="number"
                    value={homeLoanInterest}
                    onChange={(e) => setHomeLoanInterest(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 mb-1">ภาษีถูกหัก ณ ที่จ่ายไว้แล้ว</label>
                  <input
                    type="number"
                    value={taxWithheldAlready}
                    onChange={(e) => setTaxWithheldAlready(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4 tabular-nums">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] p-3.5">
                  <p className="text-[11px] text-stone-500">เงินได้สุทธิหลังหักลดหย่อน</p>
                  <p className="font-display font-bold text-lg mt-0.5">฿{tax2569Calc.netIncome.toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] p-3.5">
                  <p className="text-[11px] text-stone-500">ภาษีที่คำนวณได้ทั้งปี</p>
                  <p className="font-display font-bold text-lg text-orange-600 mt-0.5">฿{tax2569Calc.totalTax.toLocaleString()}</p>
                </div>
                <div className={`rounded-xl p-3.5 ${tax2569Calc.diff > 0 ? 'bg-rose-50 dark:bg-rose-950/30' : 'bg-emerald-50 dark:bg-emerald-950/30'}`}>
                  <p className="text-[11px] text-stone-500">{tax2569Calc.diff > 0 ? 'ต้องจ่ายภาษีเพิ่ม' : 'ได้คืนเงินภาษี'}</p>
                  <p className={`font-display font-bold text-lg mt-0.5 ${tax2569Calc.diff > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    ฿{Math.abs(tax2569Calc.diff).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-orange-200 dark:border-orange-900/40 text-stone-500">
                      <th className="py-2">ขั้นเงินได้สุทธิ (บาท)</th>
                      <th className="py-2 text-right">อัตราภาษี</th>
                      <th className="py-2 text-right">เงินได้ในขั้นนี้</th>
                      <th className="py-2 text-right">ภาษีในขั้นนี้</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100 dark:divide-orange-900/30">
                    {tax2569Calc.steps.map((st) => (
                      <tr key={st.label} className={st.taxableInStep > 0 ? 'font-semibold' : 'text-stone-400'}>
                        <td className="py-1.5">{st.label}</td>
                        <td className="py-1.5 text-right">{(st.rate * 100).toFixed(0)}%</td>
                        <td className="py-1.5 text-right">฿{st.taxableInStep.toLocaleString()}</td>
                        <td className="py-1.5 text-right text-orange-600">฿{st.stepTax.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 7. PAYROLL + SSO 2569 + PAYSLIP */}
        {activeApp === 'payroll' && (
          <div className="space-y-5 tabular-nums">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-stone-500">
                คำนวณประกันสังคม 2569 (5% เพดานฐาน 17,500 บ. = สูงสุด 875 บ.) · ยอดนำส่ง สปส. รวมนายจ้าง+ลูกจ้าง:{' '}
                <strong className="text-orange-600">฿{totalSsoRemit.toLocaleString()}</strong>
              </p>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#1E1B18] text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                พิมพ์สลิปเงินเดือน
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead>
                  <tr className="border-b border-orange-200 dark:border-orange-900/40 text-stone-500">
                    <th className="py-2">พนักงาน</th>
                    <th className="py-2 text-right">เงินเดือน</th>
                    <th className="py-2 text-right">OT (ชม.)</th>
                    <th className="py-2 text-right">ค่า OT</th>
                    <th className="py-2 text-right">ประกันสังคม</th>
                    <th className="py-2 text-right">ภาษี</th>
                    <th className="py-2 text-right">รับสุทธิ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100 dark:divide-orange-900/30">
                  {staffList.map((s) => {
                    const calc = calcStaffPay(s);
                    return (
                      <tr
                        key={s.id}
                        onClick={() => setSelectedStaffId(s.id)}
                        className={`cursor-pointer ${selectedStaffId === s.id ? 'bg-orange-50/70 dark:bg-orange-950/30' : ''}`}
                      >
                        <td className="py-2.5 font-semibold">
                          {s.name}
                          <span className="block text-[11px] text-stone-400">{s.role}</span>
                        </td>
                        <td className="py-2.5 text-right">฿{s.base.toLocaleString()}</td>
                        <td className="py-2.5 text-right">
                          <input
                            type="number"
                            value={s.otHours}
                            onChange={(e) =>
                              setStaffList((prev) =>
                                prev.map((x) =>
                                  x.id === s.id ? { ...x, otHours: Math.max(0, Number(e.target.value) || 0) } : x
                                )
                              )
                            }
                            className="w-16 px-2 py-1 rounded border border-orange-200 dark:bg-[#14100E] text-right"
                          />
                        </td>
                        <td className="py-2.5 text-right text-emerald-600">+฿{calc.otPay.toLocaleString()}</td>
                        <td className="py-2.5 text-right text-rose-600">-฿{calc.sso.toLocaleString()}</td>
                        <td className="py-2.5 text-right text-rose-600">-฿{s.wht.toLocaleString()}</td>
                        <td className="py-2.5 text-right font-bold">฿{calc.net.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {(() => {
              const st = staffList.find((x) => x.id === selectedStaffId) || staffList[0];
              const calc = calcStaffPay(st);
              return (
                <div className="erp-print-area rounded-xl border border-orange-200 dark:border-orange-900/40 p-5 bg-[#FFF7ED] dark:bg-[#2A201B] space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between font-display font-bold text-base">
                    <span>สลิปเงินเดือน (PAYSLIP) · {st.name}</span>
                    <span className="text-orange-600">ตำแหน่ง: {st.role}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div>เงินเดือน: ฿{st.base.toLocaleString()}</div>
                    <div>ค่าล่วงเวลา OT: ฿{calc.otPay.toLocaleString()}</div>
                    <div>หัก ประกันสังคม: ฿{calc.sso.toLocaleString()}</div>
                    <div className="font-bold text-emerald-600">สุทธิโอนเข้าบัญชี: ฿{calc.net.toLocaleString()}</div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* 8. FOOD COST APP */}
        {activeApp === 'foodcost' && (
          <div className="space-y-5 tabular-nums">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-stone-500 mb-1">ชื่อเมนูอาหาร</label>
                <input
                  type="text"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">
                  เป้าหมาย Food Cost (%): <strong className="text-orange-600">{targetFoodCostPct}%</strong>
                </label>
                <input
                  type="range"
                  min={20}
                  max={50}
                  value={targetFoodCostPct}
                  onChange={(e) => setTargetFoodCostPct(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">
                  จำลองวัตถุดิบขึ้นราคา: <strong className="text-rose-600">+{inflationPct}%</strong>
                </label>
                <input
                  type="range"
                  min={0}
                  max={40}
                  value={inflationPct}
                  onChange={(e) => setInflationPct(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] p-4">
                <p className="text-xs text-stone-500">ต้นทุนต่อจาน (ปัจจุบัน)</p>
                <p className="font-display font-bold text-2xl mt-1">฿{foodCostSummary.adjustedCost.toFixed(2)}</p>
              </div>
              <div className="rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] p-4">
                <p className="text-xs text-stone-500">ราคาขายที่แนะนำ</p>
                <p className="font-display font-bold text-2xl text-orange-600 mt-1">฿{foodCostSummary.suggestedPrice}</p>
              </div>
              <div className="rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] p-4">
                <p className="text-xs text-stone-500">กำไรต่อจาน</p>
                <p className="font-display font-bold text-2xl text-emerald-600 mt-1">฿{foodCostSummary.profitPerDish.toFixed(2)}</p>
              </div>
              <div className="rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] p-4">
                <p className="text-xs text-stone-500">ต้นทุนพื้นฐานเดิม</p>
                <p className="font-display font-bold text-2xl mt-1">฿{foodCostSummary.baseCost.toFixed(2)}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead>
                  <tr className="border-b border-orange-200 dark:border-orange-900/40 text-stone-500">
                    <th className="py-2">วัตถุดิบ</th>
                    <th className="py-2 text-right">ราคาซื้อ/แพ็ก</th>
                    <th className="py-2 text-right">ปริมาณใช้/จาน</th>
                    <th className="py-2 text-right">ต้นทุนต่อจาน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100 dark:divide-orange-900/30">
                  {ingredients.map((ing) => {
                    const cost = (ing.packPrice / ing.packQty) * ing.usedQty * (1 + inflationPct / 100);
                    return (
                      <tr key={ing.id}>
                        <td className="py-2.5">{ing.name}</td>
                        <td className="py-2.5 text-right">
                          <input
                            type="number"
                            value={ing.packPrice}
                            onChange={(e) =>
                              setIngredients((prev) =>
                                prev.map((x) =>
                                  x.id === ing.id ? { ...x, packPrice: Math.max(0, Number(e.target.value) || 0) } : x
                                )
                              )
                            }
                            className="w-20 px-2 py-1 rounded border border-orange-200 dark:bg-[#14100E] text-right"
                          />
                        </td>
                        <td className="py-2.5 text-right">{ing.usedQty}</td>
                        <td className="py-2.5 text-right font-bold text-orange-600">฿{cost.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 9. AR / AP LEDGER */}
        {activeApp === 'ar_ap' && (
          <div className="space-y-5 tabular-nums">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLedgerMode('AR')}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  ledgerMode === 'AR' ? 'bg-orange-500 text-white' : 'bg-orange-50 dark:bg-[#2A201B]'
                }`}
              >
                ลูกหนี้การค้า (รอรับเงิน)
              </button>
              <button
                type="button"
                onClick={() => setLedgerMode('AP')}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  ledgerMode === 'AP' ? 'bg-orange-500 text-white' : 'bg-orange-50 dark:bg-[#2A201B]'
                }`}
              >
                เจ้าหนี้การค้า (รอจ่ายเงิน)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead>
                  <tr className="border-b border-orange-200 dark:border-orange-900/40 text-stone-500">
                    <th className="py-2.5">คู่ค้า / ลูกค้า</th>
                    <th className="py-2.5">เลขเอกสาร</th>
                    <th className="py-2.5 text-right">ยอดเต็ม</th>
                    <th className="py-2.5 text-right">ชำระแล้ว</th>
                    <th className="py-2.5 text-right">คงค้าง</th>
                    <th className="py-2.5 text-right">เกินกำหนด</th>
                    <th className="py-2.5 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100 dark:divide-orange-900/30">
                  {ledgerRows
                    .filter((r) => r.type === ledgerMode)
                    .map((r) => {
                      const remain = Math.max(0, r.total - r.paid);
                      return (
                        <tr key={r.id}>
                          <td className="py-3 font-semibold">{r.party}</td>
                          <td className="py-3 font-mono">{r.invoiceNo}</td>
                          <td className="py-3 text-right">฿{r.total.toLocaleString()}</td>
                          <td className="py-3 text-right text-emerald-600">฿{r.paid.toLocaleString()}</td>
                          <td className="py-3 text-right font-bold text-rose-600">฿{remain.toLocaleString()}</td>
                          <td className="py-3 text-right">{r.overdueDays} วัน</td>
                          <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => recordPartialPayment(r.id, 5000)}
                              disabled={remain === 0}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 disabled:opacity-40 text-white text-xs font-bold"
                            >
                              +รับ 5,000
                            </button>
                            <button
                              type="button"
                              onClick={() => copyLineReminder(r)}
                              className="px-2.5 py-1 rounded-lg bg-[#06C755] text-white text-xs font-bold inline-flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              คัดลอกทวง LINE
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 10. RETIREMENT + COMPOUND INTEREST */}
        {activeApp === 'retire' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 tabular-nums">
            <div className="lg:col-span-5 grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-stone-500 mb-1">อายุปัจจุบัน (ปี)</label>
                <input
                  type="number"
                  value={curAge}
                  onChange={(e) => setCurAge(Math.max(18, Number(e.target.value) || 18))}
                  className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-500 mb-1">อายุที่ต้องการเกษียณ</label>
                <input
                  type="number"
                  value={retireAge}
                  onChange={(e) => setRetireAge(Math.max(curAge + 1, Number(e.target.value) || 60))}
                  className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-500 mb-1">อยากมีเงินใช้เดือนละ (มูลค่าวันนี้)</label>
                <input
                  type="number"
                  value={monthlySpendWanted}
                  onChange={(e) => setMonthlySpendWanted(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-500 mb-1">เงินเก็บตั้งต้นตอนนี้</label>
                <input
                  type="number"
                  value={curSavings}
                  onChange={(e) => setCurSavings(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-500 mb-1">ออมเพิ่มเดือนละ (บาท)</label>
                <input
                  type="number"
                  value={monthlySaving}
                  onChange={(e) => setMonthlySaving(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-500 mb-1">ผลตอบแทนลงทุน/ปี (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={annualReturnPct}
                  onChange={(e) => setAnnualReturnPct(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 font-mono"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-stone-500 mb-1">เงินเฟ้อเฉลี่ยต่อปี (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={inflationRetirePct}
                  onChange={(e) => setInflationRetirePct(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 font-mono"
                />
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] p-4">
                <p className="text-xs text-stone-500">เงินที่ต้องมีตอนอายุ {retireAge} ปี (รวมเงินเฟ้อ)</p>
                <p className="font-display font-bold text-2xl text-orange-600 mt-1">
                  ฿{retireCalc.requiredAtRetire.toLocaleString()}
                </p>
                <p className="text-[11px] text-stone-500 mt-1">
                  ค่าใช้จ่ายเดือนละ ฿{retireCalc.futureSpendMonthly.toLocaleString()} ณ วันเกษียณ
                </p>
              </div>
              <div className="rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] p-4">
                <p className="text-xs text-stone-500">เงินที่จะมีจริงจากแผนออมปัจจุบัน</p>
                <p className="font-display font-bold text-2xl text-emerald-600 mt-1">
                  ฿{retireCalc.projectedAtRetire.toLocaleString()}
                </p>
                <p className="text-[11px] text-stone-500 mt-1">
                  ผลตอบแทนทบต้น {annualReturnPct}% ต่อปี
                </p>
              </div>
              <div className="rounded-xl bg-[#1E1B18] text-white p-4">
                <p className="text-xs text-stone-400">ต้องออมเพิ่มอีกเดือนละ</p>
                <p className="font-display font-bold text-2xl text-amber-300 mt-1">
                  {retireCalc.extraMonthlyNeeded === 0
                    ? 'แผนปัจจุบันเพียงพอแล้ว!'
                    : `+฿${retireCalc.extraMonthlyNeeded.toLocaleString()} / เดือน`}
                </p>
              </div>
              <div className="rounded-xl bg-[#1E1B18] text-white p-4">
                <p className="text-xs text-stone-400">เงินออมปัจจุบันพอใช้ถึงอายุ</p>
                <p className="font-display font-bold text-2xl text-emerald-300 mt-1">
                  {retireCalc.lastsUntilAge >= 100 ? 'มากกว่า 100 ปี' : `${retireCalc.lastsUntilAge} ปี`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA Strip */}
        <div className="pt-4 border-t border-orange-100 dark:border-orange-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-stone-600 dark:text-stone-300">
            อยากได้ระบบนี้เป็นของร้านคุณเอง · ใส่โลโก้ร้าน ใช้หลายเครื่อง เชื่อมฐานข้อมูลจริง → ทัก LINE{' '}
            <strong className="text-orange-600">@556fsrdw</strong>
          </p>
          <button
            type="button"
            onClick={() => navigate('/webapp')}
            className="text-orange-600 dark:text-orange-400 font-bold hover:underline inline-flex items-center gap-1 whitespace-nowrap"
          >
            เปิดทดลองใช้งานระบบ SaaS ERP 20 ระบบเต็มรูปแบบ
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
}
