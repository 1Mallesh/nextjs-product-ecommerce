"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit, Trash2, MapPin, Star } from "lucide-react";
import { addressService } from "@/services/address.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { addressSchema, type AddressFormData } from "@/schemas/address.schema";
import { INDIAN_STATES } from "@/constants";
import toast from "react-hot-toast";
import type { Address } from "@/types";

const LABEL_PRESETS = ["Home", "Work", "Other"];

export default function AddressesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: addresses } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const { data } = await addressService.getAll();
      const payload = data.data as unknown;
      if (Array.isArray(payload)) return payload as Address[];
      const p = payload as Record<string, unknown>;
      return (p?.addresses ?? p?.data ?? []) as Address[];
    },
    staleTime: 0,
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: { isDefault: false },
  });

  const labelValue = watch("label");

  const saveMutation = useMutation({
    mutationFn: (data: AddressFormData) => {
      if (editId) return addressService.update(editId, data);
      return addressService.create({ ...data, isDefault: !(addresses?.length) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success(editId ? "Address updated" : "Address added");
      setShowForm(false);
      setEditId(null);
      reset();
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      const detail = Array.isArray(msg) ? msg.join(" · ") : msg;
      toast.error(detail || "Failed to save address");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: addressService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address deleted");
    },
  });

  const defaultMutation = useMutation({
    mutationFn: (id: string) => addressService.setDefault(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
    onError: () => {
      // Fallback: use update if setDefault endpoint not available
    },
  });

  const startEdit = (addr: Address) => {
    setEditId(addr.id);
    setValue("label", addr.label);
    setValue("fullName", addr.fullName);
    setValue("phone", addr.phone);
    setValue("addressLine1", addr.addressLine1);
    setValue("addressLine2", addr.addressLine2 ?? "");
    setValue("city", addr.city);
    setValue("state", addr.state);
    setValue("pincode", addr.pincode);
    setValue("isDefault", addr.isDefault);
    setShowForm(true);
  };

  const cancelForm = () => { setShowForm(false); setEditId(null); reset(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">My Addresses</h2>
        <Button variant="brand" size="sm" onClick={() => { cancelForm(); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Address
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-5">
            <h3 className="font-semibold mb-4">{editId ? "Edit Address" : "New Address"}</h3>
            <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-4">
              {/* Label presets + text input */}
              <div>
                <label className="text-sm font-medium block mb-1.5">Label *</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {LABEL_PRESETS.map((preset) => (
                    <button
                      key={preset} type="button"
                      onClick={() => setValue("label", preset, { shouldValidate: true })}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        labelValue === preset
                          ? "border-brand bg-brand/10 text-brand"
                          : "border-border hover:border-brand/40"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                  <Input
                    {...register("label")}
                    placeholder="or type custom label"
                    className="flex-1 min-w-[140px]"
                    error={errors.label?.message}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Full Name *</label>
                  <Input {...register("fullName")} placeholder="As per ID" error={errors.fullName?.message} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Mobile *</label>
                  <Input {...register("phone")} placeholder="10-digit mobile" maxLength={10} error={errors.phone?.message} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Address Line 1 *</label>
                <Input {...register("addressLine1")} placeholder="Flat/House No., Building, Street" error={errors.addressLine1?.message} />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Address Line 2</label>
                <Input {...register("addressLine2")} placeholder="Area, Landmark (optional)" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1.5">City *</label>
                  <Input {...register("city")} placeholder="City" error={errors.city?.message} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Pincode *</label>
                  <Input {...register("pincode")} placeholder="6-digit" maxLength={6} error={errors.pincode?.message} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">State *</label>
                  <select
                    {...register("state")}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p className="text-xs text-destructive mt-1">{errors.state.message}</p>}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register("isDefault")} className="rounded border-input" />
                <span className="text-sm font-medium">Set as default address</span>
              </label>

              <div className="flex gap-2 pt-1">
                <Button type="submit" variant="brand" loading={saveMutation.isPending}>
                  {editId ? "Update Address" : "Save Address"}
                </Button>
                <Button type="button" variant="outline" onClick={cancelForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses?.map((addr: Address) => (
          <div key={addr.id} className="bg-card border rounded-xl p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand shrink-0" />
                <span className="font-semibold text-sm">{addr.fullName}</span>
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded font-medium">{addr.label}</span>
                {addr.isDefault && (
                  <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded font-medium">
                    Default
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(addr)}>
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10"
                  onClick={() => deleteMutation.mutate(addr.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground pl-6">
              {addr.addressLine1}{addr.addressLine2 && `, ${addr.addressLine2}`},<br />
              {addr.city}, {addr.state} – {addr.pincode}
            </p>
            <p className="text-xs text-muted-foreground pl-6">📞 +91 {addr.phone}</p>

            {!addr.isDefault && (
              <button
                onClick={() => defaultMutation.mutate(addr.id)}
                className="text-xs text-brand hover:underline pl-6 flex items-center gap-1 mt-1"
                disabled={defaultMutation.isPending}
              >
                <Star className="h-3 w-3" /> Set as Default
              </button>
            )}
          </div>
        ))}

        {!addresses?.length && !showForm && (
          <div className="col-span-2 text-center py-16 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No addresses saved yet</p>
            <p className="text-sm mt-1">Add your first delivery address to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
