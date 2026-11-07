"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShieldCheck,
  Layers,
  ShoppingBag,
  Users,
  Settings,
} from "lucide-react";

interface AdminNavProps {
  pendingKycCount?: number;
}

export function AdminNav({ pendingKycCount = 0 }: AdminNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Control Tower",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      label: "KYC Verification",
      href: "/admin/verification",
      icon: ShieldCheck,
      active: pathname === "/admin/verification",
      badge: pendingKycCount > 0 ? pendingKycCount : undefined,
    },
    {
      label: "Catalog & Rates",
      href: "/admin/catalog",
      icon: Layers,
      active: pathname === "/admin/catalog",
    },
    {
      label: "Bookings & Disputes",
      href: "/admin/bookings",
      icon: ShoppingBag,
      active: pathname === "/admin/bookings",
    },
    {
      label: "Users Directory",
      href: "/admin/users",
      icon: Users,
      active: pathname === "/admin/users",
    },
    {
      label: "Commission Settings",
      href: "/admin/settings",
      icon: Settings,
      active: pathname === "/admin/settings",
    },
  ];

  return (
    <div className="border-b bg-card">
      <div className="container overflow-x-auto scrollbar-none">
        <nav className="flex space-x-1 sm:space-x-2 py-2 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors relative",
                  item.active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 text-[10px] font-bold rounded-full",
                      item.active
                        ? "bg-white text-primary"
                        : "bg-destructive text-destructive-foreground animate-pulse"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
