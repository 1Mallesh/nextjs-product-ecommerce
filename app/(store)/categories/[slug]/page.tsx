import { Suspense } from "react";
import CategoryPageClient from "./CategoryPageClient";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-brand border-t-transparent rounded-full" />
      </div>
    }>
      <CategoryPageClient slug={slug} />
    </Suspense>
  );
}
