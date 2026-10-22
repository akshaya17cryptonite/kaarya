import { notFound } from "next/navigation";
import Link from "next/link";
import { getProviderById } from "@/modules/providers/service";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  ShieldCheck,
  CheckCircle,
  Calendar,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface ProviderProfilePageProps {
  params: {
    id: string;
  };
}

export default async function ProviderProfilePage({ params }: ProviderProfilePageProps) {
  const provider = await getProviderById(params.id);
  if (!provider) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-muted/10 pb-16">
      {/* Provider Header Hero */}
      <section className="bg-gradient-to-b from-primary/10 via-background to-background border-b py-10">
        <div className="container max-w-5xl space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href="/services/plumber/noida" className="hover:text-foreground">Providers</Link>
            <span>/</span>
            <span className="text-foreground font-semibold">{provider.name}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-card border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl border-2 border-primary/20 shrink-0">
                {provider.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">{provider.name}</h1>
                  <Badge variant="success" className="gap-1 py-0 px-2 text-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Partner
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                  <span>📍 {provider.currentAddress}</span>
                  <span>•</span>
                  <span>Covers {provider.serviceRadiusKm} km radius in Noida</span>
                </p>
                <div className="flex items-center gap-3 pt-1 text-xs">
                  <span className="flex items-center gap-1 font-bold text-foreground">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    {provider.averageRating}
                  </span>
                  <span className="text-muted-foreground">({provider.totalReviews} reviews)</span>
                  <span>•</span>
                  <span className="font-semibold text-emerald-600">
                    {provider.totalCompletedJobs} jobs completed
                  </span>
                  <span>•</span>
                  <span className="text-muted-foreground">{provider.experienceYears} years experience</span>
                </div>
              </div>
            </div>

            <div className="flex items-center sm:self-center">
              <Link href={`/checkout/${provider.services[0]?.serviceId || "cat_plumbing_s_0"}?providerId=${provider.id}`}>
                <Button className="w-full sm:w-auto px-6 gap-2">
                  <span>Book Professional</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container max-w-5xl py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bio / About */}
          <Card className="p-6 space-y-3">
            <h2 className="text-lg font-bold">About {provider.name}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {provider.bio ||
                "Certified service professional in Noida with extensive background in home diagnostics, parts installation, and emergency service delivery. Background checked via Aadhaar & police clearance."}
            </p>
          </Card>

          {/* Services Offered with Custom Pricing */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Services Offered & Rates</h2>
            <div className="space-y-3">
              {provider.services.map((s) => (
                <Card key={s.id} className="p-5 flex items-center justify-between hover:shadow-sm transition">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-foreground">{s.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Category: {s.categoryName} • Duration: ~{s.estimatedDurationMinutes} mins
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg text-primary">
                      {formatCurrency(s.customPrice || s.basePrice)}
                    </span>
                    <Link href={`/checkout/${s.serviceId}?providerId=${provider.id}`}>
                      <Button size="sm" className="h-8 text-xs">Book</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Customer Reviews & Feedback */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">
                Customer Reviews ({provider.reviews.length})
              </h2>
              <div className="flex items-center gap-1.5 text-sm font-bold">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{provider.averageRating} out of 5</span>
              </div>
            </div>

            {provider.reviews.length === 0 ? (
              <Card className="p-8 text-center text-xs text-muted-foreground">
                No reviews yet for this professional.
              </Card>
            ) : (
              <div className="space-y-3">
                {provider.reviews.map((r) => (
                  <Card key={r.id} className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">{r.customerName}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < r.rating ? "text-amber-500 fill-amber-500" : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        &ldquo;{r.comment}&rdquo;
                      </p>
                    )}
                    {r.providerReply && (
                      <div className="bg-muted/40 border-l-2 border-primary pl-3 py-1.5 text-[11px] text-muted-foreground mt-2">
                        <span className="font-semibold text-foreground block">Response from partner:</span>
                        {r.providerReply}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Availability & Credentials (1 col) */}
        <div className="space-y-6">
          {/* Availability Slots */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm">Working Hours & Slots</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Available Monday to Saturday for on-demand booking across Noida sectors.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="border p-2 rounded text-center bg-muted/20">
                <span className="font-semibold block text-foreground">Morning</span>
                <span className="text-[11px] text-muted-foreground">09:00 - 12:00</span>
              </div>
              <div className="border p-2 rounded text-center bg-muted/20">
                <span className="font-semibold block text-foreground">Afternoon</span>
                <span className="text-[11px] text-muted-foreground">12:30 - 03:30</span>
              </div>
              <div className="border p-2 rounded text-center bg-muted/20">
                <span className="font-semibold block text-foreground">Evening</span>
                <span className="text-[11px] text-muted-foreground">04:00 - 07:00</span>
              </div>
              <div className="border p-2 rounded text-center bg-muted/20">
                <span className="font-semibold block text-foreground">Emergency</span>
                <span className="text-[11px] text-primary font-medium">On-Call</span>
              </div>
            </div>
          </Card>

          {/* Verification Badges */}
          <Card className="p-6 space-y-3">
            <h3 className="font-bold text-sm">Trust & Security Badges</h3>
            <ul className="text-xs space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Government ID (Aadhaar / PAN) Verified</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Police Verification Cleared</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Safety & Tool Sanitization SOP Trained</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>LocConnect Escrow Protected</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
