import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  description?: string;
  color?: "brand" | "green" | "blue" | "purple";
}

const COLORS = {
  brand: "bg-brand/10 text-brand",
  green: "bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  purple: "bg-purple-100 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400",
};

export default function StatCard({
  title, value, icon: Icon, change, description, color = "brand",
}: StatCardProps) {
  return (
    <div className="bg-card border rounded-xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          {change !== undefined && (
            <div className={cn("flex items-center gap-1 text-xs mt-1", change >= 0 ? "text-green-600" : "text-red-500")}>
              {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{Math.abs(change)}% vs last month</span>
            </div>
          )}
        </div>
        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", COLORS[color])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
