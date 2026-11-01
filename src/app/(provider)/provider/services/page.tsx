import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/service";
import { getProviderProfileByUserId } from "@/modules/providers/service";
import { getAllCategories } from "@/modules/catalog/service";
import { ServicesEditor, type CatalogServiceItem } from "@/components/provider/services-editor";

export const dynamic = "force-dynamic";

export default async function ProviderServicesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?role=PROVIDER&redirectTo=/provider/services");
  }

  const [provider, categories] = await Promise.all([
    getProviderProfileByUserId(session.id),
    getAllCategories(),
  ]);

  // Flatten catalog services
  const catalogServices: CatalogServiceItem[] = categories.flatMap((cat) =>
    cat.services.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: s.description,
      basePrice: s.basePrice,
      estimatedDurationMinutes: s.estimatedDurationMinutes,
      categoryName: cat.name,
      categorySlug: cat.slug,
    }))
  );

  const initialActiveServices = provider.services.map((ps) => ({
    serviceId: ps.serviceId,
    customPrice: ps.customPrice,
    isAvailable: ps.isAvailable,
  }));

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Services & Custom Pricing</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Enable or disable services you fulfill and adjust your custom quotes. All services are subject to a transparent 15% platform commission.
        </p>
      </div>

      <ServicesEditor
        catalogServices={catalogServices}
        initialActiveServices={initialActiveServices}
      />
    </div>
  );
}
