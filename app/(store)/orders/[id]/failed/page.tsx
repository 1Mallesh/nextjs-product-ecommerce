import { Suspense } from "react";
import PaymentFailedClient from "./PaymentFailedClient";

export default function PaymentFailedPage({ params }: { params: { id: string } }) {
  return (
    <Suspense>
      <PaymentFailedClient id={params.id} />
    </Suspense>
  );
}
