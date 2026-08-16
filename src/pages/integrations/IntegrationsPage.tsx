import { PageHeader } from "@/components/shared/PageHeader";
import { useAuthStore } from "@/services/authStore";
import { isManagerRole } from "@/constants/permissions";
import { WhatsAppIntegrationCard } from "@/modules/whatsapp/IntegrationCard";
import { EmailIntegrationCard } from "@/modules/email/IntegrationCard";

export function IntegrationsPage() {
  const role = useAuthStore((s) => s.user?.role);
  const canManage = isManagerRole(role);

  return (
    <div>
      <PageHeader title="Integrations" description="Connect email, calendars, payment gateways, and messaging providers." />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <EmailIntegrationCard canManage={canManage} />
        <WhatsAppIntegrationCard canManage={canManage} />
      </div>
    </div>
  );
}
