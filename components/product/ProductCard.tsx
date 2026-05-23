"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { toggleWishlist } from "@/store/slices/wishlistSlice";
import { setCartOpen } from "@/store/slices/uiSlice";
import type { Product } from "@/types";
import { formatPrice, calculateDiscount, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const wishlistIds = useAppSelector((s) => s.wishlist.productIds);
  const isWishlisted = wishlistIds.includes(product.id);
  const discount = calculateDiscount(product.mrp, product.price);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ product }));
    dispatch(setCartOpen(true));
    toast.success("Added to cart!");
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(product));
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="product-card group relative bg-card rounded-xl border overflow-hidden"
    >
      <Link href={product.slug ? `/products/${product.slug}` : "/products"}>
        {/* Image */}
        <div className={cn("relative overflow-hidden bg-muted", compact ? "h-36" : "h-48 sm:h-56")}>
          <Image
            src={product.thumbnail || "/placeholder.jpg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount >= 10 && (
              <Badge variant="discount" className="text-[10px] px-1.5 py-0.5">
                {discount}% OFF
              </Badge>
            )}
            {product.isFeatured && (
              <Badge className="bg-brand text-white text-[10px] px-1.5 py-0.5">
                <Zap className="h-2.5 w-2.5 mr-0.5" />
                Featured
              </Badge>
            )}
            {product.price < 100 && (
              <Badge variant="success" className="text-[10px] px-1.5 py-0.5">
                Under ₹100
              </Badge>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={cn(
              "absolute top-2 right-2 h-7 w-7 rounded-full flex items-center justify-center transition-all duration-200",
              isWishlisted
                ? "bg-red-500 text-white"
                : "bg-white/80 text-gray-600 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100"
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", isWishlisted && "fill-current")} />
          </button>

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-sm font-semibold bg-black/60 px-3 py-1 rounded">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs text-muted-foreground truncate">{product.category?.name}</p>
          <h3 className={cn("font-medium text-sm mt-0.5 line-clamp-2 leading-tight", compact ? "line-clamp-1" : "")}>
            {product.name}
          </h3>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <div className="flex items-center gap-0.5 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                <Star className="h-2.5 w-2.5 fill-current" />
                {product.rating.toFixed(1)}
              </div>
              <span className="text-[10px] text-muted-foreground">({product.reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-bold text-base">{formatPrice(product.price)}</span>
            {product.mrp > product.price && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.mrp)}</span>
            )}
          </div>

          {/* Delivery */}
          {product.deliveryTime && (
            <p className="text-[10px] text-muted-foreground mt-1">{product.deliveryTime}</p>
          )}
        </div>
      </Link>

      {/* Add to cart button */}
      {product.stock > 0 && !compact && (
        <div className="px-3 pb-3">
          <Button
            onClick={handleAddToCart}
            variant="brand"
            size="sm"
            className="w-full text-xs h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add to Cart
          </Button>
        </div>
      )}
    </motion.div>
  );
}
