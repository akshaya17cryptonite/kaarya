import Link from "next/link";
import { formatDistance } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShieldCheck, MapPin, Briefcase, ArrowRight } from "lucide-react";

export interface ProviderCardProps {
  provider: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    phone?: string;
    experienceYears: number;
    averageRating: number;
    totalReviews: number;
    distanceKm: number;
    currentAddress: string;
    serviceRadiusKm: number;
  };
  categorySlug?: string;
  defaultServiceId?: string;
}

export function ProviderCard({ provider, defaultServiceId }: ProviderCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all border group">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border-2 border-primary/20 shrink-0">
              {provider.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                  {provider.name}
                </h3>
                <Badge variant="success" className="gap-1 py-0 px-1.5 text-[10px]">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </Badge>
              </div>

              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {provider.averageRating}
                </span>
                <span>({provider.totalReviews} reviews)</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-muted-foreground" />
                  {provider.experienceYears} yrs exp
                </span>
              </div>
            </div>
          </div>

          {/* Distance pill */}
          <div className="text-right shrink-0">
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary font-bold text-xs px-2.5 py-1 rounded-full">
              <MapPin className="w-3 h-3" />
              {formatDistance(provider.distanceKm)}
            </span>
          </div>
        </div>

        {/* Location & Sector info */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg flex items-center justify-between">
          <span className="truncate max-w-[220px]">
            📍 {provider.currentAddress}
          </span>
          <span className="text-[11px] text-primary font-medium shrink-0">
            Covers {provider.serviceRadiusKm} km
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <Link href={`/providers/${provider.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs h-9">
              View Profile & Reviews
            </Button>
          </Link>
          <Link
            href={`/checkout/${defaultServiceId || "cat_plumbing_s_0"}?providerId=${provider.id}`}
            className="flex-1"
          >
            <Button size="sm" className="w-full text-xs h-9 gap-1.5">
              <span>Book Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
