import { Suspense } from "react";
import OffersClient from "./OffersClient";

export const metadata = {
  title: "Offers & Deals – TOKOMORT",
  description: "Best deals, discounts and offers on TOKOMORT",
};

export default function OffersPage() {
  return (
    <Suspense>
      <OffersClient />
    </Suspense>
  );
}
