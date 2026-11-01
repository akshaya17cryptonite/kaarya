"use client";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, AlertTriangle, MapPin, Power, Loader2 } from "lucide-react";
import { toggleAvailabilityAction } from "@/modules/providers/actions";

interface ProviderHeaderProps {
  name: string;
  avatarUrl: string | null;
  experienceYears: number;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  serviceRadiusKm: number;
  currentAddress: string;
  isAvailable: boolean;
  averageRating: number;
  totalReviews: number;
}

export function ProviderHeader({
  name,
  experienceYears,
  verificationStatus,
  serviceRadiusKm,
  currentAddress,
  isAvailable,
  averageRating,
  totalReviews,
}: ProviderHeaderProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("isAvailable", (!isAvailable).toString());
      await toggleAvailabilityAction(formData);
    });
  };

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-2xl border border-emerald-500/20 shadow-inner">
          {name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{name}</h1>
            {verificationStatus === "VERIFIED" ? (
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
            <Badge variant="outline" className="gap-1 text-xs">
              ⭐ {averageRating.toFixed(1)} ({totalReviews} reviews)
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {currentAddress}
            </span>
            <span>• Radius: {serviceRadiusKm} km</span>
            <span>• {experienceYears} Years Exp</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <span className="text-xs text-muted-foreground block">Duty Status</span>
          <span
            className={`text-sm font-bold flex items-center justify-end gap-1.5 ${
              isAvailable ? "text-emerald-600" : "text-muted-foreground"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isAvailable ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/50"
              }`}
            />
            {isAvailable ? "Online & Taking Jobs" : "Offline / On Break"}
          </span>
        </div>

        <Button
          variant={isAvailable ? "outline" : "default"}
          size="sm"
          onClick={handleToggle}
          disabled={isPending}
          className="gap-1.5"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Power className="w-4 h-4" />
          )}
          <span>{isAvailable ? "Go Offline" : "Go Online"}</span>
        </Button>
      </div>
    </div>
  );
}
