
import React from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";

// Sample monthly revenue data for the current year
const monthlyRevenue = [
  { month: "Jan", revenue: 4500 },
  { month: "Feb", revenue: 5200 },
  { month: "Mar", revenue: 6800 },
  { month: "Apr", revenue: 8200 },
  { month: "May", revenue: 7300 },
  { month: "Jun", revenue: 9100 },
  { month: "Jul", revenue: 10200 },
  { month: "Aug", revenue: 11500 },
  { month: "Sep", revenue: 10800 },
  { month: "Oct", revenue: 12300 },
  { month: "Nov", revenue: 11200 },
  { month: "Dec", revenue: 13500 },
];

export function RevenueChart() {
  // Define chart configuration
  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "#9b87f5", // Purple color matching the theme
    },
  };

  // Format number to display with dollar sign and commas
  const formatRevenue = (value: number) => `$${value.toLocaleString()}`;

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={monthlyRevenue}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#9b87f5" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            dy={10}
          />
          <YAxis 
            tickFormatter={formatRevenue} 
            axisLine={false} 
            tickLine={false}
            dx={-10}
          />
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
          <ChartTooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <ChartTooltipContent>
                  <div className="text-sm font-semibold">
                    {payload[0].payload.month}
                  </div>
                  <div className="text-brand-purple text-base font-bold">
                    ${payload[0].value?.toLocaleString()}
                  </div>
                </ChartTooltipContent>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#9b87f5"
            fillOpacity={1}
            fill="url(#colorRevenue)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
