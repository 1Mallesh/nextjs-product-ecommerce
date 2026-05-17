import { z } from "zod";

export const deliveryStep1Schema = z.object({
  name: z.string().min(2, "Name is required"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid mobile number"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const deliveryStep2Schema = z.object({
  aadhaarNumber: z.string().regex(/^\d{12}$/, "Aadhaar must be 12 digits"),
  drivingLicense: z.string().min(5, "Driving license number is required"),
});

export const deliveryStep3Schema = z.object({
  vehicleType: z.enum(["BICYCLE", "MOTORCYCLE", "CAR", "VAN"]),
  vehicleNumber: z
    .string()
    .regex(/^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/, "Invalid vehicle number"),
});

export type DeliveryStep1Data = z.infer<typeof deliveryStep1Schema>;
export type DeliveryStep2Data = z.infer<typeof deliveryStep2Schema>;
export type DeliveryStep3Data = z.infer<typeof deliveryStep3Schema>;
