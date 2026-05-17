"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, Phone } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeLoginModal } from "@/store/slices/uiSlice";
import { login } from "@/store/slices/authSlice";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginFormData } from "@/schemas/auth.schema";
import Logo from "@/components/shared/Logo";
import toast from "react-hot-toast";

export default function LoginModal() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loginModalOpen, loginModalRedirect } = useAppSelector((s) => s.ui);
  const { isLoading } = useAppSelector((s) => s.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    const result = await dispatch(login(data));
    if (login.fulfilled.match(result)) {
      toast.success("Welcome back!");
      dispatch(closeLoginModal());
      if (loginModalRedirect) {
        router.push(loginModalRedirect);
      }
    } else {
      toast.error(result.payload as string || "Login failed");
    }
  };

  return (
    <Dialog open={loginModalOpen} onOpenChange={(open) => !open && dispatch(closeLoginModal())}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <Logo />
          </div>
          <DialogTitle className="text-center">Welcome back!</DialogTitle>
          <DialogDescription className="text-center">
            Login to continue shopping
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
            Login
          </Button>

          <div className="relative">
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
              dispatch(closeLoginModal());
              router.push("/auth/login?tab=otp");
            }}
          >
            <Phone className="h-4 w-4" />
            Login with OTP
          </Button>
        </form>

        <div className="text-center text-sm mt-2">
          <span className="text-muted-foreground">New to TOKOMORT? </span>
          <button
            onClick={() => {
              dispatch(closeLoginModal());
              router.push("/auth/register");
            }}
            className="text-brand hover:underline font-medium"
          >
            Create account
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
