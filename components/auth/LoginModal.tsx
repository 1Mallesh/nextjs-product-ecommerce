"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeLoginModal } from "@/store/slices/uiSlice";
import { login } from "@/store/slices/authSlice";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginFormData } from "@/schemas/auth.schema";
import Logo from "@/components/shared/Logo";
import Link from "next/link";
import toast from "react-hot-toast";
import { vendorService } from "@/services/vendor.service";
import { deliveryService } from "@/services/delivery.service";
import type { UserRole } from "@/types";

async function resolveRoleDestination(role: UserRole, fallback?: string | null): Promise<string> {
  if (role === "VENDOR") {
    try {
      const { data } = await vendorService.getProfile();
      return data.data?.status === "APPROVED" ? "/dashboard/vendor" : "/vendor/onboarding";
    } catch {
      return "/vendor/onboarding";
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
  return fallback ?? "/dashboard/customer";
}

export default function LoginModal() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loginModalOpen, loginModalRedirect } = useAppSelector((s) => s.ui);
  const { isLoading } = useAppSelector((s) => s.auth);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleClose = () => {
    dispatch(closeLoginModal());
    reset();
  };

  const onSubmit = async (data: LoginFormData) => {
    const result = await dispatch(login(data));
    if (login.fulfilled.match(result)) {
      toast.success("Welcome back!");
      handleClose();
      const role = result.payload.user.role as UserRole;
      const dest = await resolveRoleDestination(role, loginModalRedirect);
      router.push(dest);
    } else {
      toast.error((result.payload as string) || "Invalid credentials");
    }
  };

  return (
    <Dialog open={loginModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <Logo />
          </div>
          <DialogTitle className="text-center">Sign in to continue</DialogTitle>
          <DialogDescription className="text-center text-sm">
            {loginModalRedirect === "/checkout"
              ? "Login to place your order — your cart is saved."
              : "Access your account, orders and wishlist."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <Input
            {...register("email")}
            type="email"
            placeholder="Email address"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
          />
          <Input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.password?.message}
          />

          <Button type="submit" variant="brand" className="w-full" loading={isLoading}>
            Login & Continue
          </Button>
        </form>

        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            handleClose();
            const dest = loginModalRedirect
              ? `/auth/login?redirect=${encodeURIComponent(loginModalRedirect)}`
              : "/auth/login";
            router.push(dest);
          }}
        >
          More login options
        </Button>

        <div className="text-center text-sm mt-1 space-y-1">
          <div>
            <span className="text-muted-foreground">New to TOKOMORT? </span>
            <button
              onClick={() => {
                handleClose();
                router.push("/auth/register");
              }}
              className="text-brand hover:underline font-medium"
            >
              Create account
            </button>
          </div>
          <div className="text-xs text-muted-foreground">
            Want to sell?{" "}
            <Link
              href="/auth/register?become=vendor"
              onClick={handleClose}
              className="text-brand hover:underline"
            >
              Register as Vendor
            </Link>
            {" · "}
            <Link
              href="/auth/register?become=delivery"
              onClick={handleClose}
              className="text-brand hover:underline"
            >
              Join as Delivery Partner
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
