import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/service";
import { getAdminUsers } from "@/modules/admin/service";
import { UsersDirectory } from "@/components/admin/users-directory";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login?role=ADMIN&redirectTo=/admin/users");
  }

  const users = await getAdminUsers();

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management & Accounts Directory</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Inspect customer and service provider accounts, transaction volumes, phone verifications, and roles across Noida.
        </p>
      </div>

      <UsersDirectory users={users} />
    </div>
  );
}
