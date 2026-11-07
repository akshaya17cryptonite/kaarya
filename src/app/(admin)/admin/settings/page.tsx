import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/service";
import { getAdminSettings } from "@/modules/admin/service";
import { SettingsEditor } from "@/components/admin/settings-editor";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login?role=ADMIN&redirectTo=/admin/settings");
  }

  const settings = await getAdminSettings();

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Commission & Marketplace Rules</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Configure default platform commission percentages, GST calculation rules, provider matching radii, and automated payout settings.
        </p>
      </div>

      <SettingsEditor initialSettings={settings} />
    </div>
  );
}
