import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/service";
import { getProviderProfileByUserId } from "@/modules/providers/service";
import { getAllCategories } from "@/modules/catalog/service";
import { OnboardingWizard } from "@/components/provider/onboarding-wizard";

export const dynamic = "force-dynamic";

export default async function ProviderOnboardingPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?role=PROVIDER&redirectTo=/provider/onboarding");
  }

  const [provider, categories] = await Promise.all([
    getProviderProfileByUserId(session.id),
    getAllCategories(),
  ]);

  const catalogServices = categories.flatMap((cat) =>
    cat.services.map((s) => ({
      id: s.id,
      name: s.name,
      categoryName: cat.name,
      basePrice: s.basePrice,
    }))
  );

  const initialData = {
    name: provider.name,
    phone: provider.phone,
    bio: provider.bio,
    experienceYears: provider.experienceYears,
    currentAddress: provider.currentAddress,
    serviceRadiusKm: provider.serviceRadiusKm,
    bankAccountName: provider.bankAccountName,
    bankAccountNumber: provider.bankAccountNumber,
    bankIfscCode: provider.bankIfscCode,
    upiId: provider.upiId,
    verificationStatus: provider.verificationStatus,
    selectedServiceIds: provider.services.map((s) => s.serviceId),
    aadhaarNumber: provider.kycDocuments.find((d) => d.documentType === "AADHAAR")?.documentNumber,
    panNumber: provider.kycDocuments.find((d) => d.documentType === "PAN")?.documentNumber,
  };

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Partner Onboarding & KYC Verification</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Complete your 5-step registration to become a verified service partner in Noida, Uttar Pradesh.
        </p>
      </div>

      <OnboardingWizard initialData={initialData} catalogServices={catalogServices} />
    </div>
  );
}
