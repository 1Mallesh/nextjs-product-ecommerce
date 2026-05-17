export const ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT: (slug: string) => `/products/${slug}`,
  CATEGORY: (slug: string) => `/categories/${slug}`,
  CATEGORIES: "/categories",
  CART: "/cart",
  WISHLIST: "/wishlist",
  CHECKOUT: "/checkout",
  ORDER_SUCCESS: (id: string) => `/orders/${id}/success`,
  ORDER_TRACKING: (id: string) => `/orders/${id}/tracking`,
  ORDERS: "/orders",
  OFFERS: "/offers",
  ABOUT: "/about",
  CONTACT: "/contact",
  FAQ: "/faq",
  PRIVACY: "/privacy",
  TERMS: "/terms",

  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",

  // Customer
  CUSTOMER_DASHBOARD: "/dashboard/customer",
  CUSTOMER_PROFILE: "/dashboard/customer/profile",
  CUSTOMER_ORDERS: "/dashboard/customer/orders",
  CUSTOMER_WISHLIST: "/dashboard/customer/wishlist",
  CUSTOMER_ADDRESSES: "/dashboard/customer/addresses",
  CUSTOMER_NOTIFICATIONS: "/dashboard/customer/notifications",

  // Vendor
  VENDOR_ONBOARDING: "/vendor/onboarding",
  VENDOR_DASHBOARD: "/dashboard/vendor",
  VENDOR_PRODUCTS: "/dashboard/vendor/products",
  VENDOR_ORDERS: "/dashboard/vendor/orders",
  VENDOR_INVENTORY: "/dashboard/vendor/inventory",
  VENDOR_ANALYTICS: "/dashboard/vendor/analytics",
  VENDOR_EARNINGS: "/dashboard/vendor/earnings",
  VENDOR_NOTIFICATIONS: "/dashboard/vendor/notifications",

  // Delivery
  DELIVERY_ONBOARDING: "/delivery/onboarding",
  DELIVERY_DASHBOARD: "/dashboard/delivery",
  DELIVERY_ORDERS: "/dashboard/delivery/orders",
  DELIVERY_HISTORY: "/dashboard/delivery/history",
  DELIVERY_EARNINGS: "/dashboard/delivery/earnings",
  DELIVERY_TRACKING: "/dashboard/delivery/tracking",

  // Admin
  ADMIN_DASHBOARD: "/dashboard/admin",
  ADMIN_USERS: "/dashboard/admin/users",
  ADMIN_VENDORS: "/dashboard/admin/vendors",
  ADMIN_DELIVERY: "/dashboard/admin/delivery",
  ADMIN_PRODUCTS: "/dashboard/admin/products",
  ADMIN_ORDERS: "/dashboard/admin/orders",
  ADMIN_CATEGORIES: "/dashboard/admin/categories",
  ADMIN_ANALYTICS: "/dashboard/admin/analytics",
  ADMIN_REFUNDS: "/dashboard/admin/refunds",
  ADMIN_REPORTS: "/dashboard/admin/reports",
  ADMIN_NOTIFICATIONS: "/dashboard/admin/notifications",
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  PACKED: "Packed",
  PICKED_UP: "Picked Up",
  IN_TRANSIT: "In Transit",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
  REFUNDED: "Refunded",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  PACKED: "bg-indigo-100 text-indigo-800",
  PICKED_UP: "bg-cyan-100 text-cyan-800",
  IN_TRANSIT: "bg-teal-100 text-teal-800",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  RETURNED: "bg-gray-100 text-gray-800",
  REFUNDED: "bg-pink-100 text-pink-800",
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-blue-100 text-blue-800",
};

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
  "Chandigarh",
];

export const DELIVERY_SLOTS = [
  { id: "express", label: "Express Delivery", time: "2-4 hours", price: 49 },
  { id: "same_day", label: "Same Day Delivery", time: "By 9 PM", price: 29 },
  { id: "next_day", label: "Next Day Delivery", time: "By 9 PM", price: 0 },
  { id: "standard", label: "Standard Delivery", time: "3-5 days", price: 0 },
];

export const ITEMS_PER_PAGE = 20;
export const MIN_PRICE_FOR_FREE_DELIVERY = 499;
export const BELOW_50_SECTION_MAX_PRICE = 50;
