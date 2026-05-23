"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { contentService } from "@/services/content.service";
import { Skeleton } from "@/components/ui/skeleton";

export default function FAQPage() {
  const [open, setOpen] = useState<string | null>(null);

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const { data } = await contentService.getFaqs();
      return data.data ?? [];
    },
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">Find answers to common questions</p>
      </div>

      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)
          : faqs.map((faq) => (
              <div key={faq.id} className="border rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpen(open === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <span className="font-medium text-sm pr-4">{faq.q}</span>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform", open === faq.id && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {open === faq.id && (
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
