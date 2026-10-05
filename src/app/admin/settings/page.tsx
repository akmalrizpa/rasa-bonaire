import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl">Shop settings</h1>
        <p className="mt-1 text-sm text-muted">
          What customers read before they order: opening state, the fee and where to collect.
        </p>
      </header>

      <SettingsForm settings={settings} />
    </div>
  );
}
