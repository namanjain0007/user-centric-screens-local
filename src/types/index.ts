export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: "active" | "away" | "offline" | "blocked";
  role: string;
  lastActive: string;
}

// PricingPlan has been moved to its own file: src/types/pricingPlan.ts
