import { useState } from "react";
import { useNavigate } from "react-router";
import { FileText, Library, Paperclip, Plus, Search, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useAuthStore } from "@/services/authStore";
import { canManageResources } from "@/constants/permissions";
import { useDebounce } from "@/hooks/useDebounce";
import { useDeleteResource, useResources } from "@/modules/resources/hooks";
import { ResourceFormDialog } from "@/modules/resources/ResourceFormDialog";
import type { Resource } from "@/modules/resources/types";
import { ResourceType } from "@/types/enums";
import { formatDate } from "@/utils/format";

export function ResourcesPage() {
  const currentUser = useAuthStore((s) => s.user);
  const canManage = canManageResources(currentUser?.role);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [typeFilter, setTypeFilter] = useState<"all" | ResourceType>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [deletingResource, setDeletingResource] = useState<Resource | null>(null);
  const navigate = useNavigate();

  const { data, isLoading } = useResources({
    limit: 60,
    search: debouncedSearch || undefined,
    type: typeFilter === "all" ? undefined : typeFilter,
  });
  const deleteResource = useDeleteResource();

  const resources = data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="Resources"
        description="A knowledge base for counsellors and applicants."
        actions={
          canManage && (
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> New resource
            </Button>
          )
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search resources…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as "all" | ResourceType)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value={ResourceType.ARTICLE}>Articles</TabsTrigger>
            <TabsTrigger value={ResourceType.FILE}>Files</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <EmptyState icon={Library} title="No resources yet" description={canManage ? "Upload a file or write an article to get started." : undefined} className="border-none py-16" />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="group relative flex cursor-pointer flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
              onClick={() => navigate(`/resources/${resource.id}`)}
            >
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  {resource.type === ResourceType.ARTICLE ? <FileText className="h-3.5 w-3.5" /> : <Paperclip className="h-3.5 w-3.5" />}
                </div>
                {resource.category && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[10.5px] font-medium text-accent-foreground">
                    {resource.category}
                  </span>
                )}
                {canManage && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-6 w-6 text-muted-foreground opacity-0 hover:text-danger group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingResource(resource);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <p className="line-clamp-1 text-sm font-medium text-foreground">{resource.title}</p>
              {resource.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{resource.description}</p>}
              <p className="mt-auto pt-3 text-[11px] text-muted-foreground">{formatDate(resource.created_at)}</p>
            </div>
          ))}
        </div>
      )}

      {canManage && (
        <>
          <ResourceFormDialog open={formOpen} onOpenChange={setFormOpen} />
          <ConfirmDialog
            open={deletingResource !== null}
            onOpenChange={(open) => !open && setDeletingResource(null)}
            title="Delete this resource?"
            description={`"${deletingResource?.title}" will be removed for everyone. This can't be undone.`}
            confirmLabel="Delete"
            destructive
            isPending={deleteResource.isPending}
            onConfirm={() =>
              deletingResource &&
              deleteResource.mutate(deletingResource.id, {
                onSuccess: () => setDeletingResource(null),
              })
            }
          />
        </>
      )}
    </div>
  );
}
