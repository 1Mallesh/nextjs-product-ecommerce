"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, Phone, User, ArrowRight, ShoppingBag, Store, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { register as registerUser } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerSchema, type RegisterFormData } from "@/schemas/auth.schema";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import type { UserRole } from "@/types";

type RegistrationRole = "CUSTOMER" | "VENDOR" | "DELIVERY_BOY";

const ROLE_OPTIONS: { role: RegistrationRole; label: string; desc: string; icon: React.ReactNode }[] = [
  { role: "CUSTOMER", label: "Shop", desc: "Buy from thousands of vendors", icon: <ShoppingBag className="h-5 w-5" /> },
  { role: "VENDOR", label: "Sell", desc: "List products & grow your business", icon: <Store className="h-5 w-5" /> },
  { role: "DELIVERY_BOY", label: "Deliver", desc: "Earn by delivering orders", icon: <Truck className="h-5 w-5" /> },
];

const POST_REGISTER_REDIRECT: Record<UserRole, string> = {
  ADMIN: "/dashboard/admin",
  VENDOR: "/vendor/onboarding",
  DELIVERY_BOY: "/delivery/onboarding",
  CUSTOMER: "/dashboard/customer",
};

const POST_REGISTER_TOAST: Record<RegistrationRole, string> = {
  CUSTOMER: "Welcome to TOKOMORT! Start shopping.",
  VENDOR: "Account created! Complete your vendor profile to start selling.",
  DELIVERY_BOY: "Account created! Set up your delivery profile to start earning.",
};

function resolveInitialRole(become: string | null): RegistrationRole {
  if (become === "vendor") return "VENDOR";
  if (become === "delivery") return "DELIVERY_BOY";
  return "CUSTOMER";
}

export default function RegisterPageClient() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading } = useAppSelector((s) => s.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RegistrationRole>(
    resolveInitialRole(searchParams.get("become"))
  );

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    const result = await dispatch(registerUser({ ...data, role: selectedRole }));
    if (registerUser.fulfilled.match(result)) {
      const role = result.payload.user.role as UserRole;
      toast.success(POST_REGISTER_TOAST[role as RegistrationRole] ?? "Welcome to TOKOMORT!");
      router.push(POST_REGISTER_REDIRECT[role] ?? "/");
    } else {
      toast.error((result.payload as string) || "Registration failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-muted-foreground text-sm mt-1">Join millions on TOKOMORT</p>
      </div>

      {/* Role selector */}
      <div className="grid grid-cols-3 gap-2">
        {ROLE_OPTIONS.map(({ role, label, desc, icon }) => (
          <motion.button
            key={role}
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => setSelectedRole(role)}
            className={cn(
              "flex flex-col items-center text-center gap-2 rounded-xl border-2 p-3 transition-all",
              selectedRole === role ? "border-brand bg-brand/5" : "border-border hover:border-brand/40"
            )}
          >
            <div className={cn(
              "h-9 w-9 rounded-full flex items-center justify-center",
              selectedRole === role ? "bg-brand text-white" : "bg-muted text-muted-foreground"
            )}>
              {icon}
            </div>
            <div>
              <p className={cn("font-semibold text-sm", selectedRole === role && "text-brand")}>{label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{desc}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Full name</label>
          <Input {...register("name")} placeholder="Your full name"
            leftIcon={<User className="h-4 w-4" />} error={errors.name?.message} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Email address</label>
          <Input {...register("email")} type="email" placeholder="you@example.com"
            leftIcon={<Mail className="h-4 w-4" />} error={errors.email?.message} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Mobile number</label>
          <Input {...register("mobile")} placeholder="10-digit mobile number"
            leftIcon={<Phone className="h-4 w-4" />} error={errors.mobile?.message} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Password</label>
          <Input {...register("password")} type={showPassword ? "text" : "password"}
            placeholder="Min. 8 characters" leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.password?.message} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Confirm password</label>
          <Input {...register("confirmPassword")} type="password" placeholder="Re-enter your password"
            leftIcon={<Lock className="h-4 w-4" />} error={errors.confirmPassword?.message} />
        </div>

        <p className="text-xs text-muted-foreground">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-brand hover:underline">Terms</Link> and{" "}
          <Link href="/privacy" className="text-brand hover:underline">Privacy Policy</Link>.
        </p>

        <Button type="submit" variant="brand" className="w-full" size="lg" loading={isLoading}>
          {selectedRole === "VENDOR" ? "Create Vendor Account"
            : selectedRole === "DELIVERY_BOY" ? "Create Delivery Account"
            : "Create Account"}{" "}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-brand hover:underline font-medium">Sign in</Link>
      </p>
    </div>
  );
}
