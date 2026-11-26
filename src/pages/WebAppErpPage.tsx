import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Crown,
  Database,
  Download,
  Edit3,
  FileSpreadsheet,
  HardDrive,
  History,
  ImagePlus,
  Layers,
  Menu,
  Package,
  Plus,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  Upload,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchJsonSafe } from '../lib/catalogClient';
import { ERP_MODULES, ErpModuleMeta } from '../data/erpModulesConfig';
import {
  BarcodeSvg,
  ErpCompanyInfo,
  ErpDocumentModal,
  ErpRecordDoc,
} from '../components/ErpDocumentModal';

interface ErpStockProduct {
  id: number;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  brand: string;
  unit: string;
  warehouse: string;
  location: string;
  supplier: string;
  costPrice: number;
  sellPrice: number;
  stockQty: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
}

interface ErpStockMovement {
  id: number;
  productId: number;
  type: string;
  qty: number;
  unitCost: number;
  beforeQty: number;
  afterQty: number;
  referenceNo: string;
  warehouseFrom?: string | null;
  warehouseTo?: string | null;
  note?: string | null;
  createdBy: string;
  createdAt: string;
}

interface ErpAuditLog {
  id: number;
  userName: string;
  moduleKey: string;
  action: string;
  recordId?: string | null;
  summary: string;
  createdAt: string;
}

interface CompanyUsageSummary {
  packageCode: string;
  packageName: string;
  packageBadge: string;
  price: number;
  billingCycle: string;
  status: string;
  isTrial: boolean;
  isExpired: boolean;
  daysRemaining: number;
  expiryAlert: '7d' | '3d' | '1d' | 'expired' | null;
  trialStartAt: string;
  trialEndAt: string;
  expiresAt: string;
  recordsUsed: number;
  recordsLimit: number;
  recordsPct: number;
  usersUsed: number;
  usersLimit: number;
  usersPct: number;
  storageUsedBytes: number;
  storageUsedMb: number;
  storageLimitMb: number;
  storagePct: number;
  storageHealth: 'ok' | 'warning' | 'critical' | 'blocked';
}

interface ErpPackageItem {
  code: string;
  name: string;
  badge: string;
  price: number;
  billingCycle: string;
  durationDays: number;
  maxStorageMb: number;
  maxUsers: number;
  maxRecords: number;
  features: string[];
  isPopular: boolean;
}

interface ErpTeamMember {
  id: number;
  memberName: string;
  memberEmail: string;
  role: string;
  status: string;
  createdAt: string;
}

const PROMPTPAY_QR = '/assets/aistudio/Untitled_e84a513c.jpg';

const DEFAULT_PREFIXES = {
  QT: 'QT-2026',
  SO: 'SO-2026',
  INV: 'INV-2026',
  RC: 'RC-2026',
  PR: 'PR-2026',
  PO: 'PO-2026',
  PAY: 'PAY-2026',
  PROD: 'PROD-2026',
  SHIP: 'SHIP-2026',
  AST: 'AST-2026',
};

export function WebAppErpPage() {
  const { dbUser, getIdToken, setAuthModalOpen, showToast, navigate, getQrUrl } = useApp();

  const [activeModule, setActiveModule] = useState<string>('bi_dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);

  const [company, setCompany] = useState<ErpCompanyInfo | null>(null);
  const [inventory, setInventory] = useState<ErpStockProduct[]>([]);
  const [movements, setMovements] = useState<ErpStockMovement[]>([]);
  const [records, setRecords] = useState<ErpRecordDoc[]>([]);
  const [auditLogs, setAuditLogs] = useState<ErpAuditLog[]>([]);
  const [usage, setUsage] = useState<CompanyUsageSummary | null>(null);
  const [team, setTeam] = useState<ErpTeamMember[]>([]);
  const [packages, setPackages] = useState<ErpPackageItem[]>([]);

  // Upgrade & Team state
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string | null>(null);
  const [selectedUpgradeCode, setSelectedUpgradeCode] = useState<string>('professional');
  const [promptpayRefInput, setPromptpayRefInput] = useState('');
  const [upgrading, setUpgrading] = useState(false);
  const [newTeamMember, setNewTeamMember] = useState({
    memberName: '',
    memberEmail: '',
    role: 'sales',
  });
  const [addingTeamMember, setAddingTeamMember] = useState(false);

  // Global search
  const [globalSearch, setGlobalSearch] = useState('');

  // List filters / pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'amount_desc' | 'amount_asc'>('newest');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Printable document modal
  const [printModalRecord, setPrintModalRecord] = useState<{
    record: ErpRecordDoc;
    format?: 'a4' | 'thermal80' | 'payslip' | 'qr_tag';
  } | null>(null);

  // Stock modals
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ErpStockProduct | null>(null);
  const [productForm, setProductForm] = useState({
    sku: '',
    barcode: '',
    name: '',
    category: 'สินค้าทั่วไป',
    brand: 'KDJ',
    unit: 'ชิ้น',
    warehouse: 'คลังหลัก (WH-01)',
    location: 'A1-01',
    supplier: 'ซัพพลายเออร์ทั่วไป',
    costPrice: '100',
    sellPrice: '200',
    stockQty: '20',
    minStock: '5',
    reorderPoint: '10',
  });

  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [movementForm, setMovementForm] = useState({
    productId: 0,
    type: 'IN',
    qty: '10',
    unitCost: '',
    warehouseTo: 'คลังสาขา 1 (WH-02)',
    referenceNo: '',
    note: '',
  });

  // POS terminal state
  const [posSearch, setPosSearch] = useState('');
  const [posCart, setPosCart] = useState<Array<{ product: ErpStockProduct; qty: number }>>([]);
  const [posDiscount, setPosDiscount] = useState('0');
  const [posIncludeVat, setPosIncludeVat] = useState(true);
  const [posPaymentMethod, setPosPaymentMethod] = useState('QR PromptPay');
  const [posCustomer, setPosCustomer] = useState('ลูกค้าหน้าร้าน (Walk-in)');
  const [posSubmitting, setPosSubmitting] = useState(false);

  // Generic CRUD Modal for modules 03-19
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ErpRecordDoc | null>(null);
  const [recordForm, setRecordForm] = useState({
    title: '',
    partyName: '',
    categoryOrDept: '',
    status: '',
    amount: '0',
    qty: '1',
    dateStr: new Date().toISOString().slice(0, 10),
    dueDateStr: '',
    extraSku: '',
    baseSalary: '25000',
    otPay: '1500',
    allowance: '1000',
    ngQty: '0',
  });

  // Company Registration form state
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    companyNameEn: '',
    taxId: '',
    branchName: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    vatRate: '7',
    whtRate: '3',
    bankName: 'ธนาคารกสิกรไทย (KBANK)',
    accountNo: '081-9-99888-8',
    accountName: '',
    prefixes: { ...DEFAULT_PREFIXES },
  });
  const [savingCompany, setSavingCompany] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getIdToken();
      const endpoint = token ? '/api/erp/workspace' : '/api/erp/showcase';
      const result = await fetchJsonSafe<any>(endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!result.ok) {
        // Fallback showcase state for static edge hosting (e.g. Cloudflare Workers Assets)
        setIsDemo(true);
        const fallbackCompany: ErpCompanyInfo = {
          id: 1,
          ownerUid: 'showcase-demo',
          companyName: 'บริษัท กดแล้วจบ โซลูชันส์ จำกัด',
          companyNameEn: 'Kodraewjob Solutions Co., Ltd.',
          taxId: '0105568001234',
          branchName: 'สำนักงานใหญ่',
          address: '99/88 อาคารดิจิทัลทาวเวอร์ ถ.พระราม 9 เขตห้วยขวาง กรุงเทพฯ 10310',
          phone: '02-999-8888',
          email: 'contact@kodraewjob.th',
          website: 'https://kodraewjob.th',
          logoUrl: '/assets/aistudio/810624000_983971044712451_6466500635178443708_n_81f9a476.jpg',
          vatRate: 7,
          whtRate: 3,
          currency: 'THB',
          prefixConfigJson: JSON.stringify(DEFAULT_PREFIXES),
          bankInfoJson: JSON.stringify({
            bankName: 'ธนาคารกสิกรไทย (KBANK)',
            accountNo: '081-9-99888-8',
            accountName: 'บริษัท กดแล้วจบ โซลูชันส์ จำกัด',
          }),
        };
        setCompany(fallbackCompany);
        setUsage({
          packageCode: 'trial',
          packageName: 'FREE TRIAL (ทดลองใช้งาน 1 เดือน)',
          packageBadge: 'ทดลองฟรี 30 วัน',
          price: 0,
          billingCycle: 'trial_30d',
          status: 'Trial',
          isTrial: true,
          isExpired: false,
          daysRemaining: 30,
          expiryAlert: null,
          trialStartAt: new Date().toISOString(),
          trialEndAt: new Date(Date.now() + 30 * 86400000).toISOString(),
          expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
          recordsUsed: 12,
          recordsLimit: 99,
          recordsPct: 12,
          usersUsed: 1,
          usersLimit: 1,
          usersPct: 100,
          storageUsedBytes: 512000,
          storageUsedMb: 0.5,
          storageLimitMb: 30,
          storagePct: 2,
          storageHealth: 'ok',
        });
        setInventory([
          {
            id: 1,
            sku: 'SKU-1001',
            barcode: '885900100101',
            name: 'ชุดเทมเพลต Excel ERP องค์กร',
            category: 'Software & Template',
            brand: 'Kodraewjob',
            unit: 'ชุด',
            warehouse: 'คลังหลัก (HQ)',
            location: 'A-01',
            supplier: 'Kodraewjob Lab',
            costPrice: 90,
            sellPrice: 199,
            stockQty: 120,
            minStock: 10,
            maxStock: 500,
            reorderPoint: 20,
          },
          {
            id: 2,
            sku: 'SKU-1002',
            barcode: '885900100102',
            name: 'เครื่องสแกนบาร์โค้ดไร้สาย 2D',
            category: 'POS Hardware',
            brand: 'Zebra',
            unit: 'เครื่อง',
            warehouse: 'คลังหลัก (HQ)',
            location: 'B-03',
            supplier: 'Tech Supply TH',
            costPrice: 1250,
            sellPrice: 1890,
            stockQty: 18,
            minStock: 5,
            maxStock: 50,
            reorderPoint: 8,
          },
        ]);
        setMovements([]);
        setRecords([
          {
            id: 1,
            moduleKey: 'sales_docs',
            docNumber: 'INV-2026-0001',
            title: 'ค่าบริการติดตั้งระบบ SaaS ERP รายปี',
            partyName: 'บจก. สยามเฟอร์นิเจอร์',
            categoryOrDept: 'ฝ่ายขายองค์กร',
            status: 'paid',
            amount: 15900,
            qty: 1,
            dateStr: new Date().toISOString().slice(0, 10),
            dueDateStr: null,
            payloadJson: JSON.stringify({ vatIncluded: true }),
            createdBy: 'ระบบตัวอย่าง',
          },
        ]);
        setAuditLogs([]);
        setTeam([]);
        setCompanyForm({
          companyName: fallbackCompany.companyName,
          companyNameEn: fallbackCompany.companyNameEn || '',
          taxId: fallbackCompany.taxId,
          branchName: fallbackCompany.branchName,
          address: fallbackCompany.address,
          phone: fallbackCompany.phone,
          email: fallbackCompany.email,
          website: fallbackCompany.website || '',
          vatRate: '7',
          whtRate: '3',
          bankName: 'ธนาคารกสิกรไทย (KBANK)',
          accountNo: '081-9-99888-8',
          accountName: fallbackCompany.companyName,
          prefixes: { ...DEFAULT_PREFIXES },
        });
        setLoading(false);
        return;
      }

      const data = result.data;
      setIsDemo(Boolean(data.isDemo));
      setCompany(data.company);
      setUsage(data.usage || null);
      setTeam(Array.isArray(data.team) ? data.team : []);
      setInventory(Array.isArray(data.inventory) ? data.inventory : []);
      setMovements(Array.isArray(data.movements) ? data.movements : []);
      setRecords(Array.isArray(data.records) ? data.records : []);
      setAuditLogs(Array.isArray(data.auditLogs) ? data.auditLogs : []);

      if (data.company) {
        let bank: Record<string, string> = {};
        let prefixes = { ...DEFAULT_PREFIXES };
        try {
          bank = JSON.parse(data.company.bankInfoJson || '{}');
        } catch {
          // ignore
        }
        try {
          prefixes = { ...DEFAULT_PREFIXES, ...JSON.parse(data.company.prefixConfigJson || '{}') };
        } catch {
          // ignore
        }
        setCompanyForm({
          companyName: data.company.companyName || '',
          companyNameEn: data.company.companyNameEn || '',
          taxId: data.company.taxId || '',
          branchName: data.company.branchName || 'สำนักงานใหญ่',
          address: data.company.address || '',
          phone: data.company.phone || '',
          email: data.company.email || '',
          website: data.company.website || '',
          vatRate: String(data.company.vatRate ?? 7),
          whtRate: String(data.company.whtRate ?? 3),
          bankName: bank.bankName || 'ธนาคารกสิกรไทย (KBANK)',
          accountNo: bank.accountNo || '',
          accountName: bank.accountName || data.company.companyName || '',
          prefixes,
        });
      }
    } catch {
      showToast({ type: 'error', title: 'ไม่สามารถโหลดระบบ SaaS ERP ได้' });
    } finally {
      setLoading(false);
    }
  }, [getIdToken, showToast]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace, dbUser?.uid]);

  useEffect(() => {
    fetchJsonSafe<{ packages?: ErpPackageItem[] }>('/api/erp/packages').then((res) => {
      if (res.ok && Array.isArray(res.data.packages) && res.data.packages.length > 0) {
        setPackages(res.data.packages);
      } else {
        setPackages([
          {
            code: 'basic',
            name: 'BASIC',
            badge: 'เริ่มต้นใช้งานจริง',
            price: 250,
            billingCycle: 'monthly',
            durationDays: 30,
            maxStorageMb: 30,
            maxUsers: 1,
            maxRecords: 99,
            features: ['Storage 30 MB · 1 User · 99 Records'],
            isPopular: false,
          },
          {
            code: 'standard',
            name: 'STANDARD',
            badge: 'คุ้มค่า SME',
            price: 350,
            billingCycle: 'monthly',
            durationDays: 30,
            maxStorageMb: 35,
            maxUsers: 2,
            maxRecords: 199,
            features: ['Storage 35 MB · 2 Users · 199 Records'],
            isPopular: false,
          },
          {
            code: 'professional',
            name: 'PROFESSIONAL',
            badge: 'ยอดนิยม 🔥',
            price: 550,
            billingCycle: 'monthly',
            durationDays: 30,
            maxStorageMb: 50,
            maxUsers: 5,
            maxRecords: 600,
            features: ['Storage 50 MB · 5 Users · 600 Records'],
            isPopular: true,
          },
          {
            code: 'business',
            name: 'BUSINESS',
            badge: 'ธุรกิจเติบโต',
            price: 990,
            billingCycle: 'monthly',
            durationDays: 30,
            maxStorageMb: 100,
            maxUsers: 10,
            maxRecords: 3000,
            features: ['Storage 100 MB · 10 Users · 3,000 Records'],
            isPopular: false,
          },
          {
            code: 'enterprise',
            name: 'ENTERPRISE',
            badge: 'องค์กรขนาดกลาง-ใหญ่',
            price: 1500,
            billingCycle: 'monthly',
            durationDays: 30,
            maxStorageMb: 500,
            maxUsers: -1,
            maxRecords: 15000,
            features: ['Storage 500 MB · Unlimited Users · 15,000 Records'],
            isPopular: false,
          },
          {
            code: 'enterprise_annual_saver',
            name: 'ENTERPRISE SAVER (รายปี)',
            badge: 'ประหยัด 2,100฿/ปี',
            price: 15900,
            billingCycle: 'yearly',
            durationDays: 365,
            maxStorageMb: 500,
            maxUsers: -1,
            maxRecords: 15000,
            features: ['Storage 500 MB · Unlimited Users · 15,000 Records'],
            isPopular: false,
          },
          {
            code: 'enterprise_yearly',
            name: 'ENTERPRISE YEARLY UNLIMITED',
            badge: 'ไม่จำกัดทั้งหมด',
            price: 19000,
            billingCycle: 'yearly',
            durationDays: 365,
            maxStorageMb: -1,
            maxUsers: -1,
            maxRecords: -1,
            features: ['Unlimited Storage · Unlimited Users · Unlimited Records'],
            isPopular: false,
          },
        ]);
      }
    });

    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    if (
      planParam &&
      [
        'basic',
        'standard',
        'professional',
        'business',
        'enterprise',
        'enterprise_annual_saver',
        'enterprise_yearly',
      ].includes(planParam)
    ) {
      setSelectedUpgradeCode(planParam);
      setUpgradeReason(null);
      setUpgradeModalOpen(true);
    }
  }, []);

  useEffect(() => {
    setSearchQuery('');
    setStatusFilter('');
    setPage(1);
  }, [activeModule]);

  const requireAuthAction = async (): Promise<string | null> => {
    const token = await getIdToken();
    if (!token || !dbUser) {
      showToast({
        type: 'info',
        title: 'กรุณาเข้าสู่ระบบ Gmail ก่อนบันทึกข้อมูล',
        description: 'ล็อกอินเพื่อสร้างฐานข้อมูลบริษัท โลโก้ และข้อมูลจริงขององค์กรคุณ',
      });
      setAuthModalOpen(true);
      return null;
    }
    return token;
  };

  const handleQuotaLimitResponse = (res: Response, data: any): boolean => {
    if (res.status === 403 && data?.upgradeRequired) {
      if (data.usage) setUsage(data.usage);
      setUpgradeReason(data.error || 'เกินโควต้าแพ็กเกจที่ใช้งาน กรุณา Upgrade Package');
      setUpgradeModalOpen(true);
      showToast({
        type: 'error',
        title: data.error || 'เกินโควต้าแพ็กเกจ กรุณาอัปเกรด',
      });
      return true;
    }
    return false;
  };

  const handleUpgradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await requireAuthAction();
    if (!token) return;
    setUpgrading(true);
    try {
      const res = await fetch('/api/erp/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          packageCode: selectedUpgradeCode,
          promptpayRef: promptpayRefInput.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast({ type: 'error', title: data.error || 'อัปเกรดแพ็กเกจไม่สำเร็จ' });
        return;
      }
      setUpgradeModalOpen(false);
      setUpgradeReason(null);
      setPromptpayRefInput('');
      showToast({
        type: 'success',
        title: `เปิดใช้งานแพ็กเกจ ${data.package?.name || selectedUpgradeCode} สำเร็จ!`,
        description: 'ปลดล็อกโควต้าพื้นที่ Storage, จำนวนผู้ใช้ และจำนวนข้อมูลใหม่เรียบร้อยแล้ว',
      });
      await loadWorkspace();
    } catch {
      showToast({ type: 'error', title: 'ไม่สามารถอัปเกรดแพ็กเกจได้' });
    } finally {
      setUpgrading(false);
    }
  };

  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await requireAuthAction();
    if (!token) return;
    setAddingTeamMember(true);
    try {
      const res = await fetch('/api/erp/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTeamMember),
      });
      const data = await res.json();
      if (handleQuotaLimitResponse(res, data)) return;
      if (!res.ok) {
        showToast({ type: 'error', title: data.error || 'เพิ่มผู้ใช้งานไม่สำเร็จ' });
        return;
      }
      setNewTeamMember({ memberName: '', memberEmail: '', role: 'sales' });
      showToast({ type: 'success', title: 'เพิ่มผู้ใช้งานเข้าบริษัทเรียบร้อยแล้ว' });
      await loadWorkspace();
    } catch {
      showToast({ type: 'error', title: 'ไม่สามารถเพิ่มผู้ใช้งานได้' });
    } finally {
      setAddingTeamMember(false);
    }
  };

  const handleRemoveTeamMember = async (id: number) => {
    const token = await requireAuthAction();
    if (!token) return;
    const res = await fetch(`/api/erp/team/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      showToast({ type: 'error', title: data.error || 'ไม่สามารถลบผู้ใช้งานได้' });
      return;
    }
    showToast({ type: 'info', title: 'ลบผู้ใช้งานออกจากบริษัทแล้ว' });
    await loadWorkspace();
  };

  const currentModuleMeta: ErpModuleMeta =
    ERP_MODULES.find((m) => m.key === activeModule) || ERP_MODULES[0];

  // Dashboard Metrics
  const dashboardStats = useMemo(() => {
    const posRevenue = records
      .filter((r) => r.moduleKey === 'pos' && r.status !== 'voided')
      .reduce((s, r) => s + r.amount, 0);

    const accIncome = records
      .filter((r) => r.moduleKey === 'accounting' && r.categoryOrDept.includes('รายรับ'))
      .reduce((s, r) => s + r.amount, 0);

    const accExpense = records
      .filter((r) => r.moduleKey === 'accounting' && r.categoryOrDept.includes('รายจ่าย'))
      .reduce((s, r) => s + r.amount, 0);

    const inventoryValue = inventory.reduce((s, p) => s + p.costPrice * p.stockQty, 0);
    const lowStockItems = inventory.filter((p) => p.stockQty <= p.reorderPoint);

    const pendingApprovals = records.filter((r) =>
      ['pending', 'draft', 'New Order'].includes(r.status)
    ).length;

    const mfgRecords = records.filter((r) => r.moduleKey === 'manufacturing');
    const avgYield =
      mfgRecords.length > 0
        ? (
            mfgRecords.reduce((s, r) => {
              const plan = Math.max(1, r.amount);
              return s + (r.qty / plan) * 100;
            }, 0) / mfgRecords.length
          ).toFixed(1)
        : '99.0';

    return {
      totalRevenue: Math.max(posRevenue, accIncome),
      netCashflow: accIncome - accExpense,
      accIncome,
      accExpense,
      inventoryValue,
      lowStockItems,
      pendingApprovals,
      avgYield,
    };
  }, [inventory, records]);

  // Global search results across inventory & all modules
  const globalMatches = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return { products: [], records: [] };
    return {
      products: inventory
        .filter(
          (p) =>
            p.sku.toLowerCase().includes(q) ||
            p.barcode.toLowerCase().includes(q) ||
            p.name.toLowerCase().includes(q)
        )
        .slice(0, 5),
      records: records
        .filter(
          (r) =>
            r.docNumber.toLowerCase().includes(q) ||
            r.title.toLowerCase().includes(q) ||
            r.partyName.toLowerCase().includes(q)
        )
        .slice(0, 6),
    };
  }, [globalSearch, inventory, records]);

  // Filtered Stock Items
  const filteredInventory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = inventory.filter((p) => {
      if (statusFilter === 'low_stock' && p.stockQty > p.reorderPoint) return false;
      if (statusFilter === 'out_of_stock' && p.stockQty > 0) return false;
      if (!q) return true;
      return (
        p.sku.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.warehouse.toLowerCase().includes(q)
      );
    });
    if (sortBy === 'amount_desc') return [...list].sort((a, b) => b.stockQty * b.costPrice - a.stockQty * a.costPrice);
    if (sortBy === 'amount_asc') return [...list].sort((a, b) => a.stockQty - b.stockQty);
    return list;
  }, [inventory, searchQuery, statusFilter, sortBy]);

  // Filtered Records for modules 02-19
  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = records.filter((r) => {
      if (r.moduleKey !== activeModule) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.docNumber.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.partyName.toLowerCase().includes(q) ||
        r.categoryOrDept.toLowerCase().includes(q)
      );
    });
    if (sortBy === 'amount_desc') return [...list].sort((a, b) => b.amount - a.amount);
    if (sortBy === 'amount_asc') return [...list].sort((a, b) => a.amount - b.amount);
    return list;
  }, [records, activeModule, searchQuery, statusFilter, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil((activeModule === 'stock' ? filteredInventory.length : filteredRecords.length) / pageSize)
  );
  const pagedInventory = filteredInventory.slice((page - 1) * pageSize, page * pageSize);
  const pagedRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);

  // Save Company Registration
  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await requireAuthAction();
    if (!token) return;

    setSavingCompany(true);
    try {
      const res = await fetch('/api/erp/company', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyName: companyForm.companyName,
          companyNameEn: companyForm.companyNameEn,
          taxId: companyForm.taxId,
          branchName: companyForm.branchName,
          address: companyForm.address,
          phone: companyForm.phone,
          email: companyForm.email,
          website: companyForm.website,
          vatRate: Number(companyForm.vatRate),
          whtRate: Number(companyForm.whtRate),
          prefixConfig: companyForm.prefixes,
          bankInfo: {
            bankName: companyForm.bankName,
            accountNo: companyForm.accountNo,
            accountName: companyForm.accountName || companyForm.companyName,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast({ type: 'error', title: data.error || 'บันทึกข้อมูลบริษัทไม่สำเร็จ' });
        return;
      }
      setCompany(data);
      showToast({
        type: 'success',
        title: 'ลงทะเบียนและอัปเดตข้อมูลบริษัทสำเร็จ',
        description: 'หัวเอกสารใบเสร็จ ใบกำกับภาษี ใบเสนอราคา และสลิปเงินเดือนอัปเดตแล้ว',
      });
      await loadWorkspace();
    } catch {
      showToast({ type: 'error', title: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลบริษัท' });
    } finally {
      setSavingCompany(false);
    }
  };

  // Upload Company Logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = await requireAuthAction();
    if (!token) return;

    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append('logo', file);
      const res = await fetch('/api/erp/company/logo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (handleQuotaLimitResponse(res, data)) return;
      if (!res.ok) {
        showToast({ type: 'error', title: data.error || 'อัปโหลดโลโก้ไม่สำเร็จ' });
        return;
      }
      setCompany(data.company);
      showToast({
        type: 'success',
        title: 'อัปโหลดโลโก้บริษัทเรียบร้อยแล้ว',
        description: 'โลโก้จะแสดงบนหัวใบเสร็จ ใบกำกับภาษี และสลิปเงินเดือนทั้งหมดอัตโนมัติ',
      });
      await loadWorkspace();
    } catch {
      showToast({ type: 'error', title: 'ไม่สามารถอัปโหลดโลโก้ได้' });
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  // Save Stock Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await requireAuthAction();
    if (!token) return;

    const url = editingProduct
      ? `/api/erp/inventory/products/${editingProduct.id}`
      : '/api/erp/inventory/products';
    const method = editingProduct ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sku: productForm.sku,
        barcode: productForm.barcode,
        name: productForm.name,
        category: productForm.category,
        brand: productForm.brand,
        unit: productForm.unit,
        warehouse: productForm.warehouse,
        location: productForm.location,
        supplier: productForm.supplier,
        costPrice: Number(productForm.costPrice),
        sellPrice: Number(productForm.sellPrice),
        stockQty: Number(productForm.stockQty),
        minStock: Number(productForm.minStock),
        reorderPoint: Number(productForm.reorderPoint),
      }),
    });

    const data = await res.json();
    if (handleQuotaLimitResponse(res, data)) return;
    if (!res.ok) {
      showToast({ type: 'error', title: data.error || 'บันทึกสินค้าไม่สำเร็จ' });
      return;
    }

    setProductModalOpen(false);
    setEditingProduct(null);
    showToast({ type: 'success', title: editingProduct ? 'แก้ไขสินค้าแล้ว' : 'เพิ่มสินค้าใหม่เข้าคลังแล้ว' });
    await loadWorkspace();
  };

  const handleDeleteProduct = async (id: number) => {
    const token = await requireAuthAction();
    if (!token) return;
    const res = await fetch(`/api/erp/inventory/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      showToast({ type: 'info', title: 'ลบสินค้าออกจากคลังแล้ว' });
      await loadWorkspace();
    }
  };

  // Stock Movement
  const handleSubmitMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await requireAuthAction();
    if (!token) return;

    const res = await fetch('/api/erp/inventory/movements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId: movementForm.productId,
        type: movementForm.type,
        qty: Number(movementForm.qty),
        unitCost: movementForm.unitCost ? Number(movementForm.unitCost) : undefined,
        warehouseTo: movementForm.warehouseTo,
        referenceNo: movementForm.referenceNo,
        note: movementForm.note,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      showToast({ type: 'error', title: data.error || 'บันทึก Stock Movement ไม่สำเร็จ' });
      return;
    }
    setMovementModalOpen(false);
    showToast({ type: 'success', title: `บันทึก ${movementForm.type} สำเร็จ` });
    await loadWorkspace();
  };

  // POS Cart Helpers & Checkout
  const addToPosCart = (prod: ErpStockProduct) => {
    if (prod.stockQty <= 0) {
      showToast({ type: 'error', title: `สินค้า "${prod.name}" หมดสต๊อก` });
      return;
    }
    setPosCart((prev) => {
      const existing = prev.find((i) => i.product.id === prod.id);
      if (existing) {
        if (existing.qty + 1 > prod.stockQty) {
          showToast({ type: 'info', title: 'จำนวนเกินสต๊อกคงเหลือ' });
          return prev;
        }
        return prev.map((i) => (i.product.id === prod.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { product: prod, qty: 1 }];
    });
  };

  const posTotals = useMemo(() => {
    const subtotal = posCart.reduce((s, item) => s + item.product.sellPrice * item.qty, 0);
    const discount = Math.max(0, Number(posDiscount || 0));
    const afterDiscount = Math.max(0, subtotal - discount);
    const vatRate = company?.vatRate ?? 7;
    const vat = posIncludeVat ? Number(((afterDiscount * vatRate) / 100).toFixed(2)) : 0;
    const grandTotal = Number((afterDiscount + vat).toFixed(2));
    return { subtotal, discount, vat, grandTotal };
  }, [posCart, posDiscount, posIncludeVat, company?.vatRate]);

  const handlePosCheckout = async () => {
    if (posCart.length === 0) return;
    const token = await requireAuthAction();
    if (!token) return;

    setPosSubmitting(true);
    try {
      const res = await fetch('/api/erp/pos/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: posCart.map((i) => ({ productId: i.product.id, qty: i.qty })),
          discount: posTotals.discount,
          includeVat: posIncludeVat,
          paymentMethod: posPaymentMethod,
          customerName: posCustomer,
        }),
      });
      const data = await res.json();
      if (handleQuotaLimitResponse(res, data)) return;
      if (!res.ok) {
        showToast({ type: 'error', title: data.error || 'ชำระเงิน POS ไม่สำเร็จ' });
        return;
      }
      setPosCart([]);
      setPosDiscount('0');
      showToast({
        type: 'success',
        title: `ปิดบิล ${data.posRecord.docNumber} สำเร็จ!`,
        description: 'ตัดสต๊อกสินค้าและบันทึกรายรับลงบัญชีเรียบร้อยแล้ว',
      });
      await loadWorkspace();
      setPrintModalRecord({ record: data.posRecord, format: 'thermal80' });
    } catch {
      showToast({ type: 'error', title: 'เกิดข้อผิดพลาดในการปิดบิล POS' });
    } finally {
      setPosSubmitting(false);
    }
  };

  // Generic Module Record CRUD
  const openCreateRecordModal = () => {
    setEditingRecord(null);
    setRecordForm({
      title: '',
      partyName: '',
      categoryOrDept: currentModuleMeta.categoryOptions[0] || '',
      status: currentModuleMeta.statusOptions[0] || 'active',
      amount: activeModule === 'hr_payroll' ? '26750' : '0',
      qty: '1',
      dateStr: new Date().toISOString().slice(0, 10),
      dueDateStr: '',
      extraSku: inventory[0]?.sku || '',
      baseSalary: '25000',
      otPay: '1500',
      allowance: '1000',
      ngQty: '0',
    });
    setRecordModalOpen(true);
  };

  const openEditRecordModal = (rec: ErpRecordDoc) => {
    let parsed: Record<string, any> = {};
    try {
      parsed = JSON.parse(rec.payloadJson || '{}');
    } catch {
      parsed = {};
    }
    setEditingRecord(rec);
    setRecordForm({
      title: rec.title,
      partyName: rec.partyName,
      categoryOrDept: rec.categoryOrDept,
      status: rec.status,
      amount: String(rec.amount),
      qty: String(rec.qty),
      dateStr: rec.dateStr,
      dueDateStr: rec.dueDateStr || '',
      extraSku: String(parsed.sku || ''),
      baseSalary: String(parsed.baseSalary || rec.amount),
      otPay: String(parsed.otPay || 0),
      allowance: String(parsed.allowance || 0),
      ngQty: String(parsed.ngQty || 0),
    });
    setRecordModalOpen(true);
  };

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await requireAuthAction();
    if (!token) return;

    const payload: Record<string, any> = {};
    let calculatedAmount = Number(recordForm.amount || 0);

    if (activeModule === 'hr_payroll') {
      const base = Number(recordForm.baseSalary || 0);
      const allowance = Number(recordForm.allowance || 0);
      const ot = Number(recordForm.otPay || 0);
      const sso = Math.min(750, Math.round(base * 0.05));
      const netPay = base + allowance + ot - sso;
      calculatedAmount = netPay;
      Object.assign(payload, { baseSalary: base, allowance, otPay: ot, sso, tax: 0, pvd: 0, netPay });
    } else if (activeModule === 'purchasing' && recordForm.extraSku) {
      payload.sku = recordForm.extraSku;
    } else if (activeModule === 'manufacturing') {
      payload.ngQty = Number(recordForm.ngQty || 0);
      payload.planQty = Number(recordForm.amount || 0);
      payload.goodQty = Number(recordForm.qty || 0);
    }

    const url = editingRecord
      ? `/api/erp/records/${activeModule}/${editingRecord.id}`
      : `/api/erp/records/${activeModule}`;
    const method = editingRecord ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: recordForm.title,
        partyName: recordForm.partyName || '-',
        categoryOrDept: recordForm.categoryOrDept || '-',
        status: recordForm.status || 'active',
        amount: calculatedAmount,
        qty: Number(recordForm.qty || 1),
        dateStr: recordForm.dateStr,
        dueDateStr: recordForm.dueDateStr || null,
        payload,
      }),
    });

    const data = await res.json();
    if (handleQuotaLimitResponse(res, data)) return;
    if (!res.ok) {
      showToast({ type: 'error', title: data.error || 'บันทึกรายการไม่สำเร็จ' });
      return;
    }

    setRecordModalOpen(false);
    setEditingRecord(null);
    showToast({ type: 'success', title: editingRecord ? 'อัปเดตรายการแล้ว' : 'บันทึกรายการใหม่แล้ว' });
    await loadWorkspace();
  };

  const handleQuickStatus = async (rec: ErpRecordDoc, nextStatus: string) => {
    const token = await requireAuthAction();
    if (!token) return;
    const res = await fetch(`/api/erp/records/${rec.moduleKey}/${rec.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) {
      showToast({
        type: 'success',
        title: `อัปเดต ${rec.docNumber} เป็น "${nextStatus}" แล้ว`,
      });
      await loadWorkspace();
    }
  };

  const handleDeleteRecord = async (rec: ErpRecordDoc) => {
    const token = await requireAuthAction();
    if (!token) return;
    const res = await fetch(`/api/erp/records/${rec.moduleKey}/${rec.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      showToast({ type: 'info', title: `ลบรายการ ${rec.docNumber} แล้ว` });
      await loadWorkspace();
    }
  };

  // Protected Export / Backup
  const handleExport = async (type: 'xlsx' | 'csv' | 'backup') => {
    const token = await requireAuthAction();
    if (!token) return;
    const url =
      type === 'backup'
        ? '/api/erp/backup'
        : `/api/erp/export/${type}?module=${encodeURIComponent(activeModule)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      showToast({ type: 'error', title: 'ไม่สามารถดาวน์โหลดไฟล์ได้' });
      return;
    }
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objUrl;
    a.download =
      type === 'backup'
        ? `kodraewjob-erp-backup.json`
        : `erp-${activeModule}.${type}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objUrl);
  };

  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = await requireAuthAction();
    if (!token) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const res = await fetch('/api/erp/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(json),
      });
      const data = await res.json();
      if (handleQuotaLimitResponse(res, data)) return;
      if (!res.ok) {
        showToast({ type: 'error', title: data.error || 'กู้คืนข้อมูลไม่สำเร็จ' });
        return;
      }
      showToast({ type: 'success', title: 'กู้คืนฐานข้อมูลจากไฟล์ Backup สำเร็จ' });
      await loadWorkspace();
    } catch {
      showToast({ type: 'error', title: 'ไฟล์ Backup JSON ไม่ถูกต้อง' });
    } finally {
      e.target.value = '';
    }
  };

  const renderSidebarList = () => {
    const groups: Array<{ id: ErpModuleMeta['group']; label: string }> = [
      { id: 'overview', label: 'Executive & BI' },
      { id: 'core', label: 'คลังสินค้า · POS · บัญชี · การค้า' },
      { id: 'hr', label: 'บุคลากร & เงินเดือน (HR)' },
      { id: 'operations', label: 'โรงงาน · ขนส่ง · อุตสาหกรรม' },
      { id: 'admin', label: 'ตั้งค่าองค์กร SaaS & SQL' },
    ];
    return (
      <div className="space-y-5">
        {groups.map((grp) => (
          <div key={grp.id}>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1.5">
              {grp.label}
            </p>
            <div className="space-y-0.5">
              {ERP_MODULES.filter((m) => m.group === grp.id).map((m) => {
                const active = activeModule === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => {
                      setActiveModule(m.key);
                      setSidebarOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 transition-colors ${
                      active
                        ? 'bg-orange-500 text-white font-semibold shadow-sm'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-orange-100/70 dark:hover:bg-[#2A201B]'
                    }`}
                  >
                    <span
                      className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
                        active
                          ? 'bg-white/20 text-white'
                          : 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300'
                      }`}
                    >
                      {m.numberLabel}
                    </span>
                    <span className="truncate">{m.shortTitle}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FFF7ED] dark:bg-[#14100E]">
      {/* Top SaaS AdminLTE-style Workspace Bar */}
      <div className="border-b border-orange-200/80 dark:border-orange-900/40 bg-white/95 dark:bg-[#1F1815]/95 backdrop-blur-sm sticky top-14 sm:top-16 z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="เปิดเมนู 20 ระบบ ERP"
              className="lg:hidden p-2 rounded-xl bg-orange-50 dark:bg-[#2A201B] text-orange-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            {company?.logoUrl && (
              <img
                src={company.logoUrl}
                alt={company.companyName}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-xl object-contain border border-orange-200 dark:border-orange-900/50 bg-white p-0.5 shrink-0"
              />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-sm sm:text-base text-[#1E1B18] dark:text-orange-50 truncate">
                  {company?.companyName || 'Kodraewjob All-in-One Business ERP'}
                </h1>
                <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 shrink-0">
                  {isDemo ? 'โหมดตัวอย่าง 20 ระบบ' : 'SaaS Workspace'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                20 ระบบบริหารธุรกิจครบวงจร · Tax ID: {company?.taxId || '-'} · VAT{' '}
                {company?.vatRate ?? 7}%
              </p>
            </div>
          </div>

          {/* Global Search across all 20 systems */}
          <div className="relative flex-1 max-w-md min-w-[220px]">
            <Search className="w-4 h-4 text-orange-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="ค้นหาด่วนทุกโมดูล (SKU, บาร์โค้ด, เลขที่เอกสาร, ชื่อลูกค้า)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 text-xs sm:text-sm focus:outline-none focus:border-orange-500"
            />
            {globalSearch.trim() && (
              <div className="absolute left-0 right-0 mt-1.5 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/50 shadow-xl p-3 z-50 max-h-80 overflow-y-auto space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                  <span>ผลการค้นหาทุกโมดูล</span>
                  <button type="button" onClick={() => setGlobalSearch('')} className="text-orange-600">
                    ปิด
                  </button>
                </div>
                {globalMatches.products.map((p) => (
                  <button
                    key={`gp-${p.id}`}
                    type="button"
                    onClick={() => {
                      setActiveModule('stock');
                      setSearchQuery(p.sku);
                      setGlobalSearch('');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-orange-50 dark:hover:bg-[#2A201B] text-xs flex justify-between"
                  >
                    <span className="font-semibold">
                      [คลัง] {p.sku} · {p.name}
                    </span>
                    <span className="tabular-nums text-orange-600">
                      {p.stockQty} {p.unit}
                    </span>
                  </button>
                ))}
                {globalMatches.records.map((r) => (
                  <button
                    key={`gr-${r.id}`}
                    type="button"
                    onClick={() => {
                      setActiveModule(r.moduleKey);
                      setSearchQuery(r.docNumber);
                      setGlobalSearch('');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-orange-50 dark:hover:bg-[#2A201B] text-xs flex justify-between"
                  >
                    <span className="truncate">
                      [{r.moduleKey}] {r.docNumber} · {r.title}
                    </span>
                    <span className="tabular-nums font-semibold shrink-0 ml-2">
                      ฿{r.amount.toLocaleString()}
                    </span>
                  </button>
                ))}
                {globalMatches.products.length === 0 && globalMatches.records.length === 0 && (
                  <p className="text-xs text-stone-400 text-center py-2">ไม่พบข้อมูลที่ตรงกัน</p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveModule('company_settings')}
              className="px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <Building2 className="w-3.5 h-3.5" />
              ลงทะเบียนบริษัท / โลโก้
            </button>
            <a
              href="/api/erp/export/mysql-sql"
              className="px-3 py-2 rounded-xl bg-[#1E1B18] hover:bg-stone-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <Database className="w-3.5 h-3.5 text-orange-400" />
              โหลด MySQL (.sql)
            </a>
          </div>
        </div>
      </div>

      {/* Main AdminLTE Layout: Sidebar + Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 xl:col-span-2">
          <div className="sticky top-36 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-3.5 soft-card max-h-[calc(100vh-10rem)] overflow-y-auto">
            {renderSidebarList()}
          </div>
        </aside>

        {/* Mobile Sidebar Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden bg-black/60 backdrop-blur-sm flex">
            <div className="w-80 max-w-full bg-white dark:bg-[#1F1815] h-full p-5 overflow-y-auto">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-orange-200/70 dark:border-orange-900/40">
                <span className="font-display font-bold text-base">20 ระบบ SaaS ERP</span>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="ปิดเมนู"
                  className="p-1.5 rounded-lg text-stone-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {renderSidebarList()}
            </div>
          </div>
        )}

        {/* Active Module Workspace */}
        <div className="lg:col-span-9 xl:col-span-10 space-y-6">
          {/* Subscription & Quota Status Bar */}
          {usage && (
            <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-4 sm:p-5 soft-card space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Crown className="w-5 h-5 text-orange-500 shrink-0" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-bold text-sm sm:text-base text-[#1E1B18] dark:text-orange-50">
                        แพ็กเกจ: {usage.packageName}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          usage.isExpired
                            ? 'text-rose-600'
                            : usage.status === 'Expiring Soon'
                              ? 'text-amber-600'
                              : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        · สถานะ {usage.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 tabular-nums">
                      {usage.isExpired
                        ? 'แพ็กเกจหมดอายุแล้ว — กรุณาเลือกแพ็กเกจและชำระเงินเพื่อใช้งานต่อ'
                        : `ใช้งานได้ถึง ${new Date(usage.expiresAt).toLocaleDateString('th-TH')} (เหลืออีก ${usage.daysRemaining} วัน)`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setUpgradeReason(null);
                    setUpgradeModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Crown className="w-3.5 h-3.5" />
                  อัปเกรดแพ็กเกจ (Upgrade)
                </button>
              </div>

              {/* Expiry Alert Banner (7 / 3 / 1 / 0 Days) */}
              {usage.expiryAlert && !isDemo && (
                <div
                  className={`rounded-xl px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 ${
                    usage.expiryAlert === 'expired' || usage.expiryAlert === '1d'
                      ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                      : 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                  }`}
                >
                  <span className="inline-flex items-center gap-2 font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {usage.expiryAlert === 'expired'
                      ? 'แพ็กเกจทดลอง/สมาชิกของคุณหมดอายุแล้ว ระบบจำกัดการเพิ่มข้อมูลใหม่จนกว่าจะต่ออายุ'
                      : `แจ้งเตือนล่วงหน้า: แพ็กเกจของคุณจะหมดอายุภายใน ${usage.daysRemaining} วัน กรุณาอัปเกรดเพื่อใช้งานต่อเนื่อง`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setUpgradeModalOpen(true)}
                    className="font-bold underline"
                  >
                    เลือกแพ็กเกจตอนนี้ →
                  </button>
                </div>
              )}

              {/* 3 Live Quota Meters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 tabular-nums">
                {/* Records Quota */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-600 dark:text-stone-300">
                      Data Records (รายการข้อมูล)
                    </span>
                    <span className="font-bold">
                      {usage.recordsUsed.toLocaleString()} /{' '}
                      {usage.recordsLimit === -1 ? 'Unlimited' : usage.recordsLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-orange-100 dark:bg-[#2A201B] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        usage.recordsLimit !== -1 && usage.recordsPct >= 95
                          ? 'bg-rose-500'
                          : usage.recordsLimit !== -1 && usage.recordsPct >= 80
                            ? 'bg-amber-500'
                            : 'bg-orange-500'
                      }`}
                      style={{ width: `${usage.recordsLimit === -1 ? 15 : Math.max(4, usage.recordsPct)}%` }}
                    />
                  </div>
                </div>

                {/* Storage Quota */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-600 dark:text-stone-300 inline-flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5 text-orange-500" />
                      Storage ({usage.storagePct}%)
                      {usage.storageHealth === 'warning' && (
                        <span className="text-amber-600 font-bold">· ใกล้เต็ม</span>
                      )}
                      {usage.storageHealth === 'critical' && (
                        <span className="text-rose-600 font-bold">· วิกฤต</span>
                      )}
                      {usage.storageHealth === 'blocked' && (
                        <span className="text-rose-700 font-bold">· เต็ม 100%</span>
                      )}
                    </span>
                    <span className="font-bold">
                      {usage.storageUsedMb} /{' '}
                      {usage.storageLimitMb === -1 ? 'Unlimited' : `${usage.storageLimitMb} MB`}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-orange-100 dark:bg-[#2A201B] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        usage.storageHealth === 'blocked' || usage.storageHealth === 'critical'
                          ? 'bg-rose-500'
                          : usage.storageHealth === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                      }`}
                      style={{ width: `${usage.storageLimitMb === -1 ? 10 : Math.max(4, usage.storagePct)}%` }}
                    />
                  </div>
                </div>

                {/* Users Quota */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-600 dark:text-stone-300 inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-orange-500" />
                      User Accounts (ผู้ใช้งาน)
                    </span>
                    <span className="font-bold">
                      {usage.usersUsed} / {usage.usersLimit === -1 ? 'Unlimited' : usage.usersLimit}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-orange-100 dark:bg-[#2A201B] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        usage.usersLimit !== -1 && usage.usersUsed >= usage.usersLimit
                          ? 'bg-amber-500'
                          : 'bg-sky-500'
                      }`}
                      style={{ width: `${usage.usersLimit === -1 ? 20 : Math.max(8, usage.usersPct)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Breadcrumb & Module Header */}
          <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 sm:p-6 soft-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mb-1">
                <button type="button" onClick={() => navigate('/')} className="hover:text-orange-600">
                  กดแล้วจบ
                </button>
                <ChevronRight className="w-3.5 h-3.5" />
                <button
                  type="button"
                  onClick={() => setActiveModule('bi_dashboard')}
                  className="hover:text-orange-600"
                >
                  Web App ERP (20 ระบบ)
                </button>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-orange-600 font-semibold">{currentModuleMeta.shortTitle}</span>
              </div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-[#1E1B18] dark:text-orange-50">
                {currentModuleMeta.title}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
                {currentModuleMeta.description}
              </p>
            </div>

            {isDemo && (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-orange-100 dark:bg-orange-950/60 border border-orange-300 dark:border-orange-800 text-orange-800 dark:text-orange-200 text-xs font-bold whitespace-nowrap shrink-0"
              >
                เข้าสู่ระบบ Gmail เพื่อรับสิทธิ์ทดลองฟรี 30 วัน &amp; บันทึกข้อมูลจริง
              </button>
            )}
          </div>

          {loading ? (
            <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-12 text-center soft-card">
              <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
              <p className="text-sm text-stone-600 dark:text-stone-300">กำลังเชื่อมต่อข้อมูล SaaS ERP...</p>
            </div>
          ) : activeModule === 'bi_dashboard' ? (
            /* ==================== 00: MASTER BI DASHBOARD ==================== */
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card">
                  <p className="text-xs text-stone-500 dark:text-stone-400">รายได้รวม &amp; ยอดขาย</p>
                  <p className="font-display font-bold text-2xl sm:text-3xl text-[#1E1B18] dark:text-orange-50 mt-1 tabular-nums">
                    ฿{dashboardStats.totalRevenue.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                    กระแสเงินสดสุทธิ: ฿{dashboardStats.netCashflow.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card">
                  <p className="text-xs text-stone-500 dark:text-stone-400">มูลค่าคลังสินค้า (Stock Value)</p>
                  <p className="font-display font-bold text-2xl sm:text-3xl text-orange-600 dark:text-orange-400 mt-1 tabular-nums">
                    ฿{dashboardStats.inventoryValue.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-stone-500 mt-1 tabular-nums">
                    สินค้าในระบบ {inventory.length} SKU
                  </p>
                </div>

                <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card">
                  <p className="text-xs text-stone-500 dark:text-stone-400">จุดสั่งซื้อซ้ำ (Low Stock Alert)</p>
                  <p className="font-display font-bold text-2xl sm:text-3xl text-rose-600 dark:text-rose-400 mt-1 tabular-nums">
                    {dashboardStats.lowStockItems.length} รายการ
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModule('stock');
                      setStatusFilter('low_stock');
                    }}
                    className="text-xs text-orange-600 hover:underline mt-1"
                  >
                    ตรวจสอบสต๊อกใกล้หมด →
                  </button>
                </div>

                <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card">
                  <p className="text-xs text-stone-500 dark:text-stone-400">ประสิทธิภาพผลิต (MES Yield)</p>
                  <p className="font-display font-bold text-2xl sm:text-3xl text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                    {dashboardStats.avgYield}%
                  </p>
                  <p className="text-xs text-stone-500 mt-1 tabular-nums">
                    เอกสารรออนุมัติ {dashboardStats.pendingApprovals} รายการ
                  </p>
                </div>
              </div>

              {/* Financial Overview & Quick Launch Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-base flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-orange-500" />
                      สรุปมูลค่าตามระบบธุรกิจ (Live Cloud SQL)
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveModule('pos')}
                      className="text-xs font-semibold text-orange-600 hover:underline"
                    >
                      เปิดหน้า POS ขายหน้าร้าน →
                    </button>
                  </div>
                  <div className="space-y-3 pt-2">
                    {[
                      {
                        label: 'รายรับรวม (Accounting Income)',
                        val: dashboardStats.accIncome,
                        color: 'bg-emerald-500',
                      },
                      {
                        label: 'รายจ่ายรวม (Expenses & Payroll)',
                        val: dashboardStats.accExpense,
                        color: 'bg-rose-500',
                      },
                      {
                        label: 'มูลค่าสต๊อกคงคลัง (Inventory)',
                        val: dashboardStats.inventoryValue,
                        color: 'bg-orange-500',
                      },
                      {
                        label: 'เอกสารขาย/ลูกหนี้ (Sales & AR)',
                        val: records
                          .filter((r) => r.moduleKey === 'sales_docs')
                          .reduce((s, r) => s + r.amount, 0),
                        color: 'bg-amber-500',
                      },
                    ].map((bar) => {
                      const maxVal = Math.max(
                        1,
                        dashboardStats.accIncome,
                        dashboardStats.inventoryValue,
                        dashboardStats.accExpense
                      );
                      const pct = Math.min(100, Math.max(8, Math.round((bar.val / maxVal) * 100)));
                      return (
                        <div key={bar.label} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span>{bar.label}</span>
                            <span className="tabular-nums font-bold">
                              ฿{bar.val.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                          <div className="h-2.5 rounded-full bg-orange-100 dark:bg-[#2A201B] overflow-hidden">
                            <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-base flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-500" />
                      แจ้งเตือนสินค้าต่ำกว่าจุดสั่งซื้อ
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveModule('purchasing')}
                      className="text-xs font-semibold text-orange-600 hover:underline"
                    >
                      เปิดใบ PO →
                    </button>
                  </div>
                  {dashboardStats.lowStockItems.length === 0 ? (
                    <p className="text-sm text-emerald-600 py-6 text-center">
                      สินค้าทุกรายการอยู่ในเกณฑ์สต๊อกปกติ
                    </p>
                  ) : (
                    <div className="divide-y divide-orange-100 dark:divide-orange-900/30">
                      {dashboardStats.lowStockItems.map((item) => (
                        <div key={item.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{item.name}</p>
                            <p className="text-stone-500 font-mono">
                              {item.sku} · Reorder: {item.reorderPoint} {item.unit}
                            </p>
                          </div>
                          <span className="font-bold tabular-nums text-rose-600 shrink-0">
                            เหลือ {item.stockQty} {item.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 20 Systems Quick Directory */}
              <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card">
                <h3 className="font-display font-bold text-base mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-orange-500" />
                  เข้าถึงทุกโมดูลในชุด 20 ระบบธุรกิจ SaaS ERP
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {ERP_MODULES.filter((m) => m.key !== 'bi_dashboard').map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setActiveModule(m.key)}
                      className="text-left p-3.5 rounded-xl border border-orange-200/80 dark:border-orange-900/40 hover:border-orange-500 hover:bg-orange-50/70 dark:hover:bg-[#2A201B] transition-all"
                    >
                      <span className="font-mono text-[11px] font-bold text-orange-600">
                        ระบบ #{m.numberLabel}
                      </span>
                      <p className="font-display font-bold text-xs sm:text-sm mt-1 truncate">
                        {m.shortTitle}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : activeModule === 'company_settings' ? (
            /* ==================== 20: COMPANY REGISTRATION, LOGO & ADMIN ==================== */
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Logo Upload & Live Document Header Preview */}
                <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card space-y-5">
                  <h3 className="font-display font-bold text-lg flex items-center gap-2">
                    <ImagePlus className="w-5 h-5 text-orange-500" />
                    โลโก้บริษัท &amp; ตัวอย่างหัวเอกสารจริง
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-orange-300 dark:border-orange-800 bg-white flex items-center justify-center overflow-hidden p-1.5 shrink-0">
                      {company?.logoUrl ? (
                        <img
                          src={company.logoUrl}
                          alt="Company Logo"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Building2 className="w-8 h-8 text-orange-300" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold cursor-pointer">
                        <Upload className="w-4 h-4" />
                        {uploadingLogo ? 'กำลังอัปโหลด...' : 'อัปโหลดโลโก้บริษัท (PNG/JPG)'}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-stone-500">
                        แสดงทันทีบนหัวใบกำกับภาษี ใบแจ้งหนี้ ใบเสร็จรับเงิน ใบสั่งซื้อ และสลิปเงินเดือน
                      </p>
                    </div>
                  </div>

                  {/* Mini Live Document Header Preview */}
                  <div className="rounded-xl border border-stone-200 bg-white text-stone-900 p-4 space-y-2">
                    <p className="text-[10px] font-bold uppercase text-orange-600">
                      ตัวอย่างหัวใบกำกับภาษี / ใบเสร็จ / สลิป
                    </p>
                    <div className="flex items-start gap-3 border-t border-stone-200 pt-2">
                      {company?.logoUrl && (
                        <img
                          src={company.logoUrl}
                          alt="Preview"
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 object-contain rounded border border-stone-200"
                        />
                      )}
                      <div className="text-[11px] leading-snug">
                        <p className="font-bold text-xs">{companyForm.companyName || 'ชื่อบริษัท'}</p>
                        <p className="text-stone-600">{companyForm.address}</p>
                        <p className="font-mono text-stone-600">
                          TAX ID: {companyForm.taxId} ({companyForm.branchName}) · โทร {companyForm.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Backup, Restore & MySQL Export */}
                  <div className="pt-3 border-t border-orange-100 dark:border-orange-900/40 space-y-3">
                    <h4 className="font-display font-bold text-sm">สำรองข้อมูล &amp; สคริปต์ฐานข้อมูล</h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleExport('backup')}
                        className="px-3.5 py-2 rounded-xl bg-[#1E1B18] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5 text-orange-400" />
                        Backup JSON
                      </button>
                      <label className="px-3.5 py-2 rounded-xl border border-orange-300 dark:border-orange-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer hover:bg-orange-50 dark:hover:bg-[#2A201B]">
                        <Upload className="w-3.5 h-3.5 text-orange-500" />
                        Restore JSON
                        <input
                          type="file"
                          accept="application/json"
                          onChange={handleRestoreBackup}
                          className="hidden"
                        />
                      </label>
                      <a
                        href="/api/erp/export/mysql-sql"
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <Database className="w-3.5 h-3.5" />
                        ดาวน์โหลด database.sql (MySQL)
                      </a>
                    </div>
                  </div>
                </div>

                {/* Company Registration Form */}
                <form
                  onSubmit={handleSaveCompany}
                  className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card space-y-4"
                >
                  <h3 className="font-display font-bold text-lg">
                    ข้อมูลนิติบุคคล &amp; รันเลขเอกสารอัตโนมัติ (SaaS Company Registration)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                    <div>
                      <label className="block font-semibold mb-1 text-xs">ชื่อบริษัท (ภาษาไทย) *</label>
                      <input
                        type="text"
                        required
                        value={companyForm.companyName}
                        onChange={(e) => setCompanyForm((f) => ({ ...f, companyName: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-xs">Company Name (EN)</label>
                      <input
                        type="text"
                        value={companyForm.companyNameEn}
                        onChange={(e) => setCompanyForm((f) => ({ ...f, companyNameEn: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-xs">เลขประจำตัวผู้เสียภาษี (Tax ID) *</label>
                      <input
                        type="text"
                        required
                        value={companyForm.taxId}
                        onChange={(e) => setCompanyForm((f) => ({ ...f, taxId: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-xs">สาขา</label>
                      <input
                        type="text"
                        value={companyForm.branchName}
                        onChange={(e) => setCompanyForm((f) => ({ ...f, branchName: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-semibold mb-1 text-xs">ที่อยู่ออกใบกำกับภาษี *</label>
                      <textarea
                        rows={2}
                        required
                        value={companyForm.address}
                        onChange={(e) => setCompanyForm((f) => ({ ...f, address: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-xs">เบอร์โทรศัพท์</label>
                      <input
                        type="text"
                        value={companyForm.phone}
                        onChange={(e) => setCompanyForm((f) => ({ ...f, phone: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-xs">อีเมลองค์กร</label>
                      <input
                        type="email"
                        value={companyForm.email}
                        onChange={(e) => setCompanyForm((f) => ({ ...f, email: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-xs">อัตรา VAT (%)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={companyForm.vatRate}
                        onChange={(e) => setCompanyForm((f) => ({ ...f, vatRate: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-xs">อัตราหัก ณ ที่จ่าย WHT (%)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={companyForm.whtRate}
                        onChange={(e) => setCompanyForm((f) => ({ ...f, whtRate: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-xs">ธนาคารรับโอน (แสดงท้ายใบแจ้งหนี้)</label>
                      <input
                        type="text"
                        value={companyForm.bankName}
                        onChange={(e) => setCompanyForm((f) => ({ ...f, bankName: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-xs">เลขที่บัญชีธนาคาร</label>
                      <input
                        type="text"
                        value={companyForm.accountNo}
                        onChange={(e) => setCompanyForm((f) => ({ ...f, accountNo: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 font-mono"
                      />
                    </div>
                  </div>

                  {/* Running Number Prefixes */}
                  <div className="pt-2">
                    <p className="text-xs font-bold mb-2">คำนำหน้าเลขที่เอกสาร (Document Running Prefix)</p>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      {Object.entries(companyForm.prefixes).map(([k, val]) => (
                        <div key={k}>
                          <label className="block text-[10px] font-mono text-stone-500 mb-0.5">{k}</label>
                          <input
                            type="text"
                            value={val}
                            onChange={(e) =>
                              setCompanyForm((f) => ({
                                ...f,
                                prefixes: { ...f.prefixes, [k]: e.target.value },
                              }))
                            }
                            className="w-full px-2 py-1.5 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 font-mono text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingCompany}
                    className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold"
                  >
                    {savingCompany ? 'กำลังบันทึก...' : 'บันทึกข้อมูลบริษัท & อัปเดตหัวเอกสารทั้งหมด'}
                  </button>
                </form>
              </div>

              {/* Multi-User & Role Management (Enforces User Limit) */}
              <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display font-bold text-lg flex items-center gap-2">
                      <Users className="w-5 h-5 text-orange-500" />
                      จัดการผู้ใช้งานในบริษัท &amp; สิทธิ์แผนก (Multi-User &amp; Role Management)
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5 tabular-nums">
                      ใช้งานอยู่ {usage?.usersUsed ?? team.length} /{' '}
                      {usage?.usersLimit === -1 ? 'Unlimited' : usage?.usersLimit ?? 1} บัญชีตามแพ็กเกจ{' '}
                      {usage?.packageName || 'Free Trial'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUpgradeModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl border border-orange-300 dark:border-orange-800 text-xs font-bold text-orange-600 hover:bg-orange-50 dark:hover:bg-[#2A201B]"
                  >
                    เพิ่มสิทธิ์ User Limit
                  </button>
                </div>

                <form
                  onSubmit={handleAddTeamMember}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end text-xs sm:text-sm"
                >
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold mb-1">ชื่อผู้ใช้งาน *</label>
                    <input
                      type="text"
                      required
                      value={newTeamMember.memberName}
                      onChange={(e) =>
                        setNewTeamMember((m) => ({ ...m, memberName: e.target.value }))
                      }
                      placeholder="เช่น สมชาย (ฝ่ายขาย)"
                      className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold mb-1">อีเมลพนักงาน *</label>
                    <input
                      type="email"
                      required
                      value={newTeamMember.memberEmail}
                      onChange={(e) =>
                        setNewTeamMember((m) => ({ ...m, memberEmail: e.target.value }))
                      }
                      placeholder="staff@company.co.th"
                      className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1">บทบาท (Role)</label>
                    <select
                      value={newTeamMember.role}
                      onChange={(e) => setNewTeamMember((m) => ({ ...m, role: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50"
                    >
                      <option value="manager">Manager</option>
                      <option value="accounting">Accounting</option>
                      <option value="hr">HR / Payroll</option>
                      <option value="sales">Sales / POS</option>
                      <option value="warehouse">Warehouse</option>
                      <option value="employee">Employee</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={addingTeamMember}
                      className="w-full px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-4 h-4" />
                      {addingTeamMember ? 'กำลังเพิ่ม...' : 'เพิ่มผู้ใช้'}
                    </button>
                  </div>
                </form>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm text-left">
                    <thead>
                      <tr className="border-b border-orange-200/70 dark:border-orange-900/40 text-stone-500">
                        <th className="py-2 pr-3">ชื่อผู้ใช้งาน</th>
                        <th className="py-2 pr-3">อีเมล</th>
                        <th className="py-2 pr-3">สิทธิ์ (Role)</th>
                        <th className="py-2 pr-3">สถานะ</th>
                        <th className="py-2 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-100 dark:divide-orange-900/30">
                      {team.map((u, idx) => (
                        <tr key={u.id}>
                          <td className="py-2.5 pr-3 font-semibold">{u.memberName}</td>
                          <td className="py-2.5 pr-3 font-mono text-xs">{u.memberEmail}</td>
                          <td className="py-2.5 pr-3 font-mono text-xs uppercase text-orange-600 font-bold">
                            {u.role}
                          </td>
                          <td className="py-2.5 pr-3 text-emerald-600 font-semibold">{u.status}</td>
                          <td className="py-2.5 text-right">
                            {idx === 0 ? (
                              <span className="text-[11px] text-stone-400">เจ้าของหลัก</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRemoveTeamMember(u.id)}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Audit Logs Table */}
              <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card">
                <h3 className="font-display font-bold text-base mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-orange-500" />
                  ประวัติการใช้งานระบบ (Activity &amp; Audit Logs)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm text-left">
                    <thead>
                      <tr className="border-b border-orange-200/70 dark:border-orange-900/40 text-stone-500">
                        <th className="py-2 pr-4">เวลา</th>
                        <th className="py-2 pr-4">ผู้ดำเนินการ</th>
                        <th className="py-2 pr-4">โมดูล</th>
                        <th className="py-2 pr-4">คำสั่ง</th>
                        <th className="py-2">รายละเอียด</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-100 dark:divide-orange-900/30">
                      {auditLogs.slice(0, 20).map((log) => (
                        <tr key={log.id}>
                          <td className="py-2.5 pr-4 whitespace-nowrap text-xs text-stone-500 tabular-nums">
                            {new Date(log.createdAt).toLocaleString('th-TH')}
                          </td>
                          <td className="py-2.5 pr-4 font-semibold">{log.userName}</td>
                          <td className="py-2.5 pr-4 font-mono text-xs text-orange-600">{log.moduleKey}</td>
                          <td className="py-2.5 pr-4 font-mono text-xs">{log.action}</td>
                          <td className="py-2.5 text-stone-700 dark:text-stone-300">{log.summary}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeModule === 'stock' ? (
            /* ==================== 01: STOCK MANAGEMENT ==================== */
            <div className="space-y-6">
              {/* Action Toolbar */}
              <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-4 sm:p-5 soft-card flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 flex-1">
                  <div className="relative min-w-[200px] flex-1 max-w-xs">
                    <Search className="w-4 h-4 text-orange-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                      placeholder="ค้นหา SKU / Barcode / ชื่อสินค้า..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 text-xs sm:text-sm"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-2 rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 text-xs sm:text-sm"
                  >
                    <option value="">สินค้าทั้งหมด</option>
                    <option value="low_stock">ต่ำกว่าจุดสั่งซื้อซ้ำ (Low Stock)</option>
                    <option value="out_of_stock">สินค้าหมด (Out of Stock)</option>
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({
                        sku: `SKU-${Date.now().toString().slice(-4)}`,
                        barcode: `8859${Date.now().toString().slice(-9)}`,
                        name: '',
                        category: 'สินค้าทั่วไป',
                        brand: 'KDJ',
                        unit: 'ชิ้น',
                        warehouse: 'คลังหลัก (WH-01)',
                        location: 'A1-01',
                        supplier: 'ซัพพลายเออร์ทั่วไป',
                        costPrice: '150',
                        sellPrice: '290',
                        stockQty: '25',
                        minStock: '5',
                        reorderPoint: '10',
                      });
                      setProductModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    เพิ่มสินค้า
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMovementForm({
                        productId: inventory[0]?.id || 0,
                        type: 'IN',
                        qty: '10',
                        unitCost: '',
                        warehouseTo: 'คลังสาขา 1 (WH-02)',
                        referenceNo: '',
                        note: '',
                      });
                      setMovementModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#1E1B18] hover:bg-stone-800 text-white text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <ArrowLeftRight className="w-4 h-4 text-orange-400" />
                    รับเข้า / เบิก / โอน / ปรับสต๊อก
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport('xlsx')}
                    className="px-3 py-2 rounded-xl border border-orange-300 dark:border-orange-800 text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    Excel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport('csv')}
                    className="px-3 py-2 rounded-xl border border-orange-300 dark:border-orange-800 text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    CSV
                  </button>
                </div>
              </div>

              {/* Inventory Table */}
              <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card overflow-x-auto">
                <table className="w-full text-xs sm:text-sm text-left">
                  <thead>
                    <tr className="border-b border-orange-200/70 dark:border-orange-900/40 text-stone-500">
                      <th className="py-2.5 pr-3">SKU / Barcode</th>
                      <th className="py-2.5 pr-3">ชื่อสินค้า &amp; คลัง</th>
                      <th className="py-2.5 pr-3 text-right">ต้นทุนเฉลี่ย</th>
                      <th className="py-2.5 pr-3 text-right">ราคาขาย</th>
                      <th className="py-2.5 pr-3 text-right">คงเหลือ</th>
                      <th className="py-2.5 pr-3">สถานะสต๊อก</th>
                      <th className="py-2.5 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100 dark:divide-orange-900/30">
                    {pagedInventory.map((p) => {
                      const isOut = p.stockQty <= 0;
                      const isLow = !isOut && p.stockQty <= p.reorderPoint;
                      return (
                        <tr key={p.id}>
                          <td className="py-3 pr-3 align-top">
                            <p className="font-mono font-bold text-xs">{p.sku}</p>
                            <div className="mt-1">
                              <BarcodeSvg code={p.barcode} />
                            </div>
                          </td>
                          <td className="py-3 pr-3 align-top">
                            <p className="font-semibold text-[#1E1B18] dark:text-orange-50">{p.name}</p>
                            <p className="text-xs text-stone-500">
                              {p.category} · {p.warehouse} ({p.location})
                            </p>
                          </td>
                          <td className="py-3 pr-3 text-right tabular-nums align-top">
                            ฿{p.costPrice.toLocaleString()}
                          </td>
                          <td className="py-3 pr-3 text-right tabular-nums font-semibold align-top">
                            ฿{p.sellPrice.toLocaleString()}
                          </td>
                          <td className="py-3 pr-3 text-right tabular-nums font-bold align-top">
                            {p.stockQty.toLocaleString()} {p.unit}
                          </td>
                          <td className="py-3 pr-3 align-top">
                            {isOut ? (
                              <span className="text-xs font-bold text-rose-600">หมดสต๊อก (0)</span>
                            ) : isLow ? (
                              <span className="text-xs font-bold text-amber-600">
                                ใกล้หมด (ต่ำกว่า {p.reorderPoint})
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-emerald-600">ปกติ</span>
                            )}
                          </td>
                          <td className="py-3 text-right align-top whitespace-nowrap space-x-1">
                            <button
                              type="button"
                              onClick={() => {
                                setMovementForm({
                                  productId: p.id,
                                  type: 'IN',
                                  qty: '10',
                                  unitCost: String(p.costPrice),
                                  warehouseTo: 'คลังสาขา 1 (WH-02)',
                                  referenceNo: '',
                                  note: '',
                                });
                                setMovementModalOpen(true);
                              }}
                              title="รับเข้า / ปรับสต๊อก"
                              className="p-1.5 rounded-lg bg-orange-50 dark:bg-[#2A201B] text-orange-600 hover:bg-orange-100"
                            >
                              <ArrowLeftRight className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduct(p);
                                setProductForm({
                                  sku: p.sku,
                                  barcode: p.barcode,
                                  name: p.name,
                                  category: p.category,
                                  brand: p.brand,
                                  unit: p.unit,
                                  warehouse: p.warehouse,
                                  location: p.location,
                                  supplier: p.supplier,
                                  costPrice: String(p.costPrice),
                                  sellPrice: String(p.sellPrice),
                                  stockQty: String(p.stockQty),
                                  minStock: String(p.minStock),
                                  reorderPoint: String(p.reorderPoint),
                                });
                                setProductModalOpen(true);
                              }}
                              title="แก้ไขสินค้า"
                              className="p-1.5 rounded-lg bg-stone-100 dark:bg-[#2A201B] text-stone-700 dark:text-stone-300"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p.id)}
                              title="ลบสินค้า"
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Recent Stock Movements */}
              <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card overflow-x-auto">
                <h3 className="font-display font-bold text-base mb-3">ประวัติการเคลื่อนไหวสต๊อกล่าสุด</h3>
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-orange-200/70 dark:border-orange-900/40 text-stone-500">
                      <th className="py-2 pr-3">อ้างอิง</th>
                      <th className="py-2 pr-3">ประเภท</th>
                      <th className="py-2 pr-3 text-right">จำนวน</th>
                      <th className="py-2 pr-3 text-right">ก่อน → หลัง</th>
                      <th className="py-2 pr-3">หมายเหตุ</th>
                      <th className="py-2">ผู้ทำรายการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100 dark:divide-orange-900/30">
                    {movements.slice(0, 12).map((mv) => (
                      <tr key={mv.id}>
                        <td className="py-2 pr-3 font-mono font-semibold">{mv.referenceNo}</td>
                        <td className="py-2 pr-3 font-mono text-orange-600">{mv.type}</td>
                        <td className="py-2 pr-3 text-right tabular-nums font-bold">{mv.qty}</td>
                        <td className="py-2 pr-3 text-right tabular-nums">
                          {mv.beforeQty} → {mv.afterQty}
                        </td>
                        <td className="py-2 pr-3 text-stone-600 dark:text-stone-400">{mv.note || '-'}</td>
                        <td className="py-2">{mv.createdBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeModule === 'pos' ? (
            /* ==================== 02: INTERACTIVE POS + RECEIPTS ==================== */
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* POS Product Picker */}
                <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display font-bold text-base flex items-center gap-2">
                      <Package className="w-5 h-5 text-orange-500" />
                      สแกนบาร์โค้ด / เลือกสินค้าขายหน้าร้าน
                    </h3>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 text-orange-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={posSearch}
                      onChange={(e) => setPosSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const q = posSearch.trim().toLowerCase();
                          const exact = inventory.find(
                            (p) => p.barcode.toLowerCase() === q || p.sku.toLowerCase() === q
                          );
                          if (exact) {
                            addToPosCart(exact);
                            setPosSearch('');
                          }
                        }
                      }}
                      placeholder="ยิงบาร์โค้ด / พิมพ์ SKU หรือชื่อสินค้าแล้วกด Enter..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                    {inventory
                      .filter((p) => {
                        const q = posSearch.trim().toLowerCase();
                        if (!q) return true;
                        return (
                          p.name.toLowerCase().includes(q) ||
                          p.sku.toLowerCase().includes(q) ||
                          p.barcode.toLowerCase().includes(q)
                        );
                      })
                      .map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => addToPosCart(p)}
                          disabled={p.stockQty <= 0}
                          className="text-left p-3.5 rounded-xl border border-orange-200/80 dark:border-orange-900/40 hover:border-orange-500 disabled:opacity-50 transition-all flex flex-col justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-stone-500">
                              <span>{p.sku}</span>
                              <span className={p.stockQty <= p.reorderPoint ? 'text-rose-600 font-bold' : ''}>
                                คงเหลือ {p.stockQty} {p.unit}
                              </span>
                            </div>
                            <p className="font-semibold text-sm mt-1 line-clamp-2">{p.name}</p>
                          </div>
                          <p className="font-display font-bold text-base text-orange-600 tabular-nums">
                            ฿{p.sellPrice.toLocaleString()}
                          </p>
                        </button>
                      ))}
                  </div>
                </div>

                {/* POS Cart & Atomic Checkout */}
                <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-display font-bold text-base flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-orange-500" />
                      ตะกร้าขาย (ตัดสต๊อกจริงทันที)
                    </h3>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <input
                        type="text"
                        value={posCustomer}
                        onChange={(e) => setPosCustomer(e.target.value)}
                        placeholder="ชื่อลูกค้า"
                        className="px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50"
                      />
                      <select
                        value={posPaymentMethod}
                        onChange={(e) => setPosPaymentMethod(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50"
                      >
                        <option value="QR PromptPay">QR PromptPay</option>
                        <option value="เงินสด (Cash)">เงินสด (Cash)</option>
                        <option value="โอนเงินธนาคาร">โอนเงินธนาคาร</option>
                        <option value="บัตรเครดิต">บัตรเครดิต</option>
                      </select>
                    </div>

                    <div className="divide-y divide-orange-100 dark:divide-orange-900/30 max-h-52 overflow-y-auto">
                      {posCart.length === 0 ? (
                        <p className="text-xs text-stone-400 text-center py-8">
                          คลิกเลือกสินค้าทางซ้ายเพื่อเริ่มคิดเงิน
                        </p>
                      ) : (
                        posCart.map((item) => (
                          <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold truncate">{item.product.name}</p>
                              <p className="text-stone-500 tabular-nums">
                                ฿{item.product.sellPrice.toLocaleString()} x {item.qty}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setPosCart((prev) =>
                                    prev
                                      .map((i) =>
                                        i.product.id === item.product.id ? { ...i, qty: i.qty - 1 } : i
                                      )
                                      .filter((i) => i.qty > 0)
                                  )
                                }
                                className="w-6 h-6 rounded bg-orange-100 dark:bg-[#2A201B] font-bold"
                              >
                                -
                              </button>
                              <span className="w-6 text-center tabular-nums font-bold">{item.qty}</span>
                              <button
                                type="button"
                                onClick={() => addToPosCart(item.product)}
                                className="w-6 h-6 rounded bg-orange-100 dark:bg-[#2A201B] font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-orange-200/80 dark:border-orange-900/40 space-y-2 text-xs sm:text-sm tabular-nums">
                    <div className="flex items-center justify-between gap-2">
                      <span>ส่วนลด (฿)</span>
                      <input
                        type="number"
                        min="0"
                        value={posDiscount}
                        onChange={(e) => setPosDiscount(e.target.value)}
                        className="w-28 px-2 py-1 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 text-right"
                      />
                    </div>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span>คำนวณ VAT {company?.vatRate ?? 7}%</span>
                      <input
                        type="checkbox"
                        checked={posIncludeVat}
                        onChange={(e) => setPosIncludeVat(e.target.checked)}
                        className="accent-orange-500 w-4 h-4"
                      />
                    </label>
                    <div className="flex justify-between text-stone-600 dark:text-stone-400">
                      <span>รวมก่อนภาษี</span>
                      <span>฿{posTotals.subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-stone-600 dark:text-stone-400">
                      <span>VAT {company?.vatRate ?? 7}%</span>
                      <span>฿{posTotals.vat.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between font-display font-bold text-lg text-orange-600 pt-1">
                      <span>ยอดสุทธิ</span>
                      <span>฿{posTotals.grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <button
                      type="button"
                      disabled={posCart.length === 0 || posSubmitting}
                      onClick={handlePosCheckout}
                      className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-sm"
                    >
                      {posSubmitting ? 'กำลังบันทึกและตัดสต๊อก...' : 'รับชำระเงิน & พิมพ์ใบเสร็จ 80mm / A4'}
                    </button>
                  </div>
                </div>
              </div>

              {/* POS Sales History */}
              <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card overflow-x-auto">
                <h3 className="font-display font-bold text-base mb-3">ประวัติบิลขาย POS ล่าสุด</h3>
                <table className="w-full text-xs sm:text-sm text-left">
                  <thead>
                    <tr className="border-b border-orange-200/70 dark:border-orange-900/40 text-stone-500">
                      <th className="py-2 pr-3">เลขที่บิล</th>
                      <th className="py-2 pr-3">รายการสินค้า</th>
                      <th className="py-2 pr-3">ลูกค้า</th>
                      <th className="py-2 pr-3">ชำระโดย</th>
                      <th className="py-2 pr-3 text-right">ยอดสุทธิ</th>
                      <th className="py-2 text-right">พิมพ์ใบเสร็จ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100 dark:divide-orange-900/30">
                    {records
                      .filter((r) => r.moduleKey === 'pos')
                      .map((rec) => (
                        <tr key={rec.id}>
                          <td className="py-2.5 pr-3 font-mono font-bold text-orange-600">{rec.docNumber}</td>
                          <td className="py-2.5 pr-3">{rec.title}</td>
                          <td className="py-2.5 pr-3">{rec.partyName}</td>
                          <td className="py-2.5 pr-3">{rec.categoryOrDept}</td>
                          <td className="py-2.5 pr-3 text-right tabular-nums font-bold">
                            ฿{rec.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setPrintModalRecord({ record: rec, format: 'thermal80' })}
                              className="px-3 py-1.5 rounded-lg bg-[#1E1B18] text-white text-xs font-semibold inline-flex items-center gap-1"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              80mm / A4
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* ==================== 03-19: UNIFIED INTERACTIVE MODULE TABLE + CRUD ==================== */
            <div className="space-y-5">
              {/* Filter & Action Toolbar */}
              <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-4 sm:p-5 soft-card flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 flex-1">
                  <div className="relative min-w-[200px] flex-1 max-w-xs">
                    <Search className="w-4 h-4 text-orange-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                      placeholder="ค้นหาเลขที่เอกสาร / รายการ / ชื่อ..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 text-xs sm:text-sm"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-2 rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 text-xs sm:text-sm"
                  >
                    <option value="">ทุกสถานะ</option>
                    {currentModuleMeta.statusOptions.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 text-xs sm:text-sm"
                  >
                    <option value="newest">ล่าสุดก่อน</option>
                    <option value="amount_desc">ยอดสูงสุด → ต่ำสุด</option>
                    <option value="amount_asc">ยอดต่ำสุด → สูงสุด</option>
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={openCreateRecordModal}
                    className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    เพิ่มรายการใหม่
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport('xlsx')}
                    className="px-3 py-2 rounded-xl border border-orange-300 dark:border-orange-800 text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    Excel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport('csv')}
                    className="px-3 py-2 rounded-xl border border-orange-300 dark:border-orange-800 text-xs font-semibold"
                  >
                    CSV
                  </button>
                </div>
              </div>

              {/* Records Data Table */}
              <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card overflow-x-auto">
                {pagedRecords.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <p className="font-display font-bold text-base">ยังไม่มีรายการในเงื่อนไขที่เลือก</p>
                    <button
                      type="button"
                      onClick={openCreateRecordModal}
                      className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold"
                    >
                      + เพิ่มรายการแรกเลย
                    </button>
                  </div>
                ) : (
                  <table className="w-full text-xs sm:text-sm text-left">
                    <thead>
                      <tr className="border-b border-orange-200/70 dark:border-orange-900/40 text-stone-500">
                        <th className="py-2.5 pr-3">เลขที่เอกสาร</th>
                        <th className="py-2.5 pr-3">รายละเอียด</th>
                        <th className="py-2.5 pr-3">{currentModuleMeta.partyLabel}</th>
                        <th className="py-2.5 pr-3">{currentModuleMeta.categoryLabel}</th>
                        <th className="py-2.5 pr-3 text-right">{currentModuleMeta.qtyLabel}</th>
                        <th className="py-2.5 pr-3 text-right">{currentModuleMeta.amountLabel}</th>
                        <th className="py-2.5 pr-3">สถานะ</th>
                        <th className="py-2.5 text-right">จัดการ / พิมพ์</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-100 dark:divide-orange-900/30">
                      {pagedRecords.map((rec) => (
                        <tr key={rec.id}>
                          <td className="py-3 pr-3 font-mono font-bold text-orange-600 whitespace-nowrap">
                            {rec.docNumber}
                            <span className="block text-[10px] text-stone-400 font-normal">
                              {rec.dateStr}
                            </span>
                          </td>
                          <td className="py-3 pr-3 font-medium text-[#1E1B18] dark:text-orange-50 max-w-xs">
                            {rec.title}
                          </td>
                          <td className="py-3 pr-3">{rec.partyName}</td>
                          <td className="py-3 pr-3 text-xs text-stone-600 dark:text-stone-400">
                            {rec.categoryOrDept}
                          </td>
                          <td className="py-3 pr-3 text-right tabular-nums">{rec.qty}</td>
                          <td className="py-3 pr-3 text-right tabular-nums font-bold">
                            {rec.amount.toLocaleString('th-TH', { minimumFractionDigits: 0 })}
                          </td>
                          <td className="py-3 pr-3">
                            <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">
                              {rec.status}
                            </span>
                          </td>
                          <td className="py-3 text-right whitespace-nowrap space-x-1">
                            {activeModule === 'purchasing' && rec.status !== 'received' && (
                              <button
                                type="button"
                                onClick={() => handleQuickStatus(rec, 'received')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold"
                              >
                                รับของเข้าคลัง
                              </button>
                            )}
                            {activeModule === 'hr_payroll' && rec.status !== 'paid' && (
                              <button
                                type="button"
                                onClick={() => handleQuickStatus(rec, 'paid')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold"
                              >
                                จ่ายลงบัญชี
                              </button>
                            )}
                            {(activeModule === 'leave' || activeModule === 'kpi') &&
                              rec.status === 'pending' && (
                                <button
                                  type="button"
                                  onClick={() => handleQuickStatus(rec, 'approved')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold inline-flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  อนุมัติ
                                </button>
                              )}
                            <button
                              type="button"
                              onClick={() =>
                                setPrintModalRecord({
                                  record: rec,
                                  format: currentModuleMeta.supportsPrintDoc || 'a4',
                                })
                              }
                              title="พิมพ์เอกสาร / สลิป / QR พร้อมโลโก้บริษัท"
                              className="p-1.5 rounded-lg bg-[#1E1B18] text-white hover:bg-orange-600"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditRecordModal(rec)}
                              title="แก้ไข"
                              className="p-1.5 rounded-lg bg-stone-100 dark:bg-[#2A201B] text-stone-700 dark:text-stone-300"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRecord(rec)}
                              title="ลบรายการ"
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {totalPages > 1 && (
                  <div className="mt-4 pt-3 border-t border-orange-100 dark:border-orange-900/40 flex items-center justify-end gap-1.5">
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pNum = idx + 1;
                      return (
                        <button
                          key={pNum}
                          type="button"
                          onClick={() => setPage(pNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold tabular-nums ${
                            page === pNum
                              ? 'bg-orange-500 text-white'
                              : 'bg-orange-50 dark:bg-[#2A201B] text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          {pNum}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Add / Edit Stock Product */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveProduct}
            className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/50 p-6 space-y-4 soft-card"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">
                {editingProduct ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่เข้าคลัง'}
              </h3>
              <button type="button" onClick={() => setProductModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold mb-1">SKU *</label>
                <input
                  required
                  value={productForm.sku}
                  onChange={(e) => setProductForm((f) => ({ ...f, sku: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Barcode</label>
                <input
                  value={productForm.barcode}
                  onChange={(e) => setProductForm((f) => ({ ...f, barcode: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1">ชื่อสินค้า *</label>
                <input
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">หมวดหมู่</label>
                <input
                  value={productForm.category}
                  onChange={(e) => setProductForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">คลังสินค้า</label>
                <input
                  value={productForm.warehouse}
                  onChange={(e) => setProductForm((f) => ({ ...f, warehouse: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">ต้นทุนเฉลี่ย (฿)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.costPrice}
                  onChange={(e) => setProductForm((f) => ({ ...f, costPrice: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">ราคาขาย (฿)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.sellPrice}
                  onChange={(e) => setProductForm((f) => ({ ...f, sellPrice: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 tabular-nums"
                />
              </div>
              {!editingProduct && (
                <div>
                  <label className="block text-xs font-semibold mb-1">ยอดตั้งต้น</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stockQty}
                    onChange={(e) => setProductForm((f) => ({ ...f, stockQty: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 tabular-nums"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold mb-1">จุดสั่งซื้อซ้ำ (Reorder Point)</label>
                <input
                  type="number"
                  min="0"
                  value={productForm.reorderPoint}
                  onChange={(e) => setProductForm((f) => ({ ...f, reorderPoint: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 tabular-nums"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-orange-200 text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
              >
                บันทึกสินค้า
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 2: Stock Movement */}
      {movementModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitMovement}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/50 p-6 space-y-4 soft-card"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">ทำรายการ Stock Movement</h3>
              <button type="button" onClick={() => setMovementModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold mb-1">เลือกสินค้า</label>
                <select
                  value={movementForm.productId}
                  onChange={(e) => setMovementForm((f) => ({ ...f, productId: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50"
                >
                  {inventory.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} · {p.name} (เหลือ {p.stockQty})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">ประเภทรายการ</label>
                <select
                  value={movementForm.type}
                  onChange={(e) => setMovementForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50"
                >
                  <option value="IN">รับเข้า (Stock IN)</option>
                  <option value="OUT">เบิกออก (Stock OUT)</option>
                  <option value="TRANSFER">โอนย้ายคลัง (Transfer)</option>
                  <option value="ADJUST">ปรับยอดตรวจนับ (Adjust / Count)</option>
                  <option value="RETURN">รับคืนสินค้า (Return)</option>
                  <option value="DAMAGE">ของเสีย (Damage)</option>
                  <option value="SCRAP">เศษซากผลิต (Scrap)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {movementForm.type === 'ADJUST' ? 'ยอดคงเหลือจริงใหม่' : 'จำนวน'}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={movementForm.qty}
                  onChange={(e) => setMovementForm((f) => ({ ...f, qty: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 tabular-nums"
                />
              </div>
              {movementForm.type === 'TRANSFER' && (
                <div>
                  <label className="block text-xs font-semibold mb-1">คลังปลายทาง</label>
                  <input
                    value={movementForm.warehouseTo}
                    onChange={(e) => setMovementForm((f) => ({ ...f, warehouseTo: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold mb-1">หมายเหตุ</label>
                <input
                  value={movementForm.note}
                  onChange={(e) => setMovementForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="ระบุเหตุผลหรือเลขใบเบิก"
                  className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMovementModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-orange-200 text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
              >
                ยืนยันรายการ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 3: Generic Module Record Create / Edit */}
      {recordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveRecord}
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/50 p-6 space-y-4 soft-card"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">
                {editingRecord ? `แก้ไข ${editingRecord.docNumber}` : `เพิ่มรายการ · ${currentModuleMeta.shortTitle}`}
              </h3>
              <button type="button" onClick={() => setRecordModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1">หัวข้อ / รายละเอียดรายการ *</label>
                <input
                  required
                  value={recordForm.title}
                  onChange={(e) => setRecordForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">{currentModuleMeta.partyLabel}</label>
                <input
                  value={recordForm.partyName}
                  onChange={(e) => setRecordForm((f) => ({ ...f, partyName: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">{currentModuleMeta.categoryLabel}</label>
                <select
                  value={recordForm.categoryOrDept}
                  onChange={(e) => setRecordForm((f) => ({ ...f, categoryOrDept: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50"
                >
                  {currentModuleMeta.categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {activeModule === 'hr_payroll' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold mb-1">ฐานเงินเดือน (฿)</label>
                    <input
                      type="number"
                      value={recordForm.baseSalary}
                      onChange={(e) => setRecordForm((f) => ({ ...f, baseSalary: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">OT + เบี้ยขยัน (฿)</label>
                    <input
                      type="number"
                      value={recordForm.otPay}
                      onChange={(e) => setRecordForm((f) => ({ ...f, otPay: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 tabular-nums"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold mb-1">{currentModuleMeta.amountLabel}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={recordForm.amount}
                      onChange={(e) => setRecordForm((f) => ({ ...f, amount: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">{currentModuleMeta.qtyLabel}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={recordForm.qty}
                      onChange={(e) => setRecordForm((f) => ({ ...f, qty: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 tabular-nums"
                    />
                  </div>
                </>
              )}

              {activeModule === 'purchasing' && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold mb-1">เชื่อมรหัสสินค้าในคลัง (เพื่อรับเข้าอัตโนมัติ)</label>
                  <select
                    value={recordForm.extraSku}
                    onChange={(e) => setRecordForm((f) => ({ ...f, extraSku: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50"
                  >
                    <option value="">-- ไม่ผูก SKU --</option>
                    {inventory.map((p) => (
                      <option key={p.id} value={p.sku}>
                        {p.sku} · {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1">สถานะ</label>
                <select
                  value={recordForm.status}
                  onChange={(e) => setRecordForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50"
                >
                  {currentModuleMeta.statusOptions.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">วันที่</label>
                <input
                  type="date"
                  value={recordForm.dateStr}
                  onChange={(e) => setRecordForm((f) => ({ ...f, dateStr: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRecordModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-orange-200 text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
              >
                บันทึกข้อมูล
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Printable Document / Payslip / Thermal 80mm / QR Tag Modal */}
      {printModalRecord && company && (
        <ErpDocumentModal
          company={company}
          record={printModalRecord.record}
          initialFormat={printModalRecord.format}
          onClose={() => setPrintModalRecord(null)}
        />
      )}

      {/* Modal 4: SaaS Package Upgrade & PromptPay Checkout */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleUpgradeSubmit}
            className="w-full max-w-4xl rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/50 p-6 sm:p-8 space-y-5 soft-card my-8"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-orange-600 dark:text-orange-400 inline-flex items-center gap-1.5">
                  <Crown className="w-4 h-4" />
                  UPGRADE WEB APPLICATION SUBSCRIPTION
                </p>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-[#1E1B18] dark:text-orange-50 mt-0.5">
                  เลือกแพ็กเกจเพื่อเพิ่ม Storage, จำนวนผู้ใช้งาน และ Data Records
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setUpgradeModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-500 hover:bg-orange-50 dark:hover:bg-[#2A201B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {upgradeReason && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 px-4 py-3 text-xs sm:text-sm font-semibold text-rose-700 dark:text-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{upgradeReason}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[340px] overflow-y-auto pr-1">
              {packages
                .filter((p) => p.code !== 'trial')
                .map((pkg) => {
                  const active = selectedUpgradeCode === pkg.code;
                  return (
                    <button
                      key={pkg.code}
                      type="button"
                      onClick={() => setSelectedUpgradeCode(pkg.code)}
                      className={`text-left rounded-xl p-4 border transition-all flex flex-col justify-between ${
                        active
                          ? 'bg-[#1E1B18] text-white border-2 border-orange-500 shadow-md'
                          : 'bg-[#FFF7ED] dark:bg-[#2A201B] border-orange-200 dark:border-orange-900/50 hover:border-orange-400'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display font-bold text-sm">{pkg.name}</span>
                          {pkg.isPopular && (
                            <span className="text-[10px] font-bold text-orange-400">ยอดนิยม</span>
                          )}
                        </div>
                        <p className="font-display font-bold text-xl mt-1 tabular-nums text-orange-500">
                          ฿{pkg.price.toLocaleString()}
                          <span className={`text-xs font-normal ml-1 ${active ? 'text-stone-300' : 'text-stone-500'}`}>
                            / {pkg.billingCycle === 'yearly' ? 'ปี' : 'เดือน'}
                          </span>
                        </p>
                      </div>
                      <div className={`mt-3 pt-2 border-t text-[11px] space-y-0.5 tabular-nums ${active ? 'border-stone-700 text-stone-300' : 'border-orange-200/70 dark:border-orange-900/40 text-stone-600 dark:text-stone-400'}`}>
                        <p>Storage: {pkg.maxStorageMb === -1 ? 'Unlimited' : `${pkg.maxStorageMb} MB`}</p>
                        <p>Users: {pkg.maxUsers === -1 ? 'Unlimited' : `${pkg.maxUsers} User`}</p>
                        <p>Records: {pkg.maxRecords === -1 ? 'Unlimited' : pkg.maxRecords.toLocaleString()}</p>
                      </div>
                    </button>
                  );
                })}
            </div>

            {/* PromptPay QR Payment Confirmation */}
            {(() => {
              const sel = packages.find((p) => p.code === selectedUpgradeCode);
              return (
                <div className="rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-4 flex justify-center">
                    <div className="bg-white rounded-xl p-2 border border-orange-200 text-center">
                      <img
                        src={getQrUrl('promptpay', PROMPTPAY_QR)}
                        alt="PromptPay QR"
                        referrerPolicy="no-referrer"
                        className="w-36 h-36 object-contain mx-auto"
                      />
                      <p className="text-[10px] font-bold text-stone-700 mt-1">
                        พร้อมเพย์ กดแล้วจบ (081-999-8888)
                      </p>
                    </div>
                  </div>
                  <div className="md:col-span-8 space-y-3 text-xs sm:text-sm">
                    <div>
                      <p className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50">
                        สรุปยอดชำระ: {sel?.name || selectedUpgradeCode} —{' '}
                        <span className="text-orange-600 tabular-nums">
                          ฿{(sel?.price ?? 550).toLocaleString()}
                        </span>
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        สแกน QR พร้อมเพย์แล้วกรอกเลขอ้างอิงสลิป (หรือกดเปิดใช้งานเพื่อปรับโควต้าทันที)
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        เลขอ้างอิงการโอน / หมายเหตุสลิป (ไม่บังคับสำหรับทดสอบระบบ)
                      </label>
                      <input
                        type="text"
                        value={promptpayRefInput}
                        onChange={(e) => setPromptpayRefInput(e.target.value)}
                        placeholder="เช่น REF-20261126-001"
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/50 font-mono text-xs"
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 font-semibold">
                        <ShieldCheck className="w-4 h-4" />
                        ข้อมูลเดิมทั้งหมดใน 20 ระบบจะถูกเก็บไว้อย่างปลอดภัย
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setUpgradeModalOpen(false)}
                          className="px-4 py-2 rounded-xl border border-orange-200 text-xs font-semibold"
                        >
                          ปิด
                        </button>
                        <button
                          type="submit"
                          disabled={upgrading}
                          className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          {upgrading ? 'กำลังอัปเกรด...' : 'ยืนยันชำระเงิน & เปิดใช้งานแพ็กเกจทันที'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </form>
        </div>
      )}
    </div>
  );
}
