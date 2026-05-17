"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const FAQS = [
  { q: "How do I track my order?", a: "Once your order is shipped, you'll receive a tracking link via SMS and email. You can also track it in My Orders section." },
  { q: "What is the return policy?", a: "We offer 7-day easy returns on most products. Items must be unused and in original packaging." },
  { q: "How do I become a vendor?", a: "Click on 'Sell on TOKOMORT' and complete the onboarding process. Approval takes 24 hours." },
  { q: "Is Cash on Delivery available?", a: "Yes! COD is available in 500+ cities across India. COD charges may apply based on order value." },
  { q: "How are payments secured?", a: "All online payments are processed via Razorpay with 256-bit SSL encryption. We never store your card details." },
  { q: "Can I cancel my order?", a: "You can cancel orders before they are shipped. Once shipped, cancellation is not possible but you can return after delivery." },
  { q: "How do I get a refund?", a: "Refunds are processed within 5-7 business days after return pickup. For COD orders, refunds go to your bank account." },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">Find answers to common questions</p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <div key={i} className="border rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-muted/30 transition-colors"
            >
              <span className="font-medium text-sm pr-4">{faq.q}</span>
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform", open === i && "rotate-180")} />
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <p className="px-4 pb-4 text-sm text-muted-foreground">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
