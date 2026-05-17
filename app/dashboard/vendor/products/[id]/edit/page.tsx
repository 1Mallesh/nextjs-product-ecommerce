import { Suspense } from "react";
import ProductEditClient from "./ProductEditClient";

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-brand border-t-transparent rounded-full" />
      </div>
    }>
      <ProductEditClient id={id} />
    </Suspense>
  );
}
