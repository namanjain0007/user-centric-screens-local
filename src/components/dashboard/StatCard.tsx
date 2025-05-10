
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, change, icon, className }: StatCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-4 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && <div className="text-gray-500">{icon}</div>}
      </div>
      <div className="mt-1">
        <h3 className="text-2xl font-bold">{value}</h3>
        {change && (
          <p
            className={cn(
              "mt-1 text-xs",
              change.isPositive ? "text-status-active" : "text-status-blocked"
            )}
          >
            {change.isPositive ? "+" : ""}
            {change.value}
          </p>
        )}
      </div>
    </div>
  );
}
