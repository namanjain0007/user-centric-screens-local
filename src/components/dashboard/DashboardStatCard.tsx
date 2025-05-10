
import { cn } from "@/lib/utils";
import React from "react";

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
  change?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function DashboardStatCard({ 
  title, 
  value, 
  icon,
  bgColor,
  iconColor,
  change, 
  className 
}: DashboardStatCardProps) {
  return (
    <div className={cn(
      "rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md", 
      className
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="mt-2">
            <h3 className="text-2xl font-bold">{value}</h3>
            {change && (
              <p
                className={cn(
                  "mt-1 flex items-center text-xs",
                  change.isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                <span className="mr-1">
                  {change.isPositive ? "↑" : "↓"}
                </span>
                {change.value}
              </p>
            )}
          </div>
        </div>
        <div className={cn(
          "rounded-full p-3",
          bgColor
        )}>
          <div className={cn("h-6 w-6", iconColor)}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
