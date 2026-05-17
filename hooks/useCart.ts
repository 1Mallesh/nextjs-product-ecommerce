import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart, removeFromCart, updateQuantity, clearCart } from "@/store/slices/cartSlice";
import { setCartOpen } from "@/store/slices/uiSlice";
import type { Product, ProductVariant } from "@/types";
import toast from "react-hot-toast";

export function useCart() {
  const dispatch = useAppDispatch();
  const { items, subtotal, total, deliveryFee, discount } = useAppSelector((s) => s.cart);

  const addItem = (product: Product, variant?: ProductVariant, quantity = 1) => {
    dispatch(addToCart({ product, variant, quantity }));
    dispatch(setCartOpen(true));
    toast.success("Added to cart!");
  };

  const removeItem = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const changeQty = (id: string, quantity: number) => {
    dispatch(updateQuantity({ id, quantity }));
  };

  const emptyCart = () => dispatch(clearCart());

  const isInCart = (productId: string) =>
    items.some((i) => i.product.id === productId);

  return {
    items,
    subtotal,
    total,
    deliveryFee,
    discount,
    addItem,
    removeItem,
    changeQty,
    emptyCart,
    isInCart,
    count: items.length,
  };
}
