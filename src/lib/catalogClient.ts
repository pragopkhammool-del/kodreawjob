import { SEED_CATEGORIES, SEED_PRODUCTS } from '../data/catalogSeed';
import { Category, Product, Review } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export function resolveApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function fetchJsonSafe<T>(
  path: string,
  init?: RequestInit
): Promise<{ ok: true; data: T } | { ok: false; status: number }> {
  try {
    const res = await fetch(resolveApiUrl(path), init);
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.toLowerCase().includes('application/json')) {
      return { ok: false, status: res.status };
    }
    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch {
    return { ok: false, status: 0 };
  }
}

const CATEGORY_BY_SLUG = new Map(SEED_CATEGORIES.map((c) => [c.slug, c]));

const LOCAL_PRODUCTS: Product[] = SEED_PRODUCTS.map((item, idx) => {
  const cat = CATEGORY_BY_SLUG.get(item.categorySlug) || SEED_CATEGORIES[0];
  return {
    id: idx + 1,
    categoryId: cat.id,
    categoryName: cat.name,
    categorySlug: cat.slug,
    title: item.title,
    slug: item.slug,
    description: item.description,
    price: item.price,
    level: item.level,
    filePath: null,
    fileSize:
      item.level === 'free' ? '1.2 MB' : item.level === 'standard' ? '2.8 MB' : '4.5 MB',
    previewImage: item.previewImage,
    aiVideoUrl: item.isFeatured ? 'showcase-demo' : null,
    downloadCount: 0,
    ratingAvg: item.ratingAvg,
    isFeatured: Boolean(item.isFeatured),
    isBestseller: Boolean(item.isBestseller),
    status: 'active',
    features: item.features,
    createdAt: new Date(Date.now() - idx * 3600 * 1000).toISOString(),
  };
});

export function getLocalCategories(): Category[] {
  return SEED_CATEGORIES.map((c) => ({ ...c }));
}

export interface LocalCatalogQuery {
  level?: string;
  category?: string;
  search?: string;
  sort?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export function queryLocalProducts(params: LocalCatalogQuery = {}) {
  const level = params.level || '';
  const category = params.category || '';
  const search = (params.search || '').trim().toLowerCase();
  const sort = params.sort || 'popular';
  const featured = Boolean(params.featured);
  const page = Math.max(1, Number(params.page || 1));
  const limit = Math.min(100, Math.max(1, Number(params.limit || 12)));

  let list = LOCAL_PRODUCTS.filter((p) => {
    if (level && ['free', 'standard', 'advanced'].includes(level) && p.level !== level) {
      return false;
    }
    if (category && CATEGORY_BY_SLUG.has(category) && p.categorySlug !== category) {
      return false;
    }
    if (featured && !p.isFeatured) {
      return false;
    }
    if (search) {
      const hay = `${p.title} ${p.description} ${p.categoryName} ${p.features.join(' ')}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });

  list = [...list].sort((a, b) => {
    if (sort === 'price_asc') return a.price - b.price;
    if (sort === 'price_desc') return b.price - a.price;
    if (sort === 'rating') return b.ratingAvg - a.ratingAvg;
    if (sort === 'newest') return b.id - a.id;
    return (
      b.downloadCount - a.downloadCount ||
      Number(b.isFeatured) - Number(a.isFeatured) ||
      a.id - b.id
    );
  });

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const offset = (page - 1) * limit;
  const items = list.slice(offset, offset + limit);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
}

export function getLocalProductDetail(
  slug: string
): (Product & { reviews: Review[] }) | null {
  const found = LOCAL_PRODUCTS.find((p) => p.slug === slug);
  if (!found) return null;

  const sampleReviews: Review[] = [
    {
      id: 1,
      productId: found.id,
      authorName: 'คุณกิตติพงษ์ วรรณศิริ (บจก. สยามเฟอร์นิเจอร์)',
      rating: 5,
      comment: 'สูตรทำงานอัตโนมัติแม่นยำ จัดหน้าพิมพ์สวยพร้อมใช้งานจริง ช่วยลดเวลาทำงานได้มากครับ',
      verifiedPurchase: true,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 2,
      productId: found.id,
      authorName: 'คุณณัฐวดี เจริญสุข',
      rating: 5,
      comment: 'คู่มือเข้าใจง่าย กรอกข้อมูลแล้ว Dashboard สรุปผลให้ทันที คุ้มค่ามากค่ะ',
      verifiedPurchase: true,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];

  return {
    ...found,
    reviews: sampleReviews,
  };
}

function escapeXml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Browser-native fallback Excel workbook download (SpreadsheetML with live SUM/AVERAGE formulas)
 * used only when running as static edge deployment without backend Express server.
 */
export function downloadClientWorkbookFallback(product: Product): boolean {
  const rows = [
    { item: 'รายการที่ 1 · ข้อมูลตัวอย่างเริ่มต้น', qty: 10, unitPrice: 1200 },
    { item: 'รายการที่ 2 · ค่าบริการและวัสดุหลัก', qty: 5, unitPrice: 2450 },
    { item: 'รายการที่ 3 · ค่าดำเนินการมาตรฐาน', qty: 8, unitPrice: 850 },
    { item: 'รายการที่ 4 · รายการเสริมเพิ่มเติม', qty: 4, unitPrice: 1500 },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="12"/>
   <Interior ss:Color="#EA580C" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Title">
   <Font ss:Bold="1" ss:Color="#1E1B18" ss:Size="14"/>
  </Style>
  <Style ss:ID="Currency">
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
  <Style ss:ID="Total">
   <Font ss:Bold="1" ss:Color="#1E1B18"/>
   <Interior ss:Color="#FFEDD5" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Template_Data">
  <Table>
   <Column ss:Width="260"/>
   <Column ss:Width="90"/>
   <Column ss:Width="120"/>
   <Column ss:Width="140"/>
   <Row>
    <Cell ss:StyleID="Title"><Data ss:Type="String">${escapeXml(product.title)}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">หมวดหมู่: ${escapeXml(product.categoryName)} | © 2027 Kodraewjob กดแล้วจบ</Data></Cell>
   </Row>
   <Row/>
   <Row>
    <Cell ss:StyleID="Header"><Data ss:Type="String">รายละเอียดรายการ</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">จำนวน</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">ราคาต่อหน่วย (บาท)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">รวมเป็นเงิน (สูตรอัตโนมัติ)</Data></Cell>
   </Row>
   ${rows
     .map(
       (r) => `<Row>
    <Cell><Data ss:Type="String">${escapeXml(r.item)}</Data></Cell>
    <Cell><Data ss:Type="Number">${r.qty}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${r.unitPrice}</Data></Cell>
    <Cell ss:StyleID="Currency" ss:Formula="=RC[-2]*RC[-1]"><Data ss:Type="Number">${r.qty * r.unitPrice}</Data></Cell>
   </Row>`
     )
     .join('\n   ')}
   <Row>
    <Cell ss:StyleID="Total"><Data ss:Type="String">รวมมูลค่าสุทธิ (SUM)</Data></Cell>
    <Cell ss:StyleID="Total" ss:Formula="=SUM(R[-4]C:R[-1]C)"><Data ss:Type="Number">27</Data></Cell>
    <Cell ss:StyleID="Total" ss:Formula="=AVERAGE(R[-4]C:R[-1]C)"><Data ss:Type="Number">1500</Data></Cell>
    <Cell ss:StyleID="Total" ss:Formula="=SUM(R[-4]C:R[-1]C)"><Data ss:Type="Number">37050</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Manual_Features">
  <Table>
   <Column ss:Width="420"/>
   <Row><Cell ss:StyleID="Title"><Data ss:Type="String">คู่มือและคุณสมบัติเด่นของเทมเพลต</Data></Cell></Row>
   ${product.features
     .map(
       (f, i) => `<Row><Cell><Data ss:Type="String">${i + 1}. ${escapeXml(f)}</Data></Cell></Row>`
     )
     .join('\n   ')}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = `${product.slug}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
  return true;
}
