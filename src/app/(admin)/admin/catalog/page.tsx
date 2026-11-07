import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/service";
import { getAdminCatalog } from "@/modules/admin/service";
import { CatalogEditor } from "@/components/admin/catalog-editor";

export const dynamic = "force-dynamic";

export default async function AdminCatalogPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login?role=ADMIN&redirectTo=/admin/catalog");
  }

  const categories = await getAdminCatalog();

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Category & Service Catalog Management</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Configure service verticals, create offerings, adjust standardized base rates, and toggle active status in Noida.
        </p>
      </div>

      <CatalogEditor categories={categories} />
    </div>
  );
}
