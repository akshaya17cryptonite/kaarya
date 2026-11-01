"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  Layers,
  DollarSign,
  Star,
  FileCheck,
} from "lucide-react";

interface ProviderNavProps {
  incomingCount?: number;
}

export function ProviderNav({ incomingCount = 0 }: ProviderNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Overview",
      href: "/provider",
      icon: LayoutDashboard,
      active: pathname === "/provider",
    },
    {
      label: "Job Requests",
      href: "/provider/jobs",
      icon: Briefcase,
      active: pathname === "/provider/jobs",
      badge: incomingCount > 0 ? incomingCount : undefined,
    },
    {
      label: "Availability",
      href: "/provider/availability",
      icon: Calendar,
      active: pathname === "/provider/availability",
    },
    {
      label: "Services & Rates",
      href: "/provider/services",
      icon: Layers,
      active: pathname === "/provider/services",
    },
    {
      label: "Payouts & Earnings",
      href: "/provider/payouts",
      icon: DollarSign,
      active: pathname === "/provider/payouts",
    },
    {
      label: "Reviews",
      href: "/provider/reviews",
      icon: Star,
      active: pathname === "/provider/reviews",
    },
    {
      label: "KYC & Profile",
      href: "/provider/onboarding",
      icon: FileCheck,
      active: pathname === "/provider/onboarding",
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
