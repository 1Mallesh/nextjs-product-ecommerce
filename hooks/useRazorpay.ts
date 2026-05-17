"use client";

import { useCallback, useRef } from "react";
import { config } from "@/config";

interface RazorpayOptions {
  /** Razorpay order ID returned by backend (rzp_live_... prefix order) */
  razorpayOrderId: string;
  /** Amount in paise (backend already sets this) */
  amount: number;
  currency?: string;
  orderNumber: string;
  prefill?: { name?: string; email?: string; contact?: string };
  onSuccess: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  onDismiss?: () => void;
  onError?: (error: unknown) => void;
}

declare global {
  interface Window {
    Razorpay: new (opts: Record<string, unknown>) => { open(): void };
  }
}

/** Loads the Razorpay checkout script exactly once per page lifetime. */
function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existing = document.querySelector('script[src*="razorpay"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function useRazorpay() {
  const instanceRef = useRef<{ open(): void } | null>(null);

  const openCheckout = useCallback(async (opts: RazorpayOptions): Promise<void> => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      opts.onError?.(new Error("Razorpay SDK failed to load. Check your internet connection."));
      return;
    }

    const keyId = config.razorpayKeyId;
    if (!keyId) {
      opts.onError?.(new Error("Razorpay key not configured."));
      return;
    }

    instanceRef.current = new window.Razorpay({
      key: keyId,
      amount: opts.amount,           // paise — set by backend
      currency: opts.currency ?? "INR",
      name: "TOKOMORT",
      description: `Order #${opts.orderNumber}`,
      image: "/logo.png",
      order_id: opts.razorpayOrderId,
      prefill: {
        name: opts.prefill?.name ?? "",
        email: opts.prefill?.email ?? "",
        contact: opts.prefill?.contact ?? "",
      },
      notes: {
        order_number: opts.orderNumber,
      },
      theme: {
        color: "#FF6B00",
        hide_topbar: false,
      },
      modal: {
        backdropclose: false,
        escape: false,
        handleback: true,
        ondismiss: () => opts.onDismiss?.(),
      },
      handler: opts.onSuccess,
    });

    instanceRef.current.open();
  }, []);

  return { openCheckout };
}
