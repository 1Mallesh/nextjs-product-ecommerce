import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ className, size = "md" }: LogoProps) {
  const sizes = { sm: "text-xl", md: "text-2xl", lg: "text-4xl" };
  return (
    <Link href="/" className={cn("font-black tracking-tight select-none", sizes[size], className)}>
      <span className="text-brand">TOKO</span>
      <span className="text-foreground">MORT</span>
    </Link>
  );
}
