"use client";

import { useState } from "react";
import { type AdminBookingDetail } from "@/modules/admin/service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Calendar,
  MapPin,
  User,
  AlertTriangle,
} from "lucide-react";
import { DisputeModal } from "@/components/admin/dispute-modal";

interface AdminBookingsManagerProps {
  bookings: AdminBookingDetail[];
}

export function AdminBookingsManager({ bookings }: AdminBookingsManagerProps) {
  const [selectedDisputeBooking, setSelectedDisputeBooking] = useState<AdminBookingDetail | null>(null);

  const requested = bookings.filter((b) => b.status === "REQUESTED");
  const active = bookings.filter((b) => b.status === "ACCEPTED" || b.status === "IN_PROGRESS");
  const completed = bookings.filter((b) => b.status === "COMPLETED");
  const cancelled = bookings.filter(
    (b) => b.status === "CANCELLED" || b.status === "REJECTED"
  );

  const renderBookingRow = (job: AdminBookingDetail) => {
    const isCancelled = job.status === "CANCELLED" || job.status === "REJECTED";
    const isCompleted = job.status === "COMPLETED";

    return (
      <Card key={job.id} className="overflow-hidden border shadow-sm">
        <div className="bg-muted/20 px-5 py-3 border-b flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-foreground">
              {job.bookingNumber}
            </span>
            <Badge
              variant={
                isCompleted
                  ? "success"
                  : isCancelled
                  ? "destructive"
                  : job.status === "REQUESTED"
                  ? "warning"
                  : "info"
              }
            >
              {job.status}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              Payment: {job.payment?.status || "PENDING"} ({job.payment?.method || "ONLINE"})
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            Created {formatDate(job.createdAt)}
          </span>
        </div>

        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-foreground">{job.service.name}</h3>
                <span className="text-xs text-muted-foreground">
                  ({job.service.categoryName})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground mt-2">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  Customer: <strong className="text-foreground">{job.customer.name}</strong> (📞 {job.customer.phone})
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  Partner: <strong className="text-foreground">{job.provider.name}</strong> (⭐ {job.provider.rating})
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-base font-bold text-foreground block">
                Total: {formatCurrency(job.totalAmount)}
              </span>
              <span className="text-xs text-emerald-600 font-semibold block">
                Platform Fee: {formatCurrency(job.platformFee)}
              </span>
              <span className="text-[11px] text-muted-foreground block">
                Partner: {formatCurrency(job.servicePrice - job.platformFee)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-muted/20 p-3 rounded-lg text-xs">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>
                Scheduled: {formatDate(job.scheduledDate)} ({job.timeSlot})
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
            <p className="text-xs italic text-muted-foreground bg-muted/20 p-2 rounded">
              Customer Note: &ldquo;{job.customerNotes}&rdquo;
            </p>
          )}

          {job.cancellationReason && (
            <p className="text-xs text-destructive bg-destructive/10 p-2 rounded font-medium">
              Resolution Note: {job.cancellationReason}
            </p>
          )}

          {/* Admin Dispute & Refund Controls */}
          <div className="flex items-center justify-between pt-2 border-t text-xs">
            <span className="text-[11px] text-muted-foreground">
              {job.payment?.razorpayPaymentId
                ? `Gateway ID: ${job.payment.razorpayPaymentId}`
                : "Cash on service payment"}
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDisputeBooking(job)}
                className="text-xs h-7 gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Dispute & Refund</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 h-auto p-1.5 gap-1">
          <TabsTrigger value="all" className="text-xs py-2">
            All ({bookings.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="text-xs py-2">
            Active / Scheduled ({active.length})
          </TabsTrigger>
          <TabsTrigger value="requested" className="text-xs py-2">
            Pending Confirmation ({requested.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs py-2">
            Completed ({completed.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="text-xs py-2">
            Cancelled / Disputed ({cancelled.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {bookings.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No bookings recorded yet.
            </Card>
          ) : (
            bookings.map(renderBookingRow)
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {active.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No active or in-progress bookings.
            </Card>
          ) : (
            active.map(renderBookingRow)
          )}
        </TabsContent>

        <TabsContent value="requested" className="space-y-4">
          {requested.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No bookings awaiting provider response.
            </Card>
          ) : (
            requested.map(renderBookingRow)
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completed.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No completed bookings yet.
            </Card>
          ) : (
            completed.map(renderBookingRow)
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelled.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No cancelled or disputed bookings.
            </Card>
          ) : (
            cancelled.map(renderBookingRow)
          )}
        </TabsContent>
      </Tabs>

      {selectedDisputeBooking && (
        <DisputeModal
          booking={selectedDisputeBooking}
          onClose={() => setSelectedDisputeBooking(null)}
        />
      )}
    </>
  );
}
