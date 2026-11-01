"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { Check, Layers, Loader2, Sparkles } from "lucide-react";
import { updateProviderServicesAction } from "@/modules/providers/actions";

export interface CatalogServiceItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  categoryName: string;
  categorySlug: string;
  estimatedDurationMinutes: number;
}

export interface ProviderServiceState {
  serviceId: string;
  customPrice?: number | null;
  isAvailable: boolean;
}

interface ServicesEditorProps {
  catalogServices: CatalogServiceItem[];
  initialActiveServices: Array<{
    serviceId: string;
    customPrice?: number | null;
    isAvailable: boolean;
  }>;
}

export function ServicesEditor({
  catalogServices,
  initialActiveServices,
}: ServicesEditorProps) {
  const [servicesState, setServicesState] = useState<Record<string, { enabled: boolean; customPrice: number }>>(() => {
    const map: Record<string, { enabled: boolean; customPrice: number }> = {};
    catalogServices.forEach((s) => {
      const existing = initialActiveServices.find((ps) => ps.serviceId === s.id);
      map[s.id] = {
        enabled: Boolean(existing?.isAvailable),
        customPrice: existing?.customPrice || s.basePrice,
      };
    });
    return map;
  });

  const [isPending, startTransition] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleService = (serviceId: string) => {
    setSaveSuccess(false);
    setServicesState((prev) => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        enabled: !prev[serviceId]?.enabled,
      },
    }));
  };

  const handlePriceChange = (serviceId: string, val: string) => {
    setSaveSuccess(false);
    const parsed = parseFloat(val) || 0;
    setServicesState((prev) => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        customPrice: parsed,
      },
    }));
  };

  const handleSave = () => {
    setError(null);
    setSaveSuccess(false);

    const payload = Object.entries(servicesState).map(([serviceId, state]) => ({
      serviceId,
      customPrice: state.customPrice,
      isAvailable: state.enabled,
    }));

    startTransition(async () => {
      const formData = new FormData();
      formData.set("services", JSON.stringify(payload));
      const res = await updateProviderServicesAction(formData);
      if (res.success) {
        setSaveSuccess(true);
      } else {
        setError(res.error || "Failed to update offered services.");
      }
    });
  };

  // Group services by category
  const categories = Array.from(new Set(catalogServices.map((s) => s.categoryName)));

  const activeCount = Object.values(servicesState).filter((s) => s.enabled).length;

  return (
    <div className="space-y-6">
      {/* Commission Transparency Card */}
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Transparent 15% Platform Commission
            </h3>
            <p className="text-xs text-muted-foreground">
              You keep <strong>85%</strong> of every job you fulfill. Custom pricing will reflect directly on your public profile and in search results.
            </p>
          </div>
          <Badge variant="outline" className="text-xs bg-background">
            {activeCount} of {catalogServices.length} Services Active
          </Badge>
        </CardContent>
      </Card>

      {/* Services List by Category */}
      <div className="space-y-6">
        {categories.map((categoryName) => {
          const items = catalogServices.filter((s) => s.categoryName === categoryName);
          return (
            <div key={categoryName} className="space-y-3">
              <h3 className="text-base font-bold text-foreground border-b pb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                {categoryName}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((service) => {
                  const state = servicesState[service.id] || {
                    enabled: false,
                    customPrice: service.basePrice,
                  };
                  const price = state.customPrice || service.basePrice;
                  const platformFee = Math.round(price * 0.15);
                  const netEarning = price - platformFee;

                  return (
                    <Card
                      key={service.id}
                      className={`transition-all border ${
                        state.enabled
                          ? "border-primary/50 shadow-sm bg-card"
                          : "border-border/60 bg-muted/20 opacity-80"
                      }`}
                    >
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-bold text-sm text-foreground">{service.name}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {service.description}
                            </p>
                            <span className="text-[11px] text-muted-foreground mt-1 inline-block">
                              ⏱️ Est. ~{service.estimatedDurationMinutes} mins
                            </span>
                          </div>

                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={state.enabled}
                              onChange={() => toggleService(service.id)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>

                        {state.enabled && (
                          <div className="pt-3 border-t space-y-3 bg-muted/20 -mx-5 -mb-5 p-4 rounded-b-xl">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs font-semibold text-foreground">
                                Your Rate (₹):
                              </span>
                              <div className="w-28">
                                <Input
                                  type="number"
                                  min={service.basePrice * 0.8}
                                  value={state.customPrice}
                                  onChange={(e) => handlePriceChange(service.id, e.target.value)}
                                  className="h-8 text-right font-bold text-xs"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                              <span>LocConnect Fee (15%):</span>
                              <span className="font-medium text-destructive">
                                -{formatCurrency(platformFee)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs font-bold text-emerald-600">
                              <span>Your Net Payout:</span>
                              <span>{formatCurrency(netEarning)}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Action Bar */}
      <div className="sticky bottom-4 bg-card/95 backdrop-blur border rounded-xl p-4 shadow-lg flex items-center justify-between gap-4">
        <div>
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              Offered services and custom rates updated!
            </span>
          )}
          {error && <span className="text-xs font-semibold text-destructive">{error}</span>}
          {!saveSuccess && !error && (
            <span className="text-xs text-muted-foreground">
              {activeCount} services currently available on your public partner card.
            </span>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={isPending}
          variant="brand"
          className="gap-2 shadow-md"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Layers className="w-4 h-4" />
          )}
          <span>Save Services & Rates</span>
        </Button>
      </div>
    </div>
  );
}
