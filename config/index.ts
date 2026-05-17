export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1",
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000",
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  googleMapsKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
  appName: process.env.NEXT_PUBLIC_APP_NAME || "TOKOMORT",
} as const;
