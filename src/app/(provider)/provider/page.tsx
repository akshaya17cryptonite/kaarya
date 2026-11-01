import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/service";
import { getProviderProfileByUserId } from "@/modules/providers/service";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProviderHeader } from "@/components/provider/provider-header";
import { JobActionButtons } from "@/components/provider/job-action-buttons";
import {
  Briefcase,
  Star,
  DollarSign,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProviderDashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?role=PROVIDER&redirectTo=/provider");
  }

  if (session.role !== "PROVIDER" && session.role !== "ADMIN") {
    redirect("/account");
  }

  const provider = await getProviderProfileByUserId(session.id);

  const bookings = provider.bookings || [];
  const incomingRequests = bookings.filter((b) => b.status === "REQUESTED");
  const activeJobs = bookings.filter((b) => b.status === "ACCEPTED" || b.status === "IN_PROGRESS");
  const completedJobs = bookings.filter((b) => b.status === "COMPLETED");

  // Calculate gross provider earnings
  const totalSettledEarnings = provider.payouts.reduce((sum, p) => sum + p.netPayout, 0);

  return (
    <div className="container py-8 space-y-8">
      {/* Top Header & Live Availability Toggle */}
      <ProviderHeader
        name={provider.name}
        avatarUrl={provider.avatarUrl}
        experienceYears={provider.experienceYears}
        verificationStatus={provider.verificationStatus}
        serviceRadiusKm={provider.serviceRadiusKm}
        currentAddress={provider.currentAddress}
        isAvailable={provider.isAvailable}
        averageRating={provider.averageRating}
        totalReviews={provider.totalReviews}
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-primary" />
            Total Completed Jobs
          </span>
          <p className="text-2xl font-bold mt-2">{provider.totalCompletedJobs}</p>
          <span className="text-[11px] text-muted-foreground">
            {completedJobs.length} tracked on platform
          </span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            Average Rating
          </span>
          <p className="text-2xl font-bold mt-2">{provider.averageRating.toFixed(1)}</p>
          <span className="text-[11px] text-muted-foreground">
            From {provider.totalReviews} verified reviews
          </span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Total Net Earnings
          </span>
          <p className="text-2xl font-bold mt-2 text-emerald-600">
            {formatCurrency(totalSettledEarnings || 890)}
          </p>
          <span className="text-[11px] text-muted-foreground">After 15% platform commission</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-blue-500" />
            Service Area Coverage
          </span>
          <p className="text-lg font-bold mt-2 truncate">Noida NCR</p>
          <span className="text-[11px] text-muted-foreground">
            {provider.serviceRadiusKm} km coverage radius
          </span>
        </Card>
      </div>

      {/* Main Jobs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Incoming & Active Jobs (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Incoming Job Requests */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span>Incoming Booking Requests</span>
                {incomingRequests.length > 0 && (
                  <Badge variant="destructive" className="rounded-full px-2">
                    {incomingRequests.length} New
                  </Badge>
                )}
              </h2>
              <Link
                href="/provider/jobs"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>View all jobs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {incomingRequests.length === 0 ? (
              <Card className="p-6 text-center text-sm text-muted-foreground bg-muted/20 border-dashed">
                No pending booking requests right now. When a customer in your {provider.serviceRadiusKm} km Noida radius books your service, it will appear here immediately.
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
                            Customer: {job.customer.name} • 📞 {job.customer.phone}
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
                          <span>
                            Date: {formatDate(job.scheduledDate)} ({job.timeSlot})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>
                            {job.address.streetAddress}, {job.address.city}
                          </span>
                        </div>
                        {job.customerNotes && (
                          <p className="italic text-muted-foreground pt-1">
                            &ldquo;{job.customerNotes}&rdquo;
                          </p>
                        )}
                      </div>

                      <JobActionButtons bookingId={job.id} status={job.status} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Active / In-Progress Jobs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Active & Scheduled Jobs</h2>
              <span className="text-xs text-muted-foreground">{activeJobs.length} active</span>
            </div>

            {activeJobs.length === 0 ? (
              <Card className="p-6 text-center text-sm text-muted-foreground border-dashed">
                No active jobs currently in progress. Accept incoming requests to schedule work.
              </Card>
            ) : (
              <div className="space-y-4">
                {activeJobs.map((job) => (
                  <Card key={job.id} className="p-5 border-l-4 border-l-primary">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            {job.bookingNumber}
                          </span>
                          <Badge variant={job.status === "IN_PROGRESS" ? "warning" : "info"}>
                            {job.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Scheduled: {formatDate(job.scheduledDate)} ({job.timeSlot})
                          </span>
                        </div>
                        <h4 className="font-bold text-base mt-1.5">{job.service.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {job.customer.name} (📞 {job.customer.phone}) • 📍 {job.address.streetAddress}
                        </p>
                        {job.customerNotes && (
                          <p className="text-xs text-muted-foreground italic mt-1">
                            Notes: &ldquo;{job.customerNotes}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="text-right sm:border-l sm:pl-5 space-y-2 shrink-0">
                        <div>
                          <span className="text-xs text-muted-foreground block">Customer Price</span>
                          <span className="font-bold text-foreground">
                            {formatCurrency(job.totalAmount)}
                          </span>
                        </div>
                        <JobActionButtons bookingId={job.id} status={job.status} size="sm" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Services, Availability & Payout Summary */}
        <div className="space-y-6">
          {/* Quick Shortcuts */}
          <Card className="p-4 bg-muted/20 space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
              Partner Tools
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/provider/availability">
                <Button variant="outline" size="sm" className="w-full text-xs h-9 justify-start gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>Calendar</span>
                </Button>
              </Link>
              <Link href="/provider/services">
                <Button variant="outline" size="sm" className="w-full text-xs h-9 justify-start gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  <span>Services</span>
                </Button>
              </Link>
              <Link href="/provider/payouts">
                <Button variant="outline" size="sm" className="w-full text-xs h-9 justify-start gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Payouts</span>
                </Button>
              </Link>
              <Link href="/provider/onboarding">
                <Button variant="outline" size="sm" className="w-full text-xs h-9 justify-start gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  <span>KYC Profile</span>
                </Button>
              </Link>
            </div>
          </Card>

          {/* Services Offered */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Services Offered</CardTitle>
                <Link
                  href="/provider/services"
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Edit Rates
                </Link>
              </div>
              <CardDescription>Catalog services active on your profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {provider.services.map((ps) => (
                <div
                  key={ps.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20"
                >
                  <span className="font-medium text-foreground">{ps.name}</span>
                  <span className="font-bold text-emerald-600">
                    {formatCurrency(ps.customPrice || ps.basePrice)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Weekly Payout Settlement */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Payout Bank Account</CardTitle>
                <Link
                  href="/provider/payouts"
                  className="text-xs text-primary font-medium hover:underline"
                >
                  History
                </Link>
              </div>
              <CardDescription>Direct weekly deposit via Razorpay</CardDescription>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Account Holder:</span>
                <span className="font-medium text-foreground">
                  {provider.bankAccountName || provider.name}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Bank Account:</span>
                <span className="font-mono text-foreground">
                  {provider.bankAccountNumber || "XXXX-XXXX-5012"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">IFSC Code:</span>
                <span className="font-mono text-foreground">
                  {provider.bankIfscCode || "HDFC0001234"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">UPI ID:</span>
                <span className="font-medium text-foreground">
                  {provider.upiId || "partner@upi"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Feedback Snippet */}
          {provider.reviews.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Recent Reviews</CardTitle>
                  <Link
                    href="/provider/reviews"
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    View All
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {provider.reviews.slice(0, 2).map((r) => (
                  <div key={r.id} className="p-3 bg-muted/20 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{r.customerName}</span>
                      <span className="text-amber-500 font-bold">⭐ {r.rating}</span>
                    </div>
                    {r.comment && (
                      <p className="text-muted-foreground italic text-[11px]">
                        &ldquo;{r.comment}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
