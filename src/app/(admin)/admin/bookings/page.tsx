import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/service";
import { getAdminBookings } from "@/modules/admin/service";
import { AdminBookingsManager } from "@/components/admin/bookings-manager";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login?role=ADMIN&redirectTo=/admin/bookings");
  }

  const bookings = await getAdminBookings();

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bookings & Dispute Resolution</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Monitor marketplace orders, view fee splits, and arbitrate customer-partner disputes or process refunds.
        </p>
      </div>

      <AdminBookingsManager bookings={bookings} />
    </div>
  );
}
