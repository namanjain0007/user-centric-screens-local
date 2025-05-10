
import { Badge } from "@/components/ui/badge";
import { User } from "@/types";

interface UserStatusBadgeProps {
  status: string;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const getVariant = () => {
    switch (status) {
      case "active":
        return "default";
      case "away":
        return "secondary";
      case "blocked":
        return "destructive";
      case "offline":
        return "outline";
      default:
        return "secondary";
    }
  };

  return <Badge variant={getVariant()}>{status}</Badge>;
}
