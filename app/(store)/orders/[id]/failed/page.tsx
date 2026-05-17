import { Suspense } from "react";
import PaymentFailedClient from "./PaymentFailedClient";

export default async function PaymentFailedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <PaymentFailedClient id={id} />
    </Suspense>
  );
}
