import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/service";
import {
  getAdminDashboardStats,
  getAdminProviders,
  getAdminBookings,
} from "@/modules/admin/service";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ShoppingBag,
  Layers,
  Settings,
} from "lucide-react";
import { VerificationCard } from "@/components/admin/verification-card";
import { ProviderVerificationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?role=ADMIN&redirectTo=/admin");
  }

  if (session.role !== "ADMIN") {
    redirect("/account");
  }

  const [stats, pendingProviders, recentBookings] = await Promise.all([
    getAdminDashboardStats(),
    getAdminProviders(ProviderVerificationStatus.PENDING),
    getAdminBookings({ limit: 5 }),
  ]);

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Admin Operations Center</h1>
            <Badge variant="default" className="text-xs">Super Admin</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time marketplace telemetry and partner control tower for Noida, NCR
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" className="px-3 py-1 text-xs">
            System Status: 100% Operational
          </Badge>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-primary" />
            Net Platform Fee (15%)
          </span>
          <p className="text-2xl font-bold mt-2 text-primary">
            {formatCurrency(stats.platformNetRevenue)}
          </p>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            GMV: {formatCurrency(stats.grossMerchandiseValue)}
          </span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            Total Bookings
          </span>
          <p className="text-2xl font-bold mt-2">{stats.totalBookings}</p>
          <span className="text-[11px] text-muted-foreground">
            {stats.completedBookingsCount} completed • {stats.cancelledBookingsCount} cancelled
          </span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Service Partners
          </span>
          <p className="text-2xl font-bold mt-2">{stats.totalProviders}</p>
          <span className="text-[11px] text-muted-foreground">
            {stats.verifiedProviders} verified • {stats.pendingKycCount} pending KYC
          </span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Users className="w-4 h-4 text-purple-600" />
            Registered Customers
          </span>
          <p className="text-2xl font-bold mt-2">{stats.totalCustomers}</p>
          <span className="text-[11px] text-muted-foreground">
            Avg Booking: {formatCurrency(stats.averageBookingValue)}
          </span>
        </Card>
      </div>

      {/* Main Grid: Pending KYC Queue & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Pending Verification Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Partner Verification & KYC Queue</h2>
                {pendingProviders.length > 0 && (
                  <Badge variant="destructive" className="rounded-full text-[10px]">
                    {pendingProviders.length} Pending
                  </Badge>
                )}
              </div>
              <Link
                href="/admin/verification"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>View all ({stats.totalProviders})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {pendingProviders.length === 0 ? (
              <Card className="p-6 text-center text-sm text-muted-foreground bg-muted/20 border-dashed">
                All provider applications in Noida are verified! New registrations will alert here.
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingProviders.map((provider) => (
                  <VerificationCard key={provider.id} provider={provider} />
                ))}
              </div>
            )}
          </div>

          {/* Category Revenue Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    Revenue & Volume by Category
                  </CardTitle>
                  <CardDescription>
                    Performance across active service verticals in Noida
                  </CardDescription>
                </div>
                <Link
                  href="/admin/catalog"
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Edit Catalog
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.categoryRevenueBreakdown.map((cat) => {
                const percentage =
                  stats.grossMerchandiseValue > 0
                    ? Math.round((cat.revenue / stats.grossMerchandiseValue) * 100)
                    : 33;

                return (
                  <div key={cat.categoryName} className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{cat.categoryName}</span>
                      <span className="font-bold text-foreground">
                        {formatCurrency(cat.revenue)}{" "}
                        <span className="text-[11px] text-muted-foreground font-normal">
                          ({cat.bookingsCount} bookings)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 col): Quick Controls & Recent Bookings */}
        <div className="space-y-6">
          {/* Admin Shortcuts */}
          <Card className="p-4 bg-muted/20 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
              Administrative Control Centers
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/admin/verification">
                <Button variant="outline" size="sm" className="w-full text-xs h-9 justify-start gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span>KYC Queue</span>
                </Button>
              </Link>
              <Link href="/admin/catalog">
                <Button variant="outline" size="sm" className="w-full text-xs h-9 justify-start gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  <span>Catalog</span>
                </Button>
              </Link>
              <Link href="/admin/bookings">
                <Button variant="outline" size="sm" className="w-full text-xs h-9 justify-start gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Disputes</span>
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button variant="outline" size="sm" className="w-full text-xs h-9 justify-start gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-amber-500" />
                  <span>Settings</span>
                </Button>
              </Link>
            </div>
          </Card>

          {/* Recent Bookings Feed */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  Recent Marketplace Bookings
                </CardTitle>
                <Link
                  href="/admin/bookings"
                  className="text-xs text-primary font-medium hover:underline"
                >
                  All
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y text-xs">
                {recentBookings.map((b) => (
                  <div key={b.id} className="p-4 space-y-1.5 hover:bg-muted/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-muted-foreground">
                        {b.bookingNumber}
                      </span>
                      <Badge
                        variant={
                          b.status === "COMPLETED"
                            ? "success"
                            : b.status === "CANCELLED"
                            ? "destructive"
                            : "info"
                        }
                        className="text-[10px]"
                      >
                        {b.status}
                      </Badge>
                    </div>

                    <p className="font-bold text-foreground">{b.service.name}</p>

                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Customer: {b.customer.name}</span>
                      <span className="font-bold text-foreground">
                        {formatCurrency(b.totalAmount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                      <span>Partner: {b.provider.name}</span>
                      <span className="text-emerald-600 font-semibold">
                        Fee: {formatCurrency(b.platformFee)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
