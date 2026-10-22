import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryBySlug } from "@/modules/catalog/service";
import { getFilteredProviders } from "@/modules/providers/service";
import { formatCurrency } from "@/lib/utils";
import { SearchFilters } from "@/components/customer/search-filters";
import { ProviderCard } from "@/components/customer/provider-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface ServicePageProps {
  params: {
    category: string;
    city: string;
  };
  searchParams: {
    radius?: string;
    rating?: string;
    sort?: string;
  };
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const category = await getCategoryBySlug(params.category);
  const cityName = params.city.charAt(0).toUpperCase() + params.city.slice(1);

  if (!category) {
    return {
      title: "Services Not Found",
    };
  }

  return {
    title: `Best ${category.name} in ${cityName} - Fixed Upfront Rates`,
    description: `Discover & book top-rated, background-checked ${category.name.toLowerCase()} in ${cityName}. Standard pricing, 30-day warranty, and on-time arrival.`,
  };
}

export default async function ServiceCategoryPage({ params, searchParams }: ServicePageProps) {
  const category = await getCategoryBySlug(params.category);
  if (!category) {
    notFound();
  }

  const cityName = params.city.charAt(0).toUpperCase() + params.city.slice(1);
  const radiusKm = searchParams.radius ? parseFloat(searchParams.radius) : 25;
  const minRating = searchParams.rating ? parseFloat(searchParams.rating) : 0;

  // Retrieve nearby verified providers
  const providers = await getFilteredProviders({
    categorySlug: params.category,
    radiusKm,
    minRating,
  });

  return (
    <div className="min-h-screen bg-muted/10 pb-16">
      {/* Category Header Hero */}
      <section className="bg-gradient-to-b from-primary/10 via-background to-background border-b py-12">
        <div className="container space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-foreground">Services</Link>
            <span>/</span>
            <span className="text-foreground font-semibold">{category.name}</span>
            <span>/</span>
            <Badge variant="secondary" className="text-[11px] font-medium">
              📍 {cityName}
            </Badge>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
                Verified {category.name} in {cityName}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mt-2">
                {category.description} Fixed rates, verified KYC, and 30-day rework guarantee across all Noida sectors.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-card border p-3 rounded-xl shadow-sm text-right">
                <span className="text-xs text-muted-foreground block">Starting from</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(category.services[0]?.basePrice || 199)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8 space-y-10">
        {/* Service Rate Card List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">Available Standardized Services</h2>
            <span className="text-xs text-muted-foreground font-medium">
              Guaranteed transparent fixed pricing
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {category.services.map((service) => (
              <Card key={service.id} className="p-4 flex flex-col justify-between hover:shadow-md transition border">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">{service.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~{service.estimatedDurationMinutes} mins</span>
                  </div>
                </div>

                <div className="pt-4 border-t mt-3 flex items-center justify-between">
                  <span className="font-bold text-base text-primary">
                    {formatCurrency(service.basePrice)}
                  </span>
                  <Link href={`/checkout/${service.id}`}>
                    <Button size="sm" className="h-8 text-xs gap-1">
                      <span>Book</span>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Filter Controls */}
        <SearchFilters />

        {/* Verified Providers List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">
              Verified Service Partners in {cityName} ({providers.length})
            </h2>
            <span className="text-xs text-muted-foreground">
              Showing professionals within {radiusKm} km
            </span>
          </div>

          {providers.length === 0 ? (
            <Card className="p-12 text-center space-y-3 bg-card">
              <h3 className="font-bold text-lg">No service providers found within {radiusKm} km</h3>
              <p className="text-xs text-muted-foreground">
                Try expanding your search radius to 15 km or 25 km to view partners covering nearby sectors.
              </p>
              <Link href={`/services/${params.category}/${params.city}?radius=25`}>
                <Button variant="outline" size="sm">
                  Expand Radius to 25 km
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  categorySlug={params.category}
                  defaultServiceId={category.services[0]?.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
