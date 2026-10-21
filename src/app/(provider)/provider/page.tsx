import { redirect } from "next/navigation";
import { type Prisma } from "@prisma/client";
import { getSession } from "@/modules/auth/service";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Star,
  DollarSign,
  MapPin,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";

type ProviderWithBookings = Prisma.ProviderGetPayload<{
  include: {
    user: {
      include: { profile: true };
    };
    services: {
      include: { service: true };
    };
    bookings: {
      include: {
        service: true;
        address: true;
        payment: true;
        customer: {
          include: { profile: true };
        };
      };
    };
    payouts: true;
    kycDocuments: true;
  };
}>;

export default async function ProviderDashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?role=PROVIDER&redirectTo=/provider");
  }

  if (session.role !== "PROVIDER" && session.role !== "ADMIN") {
    redirect("/account");
  }

  // Load provider profile & jobs safely
  let provider: ProviderWithBookings | null = null;
  try {
    provider = await prisma.provider.findFirst({
      where: { userId: session.id },
      include: {
        user: {
          include: { profile: true },
        },
        services: {
          include: { service: true },
        },
        bookings: {
          include: {
            service: true,
            address: true,
            payment: true,
            customer: {
              include: { profile: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        payouts: true,
        kycDocuments: true,
      },
    });
  } catch (err) {
    console.warn("DB not connected for provider page, using fallback:", (err as Error).message);
  }

  if (!provider) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold">Provider Profile Not Found</h1>
        <p className="text-muted-foreground mt-2">Please complete partner onboarding.</p>
      </div>
    );
  }

  const bookings = provider.bookings || [];
  const incomingRequests = bookings.filter((b) => b.status === "REQUESTED");
  const activeJobs = bookings.filter((b) => b.status === "ACCEPTED" || b.status === "IN_PROGRESS");

  // Calculate gross provider earnings
  const totalEarnings = provider.payouts.reduce((sum, p) => sum + p.netPayout, 0);

  return (
    <div className="container py-8 space-y-8">
      {/* Top Header & Verification Status */}
      <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-2xl border border-emerald-500/20">
            {session.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{session.name}</h1>
              {provider.verificationStatus === "VERIFIED" ? (
                <Badge variant="success" className="gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Partner
                </Badge>
              ) : (
                <Badge variant="warning" className="gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  KYC Pending Review
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-3">
              <span>📍 {provider.currentAddress}</span>
              <span>• Radius: {provider.serviceRadiusKm} km</span>
              <span>• {provider.experienceYears} Years Exp</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-muted-foreground block">Partner Status</span>
            <span className="text-sm font-bold text-emerald-600 flex items-center justify-end gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active & Taking Jobs
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-primary" />
            Total Jobs
          </span>
          <p className="text-2xl font-bold mt-2">{provider.totalCompletedJobs}</p>
          <span className="text-[11px] text-muted-foreground">Successfully fulfilled</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            Average Rating
          </span>
          <p className="text-2xl font-bold mt-2">{provider.averageRating}</p>
          <span className="text-[11px] text-muted-foreground">From {provider.totalReviews} customer reviews</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Total Net Payouts
          </span>
          <p className="text-2xl font-bold mt-2">{formatCurrency(totalEarnings || 850)}</p>
          <span className="text-[11px] text-muted-foreground">After 15% platform fee</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-blue-500" />
            Service Areas
          </span>
          <p className="text-lg font-bold mt-2 truncate">Noida NCR</p>
          <span className="text-[11px] text-muted-foreground">Sec 18, 62, 137, Indirapuram</span>
        </Card>
      </div>

      {/* Main Jobs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Incoming & Active Jobs (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incoming Job Requests */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span>Incoming Job Requests</span>
                {incomingRequests.length > 0 && (
                  <Badge variant="destructive" className="rounded-full px-2">
                    {incomingRequests.length} New
                  </Badge>
                )}
              </h2>
            </div>

            {incomingRequests.length === 0 ? (
              <Card className="p-6 text-center text-sm text-muted-foreground bg-muted/20">
                No new booking requests right now. New customer requests within your {provider.serviceRadiusKm} km radius in Noida will alert here.
              </Card>
            ) : (
              <div className="space-y-4">
                {incomingRequests.map((job) => (
                  <Card key={job.id} className="border-primary/40 shadow-sm overflow-hidden">
                    <div className="bg-primary/5 px-5 py-3 border-b flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold">{job.bookingNumber}</span>
                      <Badge variant="warning">Action Required</Badge>
                    </div>
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-base">{job.service.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Customer: {job.customer.profile?.name} • 📞 {job.customer.phone}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-emerald-600">
                            {formatCurrency(job.servicePrice)}
                          </span>
                          <span className="text-[10px] text-muted-foreground block">
                            Net Payout: {formatCurrency(job.servicePrice * 0.85)}
                          </span>
                        </div>
                      </div>

                      <div className="bg-muted/40 p-3 rounded-lg text-xs space-y-1.5">
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span>Date: {formatDate(job.scheduledDate)} ({job.timeSlot})</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{job.address.streetAddress}, {job.address.city}</span>
                        </div>
                        {job.customerNotes && (
                          <p className="italic text-muted-foreground pt-1">
                            &ldquo;{job.customerNotes}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <Button size="sm" variant="brand" className="gap-1.5 flex-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>Accept Job</span>
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:bg-destructive/10">
                          <XCircle className="w-4 h-4" />
                          <span>Decline</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Active / In-Progress Jobs */}
          <div>
            <h2 className="text-lg font-bold mb-4">Active & Scheduled Jobs</h2>
            {activeJobs.length === 0 ? (
              <Card className="p-6 text-center text-sm text-muted-foreground">
                No active jobs in progress.
              </Card>
            ) : (
              <div className="space-y-4">
                {activeJobs.map((job) => (
                  <Card key={job.id} className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">{job.bookingNumber}</span>
                          <Badge variant={job.status === "IN_PROGRESS" ? "warning" : "info"}>
                            {job.status}
                          </Badge>
                        </div>
                        <h4 className="font-bold text-base mt-1">{job.service.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {job.customer.profile?.name} • 📍 {job.address.streetAddress}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-foreground">{formatCurrency(job.totalAmount)}</span>
                        <div className="mt-2">
                          <Button size="sm" variant="default" className="text-xs h-8">
                            {job.status === "IN_PROGRESS" ? "Mark Complete" : "Start Job"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Services & Payout Details */}
        <div className="space-y-6">
          {/* Services Offered */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Services Offered</CardTitle>
              <CardDescription>Catalog services active on your profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {provider.services.map((ps) => (
                <div key={ps.id} className="flex items-center justify-between text-xs p-2.5 rounded-lg border bg-muted/20">
                  <span className="font-medium text-foreground">{ps.service.name}</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(ps.customPrice || ps.service.basePrice)}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Payout Bank Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payout Bank Account</CardTitle>
              <CardDescription>Direct weekly deposit via Razorpay</CardDescription>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Bank Name:</span>
                <span className="font-medium text-foreground">HDFC Bank</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Account Number:</span>
                <span className="font-mono text-foreground">{provider.bankAccountNumber || "XXXX-XXXX-5012"}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">IFSC Code:</span>
                <span className="font-mono text-foreground">{provider.bankIfscCode || "HDFC0001234"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">UPI ID:</span>
                <span className="font-medium text-foreground">{provider.upiId || "provider@upi"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
