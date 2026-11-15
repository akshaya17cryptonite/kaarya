import { notFound } from "next/navigation";
import Link from "next/link";
import { getBookingById } from "@/modules/bookings/service";
import { getSession } from "@/modules/auth/service";
import { getReviewForBooking } from "@/modules/reviews/service";
import { getBookingMessages } from "@/modules/chat/service";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cancelBookingAction, confirmOnlinePaymentAction } from "@/modules/bookings/actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookingReviewCard } from "@/components/reviews/booking-review-card";
import { BookingChat } from "@/components/chat/booking-chat";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  CreditCard,
  ArrowLeft,
  XCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface BookingStatusPageProps {
  params: {
    id: string;
  };
}

export default async function BookingStatusPage({ params }: BookingStatusPageProps) {
  const [booking, session] = await Promise.all([
    getBookingById(params.id),
    getSession(),
  ]);

  if (!booking) {
    notFound();
  }

  const [review, messages] = await Promise.all([
    getReviewForBooking(params.id),
    getBookingMessages(params.id, session?.id || "anonymous"),
  ]);

  // Determine stage progression
  const steps = [
    { key: "REQUESTED", label: "Request Placed", desc: "Partner notified" },
    { key: "ACCEPTED", label: "Partner Confirmed", desc: "Slot locked" },
    { key: "IN_PROGRESS", label: "Service In Progress", desc: "Technician on-site" },
    { key: "COMPLETED", label: "Job Completed", desc: "Warranty active" },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return 0;
      case "ACCEPTED":
        return 1;
      case "IN_PROGRESS":
        return 2;
      case "COMPLETED":
        return 3;
      case "CANCELLED":
      case "REJECTED":
        return -1;
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex(booking.status);
  const isCancelled = booking.status === "CANCELLED" || booking.status === "REJECTED";

  return (
    <div className="min-h-screen bg-muted/10 py-10">
      <div className="container max-w-4xl space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/account"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to My Bookings</span>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                Booking #{booking.bookingNumber}
              </h1>
              <Badge
                variant={
                  booking.status === "COMPLETED"
                    ? "success"
                    : booking.status === "IN_PROGRESS"
                    ? "warning"
                    : booking.status === "ACCEPTED"
                    ? "info"
                    : isCancelled
                    ? "destructive"
                    : "secondary"
                }
              >
                {booking.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Scheduled for {formatDate(booking.scheduledDate)} • {booking.timeSlot}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-muted-foreground block">Total Payable</span>
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(booking.totalAmount)}
            </span>
          </div>
        </div>

        {/* Visual Progress Timeline */}
        {!isCancelled ? (
          <Card className="p-6">
            <h3 className="text-sm font-semibold mb-6">Service Status Timeline</h3>
            <div className="grid grid-cols-4 gap-2 relative">
              {steps.map((step, idx) => {
                const isPassed = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-colors ${
                        isPassed
                          ? "bg-primary text-primary-foreground shadow"
                          : "bg-muted text-muted-foreground"
                      } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span className="text-xs font-bold text-foreground block">{step.label}</span>
                    <span className="text-[10px] text-muted-foreground hidden sm:block mt-0.5">
                      {step.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        ) : (
          <Card className="p-6 border-destructive/30 bg-destructive/5 space-y-2">
            <div className="flex items-center gap-2 text-destructive font-bold text-sm">
              <XCircle className="w-4 h-4" />
              <span>This booking was {booking.status.toLowerCase()}</span>
            </div>
            {booking.cancellationReason && (
              <p className="text-xs text-muted-foreground">Reason: {booking.cancellationReason}</p>
            )}
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Details (2 cols) */}
          <div className="md:col-span-2 space-y-6">
            {/* Service & Professional Details */}
            <Card className="p-6 space-y-5">
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <span className="text-xs font-semibold text-primary block">
                    {booking.service.category?.name}
                  </span>
                  <h3 className="font-bold text-lg text-foreground">{booking.service.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{booking.service.description}</p>
                </div>
              </div>

              {/* Assigned Partner Card */}
              <div className="bg-muted/30 p-4 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base border">
                    {booking.provider.user.profile?.name ? booking.provider.user.profile.name.slice(0, 2).toUpperCase() : "SP"}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-foreground">
                        {booking.provider.user.profile?.name}
                      </h4>
                      <Badge variant="success" className="text-[9px] py-0 px-1">Verified</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ⭐ {booking.provider.averageRating} ({booking.provider.totalReviews} reviews)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a href={`tel:${booking.provider.user.phone}`}>
                    <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
                      <Phone className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Call Partner</span>
                    </Button>
                  </a>
                  <a href="#chat-section">
                    <Button variant="default" size="sm" className="h-9 gap-1.5 text-xs">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </Button>
                  </a>
                </div>
              </div>

              {/* Location & Slot Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>Service Address</span>
                  </span>
                  <p className="font-semibold text-foreground">{booking.address.streetAddress}</p>
                  {booking.address.landmark && (
                    <p className="text-muted-foreground">Near {booking.address.landmark}</p>
                  )}
                  <p className="text-muted-foreground">
                    {booking.address.city}, {booking.address.state} - {booking.address.postalCode}
                  </p>
                </div>

                <div className="space-y-1 sm:border-l sm:pl-4">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>Scheduled Time Slot</span>
                  </span>
                  <p className="font-semibold text-foreground">{booking.timeSlot}</p>
                  <p className="text-muted-foreground">{formatDate(booking.scheduledDate)}</p>
                </div>
              </div>
            </Card>

            {/* Customer Review & Rating Section */}
            {booking.status === "COMPLETED" && (
              <BookingReviewCard
                bookingId={booking.id}
                providerName={booking.provider.user.profile?.name ?? "Service Partner"}
                existingReview={review}
                isCompleted={true}
              />
            )}

            {/* In-App Direct Chat Section */}
            <div id="chat-section">
              <BookingChat
                bookingId={booking.id}
                partnerName={booking.provider.user.profile?.name ?? "Service Partner"}
                initialMessages={messages}
                currentUserId={session?.id || "anonymous"}
              />
            </div>

            {/* Cancel Action */}
            {!isCancelled && booking.status !== "COMPLETED" && (
              <Card className="p-5 flex items-center justify-between border-destructive/20 bg-destructive/5">
                <div>
                  <h4 className="text-xs font-bold text-destructive">Need to reschedule or cancel?</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Free cancellation up to 2 hours before the scheduled slot.
                  </p>
                </div>
                <form action={cancelBookingAction}>
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <input type="hidden" name="reason" value="Customer cancelled before slot" />
                  <Button variant="outline" size="sm" className="text-xs text-destructive hover:bg-destructive/10">
                    Cancel Booking
                  </Button>
                </form>
              </Card>
            )}
          </div>

          {/* Right Payment / Receipt Sidebar (1 col) */}
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <div className="border-b pb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Payment Details
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-bold text-foreground">
                  {booking.payment?.method === "ONLINE" ? "Online (Razorpay)" : "Cash on Service"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Payment Status:</span>
                <Badge
                  variant={booking.payment?.status === "PAID" ? "success" : "warning"}
                  className="text-[10px]"
                >
                  {booking.payment?.status || "PENDING"}
                </Badge>
              </div>

              {/* Online Payment Pay Button if Pending */}
              {booking.payment?.method === "ONLINE" && booking.payment?.status !== "PAID" && !isCancelled && (
                <div className="bg-primary/5 border border-primary/20 p-3 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
                    <CreditCard className="w-4 h-4" />
                    <span>Pay Online with Razorpay</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Complete your payment now via UPI, Cards, or Netbanking. Held in escrow until service completion.
                  </p>
                  <form action={confirmOnlinePaymentAction}>
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <Button size="sm" className="w-full text-xs font-bold gap-1 mt-1">
                      <span>Pay {formatCurrency(booking.totalAmount)} Now</span>
                    </Button>
                  </form>
                </div>
              )}

              {/* Receipt Breakdown */}
              <div className="border-t pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Service Base Charge</span>
                  <span>{formatCurrency(booking.servicePrice)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Platform Fee (15%)</span>
                  <span>{formatCurrency(booking.platformFee)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>GST (18% on fee)</span>
                  <span>{formatCurrency(booking.taxAmount)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-sm text-foreground">
                  <span>Total Paid / Payable</span>
                  <span className="text-primary">{formatCurrency(booking.totalAmount)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
