import { z } from "zod";

export const addressSchema = z.object({
  name: z.string().min(2, "Name is required"),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid Indian mobile number"),
  line1: z.string().min(5, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z
    .string()
    .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit pincode"),
  country: z.string().default("India"),
  type: z.enum(["HOME", "WORK", "OTHER"]).default("HOME"),
});

export type AddressFormData = z.infer<typeof addressSchema>;
