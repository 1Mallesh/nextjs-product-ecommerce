import { z } from "zod";

/**
 * Matches backend CreateAddressDto exactly.
 * Fields: label, fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault
 * Removed: postalCode, country, type, name, mobile, line1, line2
 */
export const addressSchema = z.object({
  label: z.string().min(1, "Label is required (e.g. Home, Work)"),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  addressLine1: z.string().min(5, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit pincode"),
  isDefault: z.boolean().default(false),
});

export type AddressFormData = z.infer<typeof addressSchema>;
