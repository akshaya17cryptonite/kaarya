import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/service";
import { getProviderProfileByUserId } from "@/modules/providers/service";
import { AvailabilityEditor } from "@/components/provider/availability-editor";

export const dynamic = "force-dynamic";

export default async function ProviderAvailabilityPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?role=PROVIDER&redirectTo=/provider/availability");
  }

  const provider = await getProviderProfileByUserId(session.id);

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage Availability & Calendar</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Configure which days and hours you accept service bookings across Noida. Customers can only book slots you enable here.
        </p>
      </div>

      <AvailabilityEditor initialSlots={provider.availabilitySlots} />
    </div>
  );
}
