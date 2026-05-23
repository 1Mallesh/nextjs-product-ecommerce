"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { contentService } from "@/services/content.service";

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  const { data: slides = [], isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data } = await contentService.getBanners();
      return data.data ?? [];
    },
  });

  useEffect(() => {
    if (!slides.length) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (isLoading) {
    return <Skeleton className="h-[280px] sm:h-[360px] md:h-[420px] w-full rounded-none" />;
  }

  if (!slides.length) return null;

  const slide = slides[current];

  return (
    <div className="relative h-[280px] sm:h-[360px] md:h-[420px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.5 }}
          className={`absolute inset-0 bg-gradient-to-r ${slide.bg ?? "from-orange-500 to-rose-600"}`}
        >
          {slide.image && (
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover mix-blend-overlay opacity-40"
              priority
            />
          )}
          <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
            <div className="max-w-lg text-white">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full"
              >
                {slide.title}
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold mt-3 leading-tight"
              >
                {slide.subtitle}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-white/80 mt-2 text-sm sm:text-base"
              >
                {slide.description}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4"
              >
                <Button asChild className="bg-white text-gray-900 hover:bg-gray-100 font-semibold shadow-lg">
                  <Link href={slide.href ?? "/products"}>{slide.cta ?? "Shop Now"}</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/40 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={() => setCurrent((c) => (c + 1) % slides.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/40 transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
