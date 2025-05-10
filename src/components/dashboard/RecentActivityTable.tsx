
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ActivityItem {
  id: string;
  date: string;
  description: string;
  status: "completed" | "pending" | "delivered" | "not-paid";
  user: string;
  amount?: string;
}

interface RecentActivityTableProps {
  title: string;
  viewAllLink?: string;
  items: ActivityItem[];
}

export function RecentActivityTable({ title, viewAllLink, items }: RecentActivityTableProps) {
  const getStatusBadge = (status: ActivityItem["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Completed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "delivered":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Delivered</Badge>;
      case "not-paid":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Not Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        {viewAllLink && (
          <a 
            href={viewAllLink} 
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </a>
        )}
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>User</TableHead>
              {items.some(item => item.amount) && <TableHead>Amount</TableHead>}
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono">{item.id}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.user}</TableCell>
                {items.some(item => item.amount) && <TableCell>{item.amount || "-"}</TableCell>}
                <TableCell>{getStatusBadge(item.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
