// ─── User & Auth ────────────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "CUSTOMER" | "VENDOR" | "DELIVERY_BOY";

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginPayload {
  email?: string;
  mobile?: string;
  password?: string;
  otp?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
}

// ─── Product ─────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  parentId?: string;
  children?: Category[];
  productCount?: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price: number;
  mrp: number;
  stock: number;
  sku: string;
  images?: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  mrp: number;
  discount: number;
  images: string[];
  thumbnail: string;
  category: Category;
  vendor: Vendor;
  variants: ProductVariant[];
  stock: number;
  sku: string;
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  weight?: number;
  deliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilter {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  sortBy?: "price_asc" | "price_desc" | "newest" | "popular" | "rating";
  page?: number;
  limit?: number;
  search?: string;
  vendorId?: string;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  coupon?: Coupon;
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export interface WishlistItem {
  id: string;
  product: Product;
  addedAt: string;
}

// ─── Address ─────────────────────────────────────────────────────────────────

export interface Address {
  id: string;
  name: string;
  mobile: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  type: "HOME" | "WORK" | "OTHER";
  lat?: number;
  lng?: number;
}

// ─── Order ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "PACKED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED"
  | "REFUNDED";

export type PaymentMethod = "RAZORPAY" | "COD" | "WALLET";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface OrderItem {
  id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: User;
  items: OrderItem[];
  address: Address;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  coupon?: Coupon;
  tracking?: TrackingInfo;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrackingInfo {
  trackingId?: string;
  carrier?: string;
  estimatedDelivery?: string;
  currentLocation?: string;
  lat?: number;
  lng?: number;
  timeline: TrackingEvent[];
}

export interface TrackingEvent {
  status: OrderStatus;
  message: string;
  timestamp: string;
  location?: string;
}

// ─── Vendor ──────────────────────────────────────────────────────────────────

export type VendorStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export interface Vendor {
  id: string;
  user: User;
  shopName: string;
  shopImage?: string;
  description?: string;
  gstNumber?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  bankAccount?: string;
  ifscCode?: string;
  accountName?: string;
  status: VendorStatus;
  rating: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  address: Address;
  createdAt: string;
}

// ─── Delivery Boy ─────────────────────────────────────────────────────────────

export type DeliveryStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
export type VehicleType = "BICYCLE" | "MOTORCYCLE" | "CAR" | "VAN";

export interface DeliveryBoy {
  id: string;
  user: User;
  drivingLicense?: string;
  aadhaarNumber?: string;
  vehicleType: VehicleType;
  vehicleNumber: string;
  status: DeliveryStatus;
  isAvailable: boolean;
  currentLat?: number;
  currentLng?: number;
  totalDeliveries: number;
  earnings: number;
  rating: number;
  createdAt: string;
}

// ─── Review ──────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  user: User;
  product: Product;
  rating: number;
  comment: string;
  images?: string[];
  helpful: number;
  createdAt: string;
}

// ─── Coupon ──────────────────────────────────────────────────────────────────

export interface Coupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrder: number;
  maxDiscount?: number;
  isActive: boolean;
  expiresAt: string;
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export interface RazorpayOrder {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  key: string;
}

export interface RazorpayPaymentResponse {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "ORDER" | "PAYMENT" | "DELIVERY" | "PROMO" | "SYSTEM";
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  revenueChart: ChartPoint[];
  ordersChart: ChartPoint[];
  topProducts: Product[];
  recentOrders: Order[];
}

export interface ChartPoint {
  date: string;
  value: number;
  label?: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
