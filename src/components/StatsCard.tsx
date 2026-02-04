import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  variant?: "default" | "primary" | "success" | "warning";
  className?: string;
}

export function StatsCard({ 
  label, 
  value, 
  sublabel, 
  variant = "default",
  className 
}: StatsCardProps) {
  return (
    <div className={cn(
      "flex flex-col gap-1 p-4 rounded-lg border bg-card",
      className
    )}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn(
        "text-3xl font-bold tracking-tight",
        variant === "primary" && "text-primary",
        variant === "success" && "text-success",
        variant === "warning" && "text-warning",
        variant === "default" && "text-foreground"
      )}>
        {value}
      </span>
      {sublabel && (
        <span className="text-xs text-muted-foreground">{sublabel}</span>
      )}
    </div>
  );
}
