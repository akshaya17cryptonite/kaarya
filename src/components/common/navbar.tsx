import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getSession } from "@/modules/auth/service";
import { signOutAction, loginWithMockAccountAction } from "@/modules/auth/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Wrench,
  Zap,
  Sparkles,
  User,
  LogOut,
  ShieldCheck,
  Briefcase,
  SlidersHorizontal,
} from "lucide-react";

export async function Navbar() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Dev Quick-Switch Banner */}
      {process.env.ENABLE_MOCK_DRIVERS === "true" && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Dev Fast-Switch Role:</span>
          </div>
          <div className="flex items-center gap-2">
            <form action={loginWithMockAccountAction.bind(null, "CUSTOMER")}>
              <button
                type="submit"
                className={`px-2 py-0.5 rounded transition ${
                  session?.role === "CUSTOMER"
                    ? "bg-amber-500 text-white font-semibold"
                    : "hover:bg-amber-500/20"
                }`}
              >
                Customer (Rohit)
              </button>
            </form>
            <span>•</span>
            <form action={loginWithMockAccountAction.bind(null, "PROVIDER")}>
              <button
                type="submit"
                className={`px-2 py-0.5 rounded transition ${
                  session?.role === "PROVIDER"
                    ? "bg-amber-500 text-white font-semibold"
                    : "hover:bg-amber-500/20"
                }`}
              >
                Provider (Ramesh)
              </button>
            </form>
            <span>•</span>
            <form action={loginWithMockAccountAction.bind(null, "ADMIN")}>
              <button
                type="submit"
                className={`px-2 py-0.5 rounded transition ${
                  session?.role === "ADMIN"
                    ? "bg-amber-500 text-white font-semibold"
                    : "hover:bg-amber-500/20"
                }`}
              >
                Admin Portal
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="container flex h-16 items-center justify-between">
        {/* Brand Logo & City Selector */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="tracking-tight">{siteConfig.name}</span>
          </Link>

          {/* City Badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-muted/60 border px-3 py-1 rounded-full text-xs font-medium text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="text-foreground">{siteConfig.defaultCity.name}</span>
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-semibold">
              NCR
            </span>
          </div>
        </div>

        {/* Categories Quick Nav */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
          <Link
            href="/services/plumber/noida"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Wrench className="w-4 h-4 text-emerald-600" />
            <span>Plumbing</span>
          </Link>
          <Link
            href="/services/electrician/noida"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Electrical</span>
          </Link>
          <Link
            href="/services/cleaner/noida"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>Cleaning</span>
          </Link>
        </nav>

        {/* Right CTA / Auth Status */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              {/* Role-specific dashboard button */}
              {session.role === "ADMIN" && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="gap-1.5 border-primary/40 text-primary">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                  </Button>
                </Link>
              )}

              {session.role === "PROVIDER" && (
                <Link href="/provider">
                  <Button variant="outline" size="sm" className="gap-1.5 border-emerald-500/40 text-emerald-700 dark:text-emerald-300">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Jobs Dashboard</span>
                  </Button>
                </Link>
              )}

              {session.role === "CUSTOMER" && (
                <Link href="/account">
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>My Bookings</span>
                  </Button>
                </Link>
              )}

              {/* User Pill */}
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-semibold leading-tight">{session.name}</span>
                <span className="text-[10px] text-muted-foreground">{session.phone}</span>
              </div>

              <Badge
                variant={
                  session.role === "ADMIN"
                    ? "default"
                    : session.role === "PROVIDER"
                    ? "success"
                    : "secondary"
                }
              >
                {session.role}
              </Badge>

              <form action={signOutAction}>
                <Button variant="ghost" size="icon" title="Sign Out">
                  <LogOut className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login?role=PROVIDER">
                <Button variant="ghost" size="sm" className="text-xs">
                  Register as Partner
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm">Sign In / Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
