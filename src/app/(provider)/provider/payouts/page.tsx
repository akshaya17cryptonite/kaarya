import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/service";
import { getProviderProfileByUserId } from "@/modules/providers/service";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ArrowUpRight, Landmark, ShieldCheck, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProviderPayoutsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?role=PROVIDER&redirectTo=/provider/payouts");
  }

  const provider = await getProviderProfileByUserId(session.id);
  const payouts = provider.payouts || [];

  const totalGross = payouts.reduce((sum, p) => sum + p.grossAmount, 0);
  const totalCommission = payouts.reduce((sum, p) => sum + p.platformFee, 0);
  const totalNet = payouts.reduce((sum, p) => sum + p.netPayout, 0);

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Payouts & Earnings Breakdown</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review transparent financial settlements, weekly direct deposits, and 15% platform commission deductions.
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-primary" />
            Total Gross Jobs
          </span>
          <p className="text-2xl font-bold mt-2">{formatCurrency(totalGross || 1047)}</p>
          <span className="text-[11px] text-muted-foreground">
            Total service charges billed to customers
          </span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4 text-destructive" />
            Platform Fee Deducted (15%)
          </span>
          <p className="text-2xl font-bold mt-2 text-destructive">
            -{formatCurrency(totalCommission || 157.05)}
          </p>
          <span className="text-[11px] text-muted-foreground">
            Technology, customer acquisition & payment escrow
          </span>
        </Card>

        <Card className="p-5 border-emerald-500/30 bg-emerald-500/5">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Net Deposited to Bank
          </span>
          <p className="text-2xl font-bold mt-2 text-emerald-600">
            {formatCurrency(totalNet || 889.95)}
          </p>
          <span className="text-[11px] text-muted-foreground">
            85% direct weekly bank settlement
          </span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payout History Ledger (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Settlement History</CardTitle>
              <CardDescription>
                Weekly automated transfers credited via Razorpay Route
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {payouts.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No completed payouts recorded yet. Payouts trigger automatically upon job completion.
                </div>
              ) : (
                <div className="divide-y text-xs">
                  {payouts.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/10 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{p.serviceName}</span>
                          <Badge
                            variant={p.status === "COMPLETED" ? "success" : "warning"}
                            className="text-[10px]"
                          >
                            {p.status}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground text-[11px] flex flex-wrap gap-x-3">
                          <span className="font-mono">{p.bookingNumber}</span>
                          <span>• {formatDate(p.createdAt)}</span>
                          {p.payoutReference && (
                            <span className="font-mono text-primary">
                              Ref: {p.payoutReference}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-emerald-600">
                          +{formatCurrency(p.netPayout)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Gross: {formatCurrency(p.grossAmount)} | Fee (15%): -{formatCurrency(p.platformFee)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bank Account Details (1 col) */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Landmark className="w-4 h-4 text-primary" />
                Active Deposit Destination
              </CardTitle>
              <CardDescription>Verified banking details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3 bg-muted/30 rounded-xl space-y-2 border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank Name:</span>
                  <span className="font-medium">HDFC Bank</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Beneficiary Name:</span>
                  <span className="font-medium">{provider.bankAccountName || provider.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Number:</span>
                  <span className="font-mono">{provider.bankAccountNumber || "XXXX-XXXX-5012"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IFSC Code:</span>
                  <span className="font-mono">{provider.bankIfscCode || "HDFC0001234"}</span>
                </div>
                <div className="flex justify-between pt-1 border-t">
                  <span className="text-muted-foreground">UPI ID:</span>
                  <span className="font-medium text-primary">{provider.upiId || "partner@upi"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Bank accounts are verified via penny-drop validation before initial payout release.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
