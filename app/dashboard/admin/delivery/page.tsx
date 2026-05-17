"use client";

import { useQuery } from "@tanstack/react-query";
import { Bike, Star } from "lucide-react";
import { adminService } from "@/services/admin.service";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import type { User } from "@/types";

export default function AdminDeliveryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-delivery-boys"],
    queryFn: async () => {
      const { data } = await adminService.getUsers({ role: "DELIVERY_BOY" });
      return data.data;
    },
  });

  const users: User[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Delivery Partners</h2>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : !users.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <Bike className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p>No delivery partners yet</p>
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Name", "Email", "Mobile", "Status", "Joined"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.mobile}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.isActive ? "success" : "secondary"} className="text-[10px]">
                      {user.isActive ? "Active" : "Blocked"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
