"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText, TrendingUp, ShoppingBag, Users, DollarSign } from "lucide-react";
import { adminService } from "@/services/admin.service";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";

export default function AdminReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data } = await adminService.getReports();
      // Backend may return stats directly in data.data, or nested under data.data.summary
      const payload = data?.data as any;
      if (!payload) return null;
      // If stats are directly on the payload object, use it; otherwise unwrap one more level
      return (payload.totalRevenue !== undefined ? payload : payload.summary ?? payload.data ?? payload) as any;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Reports</h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : !data ? (
        <div className="text-center py-20 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p className="font-medium">No report data available</p>
          <p className="text-sm mt-1">Reports will appear once there is order activity</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Revenue", value: formatPrice(data.totalRevenue ?? 0), icon: DollarSign, color: "text-green-600" },
              { label: "Total Orders", value: data.totalOrders ?? 0, icon: ShoppingBag, color: "text-blue-600" },
              { label: "Total Users", value: data.totalUsers ?? 0, icon: Users, color: "text-purple-600" },
              { label: "Total Products", value: data.totalProducts ?? 0, icon: TrendingUp, color: "text-orange-600" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-card border rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            ))}
          </div>

          {data.monthlySales && Array.isArray(data.monthlySales) && data.monthlySales.length > 0 && (
            <div className="bg-card border rounded-xl p-5">
              <h3 className="font-semibold mb-4">Monthly Sales</h3>
              <div className="space-y-3">
                {(data.monthlySales as Array<{ month: string; revenue: number; orders: number }>).map((row) => (
                  <div key={row.month} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{row.month}</span>
                    <div className="flex gap-6">
                      <span>{row.orders} orders</span>
                      <span className="font-medium text-brand">{formatPrice(row.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
