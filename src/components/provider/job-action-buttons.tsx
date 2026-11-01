"use client";

import { useState, useTransition } from "react";
import { BookingStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Play, CheckCheck, Loader2 } from "lucide-react";
import { updateJobStatusAction } from "@/modules/providers/actions";

interface JobActionButtonsProps {
  bookingId: string;
  status: BookingStatus;
  size?: "default" | "sm";
}

export function JobActionButtons({ bookingId, status, size = "default" }: JobActionButtonsProps) {
  const [isPending, startTransition] = useTransition();
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStatusUpdate = (newStatus: BookingStatus, reason?: string) => {
    setErrorMessage(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("bookingId", bookingId);
      formData.set("status", newStatus);
      if (reason) {
        formData.set("reason", reason);
      }

      const res = await updateJobStatusAction(formData);
      if (!res.success && res.error) {
        setErrorMessage(res.error);
      } else {
        setShowRejectInput(false);
      }
    });
  };

  if (status === "REQUESTED") {
    return (
      <div className="space-y-2">
        {errorMessage && (
          <p className="text-xs text-destructive font-medium">{errorMessage}</p>
        )}

        {!showRejectInput ? (
          <div className="flex items-center gap-2">
            <Button
              size={size}
              variant="brand"
              onClick={() => handleStatusUpdate(BookingStatus.ACCEPTED)}
              disabled={isPending}
              className="gap-1.5 flex-1 shadow-sm"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>Accept Job</span>
            </Button>

            <Button
              size={size}
              variant="outline"
              onClick={() => setShowRejectInput(true)}
              disabled={isPending}
              className="gap-1.5 text-destructive hover:bg-destructive/10 border-destructive/30"
            >
              <XCircle className="w-4 h-4" />
              <span>Decline</span>
            </Button>
          </div>
        ) : (
          <div className="p-3 bg-muted/60 rounded-lg border border-destructive/20 space-y-2">
            <label className="text-xs font-semibold text-muted-foreground block">
              Reason for declining (shared with customer):
            </label>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Prior commitment, outside coverage today..."
              className="w-full text-xs px-2.5 py-1.5 rounded-md border bg-background"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowRejectInput(false)}
                disabled={isPending}
                className="text-xs h-7"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() =>
                  handleStatusUpdate(BookingStatus.REJECTED, rejectReason || "Schedule conflict")
                }
                disabled={isPending}
                className="text-xs h-7"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm Decline"}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (status === "ACCEPTED") {
    return (
      <div className="space-y-1">
        {errorMessage && (
          <p className="text-xs text-destructive font-medium">{errorMessage}</p>
        )}
        <Button
          size={size}
          variant="brand"
          onClick={() => handleStatusUpdate(BookingStatus.IN_PROGRESS)}
          disabled={isPending}
          className="gap-1.5"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          <span>Start Service</span>
        </Button>
      </div>
    );
  }

  if (status === "IN_PROGRESS") {
    return (
      <div className="space-y-1">
        {errorMessage && (
          <p className="text-xs text-destructive font-medium">{errorMessage}</p>
        )}
        <Button
          size={size}
          variant="brand"
          onClick={() => handleStatusUpdate(BookingStatus.COMPLETED)}
          disabled={isPending}
          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCheck className="w-4 h-4" />
          )}
          <span>Mark as Completed</span>
        </Button>
      </div>
    );
  }

  return null;
}
