"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, User, Shield, FileText, Bike,
  ArrowRight, ArrowLeft, Upload, Navigation, Eye,
} from "lucide-react";
import { deliveryService } from "@/services/delivery.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Logo from "@/components/shared/Logo";
import {
  deliveryStep1Schema, deliveryStep2Schema, deliveryStep3Schema,
  type DeliveryStep1Data, type DeliveryStep2Data, type DeliveryStep3Data,
} from "@/schemas/delivery.schema";
import toast from "react-hot-toast";

const STEPS = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "KYC Details", icon: Shield },
  { id: 3, title: "Documents", icon: FileText },
  { id: 4, title: "Vehicle", icon: Bike },
];

const VEHICLE_TYPES = [
  { value: "BICYCLE", label: "Bicycle", emoji: "🚲" },
  { value: "MOTORCYCLE", label: "Motorcycle", emoji: "🏍️" },
  { value: "CAR", label: "Car", emoji: "🚗" },
  { value: "VAN", label: "Van", emoji: "🚐" },
];

type FileKeys = "profilePhoto" | "aadhaarFront" | "aadhaarBack" | "panCard" | "drivingLicenseImage";

const FILE_INPUTS: { key: FileKeys; label: string; required: boolean }[] = [
  { key: "profilePhoto", label: "Profile Photo", required: true },
  { key: "aadhaarFront", label: "Aadhaar Card (Front)", required: true },
  { key: "aadhaarBack", label: "Aadhaar Card (Back)", required: true },
  { key: "panCard", label: "PAN Card", required: true },
  { key: "drivingLicenseImage", label: "Driving License", required: true },
];

export default function DeliveryOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [allData, setAllData] = useState<Partial<DeliveryStep1Data & DeliveryStep2Data & DeliveryStep3Data>>({});
  const [files, setFiles] = useState<Partial<Record<FileKeys, File>>>({});
  const [previews, setPreviews] = useState<Partial<Record<FileKeys, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);

  const step1Form = useForm<DeliveryStep1Data>({ resolver: zodResolver(deliveryStep1Schema) });
  const step2Form = useForm<DeliveryStep2Data>({ resolver: zodResolver(deliveryStep2Schema) });
  const step3Form = useForm<DeliveryStep3Data>({ resolver: zodResolver(deliveryStep3Schema) });

  const onStep1 = (data: DeliveryStep1Data) => { setAllData((p) => ({ ...p, ...data })); setCurrentStep(2); };
  const onStep2 = (data: DeliveryStep2Data) => { setAllData((p) => ({ ...p, ...data })); setCurrentStep(3); };

  const onStep3 = () => {
    const requiredFiles: FileKeys[] = ["profilePhoto", "aadhaarFront", "aadhaarBack", "panCard", "drivingLicenseImage"];
    const missing = requiredFiles.filter((k) => !files[k]);
    if (missing.length) {
      toast.error(`Please upload: ${missing.map((k) => FILE_INPUTS.find((f) => f.key === k)?.label).join(", ")}`);
      return;
    }
    setCurrentStep(4);
  };

  const onStep4 = async (data: DeliveryStep3Data) => {
    if (!locationGranted) { toast.error("Please grant location access to continue"); return; }
    setSubmitting(true);
    const merged = { ...allData, ...data };
    try {
      const form = new FormData();
      Object.entries(merged).forEach(([k, v]) => { if (v !== undefined) form.append(k, String(v)); });
      (Object.entries(files) as [FileKeys, File][]).forEach(([k, v]) => form.append(k, v));
      await deliveryService.onboard(form);
      toast.success("Application submitted! We'll review within 24 hours.");
      router.push("/dashboard/delivery");
    } catch {
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const requestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      () => { setLocationGranted(true); toast.success("Location access granted!"); },
      () => toast.error("Location access denied. Please allow it in browser settings.")
    );
  };

  const handleFileChange = (key: FileKeys, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFiles((p) => ({ ...p, [key]: file }));
    const url = URL.createObjectURL(file);
    setPreviews((p) => ({ ...p, [key]: url }));
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b px-4 py-3 flex items-center gap-4">
        <Logo />
        <div className="h-5 w-px bg-border" />
        <p className="text-sm font-medium text-muted-foreground">Delivery Partner Registration</p>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Step progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
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
                  <p className="text-[10px] mt-1 font-medium hidden sm:block text-muted-foreground">{step.title}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-colors ${currentStep > step.id ? "bg-green-500" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">Step {currentStep} of {STEPS.length}</p>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Basic details for your delivery partner account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={step1Form.handleSubmit(onStep1)} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Full Name *</label>
                      <Input {...step1Form.register("name")} placeholder="As per Aadhaar card" error={step1Form.formState.errors.name?.message} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Mobile Number *</label>
                      <Input {...step1Form.register("mobile")} placeholder="10-digit mobile" maxLength={10} error={step1Form.formState.errors.mobile?.message} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Email Address *</label>
                      <Input {...step1Form.register("email")} type="email" placeholder="you@example.com" error={step1Form.formState.errors.email?.message} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Password *</label>
                      <Input {...step1Form.register("password")} type="password" placeholder="Minimum 8 characters" error={step1Form.formState.errors.password?.message} />
                    </div>
                    <Button type="submit" variant="brand" className="w-full gap-2">
                      Continue <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: KYC Details (text fields) */}
          {currentStep === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <Card>
                <CardHeader>
                  <CardTitle>KYC Verification</CardTitle>
                  <CardDescription>Government ID details for identity verification</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={step2Form.handleSubmit(onStep2)} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Aadhaar Number *</label>
                      <Input
                        {...step2Form.register("aadhaarNumber")}
                        placeholder="12-digit Aadhaar number"
                        maxLength={12}
                        error={step2Form.formState.errors.aadhaarNumber?.message}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">PAN Number *</label>
                      <Input
                        {...step2Form.register("panNumber")}
                        placeholder="e.g. ABCDE1234F"
                        maxLength={10}
                        className="uppercase"
                        onChange={(e) => {
                          e.target.value = e.target.value.toUpperCase();
                          step2Form.setValue("panNumber", e.target.value);
                        }}
                        error={step2Form.formState.errors.panNumber?.message}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Driving License Number *</label>
                      <Input
                        {...step2Form.register("drivingLicense")}
                        placeholder="e.g. MH0120220012345"
                        error={step2Form.formState.errors.drivingLicense?.message}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Full Address *</label>
                      <textarea
                        {...step2Form.register("address")}
                        placeholder="House/Flat No., Street, Area, City, State, PIN"
                        rows={3}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
                      />
                      {step2Form.formState.errors.address && (
                        <p className="text-xs text-destructive mt-1">{step2Form.formState.errors.address.message}</p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" className="flex-1 gap-2" onClick={() => setCurrentStep(1)}>
                        <ArrowLeft className="h-4 w-4" /> Back
                      </Button>
                      <Button type="submit" variant="brand" className="flex-1 gap-2">
                        Continue <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Document Uploads */}
          {currentStep === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Upload Documents</CardTitle>
                  <CardDescription>Upload clear photos of your documents (JPG/PNG, max 5MB each)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {FILE_INPUTS.map(({ key, label, required }) => (
                    <div key={key} className="space-y-2">
                      <label className="text-sm font-medium block">
                        {label} {required && <span className="text-destructive">*</span>}
                      </label>
                      <div className={`border-2 border-dashed rounded-xl p-3 transition-colors ${
                        files[key] ? "border-green-400 bg-green-50 dark:bg-green-950/20" : "border-border hover:border-brand/40"
                      }`}>
                        {previews[key] ? (
                          <div className="flex items-center gap-3">
                            <img src={previews[key]} alt={label} className="h-14 w-20 object-cover rounded-lg" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-green-700 dark:text-green-400 truncate">{files[key]?.name}</p>
                              <p className="text-xs text-muted-foreground">{((files[key]?.size ?? 0) / 1024).toFixed(0)} KB</p>
                            </div>
                            <label className="cursor-pointer">
                              <Eye className="h-4 w-4 text-muted-foreground" />
                              <input type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => handleFileChange(key, e)} />
                            </label>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center gap-1.5 cursor-pointer py-2">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Click to upload {label}</span>
                            <input type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => handleFileChange(key, e)} />
                          </label>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1 gap-2" onClick={() => setCurrentStep(2)}>
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button type="button" variant="brand" className="flex-1 gap-2" onClick={onStep3}>
                      Continue <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Vehicle + Location */}
          {currentStep === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Details</CardTitle>
                  <CardDescription>Your delivery vehicle information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={step3Form.handleSubmit(onStep4)} className="space-y-5">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Vehicle Type *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {VEHICLE_TYPES.map((v) => {
                          const val = step3Form.watch("vehicleType");
                          return (
                            <button
                              key={v.value}
                              type="button"
                              onClick={() => step3Form.setValue("vehicleType", v.value as never)}
                              className={`p-3 rounded-xl border-2 text-sm font-medium transition-all text-left flex items-center gap-2 ${
                                val === v.value
                                  ? "border-brand bg-brand/10 text-brand"
                                  : "border-border hover:border-brand/40"
                              }`}
                            >
                              <span className="text-xl">{v.emoji}</span> {v.label}
                            </button>
                          );
                        })}
                      </div>
                      {step3Form.formState.errors.vehicleType && (
                        <p className="text-xs text-destructive mt-1">{step3Form.formState.errors.vehicleType.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Vehicle Number *</label>
                      <Input
                        {...step3Form.register("vehicleNumber")}
                        placeholder="MH01AB1234"
                        className="uppercase"
                        onChange={(e) => {
                          e.target.value = e.target.value.toUpperCase();
                          step3Form.setValue("vehicleNumber", e.target.value);
                        }}
                        error={step3Form.formState.errors.vehicleNumber?.message}
                      />
                    </div>

                    {/* Location permission */}
                    <div className={`rounded-xl p-4 border transition-colors ${
                      locationGranted
                        ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                        : "bg-muted border-border"
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium flex items-center gap-2">
                            <Navigation className={`h-4 w-4 ${locationGranted ? "text-green-600" : "text-muted-foreground"}`} />
                            Live Location Access {locationGranted && "✓"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">Required for delivery tracking</p>
                        </div>
                        {locationGranted ? (
                          <span className="text-xs text-green-600 font-medium bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded-full">Granted</span>
                        ) : (
                          <Button type="button" size="sm" variant="brand" onClick={requestLocation}>Allow</Button>
                        )}
                      </div>
                    </div>

                    {/* Declaration */}
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
                      <p className="text-xs text-blue-800 dark:text-blue-300">
                        By submitting this application, I confirm that all information provided is accurate and genuine.
                        I authorize TOKOMORT to verify my documents. False information may result in rejection or termination.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button type="button" variant="outline" className="flex-1 gap-2" onClick={() => setCurrentStep(3)}>
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
