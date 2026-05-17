/**
 * Adapter functions that transform backend API responses into frontend type shapes.
 * Backend and frontend use different field names in several places — all normalization
 * happens here so the rest of the UI never needs to know about the difference.
 */

import type {
  User, Address, Product, ProductVariant, Order, OrderItem,
  Vendor, DeliveryBoy, Review, Notification, PaginatedResponse, PaginationMeta,
} from "@/types";

// ─── User ────────────────────────────────────────────────────────────────────

export function adaptUser(raw: Record<string, any>): User {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    mobile: raw.phone ?? raw.mobile ?? "",        // backend: "phone"
    role: raw.role,
    avatar: raw.avatar ?? undefined,
    isVerified: raw.isEmailVerified ?? raw.isVerified ?? false,
    isActive: raw.isActive ?? true,
    createdAt: raw.createdAt ?? "",
  };
}

// ─── Address ─────────────────────────────────────────────────────────────────

export function adaptAddress(raw: Record<string, any>): Address {
  return {
    id: raw.id,
    label: raw.label ?? raw.type ?? "HOME",
    fullName: raw.fullName ?? raw.name ?? "",
    phone: raw.phone ?? raw.mobile ?? "",
    addressLine1: raw.addressLine1 ?? raw.line1 ?? "",
    addressLine2: raw.addressLine2 ?? raw.line2,
    city: raw.city ?? "",
    state: raw.state ?? "",
    pincode: raw.pincode ?? "",
    isDefault: raw.isDefault ?? false,
    lat: raw.latitude ?? raw.lat,
    lng: raw.longitude ?? raw.lng,
  };
}

/** Convert frontend Address form data → backend CreateAddressDto fields */
export function addressToBackend(addr: Partial<Address> & Record<string, any>) {
  return {
    fullName: addr.name ?? addr.fullName,
    phone: addr.mobile ?? addr.phone,
    addressLine1: addr.line1 ?? addr.addressLine1,
    addressLine2: addr.line2 ?? addr.addressLine2,
    city: addr.city,
    state: addr.state,
    pincode: addr.pincode,
    country: addr.country ?? "India",
    isDefault: addr.isDefault ?? false,
    label: addr.type ?? addr.label ?? "HOME",
    latitude: addr.lat ?? addr.latitude,
    longitude: addr.lng ?? addr.longitude,
  };
}

// ─── Product Variant ──────────────────────────────────────────────────────────

export function adaptVariant(raw: Record<string, any>): ProductVariant {
  return {
    id: raw.id,
    name: raw.name,
    value: raw.value,
    price: raw.price ?? 0,
    mrp: raw.price ?? 0,          // backend has no separate mrp on variants
    stock: raw.stock ?? 0,
    sku: raw.sku ?? "",
    images: raw.image ? [raw.image] : [],
  };
}

// ─── Product ─────────────────────────────────────────────────────────────────

export function adaptProduct(raw: Record<string, any>): Product {
  const mrp = raw.comparePrice ?? raw.mrp ?? raw.price ?? 0;
  const price = raw.price ?? 0;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug ?? "",
    description: raw.description ?? "",
    shortDescription: raw.shortDescription,
    price,
    mrp,
    discount,
    images: raw.images ?? [],
    thumbnail: raw.images?.[0] ?? "",
    category: raw.category ?? { id: raw.categoryId, name: "", slug: "" },
    vendor: raw.vendor ? adaptVendorBasic(raw.vendor) : ({} as any),
    variants: (raw.variants ?? []).map(adaptVariant),
    stock: raw.stock ?? 0,
    sku: raw.sku ?? "",
    isActive: raw.isActive ?? true,
    isFeatured: raw.isFeatured ?? false,
    rating: raw.averageRating ?? raw.rating ?? 0,   // backend: "averageRating"
    reviewCount: raw.reviewCount ?? 0,
    tags: raw.tags ?? [],
    weight: raw.weight,
    approvalStatus: raw.approvalStatus,
    isPublished: raw.isPublished ?? false,
    createdAt: raw.createdAt ?? "",
    updatedAt: raw.updatedAt ?? "",
  };
}

// ─── Vendor ──────────────────────────────────────────────────────────────────

function adaptVendorBasic(raw: Record<string, any>) {
  return {
    id: raw.id,
    shopName: raw.shopName ?? "",
    shopImage: raw.shopLogo ?? raw.shopImage,
    rating: raw.rating ?? 0,
  };
}

export function adaptVendor(raw: Record<string, any>): Vendor {
  return {
    id: raw.id,
    user: raw.user ? adaptUser(raw.user) : ({} as User),
    shopName: raw.shopName ?? "",
    shopImage: raw.shopLogo ?? raw.shopImage,
    description: raw.shopDescription ?? raw.description,
    gstNumber: raw.gstNumber,
    panNumber: raw.panNumber,
    aadhaarNumber: raw.aadhaarNumber,
    bankAccount: raw.bankAccountNumber,
    ifscCode: raw.bankIfscCode,
    accountName: raw.bankAccountName,
    status: (raw.approvalStatus ?? raw.status ?? "PENDING") as Vendor["status"],
    rating: raw.rating ?? 0,
    totalProducts: raw.totalProducts ?? 0,
    totalOrders: raw.totalOrders ?? 0,
    totalRevenue: raw.totalRevenue ?? raw.totalEarnings ?? 0,
    address: raw.address ? adaptAddress(raw.address) : ({} as Address),
    createdAt: raw.createdAt ?? "",
  };
}

// ─── DeliveryBoy ─────────────────────────────────────────────────────────────

export function adaptDeliveryBoy(raw: Record<string, any>): DeliveryBoy {
  return {
    id: raw.id,
    user: raw.user ? adaptUser(raw.user) : ({} as User),
    drivingLicense: raw.drivingLicense,
    aadhaarNumber: raw.aadhaarNumber,
    vehicleType: raw.vehicleType as DeliveryBoy["vehicleType"],
    vehicleNumber: raw.vehicleNumber ?? "",
    status: (raw.approvalStatus ?? raw.status ?? "PENDING") as DeliveryBoy["status"],
    isAvailable: raw.isAvailable ?? true,
    currentLat: raw.currentLatitude,
    currentLng: raw.currentLongitude,
    totalDeliveries: raw.totalDeliveries ?? 0,
    earnings: raw.totalEarnings ?? 0,
    rating: raw.rating ?? 0,
    createdAt: raw.createdAt ?? "",
  };
}

// ─── Order ───────────────────────────────────────────────────────────────────

export function adaptOrderItem(raw: Record<string, any>): OrderItem {
  return {
    id: raw.id,
    product: raw.product ? adaptProduct(raw.product) : ({ id: raw.productId, name: raw.name, images: raw.image ? [raw.image] : [], price: raw.price } as any),
    variant: raw.variant ? adaptVariant(raw.variant) : undefined,
    quantity: raw.quantity,
    price: raw.price,
    total: raw.total ?? raw.price * raw.quantity,
  };
}

export function adaptOrder(raw: Record<string, any>): Order {
  return {
    id: raw.id,
    orderNumber: raw.orderNumber ?? "",
    customer: raw.user ? adaptUser(raw.user) : ({} as User),
    items: (raw.items ?? []).map(adaptOrderItem),
    address: raw.address ? adaptAddress(raw.address) : ({} as Address),
    status: raw.status as Order["status"],
    paymentMethod: raw.paymentMethod as Order["paymentMethod"],
    paymentStatus: raw.paymentStatus as Order["paymentStatus"],
    subtotal: raw.subtotal ?? 0,
    discount: raw.discount ?? 0,
    deliveryFee: raw.shippingCharge ?? raw.deliveryFee ?? 0,
    total: raw.totalAmount ?? raw.total ?? 0,
    notes: raw.notes,
    createdAt: raw.createdAt ?? "",
    updatedAt: raw.updatedAt ?? "",
  };
}

// ─── Review ──────────────────────────────────────────────────────────────────

export function adaptReview(raw: Record<string, any>): Review {
  return {
    id: raw.id,
    user: raw.user ? adaptUser(raw.user) : ({} as User),
    product: raw.product ? adaptProduct(raw.product) : ({} as Product),
    rating: raw.rating,
    comment: raw.comment ?? raw.title ?? "",
    images: raw.images ?? [],
    helpful: raw.helpful ?? 0,
    createdAt: raw.createdAt ?? "",
  };
}

// ─── Notification ─────────────────────────────────────────────────────────────

const NOTIF_TYPE_MAP: Record<string, Notification["type"]> = {
  ORDER_UPDATE: "ORDER",
  PAYMENT_SUCCESS: "PAYMENT",
  DELIVERY_ASSIGNED: "DELIVERY",
  PRODUCT_APPROVED: "SYSTEM",
  VENDOR_APPROVED: "SYSTEM",
  GENERAL: "SYSTEM",
};

export function adaptNotification(raw: Record<string, any>): Notification {
  return {
    id: raw.id,
    title: raw.title ?? "",
    message: raw.message ?? "",
    type: NOTIF_TYPE_MAP[raw.type] ?? "SYSTEM",
    isRead: raw.isRead ?? false,
    link: raw.data?.link,
    createdAt: raw.createdAt ?? "",
  };
}

// ─── Pagination ───────────────────────────────────────────────────────────────

/**
 * Backend returns { [itemsKey]: T[], total, page, limit }
 * Frontend expects { data: T[], meta: PaginationMeta }
 *
 * itemsKey is the key that holds the array in the backend response
 * (e.g. "products", "orders", "vendors", "users", "boys", "notifications", "items")
 */
export function adaptPaginated<TRaw, TOut>(
  raw: Record<string, any>,
  itemsKey: string,
  adapter: (item: TRaw) => TOut,
): PaginatedResponse<TOut> {
  // Backend can return the array under different keys — fall back gracefully
  const items: TRaw[] =
    raw[itemsKey] ??
    raw.data ??
    raw.items ??
    raw.results ??
    [];

  const total: number = raw.total ?? items.length;
  const page: number = raw.page ?? 1;
  const limit: number = raw.limit ?? items.length;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;

  const meta: PaginationMeta = {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  return { data: items.map(adapter), meta };
}
