"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Phone } from "lucide-react";
import { userService } from "@/services/user.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch } from "@/store/hooks";
import { loadUser } from "@/store/slices/authSlice";
import toast from "react-hot-toast";

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  mobile: z.string().min(10, "Invalid mobile"),
});
type ProfileFormData = z.infer<typeof profileSchema>;

export default function CustomerProfilePage() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data } = await userService.getProfile();
      return data.data;
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile?.name ?? "",
      email: profile?.email ?? "",
      mobile: profile?.mobile ?? "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProfileFormData) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      dispatch(loadUser());
      toast.success("Profile updated");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-md">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md">
      <div className="flex items-center gap-3">
        <User className="h-5 w-5 text-brand" />
        <h2 className="text-xl font-bold">My Profile</h2>
      </div>

      <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Full Name</label>
          <Input
            {...register("name")}
            placeholder="Your full name"
            leftIcon={<User className="h-4 w-4" />}
            error={errors.name?.message}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Email Address</label>
          <Input
            {...register("email")}
            type="email"
            placeholder="your@email.com"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Mobile Number</label>
          <Input
            {...register("mobile")}
            placeholder="10-digit mobile number"
            leftIcon={<Phone className="h-4 w-4" />}
            error={errors.mobile?.message}
          />
        </div>

        <Button type="submit" variant="brand" loading={updateMutation.isPending}>
          Save Changes
        </Button>
      </form>
    </div>
  );
}
