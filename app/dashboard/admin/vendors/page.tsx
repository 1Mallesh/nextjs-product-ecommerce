"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Eye, Store, Search } from "lucide-react";
import { vendorService } from "@/services/vendor.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import type { VendorStatus } from "@/types";

const STATUS_COLORS: Record<VendorStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  SUSPENDED: "bg-gray-100 text-gray-800",
};

export default function AdminVendorsPage() {
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-vendors", statusFilter],
    queryFn: async () => {
      const { data } = await vendorService.adminGetAll({ status: statusFilter });
      return data.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: vendorService.adminApprove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });
      toast.success("Vendor approved");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => vendorService.adminReject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });
      toast.success("Vendor rejected");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Vendors</h2>
        <div className="flex gap-2">
          {["PENDING", "APPROVED", "REJECTED", "SUSPENDED"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                statusFilter === s ? "bg-brand text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}>{s}</button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : !data?.data?.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <Store className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p>No {statusFilter.toLowerCase()} vendors</p>
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Shop", "Owner", "GST", "Status", "Applied", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.data.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{vendor.shopName}</p>
                    <p className="text-xs text-muted-foreground">{vendor.user?.email}</p>
                  </td>
                  <td className="px-4 py-3">{vendor.user?.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{vendor.gstNumber || "–"}</td>
                  <td className="px-4 py-3">
                    <Badge className={STATUS_COLORS[vendor.status]} variant="outline">
                      {vendor.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(vendor.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {vendor.status === "PENDING" && (
                        <>
                          <Button size="sm" variant="outline"
                            className="h-7 text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => approveMutation.mutate(vendor.id)}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline"
                            className="h-7 text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => {
                              const reason = prompt("Rejection reason:");
                              if (reason) rejectMutation.mutate({ id: vendor.id, reason });
                            }}>
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
