"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  AlertTriangle,
  RotateCcw,
  XCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { resolveBookingDisputeAction } from "@/modules/admin/actions";
import { type AdminBookingDetail } from "@/modules/admin/service";

interface DisputeModalProps {
  booking: AdminBookingDetail;
  onClose: () => void;
}

export function DisputeModal({ booking, onClose }: DisputeModalProps) {
  const [action, setAction] = useState<"REFUND" | "CANCEL" | "RESOLVE">("REFUND");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("bookingId", booking.id);
      formData.set("action", action);
      formData.set("notes", notes || `Resolved via admin action: ${action}`);

      const res = await resolveBookingDisputeAction(formData);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || "Failed to process dispute resolution.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base">Booking Dispute & Refund Resolution</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 rounded-full"
          >
            ✕
          </Button>
        </div>

        <div className="p-4 bg-muted/20 rounded-xl space-y-2 text-xs border">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Booking Number:</span>
            <span className="font-mono font-bold">{booking.bookingNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service:</span>
            <span className="font-medium">{booking.service.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Customer:</span>
            <span>{booking.customer.name} (📞 {booking.customer.phone})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Partner:</span>
            <span>{booking.provider.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Paid:</span>
            <span className="font-bold text-emerald-600">{formatCurrency(booking.totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment Status:</span>
            <Badge variant="outline" className="text-[10px]">
              {booking.payment?.status || "PENDING"}
            </Badge>
          </div>
          {booking.customerNotes && (
            <div className="pt-1 text-muted-foreground italic border-t">
              &ldquo;{booking.customerNotes}&rdquo;
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Select Administrative Resolution:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAction("REFUND")}
                className={`p-2.5 rounded-lg border text-center transition-all text-xs font-semibold ${
                  action === "REFUND"
                    ? "border-destructive bg-destructive/10 text-destructive ring-1 ring-destructive/30"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5 mx-auto mb-1" />
                Issue Refund
              </button>

              <button
                type="button"
                onClick={() => setAction("CANCEL")}
                className={`p-2.5 rounded-lg border text-center transition-all text-xs font-semibold ${
                  action === "CANCEL"
                    ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <XCircle className="w-3.5 h-3.5 mx-auto mb-1" />
                Cancel Only
              </button>

              <button
                type="button"
                onClick={() => setAction("RESOLVE")}
                className={`p-2.5 rounded-lg border text-center transition-all text-xs font-semibold ${
                  action === "RESOLVE"
                    ? "border-emerald-600 bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/30"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5 mx-auto mb-1" />
                Mark Resolved
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Resolution Notes / Reason:</label>
            <Input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Technician could not attend due to emergency. Full 100% refund approved."
              className="text-xs"
              required
            />
          </div>

          {error && <p className="text-xs text-destructive font-medium">{error}</p>}

          <div className="flex items-center justify-between pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              variant={action === "REFUND" ? "destructive" : "brand"}
              size="sm"
              disabled={isPending}
              className="text-xs gap-1.5 shadow-sm"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5" />
              )}
              <span>Execute {action}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
