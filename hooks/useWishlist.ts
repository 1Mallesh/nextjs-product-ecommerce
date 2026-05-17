import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleWishlist } from "@/store/slices/wishlistSlice";
import type { Product } from "@/types";
import toast from "react-hot-toast";

export function useWishlist() {
  const dispatch = useAppDispatch();
  const { productIds, products } = useAppSelector((s) => s.wishlist);

  const toggle = (product: Product) => {
    const isWishlisted = productIds.includes(product.id);
    dispatch(toggleWishlist(product));
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const isWishlisted = (productId: string) => productIds.includes(productId);

  return { productIds, products, toggle, isWishlisted, count: productIds.length };
}
