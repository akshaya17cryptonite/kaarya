"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  Settings,
  Percent,
  Check,
  Loader2,
  DollarSign,
  ShieldAlert,
} from "lucide-react";
import { updatePlatformSettingsAction } from "@/modules/admin/actions";
import { type PlatformSettings } from "@/modules/admin/service";

interface SettingsEditorProps {
  initialSettings: PlatformSettings;
}

export function SettingsEditor({ initialSettings }: SettingsEditorProps) {
  const [commission, setCommission] = useState(initialSettings.commissionPercentage);
  const [gst, setGst] = useState(initialSettings.gstPercentage);
  const [radius, setRadius] = useState(initialSettings.defaultCoverageRadiusKm);
  const [autoPayouts, setAutoPayouts] = useState(initialSettings.autoApprovePayouts);
  const [supportEmail, setSupportEmail] = useState(initialSettings.supportEmail);
  const [supportPhone, setSupportPhone] = useState(initialSettings.supportPhone);

  const [isPending, startTransition] = useTransition();
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live simulation for a ₹1000 service job
  const sampleServicePrice = 1000;
  const simulatedCommission = Math.round(sampleServicePrice * (commission / 100));
  const simulatedGst = Math.round(simulatedCommission * (gst / 100));
  const simulatedTotalPayable = sampleServicePrice + simulatedGst;
  const simulatedPartnerEarning = sampleServicePrice - simulatedCommission;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedSuccess(false);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("commissionPercentage", commission.toString());
      formData.set("gstPercentage", gst.toString());
      formData.set("defaultCoverageRadiusKm", radius.toString());
      formData.set("autoApprovePayouts", autoPayouts.toString());
      formData.set("supportEmail", supportEmail);
      formData.set("supportPhone", supportPhone);

      const res = await updatePlatformSettingsAction(formData);
      if (res.success) {
        setSavedSuccess(true);
      } else {
        setError(res.error || "Failed to update platform settings.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Commission Split Live Preview */}
      <Card className="border-primary/30 bg-primary/5 overflow-hidden">
        <div className="p-5 border-b bg-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-sm">Live Marketplace Split Simulator</h3>
          </div>
          <Badge variant="outline" className="text-xs bg-background">
            Active: {commission}% Commission + {gst}% GST
          </Badge>
        </div>

        <CardContent className="p-5">
          <p className="text-xs text-muted-foreground mb-4">
            Based on a hypothetical <strong>{formatCurrency(sampleServicePrice)}</strong> service in Noida:
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-background rounded-xl border">
              <span className="text-[11px] text-muted-foreground block">Customer Pays</span>
              <span className="text-lg font-bold text-foreground">
                {formatCurrency(simulatedTotalPayable)}
              </span>
              <span className="text-[10px] text-muted-foreground block">(Job + GST on Fee)</span>
            </div>

            <div className="p-3 bg-background rounded-xl border">
              <span className="text-[11px] text-muted-foreground block">Partner Payout (85%)</span>
              <span className="text-lg font-bold text-emerald-600">
                {formatCurrency(simulatedPartnerEarning)}
              </span>
              <span className="text-[10px] text-muted-foreground block">Direct to Bank / UPI</span>
            </div>

            <div className="p-3 bg-background rounded-xl border">
              <span className="text-[11px] text-muted-foreground block">Platform Fee ({commission}%)</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(simulatedCommission)}
              </span>
              <span className="text-[10px] text-muted-foreground block">LocConnect Revenue</span>
            </div>

            <div className="p-3 bg-background rounded-xl border">
              <span className="text-[11px] text-muted-foreground block">Govt. GST ({gst}%)</span>
              <span className="text-lg font-bold text-amber-600">
                {formatCurrency(simulatedGst)}
              </span>
              <span className="text-[10px] text-muted-foreground block">Remitted to Tax Dept</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Form Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4">
          <h4 className="font-bold text-sm flex items-center gap-2 text-foreground">
            <DollarSign className="w-4 h-4 text-primary" />
            Commission & Tax Rates
          </h4>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-semibold">Platform Fee Percentage (%):</label>
              <span className="font-bold text-primary">{commission}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="0.5"
              value={commission}
              onChange={(e) => setCommission(parseFloat(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>5% (Low margin)</span>
              <span>15% (LocConnect Standard)</span>
              <span>30% (Premium)</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold">GST on Marketplace Fee (%):</label>
            <Input
              type="number"
              min="0"
              max="28"
              step="1"
              value={gst}
              onChange={(e) => setGst(parseFloat(e.target.value) || 0)}
              className="text-xs"
              required
            />
            <span className="text-[10px] text-muted-foreground">
              Standard Indian GST for IT & intermediation services is 18%.
            </span>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <h4 className="font-bold text-sm flex items-center gap-2 text-foreground">
            <Settings className="w-4 h-4 text-primary" />
            Coverage & Payout Policy
          </h4>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-semibold">Default Provider Radius (km):</label>
              <span className="font-bold text-primary">{radius} km</span>
            </div>
            <input
              type="range"
              min="5"
              max="35"
              step="5"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value, 10))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
          </div>

          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
              <div>
                <span className="text-xs font-bold block">Instant Automated Payouts</span>
                <span className="text-[11px] text-muted-foreground">
                  Trigger automated Razorpay Route deposit upon job completion
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoPayouts}
                onChange={(e) => setAutoPayouts(e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-4 md:col-span-2">
          <h4 className="font-bold text-sm flex items-center gap-2 text-foreground">
            <ShieldAlert className="w-4 h-4 text-primary" />
            Support & Customer Escalation Contacts
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Customer Support Email</label>
              <Input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Toll-Free / Support Helpline</label>
              <Input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="text-xs font-mono"
                required
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Save Action Bar */}
      <div className="sticky bottom-4 bg-card/95 backdrop-blur border rounded-xl p-4 shadow-lg flex items-center justify-between gap-4">
        <div>
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              Platform commission and marketplace parameters updated!
            </span>
          )}
          {error && <span className="text-xs font-semibold text-destructive">{error}</span>}
          {!savedSuccess && !error && (
            <span className="text-xs text-muted-foreground">
              Changes take effect immediately on new customer checkouts and provider payouts.
            </span>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          variant="brand"
          className="gap-2 shadow-md text-xs"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          <span>Save Configuration</span>
        </Button>
      </div>
    </form>
  );
}
