import {
  Workflow,
  Sparkles,
  Receipt,
} from "lucide-react";
import { ComingSoonPage } from "@/components/shared/ComingSoonPage";

export { RolesPermissionsPage } from "./RolesPermissionsPage";
export { ActivityLogsPage as AuditLogsPage } from "@/pages/system/ActivityLogsPage";

export const AutomationPage = () => (
  <ComingSoonPage title="Automation" description="Trigger-based workflows that act on leads, tasks, and documents automatically." icon={Workflow} />
);
export const AIAssistantPage = () => (
  <ComingSoonPage title="AI Assistant" description="Lead scoring, document review, and a chat assistant across the workspace." icon={Sparkles} />
);
export const InvoicesExpensesPage = () => (
  <ComingSoonPage title="Invoices & Expenses" description="Generate invoices and track consultancy operating expenses." icon={Receipt} />
);
