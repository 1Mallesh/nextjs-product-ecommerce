"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check, User, Shield, Bike, ArrowRight, ArrowLeft, Upload, Navigation } from "lucide-react";
import { deliveryService } from "@/services/delivery.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/shared/Logo";
import {
  deliveryStep1Schema, deliveryStep2Schema, deliveryStep3Schema,
  type DeliveryStep1Data, type DeliveryStep2Data, type DeliveryStep3Data,
} from "@/schemas/delivery.schema";
import toast from "react-hot-toast";

const STEPS = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Documents", icon: Shield },
  { id: 3, title: "Vehicle Info", icon: Bike },
];

const VEHICLE_TYPES = [
  { value: "BICYCLE", label: "Bicycle 🚲" },
  { value: "MOTORCYCLE", label: "Motorcycle 🏍️" },
  { value: "CAR", label: "Car 🚗" },
  { value: "VAN", label: "Van 🚐" },
];

export default function DeliveryOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [allData, setAllData] = useState<Partial<DeliveryStep1Data & DeliveryStep2Data & DeliveryStep3Data>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [submitting, setSubmitting] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);

  const step1Form = useForm<DeliveryStep1Data>({ resolver: zodResolver(deliveryStep1Schema) });
  const step2Form = useForm<DeliveryStep2Data>({ resolver: zodResolver(deliveryStep2Schema) });
  const step3Form = useForm<DeliveryStep3Data>({ resolver: zodResolver(deliveryStep3Schema) });

  const onStep1 = (data: DeliveryStep1Data) => { setAllData((p) => ({ ...p, ...data })); setCurrentStep(2); };
  const onStep2 = (data: DeliveryStep2Data) => { setAllData((p) => ({ ...p, ...data })); setCurrentStep(3); };

  const onStep3 = async (data: DeliveryStep3Data) => {
    if (!locationGranted) { toast.error("Please grant location access to continue"); return; }
    setSubmitting(true);
    const merged = { ...allData, ...data };
    try {
      const form = new FormData();
      Object.entries(merged).forEach(([k, v]) => form.append(k, String(v)));
      Object.entries(files).forEach(([k, v]) => form.append(k, v));
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
      () => toast.error("Location access denied. Please allow it.")
    );
  };

  const handleFileChange = (name: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFiles((p) => ({ ...p, [name]: e.target.files![0] }));
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-background border-b px-4 py-3 flex items-center gap-4">
        <Logo />
        <div className="h-5 w-px bg-border" />
        <p className="text-sm font-medium text-muted-foreground">Delivery Partner Registration</p>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, i) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    currentStep > step.id ? "bg-green-500 border-green-500 text-white"
                      : currentStep === step.id ? "border-brand bg-brand/10 text-brand"
                      : "border-border bg-muted text-muted-foreground"
                  }`}>
                    {currentStep > step.id ? <Check className="h-5 w-5" /> : <step.icon className="h-4 w-4" />}
                  </div>
                  <p className="text-[10px] mt-1 font-medium hidden sm:block text-muted-foreground">{step.title}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${currentStep > step.id ? "bg-green-500" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1 */}
          {currentStep === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card>
                <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={step1Form.handleSubmit(onStep1)} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Full Name *</label>
                      <Input {...step1Form.register("name")} placeholder="Your full name" error={step1Form.formState.errors.name?.message} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Mobile *</label>
                      <Input {...step1Form.register("mobile")} placeholder="10-digit mobile" error={step1Form.formState.errors.mobile?.message} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Email *</label>
                      <Input {...step1Form.register("email")} type="email" placeholder="you@example.com" error={step1Form.formState.errors.email?.message} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Password *</label>
                      <Input {...step1Form.register("password")} type="password" placeholder="Min. 8 characters" error={step1Form.formState.errors.password?.message} />
                    </div>
                    <Button type="submit" variant="brand" className="w-full">
                      Next <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card>
                <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={step2Form.handleSubmit(onStep2)} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Aadhaar Number *</label>
                      <Input {...step2Form.register("aadhaarNumber")} placeholder="12-digit Aadhaar" maxLength={12} error={step2Form.formState.errors.aadhaarNumber?.message} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Driving License Number *</label>
                      <Input {...step2Form.register("drivingLicense")} placeholder="DL number" error={step2Form.formState.errors.drivingLicense?.message} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5"><Upload className="h-3.5 w-3.5" /> Aadhaar</label>
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange("aadhaar", e)}
                          className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-brand file:text-white" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5"><Upload className="h-3.5 w-3.5" /> Driving License</label>
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange("drivingLicense", e)}
                          className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-brand file:text-white" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setCurrentStep(1)}><ArrowLeft className="h-4 w-4" /> Back</Button>
                      <Button type="submit" variant="brand" className="flex-1">Next <ArrowRight className="h-4 w-4" /></Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card>
                <CardHeader><CardTitle>Vehicle Details</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={step3Form.handleSubmit(onStep3)} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Vehicle Type *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {VEHICLE_TYPES.map((v) => {
                          const val = step3Form.watch("vehicleType");
                          return (
                            <button key={v.value} type="button"
                              onClick={() => step3Form.setValue("vehicleType", v.value as never)}
                              className={`p-3 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                                val === v.value ? "border-brand bg-brand/10 text-brand" : "border-border hover:border-brand/40"
                              }`}
                            >{v.label}</button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Vehicle Number *</label>
                      <Input {...step3Form.register("vehicleNumber")} placeholder="MH01AB1234" error={step3Form.formState.errors.vehicleNumber?.message} />
                    </div>

                    {/* Location permission */}
                    <div className={`rounded-xl p-4 border ${locationGranted ? "bg-green-50 dark:bg-green-950/30 border-green-200" : "bg-muted"}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium flex items-center gap-2">
                            <Navigation className={`h-4 w-4 ${locationGranted ? "text-green-600" : "text-muted-foreground"}`} />
                            Live Location Access {locationGranted && "✓"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">Required for delivery tracking</p>
                        </div>
                        {!locationGranted && (
                          <Button type="button" size="sm" variant="brand" onClick={requestLocation}>Allow</Button>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setCurrentStep(2)}><ArrowLeft className="h-4 w-4" /> Back</Button>
                      <Button type="submit" variant="brand" className="flex-1" loading={submitting}>Submit Application</Button>
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
