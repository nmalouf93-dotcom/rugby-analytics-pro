import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  variant?: "default" | "dominant" | "neutral" | "lost";
  className?: string;
}

const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  variant = "default",
  className,
}: StatsCardProps) => {
  const variantStyles = {
    default: "border-border/50",
    dominant: "border-dominant/30 bg-dominant/5",
    neutral: "border-warning/30 bg-warning/5",
    lost: "border-lost/30 bg-lost/5",
  };

  const valueStyles = {
    default: "text-foreground",
    dominant: "text-dominant",
    neutral: "text-warning",
    lost: "text-lost",
  };

  return (
    <div
      className={cn(
        "glass rounded-lg p-5 transition-all duration-300 hover:scale-[1.02]",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn("text-3xl font-bold tracking-tight", valueStyles[variant])}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={cn("text-muted-foreground/50", variant !== "default" && valueStyles[variant])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
