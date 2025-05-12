export interface PricingPlan {
  plan_id: number;
  name: string;
  price: number;
  duration_in_days: number;
  available_listing: number;
  created_at: string;
  updated_at: string;
}

// Helper function to convert duration_in_days to a human-readable format
export function formatDuration(days: number): string {
  if (days === 30) return "Monthly";
  if (days === 90) return "Quarterly";
  if (days === 180) return "Six Month";
  if (days === 365) return "Yearly";
  return `${days} days`;
}

// Helper function to convert human-readable duration to days
export function durationToDays(duration: string): number {
  switch (duration) {
    case "Monthly": return 30;
    case "Quarterly": return 90;
    case "Six Month": return 180;
    case "Yearly": return 365;
    default: return parseInt(duration) || 30;
  }
}
