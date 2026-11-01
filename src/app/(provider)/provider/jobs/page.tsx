import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/service";
import { getProviderProfileByUserId } from "@/modules/providers/service";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { JobActionButtons } from "@/components/provider/job-action-buttons";
import { Calendar, MapPin, Phone, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProviderJobsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?role=PROVIDER&redirectTo=/provider/jobs");
  }

  const provider = await getProviderProfileByUserId(session.id);
  const bookings = provider.bookings || [];

  const incomingRequests = bookings.filter((b) => b.status === "REQUESTED");
  const activeJobs = bookings.filter((b) => b.status === "ACCEPTED" || b.status === "IN_PROGRESS");
  const completedJobs = bookings.filter((b) => b.status === "COMPLETED");
  const cancelledJobs = bookings.filter(
    (b) => b.status === "CANCELLED" || b.status === "REJECTED"
  );

  const renderBookingCard = (job: (typeof bookings)[number]) => {
    return (
      <Card key={job.id} className="overflow-hidden border shadow-sm">
        <div className="bg-muted/30 px-5 py-3 border-b flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-foreground">
              {job.bookingNumber}
            </span>
            <Badge
              variant={
                job.status === "REQUESTED"
                  ? "warning"
                  : job.status === "IN_PROGRESS"
                  ? "info"
                  : job.status === "COMPLETED"
                  ? "success"
                  : job.status === "ACCEPTED"
                  ? "default"
                  : "destructive"
              }
            >
              {job.status}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            Booked on {formatDate(job.createdAt)}
          </span>
        </div>

        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-foreground">{job.service.name}</h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-primary" />
                  {job.customer.name}
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  {job.customer.phone}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-lg font-bold text-emerald-600 block">
                {formatCurrency(job.servicePrice)}
              </span>
              <span className="text-[11px] text-muted-foreground">
                Your Net: {formatCurrency(job.servicePrice * 0.85)} (after 15% fee)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-muted/20 p-3 rounded-lg text-xs">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>
                {formatDate(job.scheduledDate)} ({job.timeSlot})
              </span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">
                {job.address.streetAddress}, {job.address.city}
              </span>
            </div>
          </div>

          {job.customerNotes && (
            <div className="text-xs p-2.5 rounded bg-amber-500/5 border border-amber-500/20 text-muted-foreground italic">
              <strong>Customer Note:</strong> &ldquo;{job.customerNotes}&rdquo;
            </div>
          )}

          {job.cancellationReason && (
            <div className="text-xs p-2.5 rounded bg-destructive/10 border border-destructive/20 text-destructive">
              <strong>Decline/Cancellation Reason:</strong> {job.cancellationReason}
            </div>
          )}

          {/* Action triggers */}
          {(job.status === "REQUESTED" ||
            job.status === "ACCEPTED" ||
            job.status === "IN_PROGRESS") && (
            <div className="pt-2 border-t">
              <JobActionButtons bookingId={job.id} status={job.status} />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage Job Requests & Bookings</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review new incoming requests, start scheduled work, and track completed jobs.
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 h-auto p-1.5 gap-1">
          <TabsTrigger value="all" className="text-xs py-2">
            All ({bookings.length})
          </TabsTrigger>
          <TabsTrigger value="requested" className="text-xs py-2 relative">
            New Requests
            {incomingRequests.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-destructive text-destructive-foreground font-bold text-[10px]">
                {incomingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="active" className="text-xs py-2">
            Active ({activeJobs.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs py-2">
            Completed ({completedJobs.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="text-xs py-2">
            History ({cancelledJobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {bookings.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No bookings recorded yet.
            </Card>
          ) : (
            bookings.map(renderBookingCard)
          )}
        </TabsContent>

        <TabsContent value="requested" className="space-y-4">
          {incomingRequests.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No new requests requiring confirmation.
            </Card>
          ) : (
            incomingRequests.map(renderBookingCard)
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeJobs.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No active or in-progress jobs. Accept incoming requests to begin.
            </Card>
          ) : (
            activeJobs.map(renderBookingCard)
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedJobs.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No completed jobs yet.
            </Card>
          ) : (
            completedJobs.map(renderBookingCard)
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledJobs.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No cancelled or declined jobs.
            </Card>
          ) : (
            cancelledJobs.map(renderBookingCard)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
