import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/service";
import { getAdminDashboardStats } from "@/modules/admin/service";
import { AdminNav } from "@/components/admin/admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login?role=ADMIN&redirectTo=/admin");
  }

  if (session.role !== "ADMIN") {
    redirect("/account");
  }

  const stats = await getAdminDashboardStats();

  return (
    <div className="min-h-screen bg-muted/10 pb-16">
      <AdminNav pendingKycCount={stats.pendingKycCount} />
      <main>{children}</main>
    </div>
  );
}
