"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, Phone, User, ArrowRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { register as registerUser } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerSchema, type RegisterFormData } from "@/schemas/auth.schema";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading } = useAppSelector((s) => s.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    const result = await dispatch(registerUser({ ...data, role: "CUSTOMER" }));
    if (registerUser.fulfilled.match(result)) {
      toast.success("Account created! Welcome to TOKOMORT!");
      router.push("/dashboard/customer");
    } else {
      toast.error(result.payload as string || "Registration failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Join millions of shoppers on TOKOMORT
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Full name</label>
          <Input
            {...register("name")}
            placeholder="Your full name"
            leftIcon={<User className="h-4 w-4" />}
            error={errors.name?.message}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Email address</label>
          <Input
            {...register("email")}
            type="email"
            placeholder="you@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Mobile number</label>
          <Input
            {...register("mobile")}
            placeholder="10-digit mobile number"
            leftIcon={<Phone className="h-4 w-4" />}
            error={errors.mobile?.message}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Password</label>
          <Input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 characters"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.password?.message}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Confirm password</label>
          <Input
            {...register("confirmPassword")}
            type="password"
            placeholder="Re-enter your password"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.confirmPassword?.message}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-brand hover:underline">Terms</Link> and{" "}
          <Link href="/privacy" className="text-brand hover:underline">Privacy Policy</Link>.
        </p>

        <Button type="submit" variant="brand" className="w-full" size="lg" loading={isLoading}>
          Create Account <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-brand hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
