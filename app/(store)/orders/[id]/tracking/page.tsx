import type { Metadata } from "next";
import { Suspense } from "react";
import OrderTrackingClient from "./OrderTrackingClient";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Track Order",
  description: "Real-time order tracking — see exactly where your delivery is.",
  robots: { index: false, follow: false },
};

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    }>
      <OrderTrackingClient id={id} />
    </Suspense>
  );
}
