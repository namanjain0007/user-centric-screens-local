
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Users,
  LayoutDashboard,
  Bell,
  Settings,
  HelpCircle,
  CreditCard,
  ListOrdered,
  Shield,
  DollarSign,
  FolderTree,
} from "lucide-react";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  isActive?: boolean;
}

const NavItem = ({ href, icon, title, isActive }: NavItemProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
    >
      {icon}
      <span>{title}</span>
    </Link>
  );
};

const NavSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="space-y-2">
      <h2 className="px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
        {title}
      </h2>
      <div className="space-y-1">{children}</div>
    </div>
  );
};

export function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="hidden md:flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <Link 
          to="/" 
          className="flex items-center gap-2 font-semibold text-lg text-sidebar-foreground"
        >
          <div className="h-6 w-6 rounded-md bg-brand-purple"></div>
          <span>UserTrack</span>
        </Link>
      </div>
      <div className="flex flex-col gap-6 p-4 overflow-y-auto">
        <NavSection title="Dashboard">
          <NavItem
            href="/dashboard"
            icon={<LayoutDashboard className="h-4 w-4" />}
            title="Dashboard"
            isActive={isActive("/dashboard")}
          />
        </NavSection>

        <NavSection title="User Management">
          <NavItem
            href="/users"
            icon={<Users className="h-4 w-4" />}
            title="User Management"
            isActive={isActive("/users")}
          />
        </NavSection>

        <NavSection title="Content">
          <NavItem
            href="/categories"
            icon={<FolderTree className="h-4 w-4" />}
            title="Categories"
            isActive={isActive("/categories")}
          />
          <NavItem
            href="/listings"
            icon={<ListOrdered className="h-4 w-4" />}
            title="Listing Management"
            isActive={isActive("/listings")}
          />
        </NavSection>

        <NavSection title="Billing">
          <NavItem
            href="/payments"
            icon={<CreditCard className="h-4 w-4" />}
            title="Payments"
            isActive={isActive("/payments")}
          />
          <NavItem
            href="/pricing"
            icon={<DollarSign className="h-4 w-4" />}
            title="Pricing Plans"
            isActive={isActive("/pricing")}
          />
        </NavSection>

        <NavSection title="System">
          <NavItem
            href="/admin"
            icon={<Shield className="h-4 w-4" />}
            title="Admin Users"
            isActive={isActive("/admin")}
          />
          <NavItem
            href="/settings"
            icon={<Settings className="h-4 w-4" />}
            title="Settings"
            isActive={isActive("/settings")}
          />
          <NavItem
            href="/notifications"
            icon={<Bell className="h-4 w-4" />}
            title="Notifications"
            isActive={isActive("/notifications")}
          />
          <NavItem
            href="/help"
            icon={<HelpCircle className="h-4 w-4" />}
            title="Help & Support"
            isActive={isActive("/help")}
          />
        </NavSection>
      </div>
    </div>
  );
}
