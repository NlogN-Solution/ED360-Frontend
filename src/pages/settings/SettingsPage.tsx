import { useSearchParams } from "react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlatformSettingsTab } from "@/modules/settings/PlatformSettingsTab";
import { EmailTemplatesTab } from "@/modules/settings/EmailTemplatesTab";
import { useAuthStore } from "@/services/authStore";
import { isManagerRole } from "@/constants/permissions";
import { EmptyState } from "@/components/shared/EmptyState";
import { ShieldAlert } from "lucide-react";

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const canManagePlatform = isManagerRole(user?.role);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "platform";

  return (
    <div>
      <PageHeader title="Settings" description="Manage your workspace configuration." />

      {canManagePlatform ? (
        <Tabs value={activeTab} onValueChange={(v) => setSearchParams((prev) => ({ ...Object.fromEntries(prev), tab: v }))}>
          <TabsList>
            <TabsTrigger value="platform">Platform Settings</TabsTrigger>
            <TabsTrigger value="templates">Email Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="platform" className="mt-4">
            <PlatformSettingsTab />
          </TabsContent>

          <TabsContent value="templates" className="mt-4">
            <EmailTemplatesTab />
          </TabsContent>
        </Tabs>
      ) : (
        <EmptyState
          icon={ShieldAlert}
          title="Nothing to configure here"
          description="Workspace settings are managed by your workspace administrator."
          className="border-none py-16"
        />
      )}
    </div>
  );
}
