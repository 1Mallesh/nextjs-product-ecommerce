"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import { useAppSelector } from "@/store/hooks";

// Redirects to main delivery dashboard which shows assigned orders
export default function DeliveryOrdersPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Assigned Orders</h2>
      <p className="text-muted-foreground text-sm">
        View and manage your assigned deliveries from the{" "}
        <Link href="/dashboard/delivery" className="text-brand hover:underline">
          Overview
        </Link>{" "}
        page.
      </p>
      <div className="text-center py-16 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-40" />
        <p>Go to Overview to see assigned orders and update delivery status.</p>
      </div>
    </div>
  );
}
