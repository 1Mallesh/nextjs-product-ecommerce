"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SLIDES = [
  {
    id: 1,
    title: "Mega Sale",
    subtitle: "Up to 70% off on Electronics",
    description: "Top brands, best prices. Shop now and save big!",
    cta: "Shop Electronics",
    href: "/categories/electronics",
    bg: "from-orange-500 to-rose-600",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&q=80",
  },
  {
    id: 2,
    title: "Fashion Week",
    subtitle: "New arrivals every day",
    description: "Trendy styles from top vendors at unbeatable prices",
    cta: "Explore Fashion",
    href: "/categories/fashion",
    bg: "from-purple-600 to-blue-600",
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80",
  },
  {
    id: 3,
    title: "Fresh Groceries",
    subtitle: "Delivered in 2 hours",
    description: "Farm fresh, delivered fast. Quality you can trust.",
    cta: "Order Now",
    href: "/categories/groceries",
    bg: "from-green-500 to-teal-600",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80",
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <div className="relative h-[280px] sm:h-[360px] md:h-[420px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.5 }}
          className={`absolute inset-0 bg-gradient-to-r ${slide.bg}`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover mix-blend-overlay opacity-40"
            priority
          />
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
                  <Link href={slide.href}>{slide.cta}</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <button
        onClick={() => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/40 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={() => setCurrent((c) => (c + 1) % SLIDES.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/40 transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((_, i) => (
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
