import { useEffect, useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateArticleResource, useUploadFileResource } from "./hooks";

export function ResourceFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const createArticle = useCreateArticleResource();
  const uploadFile = useUploadFileResource();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<"article" | "file">("article");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;
    setTab("article");
    setTitle("");
    setDescription("");
    setCategory("");
    setBody("");
    setFile(null);
  }, [open]);

  const isPending = createArticle.isPending || uploadFile.isPending;

  function handleSave() {
    if (tab === "article") {
      if (!title.trim() || !body.trim()) return;
      createArticle.mutate(
        { title: title.trim(), description: description.trim() || null, category: category.trim() || null, body: body.trim() },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      if (!file) return;
      uploadFile.mutate(
        { file, title: title.trim() || undefined, description: description.trim() || undefined, category: category.trim() || undefined },
        { onSuccess: () => onOpenChange(false) },
      );
    }
  }

  const canSave = tab === "article" ? Boolean(title.trim() && body.trim()) : Boolean(file);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New resource</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "article" | "file")}>
          <TabsList>
            <TabsTrigger value="article">Write article</TabsTrigger>
            <TabsTrigger value="file">Upload file</TabsTrigger>
          </TabsList>

          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Visa checklist" />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Optional" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional short summary" />
            </div>

            <TabsContent value="article" className="mt-0 space-y-1.5">
              <Label>Content</Label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write the article…" rows={8} />
            </TabsContent>

            <TabsContent value="file" className="mt-0 space-y-1.5">
              <Label>File</Label>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <Button type="button" variant="outline" className="w-full justify-start" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-3.5 w-3.5" />
                {file ? file.name : "Choose file"}
              </Button>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!canSave || isPending} onClick={handleSave}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {tab === "article" ? "Publish" : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
