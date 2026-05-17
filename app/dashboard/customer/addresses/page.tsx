"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit, Trash2, MapPin, Check } from "lucide-react";
import { addressService } from "@/services/address.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { addressSchema, type AddressFormData } from "@/schemas/address.schema";
import { INDIAN_STATES } from "@/constants";
import toast from "react-hot-toast";
import type { Address } from "@/types";

export default function AddressesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: addresses } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const { data } = await addressService.getAll();
      return data.data;
    },
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  const saveMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      if (editId) return addressService.update(editId, data);
      return addressService.create({ ...data, isDefault: !addresses?.length });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success(editId ? "Address updated" : "Address added");
      setShowForm(false);
      setEditId(null);
      reset();
    },
    onError: () => toast.error("Failed to save address"),
  });

  const deleteMutation = useMutation({
    mutationFn: addressService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address deleted");
    },
  });

  const defaultMutation = useMutation({
    mutationFn: (id: string) => addressService.update(id, { isDefault: true } as Partial<import("@/types").Address>),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
  });

  const startEdit = (addr: Address) => {
    setEditId(addr.id);
    setValue("name", addr.name);
    setValue("mobile", addr.mobile);
    setValue("line1", addr.line1);
    setValue("line2", addr.line2 || "");
    setValue("city", addr.city);
    setValue("state", addr.state);
    setValue("pincode", addr.pincode);
    setValue("type", addr.type);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">My Addresses</h2>
        <Button variant="brand" size="sm" onClick={() => { setShowForm(!showForm); setEditId(null); reset(); }}>
          <Plus className="h-4 w-4" />
          {showForm ? "Cancel" : "Add Address"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4">
            <h3 className="font-semibold mb-4">{editId ? "Edit Address" : "New Address"}</h3>
            <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Name</label>
                  <Input {...register("name")} error={errors.name?.message} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Mobile</label>
                  <Input {...register("mobile")} error={errors.mobile?.message} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Address Line 1</label>
                <Input {...register("line1")} error={errors.line1?.message} />
              </div>
              <Input {...register("line2")} placeholder="Line 2 (optional)" />
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">City</label>
                  <Input {...register("city")} error={errors.city?.message} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Pincode</label>
                  <Input {...register("pincode")} error={errors.pincode?.message} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">State</label>
                  <select {...register("state")} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">Select</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Type</label>
                <select {...register("type")} className="h-10 w-48 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="HOME">Home</option>
                  <option value="WORK">Work</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <Button type="submit" variant="brand" loading={saveMutation.isPending}>
                Save Address
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses?.map((addr: Address) => (
          <div key={addr.id} className="bg-card border rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-brand" />
                <span className="font-medium text-sm">{addr.name}</span>
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{addr.type}</span>
                {addr.isDefault && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Default</span>}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(addr)}>
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10"
                  onClick={() => deleteMutation.mutate(addr.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {addr.line1}{addr.line2 && `, ${addr.line2}`}, {addr.city}, {addr.state} – {addr.pincode}
            </p>
            <p className="text-xs text-muted-foreground mt-1">+91 {addr.mobile}</p>
            {!addr.isDefault && (
              <button onClick={() => defaultMutation.mutate(addr.id)}
                className="text-xs text-brand hover:underline mt-2 flex items-center gap-1">
                <Check className="h-3 w-3" /> Set as Default
              </button>
            )}
          </div>
        ))}
        {!addresses?.length && !showForm && (
          <div className="col-span-2 text-center py-12 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>No addresses saved yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
