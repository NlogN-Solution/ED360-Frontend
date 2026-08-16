import { useSearchParams } from "react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvatarUploader } from "@/modules/profile/AvatarUploader";
import { PersonalInfoCard } from "@/modules/profile/PersonalInfoCard";
import { StudentDetailsCard } from "@/modules/profile/StudentDetailsCard";
import { EducationHistoryCard } from "@/modules/profile/EducationHistoryCard";
import { WorkExperienceCard } from "@/modules/profile/WorkExperienceCard";
import { DocumentExtractionCard } from "@/modules/profile/DocumentExtractionCard";
import { PlatformSettingsTab } from "@/modules/settings/PlatformSettingsTab";
import { EmailTemplatesTab } from "@/modules/settings/EmailTemplatesTab";
import { useAuthStore } from "@/services/authStore";
import { isManagerRole } from "@/constants/permissions";
import { UserRole } from "@/types/enums";
import { toTitleCase } from "@/utils/format";

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const isStudent = user?.role === UserRole.STUDENT;
  const canManagePlatform = isManagerRole(user?.role);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "platform";

  return (
    <div>
      <PageHeader title="Settings" description="Manage your personal information and, if you're an admin, your workspace configuration." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-xl border border-border bg-card p-4">
            <AvatarUploader />
          </section>

          <PersonalInfoCard />

          {isStudent && user && (
            <>
              <StudentDetailsCard userId={user.id} />
              <EducationHistoryCard userId={user.id} />
              <WorkExperienceCard userId={user.id} />
              <DocumentExtractionCard userId={user.id} />
            </>
          )}
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-[13px] font-semibold text-foreground">Account</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[11px] text-muted-foreground">Role</p>
                <p className="text-foreground">{user ? toTitleCase(user.role) : "—"}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Status</p>
                {user && <StatusBadge status={user.status} />}
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Role and account status are managed by your workspace administrator.
            </p>
          </section>
        </div>
      </div>

      {canManagePlatform && (
        <div className="mt-6">
          <h2 className="mb-3 text-[13px] font-semibold text-foreground">Workspace configuration</h2>
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
        </div>
      )}
    </div>
  );
}
