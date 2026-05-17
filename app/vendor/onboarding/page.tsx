"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Upload, Store, Shield, Banknote, MapPin, ArrowRight, ArrowLeft } from "lucide-react";
import { vendorService } from "@/services/vendor.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/shared/Logo";
import {
  vendorStep1Schema, vendorStep2Schema, vendorStep3Schema, vendorStep4Schema,
  type VendorStep1Data, type VendorStep2Data, type VendorStep3Data, type VendorStep4Data,
} from "@/schemas/vendor.schema";
import { INDIAN_STATES } from "@/constants";
import toast from "react-hot-toast";

const STEPS = [
  { id: 1, title: "Basic Info", icon: Store },
  { id: 2, title: "KYC Details", icon: Shield },
  { id: 3, title: "Bank Account", icon: Banknote },
  { id: 4, title: "Shop Location", icon: MapPin },
];

type AllData = VendorStep1Data & VendorStep2Data & VendorStep3Data & VendorStep4Data;

export default function VendorOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [allData, setAllData] = useState<Partial<AllData>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [submitting, setSubmitting] = useState(false);

  const step1Form = useForm<VendorStep1Data>({ resolver: zodResolver(vendorStep1Schema) });
  const step2Form = useForm<VendorStep2Data>({ resolver: zodResolver(vendorStep2Schema) });
  const step3Form = useForm<VendorStep3Data>({ resolver: zodResolver(vendorStep3Schema) });
  const step4Form = useForm<VendorStep4Data>({ resolver: zodResolver(vendorStep4Schema) });

  const onStep1 = (data: VendorStep1Data) => { setAllData((p) => ({ ...p, ...data })); setCurrentStep(2); };
  const onStep2 = (data: VendorStep2Data) => { setAllData((p) => ({ ...p, ...data })); setCurrentStep(3); };
  const onStep3 = (data: VendorStep3Data) => { setAllData((p) => ({ ...p, ...data })); setCurrentStep(4); };

  const onStep4 = async (data: VendorStep4Data) => {
    setSubmitting(true);
    const merged = { ...allData, ...data };
    try {
      const form = new FormData();
      Object.entries(merged).forEach(([k, v]) => form.append(k, String(v)));
      Object.entries(files).forEach(([k, v]) => form.append(k, v));

      await vendorService.onboard(form);
      toast.success("Application submitted! We'll review within 24 hours.");
      router.push("/dashboard/vendor");
    } catch {
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (name: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFiles((p) => ({ ...p, [name]: e.target.files![0] }));
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b px-4 py-3 flex items-center gap-4">
        <Logo />
        <div className="h-5 w-px bg-border" />
        <p className="text-sm font-medium text-muted-foreground">Vendor Registration</p>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, i) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    currentStep > step.id
                      ? "bg-green-500 border-green-500 text-white"
                      : currentStep === step.id
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border bg-muted text-muted-foreground"
                  }`}>
                    {currentStep > step.id ? <Check className="h-5 w-5" /> : <step.icon className="h-4 w-4" />}
                  </div>
                  <p className={`text-[10px] mt-1 font-medium hidden sm:block ${
                    currentStep === step.id ? "text-brand" : "text-muted-foreground"
                  }`}>
                    {step.title}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-all ${
                    currentStep > step.id ? "bg-green-500" : "bg-border"
                  }`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Step {currentStep} of {STEPS.length}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={step1Form.handleSubmit(onStep1)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Shop Name *</label>
                        <Input {...step1Form.register("shopName")} placeholder="Your shop name" error={step1Form.formState.errors.shopName?.message} />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Owner Name *</label>
                        <Input {...step1Form.register("ownerName")} placeholder="Full name" error={step1Form.formState.errors.ownerName?.message} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Email *</label>
                      <Input {...step1Form.register("email")} type="email" placeholder="shop@example.com" error={step1Form.formState.errors.email?.message} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Mobile *</label>
                      <Input {...step1Form.register("mobile")} placeholder="10-digit mobile number" error={step1Form.formState.errors.mobile?.message} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Password *</label>
                      <Input {...step1Form.register("password")} type="password" placeholder="Min. 8 characters" error={step1Form.formState.errors.password?.message} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Shop Description</label>
                      <textarea
                        {...step1Form.register("description")}
                        placeholder="Tell customers about your shop..."
                        rows={3}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
                        <Upload className="h-4 w-4" /> Shop Image
                      </label>
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange("shopImage", e)}
                        className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-brand file:text-white file:cursor-pointer" />
                    </div>
                    <Button type="submit" variant="brand" className="w-full">
                      Next: KYC Details <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: KYC */}
          {currentStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card>
                <CardHeader>
                  <CardTitle>KYC Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={step2Form.handleSubmit(onStep2)} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">GST Number *</label>
                      <Input {...step2Form.register("gstNumber")} placeholder="22AAAAA0000A1Z5" error={step2Form.formState.errors.gstNumber?.message} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">PAN Number *</label>
                      <Input {...step2Form.register("panNumber")} placeholder="ABCDE1234F" error={step2Form.formState.errors.panNumber?.message} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Aadhaar Number *</label>
                      <Input {...step2Form.register("aadhaarNumber")} placeholder="12-digit Aadhaar" maxLength={12} error={step2Form.formState.errors.aadhaarNumber?.message} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5"><Upload className="h-3.5 w-3.5" /> Aadhaar Front</label>
                        <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange("aadhaarFront", e)}
                          className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-brand file:text-white" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5"><Upload className="h-3.5 w-3.5" /> PAN Card</label>
                        <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange("panCard", e)}
                          className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-brand file:text-white" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setCurrentStep(1)}>
                        <ArrowLeft className="h-4 w-4" /> Back
                      </Button>
                      <Button type="submit" variant="brand" className="flex-1">
                        Next: Bank Info <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Bank */}
          {currentStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Bank Account Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={step3Form.handleSubmit(onStep3)} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Account Holder Name *</label>
                      <Input {...step3Form.register("accountName")} placeholder="Name as in bank" error={step3Form.formState.errors.accountName?.message} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Account Number *</label>
                      <Input {...step3Form.register("bankAccount")} placeholder="Account number" error={step3Form.formState.errors.bankAccount?.message} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">IFSC Code *</label>
                      <Input {...step3Form.register("ifscCode")} placeholder="SBIN0000000" error={step3Form.formState.errors.ifscCode?.message} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5"><Upload className="h-3.5 w-3.5" /> Passbook / Cheque</label>
                      <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange("passbook", e)}
                        className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-brand file:text-white" />
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setCurrentStep(2)}>
                        <ArrowLeft className="h-4 w-4" /> Back
                      </Button>
                      <Button type="submit" variant="brand" className="flex-1">
                        Next: Location <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Location */}
          {currentStep === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Shop Location & Pickup Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={step4Form.handleSubmit(onStep4)} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Address Line 1 *</label>
                      <Input {...step4Form.register("line1")} placeholder="Shop number, street name" error={step4Form.formState.errors.line1?.message} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">City *</label>
                        <Input {...step4Form.register("city")} placeholder="City" error={step4Form.formState.errors.city?.message} />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Pincode *</label>
                        <Input {...step4Form.register("pincode")} placeholder="6-digit pincode" error={step4Form.formState.errors.pincode?.message} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">State *</label>
                      <select {...step4Form.register("state")}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-400">
                      ℹ️ Your application will be reviewed within 24 hours. You&apos;ll receive an email once approved.
                    </div>

                    <div className="flex gap-3">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setCurrentStep(3)}>
                        <ArrowLeft className="h-4 w-4" /> Back
                      </Button>
                      <Button type="submit" variant="brand" className="flex-1" loading={submitting}>
                        Submit Application
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
