"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { login, setCredentials } from "@/store/slices/authSlice";
import { vendorService } from "@/services/vendor.service";
import { deliveryService } from "@/services/delivery.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginFormData } from "@/schemas/auth.schema";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { authService } from "@/services/auth.service";
import toast from "react-hot-toast";
import type { UserRole } from "@/types";

export default function LoginPageClient() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { isLoading } = useAppSelector((s) => s.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [tab, setTab] = useState(searchParams.get("tab") === "otp" ? "otp" : "password");
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const resolveDestination = async (role: UserRole): Promise<string> => {
    if (role === "VENDOR") {
      try {
        await vendorService.getProfile();
        return "/dashboard/vendor"; // profile exists → go to dashboard (pending banner shown there)
      } catch {
        return "/vendor/onboarding"; // no profile yet → complete onboarding first
      }
    }
    if (role === "DELIVERY_BOY") {
      try {
        await deliveryService.getProfile();
        return "/dashboard/delivery";
      } catch {
        return "/delivery/onboarding";
      }
    }
    if (role === "ADMIN") return "/dashboard/admin";
    // CUSTOMER — respect redirect param if it's not just "/"
    return redirect && redirect !== "/" ? redirect : "/";
  };

  const onPasswordLogin = async (data: LoginFormData) => {
    const result = await dispatch(login(data));
    if (login.fulfilled.match(result)) {
      toast.success("Welcome back!");
      const dest = await resolveDestination(result.payload.user.role as UserRole);
      router.push(dest);
    } else {
      toast.error((result.payload as string) || "Invalid credentials");
    }
  };

  const handleSendOtp = async () => {
    if (!otpEmail || !/\S+@\S+\.\S+/.test(otpEmail)) {
      toast.error("Enter a valid email address");
      return;
    }
    setOtpLoading(true);
    try {
      await authService.forgotPassword(otpEmail);
      setOtpSent(true);
      toast.success("OTP sent to your email");
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpLogin = async () => {
    if (otp.length !== 6) { toast.error("Enter the 6-digit OTP"); return; }
    setOtpLoading(true);
    try {
      const { data } = await authService.verifyOtp({ email: otpEmail, otp });
      dispatch(setCredentials({ accessToken: data.data.accessToken, refreshToken: data.data.refreshToken }));
      toast.success("Login successful!");
      router.push(redirect);
    } catch {
      toast.error("Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sign in to TOKOMORT</h1>
        <p className="text-muted-foreground text-sm mt-1">Access your orders, wishlist and more</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="password" className="flex-1">
            <Mail className="h-4 w-4 mr-2" /> Email
          </TabsTrigger>
          <TabsTrigger value="otp" className="flex-1">
            <Mail className="h-4 w-4 mr-2" /> OTP
          </TabsTrigger>
        </TabsList>

        <TabsContent value="password" className="mt-4">
          <form onSubmit={handleSubmit(onPasswordLogin)} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email address</label>
              <Input {...register("email")} type="email" placeholder="you@example.com"
                leftIcon={<Mail className="h-4 w-4" />} error={errors.email?.message} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-brand hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input {...register("password")} type={showPassword ? "text" : "password"}
                placeholder="Enter your password" leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={errors.password?.message} />
            </div>
            <Button type="submit" variant="brand" className="w-full" size="lg" loading={isLoading}>
              Login <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="otp" className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Email address</label>
            <Input value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)}
              placeholder="you@example.com" type="email"
              leftIcon={<Mail className="h-4 w-4" />} />
          </div>
          {!otpSent ? (
            <Button onClick={handleSendOtp} variant="brand" className="w-full" size="lg" loading={otpLoading}>
              Send OTP
            </Button>
          ) : (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Enter OTP</label>
                  <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP"
                    maxLength={6} className="text-center text-lg tracking-[0.5em] font-bold" />
                  <p className="text-xs text-muted-foreground mt-1">
                    OTP sent to {otpEmail}.{" "}
                    <button onClick={handleSendOtp} className="text-brand hover:underline">Resend</button>
                  </p>
                </div>
                <Button onClick={handleOtpLogin} variant="brand" className="w-full" size="lg" loading={otpLoading}>
                  Verify & Login
                </Button>
              </motion.div>
            </AnimatePresence>
          )}
        </TabsContent>
      </Tabs>

      <p className="text-center text-sm text-muted-foreground">
        New to TOKOMORT?{" "}
        <Link href="/auth/register" className="text-brand hover:underline font-medium">Create account</Link>
      </p>
    </div>
  );
}
