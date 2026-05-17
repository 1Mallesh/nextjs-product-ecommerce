"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

type Step = "email" | "otp" | "done";

export default function ForgotPasswordClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      toast.success("OTP sent to your email");
      setStep("otp");
    } catch {
      toast.error("Email not found");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (otp.length !== 6) { toast.error("Enter the 6-digit OTP"); return; }
    if (newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }

    setLoading(true);
    try {
      // API expects { email, otp, newPassword }
      await authService.resetPassword(email, otp, newPassword);
      toast.success("Password reset successfully!");
      setStep("done");
    } catch {
      toast.error("Invalid OTP or OTP expired");
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <div className="space-y-6 text-center">
        <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-7 w-7 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Password Reset!</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your password has been changed. You can now login with your new password.
          </p>
        </div>
        <Button variant="brand" className="w-full" size="lg" onClick={() => router.push("/auth/login")}>
          Login Now <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Enter the OTP sent to <strong>{email}</strong> and your new password.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">OTP</label>
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="6-digit OTP"
              maxLength={6}
              className="text-center text-lg tracking-[0.5em] font-bold"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">New Password</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
              leftIcon={<Lock className="h-4 w-4" />}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Confirm Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              leftIcon={<Lock className="h-4 w-4" />}
            />
          </div>

          <Button onClick={handleResetPassword} variant="brand" className="w-full" size="lg" loading={loading}>
            Reset Password <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Didn&apos;t receive OTP?{" "}
            <button onClick={handleSendOtp} className="text-brand hover:underline font-medium">
              Resend
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Forgot Password?</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Enter your email and we&apos;ll send you an OTP to reset your password.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Email address</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
            onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
          />
        </div>

        <Button onClick={handleSendOtp} variant="brand" className="w-full" size="lg" loading={loading}>
          Send OTP <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/auth/login" className="text-brand hover:underline font-medium">Sign in</Link>
      </p>
    </div>
  );
}
