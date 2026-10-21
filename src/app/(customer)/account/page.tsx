import { redirect } from "next/navigation";
import Link from "next/link";
import { type Prisma } from "@prisma/client";
import { getSession } from "@/modules/auth/service";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, Wrench } from "lucide-react";

export const dynamic = "force-dynamic";

type CustomerWithBookings = Prisma.UserGetPayload<{
  include: {
    profile: true;
    addresses: true;
    bookings: {
      include: {
        service: true;
        provider: {
          include: {
            user: {
              include: { profile: true };
            };
          };
        };
        payment: true;
        review: true;
      };
    };
  };
}>;

export default async function CustomerAccountPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?redirectTo=/account");
  }

  // Load customer bookings & addresses safely
  let customer: CustomerWithBookings | null = null;
  try {
    customer = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        profile: true,
        addresses: true,
        bookings: {
          include: {
            service: true,
            provider: {
              include: {
                user: {
                  include: { profile: true },
                },
              },
            },
            payment: true,
            review: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch (err) {
    console.warn("DB not connected for account page, using empty default:", (err as Error).message);
  }

  const bookings = customer?.bookings || [];
  const addresses = customer?.addresses || [];

  return (
    <div className="container py-8 space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold border-2 border-primary/20">
            {session.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{session.name}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
              <span>{session.phone}</span>
              {session.email && <span>• {session.email}</span>}
              <Badge variant="secondary" className="ml-2">Customer Account</Badge>
            </p>
          </div>
        </div>

        <Link href="/">
          <Button className="gap-2">
            <Wrench className="w-4 h-4" />
            <span>Book a New Service</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bookings Section (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Your Service Bookings</h2>
            <span className="text-xs text-muted-foreground font-medium">
              {bookings.length} {bookings.length === 1 ? "booking" : "bookings"} total
            </span>
          </div>

          {bookings.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">No bookings yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover verified plumbers, electricians, and cleaners in Noida.
                  </p>
                </div>
                <Link href="/">
                  <Button variant="default">Browse Services</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const statusBadgeVariant =
                  booking.status === "COMPLETED"
                    ? "success"
                    : booking.status === "IN_PROGRESS"
                    ? "warning"
                    : booking.status === "ACCEPTED"
                    ? "info"
                    : "secondary";

                return (
                  <Card key={booking.id} className="overflow-hidden hover:shadow-md transition">
                    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b bg-muted/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-muted-foreground">
                            {booking.bookingNumber}
                          </span>
                          <Badge variant={statusBadgeVariant}>{booking.status}</Badge>
                        </div>
                        <h3 className="font-bold text-lg mt-1">{booking.service.name}</h3>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-xs text-muted-foreground block">Total Amount</span>
                        <span className="text-lg font-bold text-foreground">
                          {formatCurrency(booking.totalAmount)}
                        </span>
                      </div>
                    </div>

                    <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Scheduled Date: <strong>{formatDate(booking.scheduledDate)}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Time Slot: <strong>{booking.timeSlot}</strong></span>
                        </div>
                        {booking.customerNotes && (
                          <p className="text-xs text-muted-foreground mt-2 italic bg-muted/40 p-2 rounded">
                            &ldquo;{booking.customerNotes}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 sm:border-l sm:pl-4">
                        <span className="text-xs text-muted-foreground block">Assigned Professional</span>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {booking.provider.user.profile?.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-xs">{booking.provider.user.profile?.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              ⭐ {booking.provider.averageRating} ({booking.provider.totalReviews} reviews)
                            </p>
                          </div>
                        </div>

                        {booking.payment && (
                          <div className="pt-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
                            <span className="font-medium">Payment:</span>
                            <Badge variant={booking.payment.status === "PAID" ? "success" : "warning"} className="text-[10px] py-0 px-1.5">
                              {booking.payment.status} ({booking.payment.method})
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Saved Addresses & Profile Sidebar (1 Col) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Saved Addresses</span>
              </CardTitle>
              <CardDescription>
                Service locations in Noida for rapid booking.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {addresses.length === 0 ? (
                <p className="text-xs text-muted-foreground">No saved addresses yet.</p>
              ) : (
                addresses.map((addr) => (
                  <div key={addr.id} className="border p-3 rounded-lg text-xs space-y-1 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{addr.label || "Address"}</span>
                      {addr.isDefault && (
                        <Badge variant="secondary" className="text-[10px]">Default</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{addr.streetAddress}</p>
                    {addr.landmark && <p className="text-muted-foreground">Near {addr.landmark}</p>}
                    <p className="font-medium text-foreground">{addr.city}, {addr.state} - {addr.postalCode}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
