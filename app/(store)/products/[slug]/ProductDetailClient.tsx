"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, ShoppingCart, Share2, Star, Truck, Shield, RotateCcw,
  ChevronRight, Minus, Plus, Check, MapPin, Zap,
} from "lucide-react";
import { productService } from "@/services/product.service";
import api from "@/services/axios";
import { reviewService } from "@/services/review.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { toggleWishlist } from "@/store/slices/wishlistSlice";
import { setCartOpen } from "@/store/slices/uiSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import StarRating from "@/components/product/StarRating";
import ProductGrid from "@/components/product/ProductGrid";
import type { ProductVariant } from "@/types";
import { formatPrice, calculateDiscount, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface Props {
  slug: string;
}

export default function ProductDetailClient({ slug }: Props) {
  const dispatch = useAppDispatch();
  const wishlistIds = useAppSelector((s) => s.wishlist.productIds);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState<{ available: boolean; days?: string } | null>(null);
  const [checkingPincode, setCheckingPincode] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data } = await productService.getById(slug);
      return data.data;
    },
  });

  const { data: reviews } = useQuery({
    queryKey: ["reviews", product?.id],
    queryFn: async () => {
      if (!product?.id) return null;
      const { data } = await reviewService.getForProduct(product.id, { limit: 10 });
      return data.data;
    },
    enabled: !!product?.id,
  });

  const { data: related } = useQuery({
    queryKey: ["related", product?.id],
    queryFn: async () => {
      if (!product?.id) return [];
      const { data } = await productService.getRelated(product.id);
      return data.data;
    },
    enabled: !!product?.id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return (
    <div className="text-center py-20">
      <p className="text-xl font-semibold">Product not found</p>
      <Button asChild className="mt-4" variant="brand">
        <Link href="/products">Browse Products</Link>
      </Button>
    </div>
  );

  const isWishlisted = wishlistIds.includes(product.id);
  const currentVariant = selectedVariant;
  const price = currentVariant?.price ?? product.price;
  const mrp = currentVariant?.mrp ?? product.mrp;
  const stock = currentVariant?.stock ?? product.stock;
  const discount = calculateDiscount(mrp, price);
  const images = currentVariant?.images?.length ? currentVariant.images : product.images;

  const handleAddToCart = () => {
    dispatch(addToCart({ product, variant: currentVariant || undefined, quantity }));
    dispatch(setCartOpen(true));
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ product, variant: currentVariant || undefined, quantity }));
    window.location.href = "/checkout";
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-brand">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/products" className="hover:text-brand">Products</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        {product.category && (
          <>
            <Link href={`/categories/${product.category.slug}`} className="hover:text-brand">
              {product.category.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
          </>
        )}
        <span className="text-foreground line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted mb-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <Image
                  src={images[activeImage] || "/placeholder.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
            </AnimatePresence>
            {discount >= 10 && (
              <div className="absolute top-3 left-3">
                <Badge variant="discount" className="text-sm px-2 py-1">
                  {discount}% OFF
                </Badge>
              </div>
            )}
            <button
              onClick={() => {
                dispatch(toggleWishlist(product));
                toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
              }}
              className={`absolute top-3 right-3 h-9 w-9 rounded-full flex items-center justify-center transition-all ${
                isWishlisted ? "bg-red-500 text-white" : "bg-white/90 text-gray-700 hover:bg-red-50"
              }`}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-16 w-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    activeImage === i ? "border-brand" : "border-transparent opacity-60"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-5">
          <div>
            <Badge variant="outline" className="text-xs mb-2">{product.category?.name}</Badge>
            <h1 className="text-xl sm:text-2xl font-bold leading-tight">{product.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{product.vendor?.shopName}</p>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1.5 bg-green-500 text-white text-sm font-bold px-2 py-0.5 rounded-md">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {product.rating.toFixed(1)}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.reviewCount.toLocaleString("en-IN")} ratings
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Price */}
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-brand">{formatPrice(price)}</span>
              {mrp > price && (
                <>
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(mrp)}</span>
                  <Badge variant="discount">{discount}% OFF</Badge>
                </>
              )}
            </div>
            {mrp > price && (
              <p className="text-sm text-green-600 mt-1">
                You save {formatPrice(mrp - price)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Inclusive of all taxes</p>
          </div>

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">
                Select: {currentVariant ? `${currentVariant.name} - ${currentVariant.value}` : "Choose option"}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v.id === currentVariant?.id ? null : v)}
                    disabled={v.stock === 0}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                      currentVariant?.id === v.id
                        ? "border-brand bg-brand/10 text-brand"
                        : v.stock === 0
                        ? "opacity-40 cursor-not-allowed line-through"
                        : "hover:border-brand/50"
                    }`}
                  >
                    {v.value}
                    {v.stock === 0 && " (OOS)"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="text-sm font-semibold mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-9 w-9 flex items-center justify-center hover:bg-muted transition-colors">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="h-9 w-12 flex items-center justify-center text-sm font-medium border-x">
                  {quantity}
                </span>
                <button onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                  className="h-9 w-9 flex items-center justify-center hover:bg-muted transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-xs text-muted-foreground">
                {stock > 0 ? `${stock} in stock` : <span className="text-red-500">Out of stock</span>}
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleAddToCart}
              variant="outline"
              size="lg"
              className="flex-1 border-brand text-brand hover:bg-brand/5"
              disabled={stock === 0}
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
            <Button
              onClick={handleBuyNow}
              variant="brand"
              size="lg"
              className="flex-1"
              disabled={stock === 0}
            >
              <Zap className="h-4 w-4" />
              Buy Now
            </Button>
          </div>

          {/* Delivery check */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand" />
              Check Delivery
            </p>
            <div className="flex gap-2">
              <input
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter pincode"
                maxLength={6}
                className="flex-1 h-9 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 bg-background"
              />
              <Button
                size="sm"
                variant="outline"
                loading={checkingPincode}
                disabled={pincode.length !== 6}
                onClick={async () => {
                  if (pincode.length !== 6) return;
                  setCheckingPincode(true);
                  setPincodeResult(null);
                  try {
                    const { data } = await api.get(`/delivery/check-pincode?pincode=${pincode}`);
                    setPincodeResult({ available: true, days: data?.data?.estimatedDays ?? "3-5" });
                  } catch {
                    setPincodeResult({ available: false });
                  } finally {
                    setCheckingPincode(false);
                  }
                }}
              >
                Check
              </Button>
            </div>
            {pincodeResult && (
              <p className={`text-xs font-medium ${pincodeResult.available ? "text-green-600" : "text-red-500"}`}>
                {pincodeResult.available
                  ? `✓ Delivery available — arrives in ${pincodeResult.days} business days`
                  : "✗ Delivery not available for this pincode"}
              </p>
            )}
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, text: "Fast Delivery" },
              { icon: RotateCcw, text: "Easy Returns" },
              { icon: Shield, text: "Secure Pay" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1.5 text-center bg-muted/50 rounded-xl p-3">
                <Icon className="h-4 w-4 text-brand" />
                <span className="text-xs font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs: Description, Reviews */}
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({product.reviewCount})
            </TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-4 prose dark:prose-invert max-w-none text-sm">
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            <div className="space-y-6">
              {reviews?.data?.map((review) => (
                <div key={review.id} className="border rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center text-sm font-bold text-brand shrink-0">
                      {review.user.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{review.user.name}</p>
                        <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                      <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
              {!reviews?.data?.length && (
                <p className="text-muted-foreground text-sm text-center py-8">
                  No reviews yet. Be the first to review this product!
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="mt-4">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Free delivery on orders above ₹499</p>
              <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Express delivery available in select cities</p>
              <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Easy 7-day return policy</p>
              <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Cash on delivery available</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related products */}
      {related && related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">You may also like</h2>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  );
}
