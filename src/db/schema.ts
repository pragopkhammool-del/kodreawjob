import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  real,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  avatar: text('avatar'),
  role: text('role').notNull().default('customer'),
  lineId: text('line_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  icon: text('icon').notNull(),
  description: text('description').notNull(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id')
    .references(() => categories.id)
    .notNull(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  price: integer('price').notNull().default(0),
  level: text('level').notNull().default('free'), // 'free' | 'standard' | 'advanced'
  filePath: text('file_path'),
  fileSize: text('file_size').notNull().default('2.4 MB'),
  previewImage: text('preview_image').notNull(),
  aiVideoUrl: text('ai_video_url'),
  downloadCount: integer('download_count').notNull().default(0),
  ratingAvg: real('rating_avg').notNull().default(4.9),
  isFeatured: boolean('is_featured').notNull().default(false),
  isBestseller: boolean('is_bestseller').notNull().default(false),
  status: text('status').notNull().default('active'),
  featuresJson: text('features_json'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  userUid: text('user_uid'),
  orderNumber: text('order_number').notNull().unique(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone'),
  totalAmount: integer('total_amount').notNull(),
  discountAmount: integer('discount_amount').notNull().default(0),
  couponCode: text('coupon_code'),
  status: text('status').notNull().default('pending'), // 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod: text('payment_method').notNull(),
  slipImage: text('slip_image'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .references(() => orders.id)
    .notNull(),
  productId: integer('product_id')
    .references(() => products.id)
    .notNull(),
  price: integer('price').notNull(),
  downloadToken: text('download_token').notNull().unique(),
  tokenExpiresAt: timestamp('token_expires_at').notNull(),
});

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .references(() => products.id)
    .notNull(),
  userId: integer('user_id').references(() => users.id),
  authorName: text('author_name').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  verifiedPurchase: boolean('verified_purchase').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  discountType: text('discount_type').notNull().default('percent'), // 'percent' | 'fixed'
  discountValue: integer('discount_value').notNull(),
  usageLimit: integer('usage_limit').notNull().default(100),
  usedCount: integer('used_count').notNull().default(0),
  expiresAt: timestamp('expires_at'),
});

export const paymentsSettings = pgTable('payments_settings', {
  id: serial('id').primaryKey(),
  provider: text('provider').notNull().unique(),
  configJson: text('config_json').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const downloadLogs = pgTable('download_logs', {
  id: serial('id').primaryKey(),
  orderItemId: integer('order_item_id').references(() => orderItems.id),
  productId: integer('product_id').references(() => products.id),
  ip: text('ip'),
  userAgent: text('user_agent'),
  downloadedAt: timestamp('downloaded_at').defaultNow().notNull(),
});

export const aiGenerations = pgTable('ai_generations', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id),
  type: text('type').notNull(), // 'image' | 'video' | 'description'
  prompt: text('prompt').notNull(),
  resultUrl: text('result_url'),
  status: text('status').notNull().default('completed'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const siteVisitors = pgTable('site_visitors', {
  id: serial('id').primaryKey(),
  visitorKey: text('visitor_key').notNull().unique(),
  firstVisitAt: timestamp('first_visit_at').defaultNow().notNull(),
});

export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  valueJson: text('value_json').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const qrCodes = pgTable('qr_codes', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  imageUrl: text('image_url').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const linkClicks = pgTable('link_clicks', {
  id: serial('id').primaryKey(),
  linkKey: text('link_key').notNull(),
  label: text('label').notNull(),
  targetUrl: text('target_url').notNull(),
  visitorKey: text('visitor_key'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ================= SAAS BUSINESS ERP SUITE (20 MODULES) =================
export const erpCompanies = pgTable('erp_companies', {
  id: serial('id').primaryKey(),
  ownerUid: text('owner_uid').notNull(),
  companyName: text('company_name').notNull(),
  companyNameEn: text('company_name_en'),
  taxId: text('tax_id').notNull(),
  branchName: text('branch_name').notNull().default('สำนักงานใหญ่'),
  address: text('address').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  website: text('website'),
  logoUrl: text('logo_url'),
  vatRate: real('vat_rate').notNull().default(7),
  whtRate: real('wht_rate').notNull().default(3),
  currency: text('currency').notNull().default('THB'),
  prefixConfigJson: text('prefix_config_json').notNull(),
  bankInfoJson: text('bank_info_json'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const erpInventoryProducts = pgTable('erp_inventory_products', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id')
    .references(() => erpCompanies.id)
    .notNull(),
  sku: text('sku').notNull(),
  barcode: text('barcode').notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  brand: text('brand').notNull().default('-'),
  unit: text('unit').notNull().default('ชิ้น'),
  warehouse: text('warehouse').notNull().default('คลังหลัก (WH-01)'),
  location: text('location').notNull().default('A1-01'),
  supplier: text('supplier').notNull().default('ซัพพลายเออร์ทั่วไป'),
  costPrice: real('cost_price').notNull().default(0),
  sellPrice: real('sell_price').notNull().default(0),
  stockQty: real('stock_qty').notNull().default(0),
  minStock: real('min_stock').notNull().default(5),
  maxStock: real('max_stock').notNull().default(200),
  reorderPoint: real('reorder_point').notNull().default(10),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const erpStockMovements = pgTable('erp_stock_movements', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id')
    .references(() => erpCompanies.id)
    .notNull(),
  productId: integer('product_id')
    .references(() => erpInventoryProducts.id)
    .notNull(),
  type: text('type').notNull(), // IN | OUT | TRANSFER | ADJUST | COUNT | RETURN | DAMAGE | SCRAP | POS_SALE
  qty: real('qty').notNull(),
  unitCost: real('unit_cost').notNull().default(0),
  beforeQty: real('before_qty').notNull(),
  afterQty: real('after_qty').notNull(),
  referenceNo: text('reference_no').notNull(),
  warehouseFrom: text('warehouse_from'),
  warehouseTo: text('warehouse_to'),
  note: text('note'),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const erpModuleRecords = pgTable('erp_module_records', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id')
    .references(() => erpCompanies.id)
    .notNull(),
  moduleKey: text('module_key').notNull(),
  docNumber: text('doc_number').notNull(),
  title: text('title').notNull(),
  partyName: text('party_name').notNull().default('-'),
  categoryOrDept: text('category_or_dept').notNull().default('-'),
  status: text('status').notNull().default('active'),
  amount: real('amount').notNull().default(0),
  qty: real('qty').notNull().default(1),
  dateStr: text('date_str').notNull(),
  dueDateStr: text('due_date_str'),
  payloadJson: text('payload_json').notNull(),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const erpAuditLogs = pgTable('erp_audit_logs', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id')
    .references(() => erpCompanies.id)
    .notNull(),
  userUid: text('user_uid').notNull(),
  userName: text('user_name').notNull(),
  moduleKey: text('module_key').notNull(),
  action: text('action').notNull(),
  recordId: text('record_id'),
  summary: text('summary').notNull(),
  ip: text('ip'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const erpPackages = pgTable('erp_packages', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  badge: text('badge').notNull(),
  price: integer('price').notNull().default(0),
  billingCycle: text('billing_cycle').notNull().default('monthly'), // 'trial_30d' | 'monthly' | 'yearly'
  durationDays: integer('duration_days').notNull().default(30),
  maxStorageMb: integer('max_storage_mb').notNull().default(30), // -1 = Unlimited
  maxUsers: integer('max_users').notNull().default(1), // -1 = Unlimited
  maxRecords: integer('max_records').notNull().default(99), // -1 = Unlimited
  featuresJson: text('features_json').notNull(),
  isPopular: boolean('is_popular').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const erpSubscriptions = pgTable('erp_subscriptions', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id')
    .references(() => erpCompanies.id)
    .notNull(),
  ownerUid: text('owner_uid').notNull(),
  applicationKey: text('application_key').notNull().default('erp-20-suite'),
  packageCode: text('package_code').notNull().default('trial'),
  status: text('status').notNull().default('Trial'), // 'Trial' | 'Active' | 'Expiring Soon' | 'Expired' | 'Suspended' | 'Cancelled'
  isTrial: boolean('is_trial').notNull().default(true),
  trialStartAt: timestamp('trial_start_at').defaultNow().notNull(),
  trialEndAt: timestamp('trial_end_at').notNull(),
  startAt: timestamp('start_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  promptpayRef: text('promptpay_ref'),
  autoRenew: boolean('auto_renew').notNull().default(false),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const erpCompanyUsers = pgTable('erp_company_users', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id')
    .references(() => erpCompanies.id)
    .notNull(),
  memberName: text('member_name').notNull(),
  memberEmail: text('member_email').notNull(),
  role: text('role').notNull().default('admin'), // 'admin' | 'manager' | 'hr' | 'accounting' | 'sales' | 'warehouse' | 'employee' | 'viewer'
  status: text('status').notNull().default('active'), // 'active' | 'invited'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  reviews: many(reviews),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  reviews: many(reviews),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const erpCompaniesRelations = relations(erpCompanies, ({ many }) => ({
  inventoryProducts: many(erpInventoryProducts),
  stockMovements: many(erpStockMovements),
  moduleRecords: many(erpModuleRecords),
  auditLogs: many(erpAuditLogs),
  subscriptions: many(erpSubscriptions),
  companyUsers: many(erpCompanyUsers),
}));

export const erpInventoryProductsRelations = relations(erpInventoryProducts, ({ one, many }) => ({
  company: one(erpCompanies, {
    fields: [erpInventoryProducts.companyId],
    references: [erpCompanies.id],
  }),
  movements: many(erpStockMovements),
}));
