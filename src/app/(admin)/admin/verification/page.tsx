import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/service";
import { getAdminProviders } from "@/modules/admin/service";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { VerificationCard } from "@/components/admin/verification-card";

export const dynamic = "force-dynamic";

export default async function AdminVerificationPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login?role=ADMIN&redirectTo=/admin/verification");
  }

  const allProviders = await getAdminProviders();

  const pending = allProviders.filter((p) => p.verificationStatus === "PENDING");
  const verified = allProviders.filter((p) => p.verificationStatus === "VERIFIED");
  const rejected = allProviders.filter((p) => p.verificationStatus === "REJECTED");

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Partner Verification & KYC Approvals</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review government identity documents (Aadhaar, PAN), professional experience, and grant marketplace verification badges.
        </p>
      </div>

      <Tabs defaultValue={pending.length > 0 ? "pending" : "all"} className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 h-auto p-1.5 gap-1">
          <TabsTrigger value="pending" className="text-xs py-2 relative">
            Pending Review
            {pending.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-destructive text-destructive-foreground font-bold text-[10px]">
                {pending.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs py-2">
            All ({allProviders.length})
          </TabsTrigger>
          <TabsTrigger value="verified" className="text-xs py-2">
            Verified ({verified.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs py-2">
            Rejected ({rejected.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pending.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground border-dashed">
              No applications waiting for review. All providers are verified.
            </Card>
          ) : (
            pending.map((p) => <VerificationCard key={p.id} provider={p} />)
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {allProviders.map((p) => (
            <VerificationCard key={p.id} provider={p} />
          ))}
        </TabsContent>

        <TabsContent value="verified" className="space-y-4">
          {verified.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No verified providers yet.
            </Card>
          ) : (
            verified.map((p) => <VerificationCard key={p.id} provider={p} />)
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejected.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No rejected applications.
            </Card>
          ) : (
            rejected.map((p) => <VerificationCard key={p.id} provider={p} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
