
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { RecentActivityTable } from "@/components/dashboard/RecentActivityTable";
import { TopSellingProducts } from "@/components/dashboard/TopSellingProducts";
import { RevenueChart } from "@/components/dashboard/RevenueChart";

// Sample recent orders data
const recentOrders = [
  {
    id: "ORD-14985563",
    date: "23.12.2021",
    description: "New order placed",
    user: "Jake Morrison",
    amount: "$1,650",
    status: "not-paid" as const,
  },
  {
    id: "ORD-96571981",
    date: "23.12.2021",
    description: "Order delivered",
    user: "Juliet Roman",
    amount: "$860",
    status: "delivered" as const,
  },
  {
    id: "ORD-63869521",
    date: "23.12.2021",
    description: "Order delivered",
    user: "Kate Baker",
    amount: "$5,970",
    status: "delivered" as const,
  },
  {
    id: "ORD-75869432",
    date: "22.12.2021",
    description: "New order placed",
    user: "Michael Brown",
    amount: "$1,280",
    status: "pending" as const,
  },
  {
    id: "ORD-58694127",
    date: "22.12.2021",
    description: "Order completed",
    user: "Emily Davis",
    amount: "$3,450",
    status: "completed" as const,
  },
];

// Sample top selling products
const topProducts = [
  {
    id: "1",
    name: "Headphones JBL JR 310 BT Green",
    articleNumber: "96745259",
    sales: 703,
    image: "/placeholder.svg",
  },
  {
    id: "2",
    name: "Samsung SM-G998B Galaxy S21 Ultra",
    articleNumber: "46587234",
    sales: 620,
    image: "/placeholder.svg",
  },
  {
    id: "3",
    name: '4K UHD TV Samsung GE43QN90A 43"',
    articleNumber: "98517598",
    sales: 564,
    image: "/placeholder.svg",
  },
  {
    id: "4",
    name: '15.6" Gaming Laptop ThunderRobot 911',
    articleNumber: "56064257",
    sales: 525,
    image: "/placeholder.svg",
  },
  {
    id: "5",
    name: "Fujifilm X-S10 Kit 18-55mm f/2.8-4",
    articleNumber: "25874125",
    sales: 428,
    image: "/placeholder.svg",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <WelcomeSection username="John" />
      
      {/* Stats section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard 
          title="Total Revenue" 
          value="$13,234" 
          change={{ value: "12% vs last month", isPositive: true }}
          icon={<DollarSign className="h-full w-full text-current" />}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <DashboardStatCard 
          title="Orders Completed" 
          value="35" 
          change={{ value: "5% vs last month", isPositive: true }}
          icon={<ShoppingCart className="h-full w-full text-current" />}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <DashboardStatCard 
          title="Products in Catalog" 
          value="456" 
          change={{ value: "8% vs last month", isPositive: true }}
          icon={<Package className="h-full w-full text-current" />}
          bgColor="bg-amber-100"
          iconColor="text-amber-600"
        />
        <DashboardStatCard 
          title="Active Vendors" 
          value="128" 
          change={{ value: "3% vs last month", isPositive: false }}
          icon={<Users className="h-full w-full text-current" />}
          bgColor="bg-green-100"
          iconColor="text-green-600"
        />
      </div>

      {/* Revenue Chart */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Revenue Overview - Monthly revenue for the current year</h2>
        <div className="h-80">
          <RevenueChart />
        </div>
      </div>
      
      {/* Content area with activity and products */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Recent activity - takes up 4/7 of the space on medium+ screens */}
        <div className="md:col-span-4">
          <RecentActivityTable 
            title="Latest Orders"
            viewAllLink="/orders"
            items={recentOrders}
          />
        </div>
        
        {/* Top selling products - takes up 3/7 of the space on medium+ screens */}
        <div className="md:col-span-3">
          <TopSellingProducts products={topProducts} />
        </div>
      </div>
    </div>
  );
}
