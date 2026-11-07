"use client";

import { useState, useTransition } from "react";
import { ProviderVerificationStatus } from "@prisma/client";
import { type AdminProviderDetail } from "@/modules/admin/service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Phone,
  MapPin,
  Calendar,
  FileText,
  ExternalLink,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { verifyProviderAction } from "@/modules/admin/actions";
import { formatCurrency, formatDate } from "@/lib/utils";

interface VerificationCardProps {
  provider: AdminProviderDetail;
}

export function VerificationCard({ provider }: VerificationCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [inspectDoc, setInspectDoc] = useState<AdminProviderDetail["kycDocuments"][number] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isVerified = provider.verificationStatus === "VERIFIED";
  const isRejected = provider.verificationStatus === "REJECTED";

  const handleVerify = (status: ProviderVerificationStatus, reason?: string) => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("providerId", provider.id);
      formData.set("status", status);
      if (reason) {
        formData.set("rejectionReason", reason);
      }

      const res = await verifyProviderAction(formData);
      if (!res.success) {
        setError(res.error || "Failed to update verification status.");
      } else {
        setShowRejectForm(false);
      }
    });
  };

  return (
    <>
      <Card className="overflow-hidden border shadow-sm">
        <div className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 border-b bg-muted/10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl border shrink-0">
              {provider.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-base text-foreground">{provider.name}</h3>
                <Badge
                  variant={isVerified ? "success" : isRejected ? "destructive" : "warning"}
                  className="text-xs"
                >
                  {provider.verificationStatus}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  ⭐ {provider.averageRating.toFixed(1)} ({provider.totalReviews} reviews)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1.5">
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  {provider.phone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {provider.currentAddress}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  Joined {formatDate(provider.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            {isVerified ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleVerify(ProviderVerificationStatus.PENDING)}
                disabled={isPending}
                className="text-xs text-muted-foreground h-8"
              >
                Re-evaluate
              </Button>
            ) : isRejected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleVerify(ProviderVerificationStatus.VERIFIED)}
                disabled={isPending}
                className="text-xs text-emerald-600 h-8"
              >
                Approve Now
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="brand"
                  size="sm"
                  onClick={() => handleVerify(ProviderVerificationStatus.VERIFIED)}
                  disabled={isPending}
                  className="gap-1.5 text-xs h-8 shadow-sm"
                >
                  {isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  <span>Approve Partner</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRejectForm(true)}
                  disabled={isPending}
                  className="gap-1.5 text-xs h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-5 space-y-4">
          {error && <p className="text-xs text-destructive font-medium">{error}</p>}

          {/* Inline Rejection Form */}
          {showRejectForm && (
            <div className="p-3 bg-destructive/10 rounded-xl border border-destructive/20 space-y-2">
              <label className="text-xs font-semibold text-destructive block">
                Specify rejection reason (sent to partner):
              </label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Aadhaar image blurred, PAN name mismatch, address outside Noida..."
                className="w-full text-xs px-3 py-2 rounded-lg border bg-background"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowRejectForm(false)}
                  disabled={isPending}
                  className="text-xs h-7"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() =>
                    handleVerify(
                      ProviderVerificationStatus.REJECTED,
                      rejectReason || "Verification failed requirements."
                    )
                  }
                  disabled={isPending}
                  className="text-xs h-7 gap-1"
                >
                  {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                  <span>Confirm Rejection</span>
                </Button>
              </div>
            </div>
          )}

          {provider.rejectionReason && (
            <div className="p-3 bg-destructive/10 rounded-lg text-xs text-destructive flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                <strong>Previous Rejection Reason:</strong> {provider.rejectionReason}
              </span>
            </div>
          )}

          {/* KYC Documents Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              Government KYC Documents ({provider.kycDocuments.length})
            </h4>

            {provider.kycDocuments.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No KYC documents uploaded by this provider yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {provider.kycDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-xl border bg-muted/20 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <FileText className="w-3.5 h-3.5 text-primary" />
                        <span>{doc.documentType}</span>
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                          {doc.verificationStatus}
                        </Badge>
                      </div>
                      <span className="font-mono text-muted-foreground block text-[11px]">
                        ID: {doc.documentNumber}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setInspectDoc(doc)}
                      className="text-xs h-7 gap-1 shrink-0"
                    >
                      <span>Inspect</span>
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bank & Services details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 bg-muted/10 rounded-lg border space-y-1">
              <span className="font-semibold text-muted-foreground block text-[11px]">
                Banking / Payout Setup
              </span>
              <p className="font-medium text-foreground">
                {provider.bankAccountName || provider.name} • {provider.bankIfscCode || "HDFC0001234"}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground">
                A/C: {provider.bankAccountNumber || "XXXX-XXXX-5012"} | UPI: {provider.upiId || "N/A"}
              </p>
            </div>

            <div className="p-3 bg-muted/10 rounded-lg border space-y-1">
              <span className="font-semibold text-muted-foreground block text-[11px]">
                Active Trade Services ({provider.services.length})
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {provider.services.map((s) => (
                  <Badge key={s.id} variant="secondary" className="text-[10px]">
                    {s.name} ({formatCurrency(s.customPrice || s.basePrice)})
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Inspector Modal */}
      {inspectDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base">
                  {inspectDoc.documentType} Document Inspection
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInspectDoc(null)}
                className="h-7 w-7 p-0 rounded-full"
              >
                ✕
              </Button>
            </div>

            <div className="p-6 bg-muted/30 border-2 border-dashed rounded-xl text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <span className="font-bold text-sm block">Document ID: {inspectDoc.documentNumber}</span>
                <span className="text-xs text-muted-foreground mt-1 block">
                  Issuer: Government of India (UIDAI / NSDL Verification Simulation)
                </span>
              </div>
              <div className="p-3 bg-background rounded-lg border text-left text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider:</span>
                  <span className="font-medium">{provider.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uploaded On:</span>
                  <span>{formatDate(inspectDoc.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Notes:</span>
                  <span className="text-muted-foreground italic">{inspectDoc.notes || "None"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInspectDoc(null)}
                className="text-xs"
              >
                Close Inspector
              </Button>
              <Button
                variant="brand"
                size="sm"
                onClick={() => {
                  setInspectDoc(null);
                  handleVerify(ProviderVerificationStatus.VERIFIED);
                }}
                disabled={isPending}
                className="text-xs gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Mark Verified</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
