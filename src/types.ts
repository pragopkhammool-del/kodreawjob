export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export interface Product {
  id: number;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  level: 'free' | 'standard' | 'advanced';
  filePath?: string | null;
  fileSize: string;
  previewImage: string;
  aiVideoUrl?: string | null;
  downloadCount: number;
  ratingAvg: number;
  isFeatured: boolean;
  isBestseller: boolean;
  status: string;
  features: string[];
  createdAt: string;
}

export interface Review {
  id: number;
  productId: number;
  authorName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItemDTO {
  id: number;
  productId: number;
  price: number;
  downloadToken: string;
  tokenExpiresAt: string;
  productTitle: string;
  productSlug: string;
  previewImage?: string;
  fileSize?: string;
}

export interface OrderDTO {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  totalAmount: number;
  discountAmount: number;
  couponCode?: string | null;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  slipImage?: string | null;
  paidAt?: string | null;
  createdAt: string;
  items?: OrderItemDTO[];
}

export interface DbUser {
  id: number;
  uid: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

export interface ThemeConfig {
  presetId: string;
  name: string;
  primaryColor: string;
  primaryHover: string;
  bgLight: string;
  surfaceLight: string;
  darkAccent: string;
}

export interface QrCodeItem {
  id: number;
  code: string;
  title: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  updatedAt?: string;
}

export interface SiteConfig {
  theme: ThemeConfig;
  qrCodes: QrCodeItem[];
}

