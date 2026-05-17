import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Product Details`,
    description: `Shop this product on TOKOMORT`,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}
