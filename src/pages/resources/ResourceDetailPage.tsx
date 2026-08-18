import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Download, FileText, Loader2, Paperclip, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useAuthStore } from "@/services/authStore";
import { canManageResources } from "@/constants/permissions";
import { useDeleteResource, useResource, useUpdateResource } from "@/modules/resources/hooks";
import { ResourceType } from "@/types/enums";
import { formatBytes, formatDateTime } from "@/utils/format";
import { resolveUploadUrl } from "@/utils/url";

export function ResourceDetailPage() {
  const { resourceId } = useParams<{ resourceId: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const canManage = canManageResources(currentUser?.role);

  const { data: resource, isLoading } = useResource(resourceId);
  const update = useUpdateResource(resourceId ?? "");
  const remove = useDeleteResource();

  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (!resource) return;
    setTitle(resource.title);
    setDescription(resource.description ?? "");
    setCategory(resource.category ?? "");
    setBody(resource.body ?? "");
  }, [resource]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-3 px-6 py-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-5">
        <EmptyState icon={FileText} title="Resource not found" className="border-none py-16" />
      </div>
    );
  }

  function handleSave() {
    if (!title.trim() || !resource) return;
    update.mutate(
      {
        title: title.trim(),
        description: description.trim() || null,
        category: category.trim() || null,
        body: resource.type === ResourceType.ARTICLE ? body : undefined,
      },
      { onSuccess: () => setEditing(false) },
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-5">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/resources">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Resources
          </Link>
        </Button>
        {canManage && !editing && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
            <Button variant="outline" size="sm" className="text-danger hover:text-danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        {editing ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Optional" />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
              </div>
            </div>
            {resource.type === ResourceType.ARTICLE && (
              <div className="space-y-1.5">
                <Label>Content</Label>
                <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={12} />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" disabled={!title.trim() || update.isPending} onClick={handleSave}>
                {update.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-start gap-3 border-b border-border pb-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                {resource.type === ResourceType.ARTICLE ? <FileText className="h-4 w-4" /> : <Paperclip className="h-4 w-4" />}
              </div>
              <div className="min-w-0">
                <h1 className="text-[17px] font-semibold tracking-tight text-foreground">{resource.title}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {resource.category && (
                    <span className="rounded-full bg-accent px-2 py-0.5 font-medium text-accent-foreground">{resource.category}</span>
                  )}
                  <span>{formatDateTime(resource.created_at)}</span>
                </div>
              </div>
            </div>

            {resource.description && <p className="mb-4 text-sm text-muted-foreground">{resource.description}</p>}

            {resource.type === ResourceType.ARTICLE ? (
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{resource.body}</div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{resource.original_file_name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(resource.file_size)}</p>
                </div>
                <Button asChild size="sm">
                  <a href={resolveUploadUrl(resource.file_url)} target="_blank" rel="noreferrer" download={resource.original_file_name ?? true}>
                    <Download className="h-3.5 w-3.5" /> Download
                  </a>
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this resource?"
        description="This can't be undone."
        confirmLabel="Delete"
        destructive
        isPending={remove.isPending}
        onConfirm={() => remove.mutate(resource.id, { onSuccess: () => navigate("/resources") })}
      />
    </div>
  );
}
