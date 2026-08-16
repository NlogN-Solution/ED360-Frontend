import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CountryPicker } from "./pickers";
import { useUpdateUniversity } from "./hooks";
import type { UniversityRead } from "./types";

interface UniversityEditDialogProps {
  university: UniversityRead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UniversityEditDialog({ university, open, onOpenChange }: UniversityEditDialogProps) {
  const updateUniversity = useUpdateUniversity(university.id);
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [countryId, setCountryId] = useState<string | undefined>();
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [ranking, setRanking] = useState("");
  const [isPartner, setIsPartner] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (open) {
      setName(university.name);
      setShortName(university.short_name ?? "");
      setCountryId(university.country_id);
      setCity(university.city ?? "");
      setAddress(university.address ?? "");
      setWebsite(university.website ?? "");
      setEmail(university.email ?? "");
      setPhone(university.phone ?? "");
      setRanking(university.ranking != null ? String(university.ranking) : "");
      setIsPartner(university.is_partner);
      setIsActive(university.is_active);
    }
  }, [open, university]);

  function handleSubmit() {
    if (!countryId) return;
    updateUniversity.mutate(
      {
        name,
        country_id: countryId,
        short_name: shortName || null,
        city: city || null,
        address: address || null,
        website: website || null,
        email: email || null,
        phone: phone || null,
        ranking: ranking ? Number(ranking) : null,
        is_partner: isPartner,
        is_active: isActive,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit university</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>University name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Short name</Label>
              <Input value={shortName} onChange={(e) => setShortName(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Country</Label>
              <CountryPicker value={countryId} onChange={setCountryId} />
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Website</Label>
              <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
            </div>
            <div className="space-y-1.5">
              <Label>Ranking</Label>
              <Input type="number" value={ranking} onChange={(e) => setRanking(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label className="cursor-pointer">Partner university</Label>
            <Switch checked={isPartner} onCheckedChange={setIsPartner} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label className="cursor-pointer">Active</Label>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!name || !countryId || updateUniversity.isPending} onClick={handleSubmit}>
            {updateUniversity.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
