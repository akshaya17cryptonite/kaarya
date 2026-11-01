import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/service";
import { getProviderProfileByUserId } from "@/modules/providers/service";
import { ProviderNav } from "@/components/provider/provider-nav";

export const dynamic = "force-dynamic";

export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login?role=PROVIDER&redirectTo=/provider");
  }

  if (session.role !== "PROVIDER" && session.role !== "ADMIN") {
    redirect("/account");
  }

  const provider = await getProviderProfileByUserId(session.id);
  const incomingCount = provider.bookings.filter((b) => b.status === "REQUESTED").length;

  return (
    <div className="min-h-screen bg-muted/10 pb-16">
      <ProviderNav incomingCount={incomingCount} />
      <main>{children}</main>
    </div>
  );
}
