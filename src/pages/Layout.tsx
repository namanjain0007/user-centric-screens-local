import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();
  
  // Get the current page title based on the route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/users") return "User Management";
    if (path === "/admin") return "Admin Users";
    if (path === "/notifications") return "Notifications";
    if (path === "/categories") return "Categories";
    if (path === "/listings") return "Listing Management";
    if (path === "/payments") return "Payments";
    if (path === "/pricing") return "Pricing Plans";
    if (path === "/settings") return "Settings";
    if (path === "/help") return "Help & Support";
    return "Dashboard";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={getPageTitle()} />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
