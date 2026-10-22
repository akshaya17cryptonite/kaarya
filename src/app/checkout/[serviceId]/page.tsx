import { notFound } from "next/navigation";
import Link from "next/link";
import { getServiceById } from "@/modules/catalog/service";
import { getFilteredProviders } from "@/modules/providers/service";
import { getSession } from "@/modules/auth/service";
import { calculateMarketplaceSplit } from "@/modules/payments";
import { formatCurrency } from "@/lib/utils";
import { createBookingAction } from "@/modules/bookings/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  ShieldCheck,
  CreditCard,
  Banknote,
  CheckCircle,
  ArrowRight,
  Info,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface CheckoutPageProps {
  params: {
    serviceId: string;
  };
  searchParams: {
    providerId?: string;
  };
}

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const service = await getServiceById(params.serviceId);
  if (!service) {
    notFound();
  }

  const session = await getSession();
  const providers = await getFilteredProviders({
    categorySlug: service.category?.slug,
    radiusKm: 25,
  });

  const selectedProvider =
    providers.find((p) => p.id === searchParams.providerId) || providers[0] || {
      id: "p1",
      name: "Ramesh Verma",
      averageRating: 4.8,
      totalReviews: 42,
    };

  const split = calculateMarketplaceSplit(service.basePrice);

  // Available dates (Next 5 days)
  const availableDates = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      iso: d.toISOString().split("T")[0],
      display: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
      isTomorrow: i === 0,
    };
  });

  return (
    <div className="min-h-screen bg-muted/10 py-10">
      <div className="container max-w-4xl space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href={`/services/${service.category?.slug || "plumber"}/noida`} className="hover:text-foreground">
            {service.category?.name || "Services"}
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold">Book {service.name}</span>
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">Confirm & Book Service</h1>
          <p className="text-sm text-muted-foreground">
            Complete your booking in 60 seconds with verified local professionals in Noida.
          </p>
        </div>

        <form action={createBookingAction} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <input type="hidden" name="serviceId" value={service.id} />
          <input type="hidden" name="providerId" value={selectedProvider.id} />

          {/* Left Form Columns (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Selected Professional */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Assigned Professional
                </span>
                <Badge variant="success" className="text-[10px] gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base border">
                  {selectedProvider.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">{selectedProvider.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    ⭐ {selectedProvider.averageRating} ({selectedProvider.totalReviews} reviews) • Noida Partner
                  </p>
                </div>
              </div>
            </Card>

            {/* 2. Select Date & Time Slot */}
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>1. Select Date & Time Slot</span>
              </h3>

              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground">Choose Service Date</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {availableDates.map((d, index) => (
                    <label
                      key={d.iso}
                      className="cursor-pointer border rounded-xl p-2.5 text-center transition hover:border-primary peer-checked:border-primary peer-checked:bg-primary/5 has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:text-primary"
                    >
                      <input
                        type="radio"
                        name="scheduledDate"
                        value={d.iso}
                        defaultChecked={index === 0}
                        className="sr-only"
                      />
                      <span className="block text-xs font-semibold">{d.display}</span>
                      {d.isTomorrow && (
                        <span className="text-[10px] text-primary block mt-0.5">Tomorrow</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-xs text-muted-foreground">Choose Time Slot</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {["09:00 AM - 11:00 AM", "11:30 AM - 01:30 PM", "02:30 PM - 04:30 PM", "05:00 PM - 07:00 PM"].map(
                    (slot, idx) => (
                      <label
                        key={slot}
                        className="cursor-pointer border rounded-xl p-2.5 text-center transition hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:text-primary font-medium"
                      >
                        <input
                          type="radio"
                          name="timeSlot"
                          value={slot}
                          defaultChecked={idx === 0}
                          className="sr-only"
                        />
                        <span>{slot}</span>
                      </label>
                    )
                  )}
                </div>
              </div>
            </Card>

            {/* 3. Service Address & Contact */}
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>2. Service Address & Contact</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="customerName" className="text-xs">Your Name</Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    defaultValue={session?.name || "Rohit Mehta"}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="customerPhone" className="text-xs">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    name="customerPhone"
                    defaultValue={session?.phone || "9811122233"}
                    required
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="streetAddress" className="text-xs">House / Flat No., Society / Building</Label>
                  <Input
                    id="streetAddress"
                    name="streetAddress"
                    placeholder="e.g. Flat 402, Stellar Park Apartments, Sector 62"
                    defaultValue="Flat 402, Stellar Park, Sector 62"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="landmark" className="text-xs">Landmark (Optional)</Label>
                  <Input
                    id="landmark"
                    name="landmark"
                    placeholder="e.g. Near Fortis Hospital"
                    defaultValue="Near Fortis Hospital"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs">City</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue="Noida"
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="customerNotes" className="text-xs">Special Instructions (Optional)</Label>
                  <Input
                    id="customerNotes"
                    name="customerNotes"
                    placeholder="e.g. Please bring water pipe connector and ladder"
                  />
                </div>
              </div>
            </Card>

            {/* 4. Payment Options */}
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <span>3. Payment Mode</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <label className="cursor-pointer border rounded-xl p-4 flex items-start gap-3 transition hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE"
                    defaultChecked
                    className="mt-1"
                  />
                  <div>
                    <span className="font-bold block text-foreground flex items-center gap-1.5">
                      <span>Online Payment</span>
                      <Badge variant="default" className="text-[10px] py-0 px-1.5">Razorpay Escrow</Badge>
                    </span>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      UPI (GPay/PhonePe), Credit/Debit Card, Netbanking. Safe escrow release.
                    </span>
                  </div>
                </label>

                <label className="cursor-pointer border rounded-xl p-4 flex items-start gap-3 transition hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CASH"
                    className="mt-1"
                  />
                  <div>
                    <span className="font-bold block text-foreground flex items-center gap-1.5">
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <span>Pay on Service</span>
                    </span>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      Pay cash or UPI directly to professional after job completion.
                    </span>
                  </div>
                </label>
              </div>
            </Card>
          </div>

          {/* Right Summary Sidebar (1 col) */}
          <div className="space-y-6">
            <Card className="p-6 space-y-5 sticky top-24">
              <div className="border-b pb-4 space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Booking Summary
                </span>
                <h3 className="font-bold text-lg text-foreground">{service.name}</h3>
                <p className="text-xs text-muted-foreground">{service.category?.name} in Noida</p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Item Total</span>
                  <span className="font-medium text-foreground">{formatCurrency(split.servicePrice)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span>Platform Convenience Fee</span>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </span>
                  <span className="font-medium text-foreground">{formatCurrency(split.platformFee)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>GST on Fee (18%)</span>
                  <span className="font-medium text-foreground">{formatCurrency(split.taxOnFee)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-base font-bold text-foreground">
                  <span>Total Amount</span>
                  <span className="text-primary text-xl font-extrabold">{formatCurrency(split.totalCustomerPayable)}</span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="bg-muted/40 p-3 rounded-xl space-y-1.5 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5 text-foreground font-semibold">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>30-Day Free Rework Guarantee</span>
                </div>
                <p>Standardized transparent pricing with zero hidden surcharges.</p>
              </div>

              <Button type="submit" size="lg" className="w-full gap-2 text-sm font-bold shadow-md">
                <span>Confirm & Book Now</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
