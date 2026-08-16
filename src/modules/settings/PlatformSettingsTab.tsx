import { useEffect, useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/services/apiClient";
import { useOrganization, useUpdateOrganization, useUploadOrgFavicon, useUploadOrgLogo } from "@/modules/subscription/hooks";
import { toTitleCase } from "@/utils/format";

function resolveUrl(url: string | null): string | undefined {
  if (!url) return undefined;
  return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
}

function ImageUploader({
  label,
  url,
  onUpload,
  isPending,
  shape = "square",
}: {
  label: string;
  url: string | null;
  onUpload: (file: File) => void;
  isPending: boolean;
  shape?: "square" | "round";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border border-border bg-muted ${shape === "round" ? "rounded-full" : "rounded-lg"}`}
        >
          {url ? (
            <img src={resolveUrl(url)} alt={label} className="h-full w-full object-contain" />
          ) : (
            <Upload className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => inputRef.current?.click()}>
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Upload
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
const TIME_FORMATS = [
  { value: "12h", label: "12-hour" },
  { value: "24h", label: "24-hour" },
];
const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ne", label: "Nepali" },
];

export function PlatformSettingsTab() {
  const { data: org, isLoading } = useOrganization();
  const update = useUpdateOrganization();
  const uploadLogo = useUploadOrgLogo();
  const uploadFavicon = useUploadOrgFavicon();

  const [name, setName] = useState("");
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("");
  const [currency, setCurrency] = useState("");
  const [dateFormat, setDateFormat] = useState(DATE_FORMATS[0]);
  const [timeFormat, setTimeFormat] = useState("24h");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);

  useEffect(() => {
    if (org) {
      setName(org.name);
      setLanguage(org.default_language ?? "en");
      setTimezone(org.timezone ?? "");
      setCurrency(org.default_currency ?? "");
      setDateFormat(org.date_format ?? DATE_FORMATS[0]);
      setTimeFormat(org.time_format ?? "24h");
      setMaintenanceMode(org.maintenance_mode);
      setRegistrationEnabled(org.registration_enabled);
    }
  }, [org]);

  if (isLoading || !org) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }

  function handleSave() {
    update.mutate({
      name,
      default_language: language,
      timezone: timezone || null,
      default_currency: currency || null,
      date_format: dateFormat,
      time_format: timeFormat,
      maintenance_mode: maintenanceMode,
      registration_enabled: registrationEnabled,
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-semibold text-foreground">Platform settings</h2>
          <p className="text-xs text-muted-foreground">Basic configuration for your consultancy's workspace.</p>
        </div>
        <Button size="sm" disabled={update.isPending} onClick={handleSave}>
          {update.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Platform name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Platform status</Label>
          <div className="flex h-9 items-center">
            <StatusBadge status={org.status} />
          </div>
        </div>

        <ImageUploader label="Logo" url={org.logo_url} onUpload={(f) => uploadLogo.mutate(f)} isPending={uploadLogo.isPending} />
        <ImageUploader
          label="Favicon"
          url={org.favicon_url}
          onUpload={(f) => uploadFavicon.mutate(f)}
          isPending={uploadFavicon.isPending}
          shape="round"
        />

        <div className="space-y-1.5">
          <Label>Default language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Default timezone</Label>
          <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="Asia/Kathmandu" />
        </div>

        <div className="space-y-1.5">
          <Label>Default currency</Label>
          <Input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} placeholder="NPR" maxLength={3} />
        </div>
        <div className="space-y-1.5">
          <Label>Date format</Label>
          <Select value={dateFormat} onValueChange={setDateFormat}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_FORMATS.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Time format</Label>
          <Select value={timeFormat} onValueChange={setTimeFormat}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_FORMATS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {toTitleCase(f.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <Label className="cursor-pointer">Maintenance mode</Label>
            <p className="text-xs text-muted-foreground">Temporarily restrict access while you make changes.</p>
          </div>
          <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <Label className="cursor-pointer">Registration enabled</Label>
            <p className="text-xs text-muted-foreground">Allow new applicants to self-register on the portal.</p>
          </div>
          <Switch checked={registrationEnabled} onCheckedChange={setRegistrationEnabled} />
        </div>
      </div>
    </div>
  );
}
