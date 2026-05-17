import { z } from "zod";

export const vendorStep1Schema = z.object({
  shopName: z.string().min(3, "Shop name must be at least 3 characters"),
  ownerName: z.string().min(2, "Owner name is required"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid mobile number"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  description: z.string().optional(),
});

export const vendorStep2Schema = z.object({
  gstNumber: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "Invalid GST number"
    ),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number"),
  aadhaarNumber: z
    .string()
    .regex(/^\d{12}$/, "Aadhaar must be 12 digits"),
});

export const vendorStep3Schema = z.object({
  bankAccount: z.string().min(9, "Invalid account number"),
  ifscCode: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
  accountName: z.string().min(2, "Account holder name is required"),
});

export const vendorStep4Schema = z.object({
  line1: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Invalid pincode"),
});

export type VendorStep1Data = z.infer<typeof vendorStep1Schema>;
export type VendorStep2Data = z.infer<typeof vendorStep2Schema>;
export type VendorStep3Data = z.infer<typeof vendorStep3Schema>;
export type VendorStep4Data = z.infer<typeof vendorStep4Schema>;
