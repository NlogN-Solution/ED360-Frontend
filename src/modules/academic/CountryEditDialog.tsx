import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUpdateCountry } from "./hooks";
import type { CountryRead } from "./types";

interface CountryEditDialogProps {
  country: CountryRead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CountryEditDialog({ country, open, onOpenChange }: CountryEditDialogProps) {
  const updateCountry = useUpdateCountry(country.id);
  const [name, setName] = useState("");
  const [iso2, setIso2] = useState("");
  const [iso3, setIso3] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [currencyCode, setCurrencyCode] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (open) {
      setName(country.name);
      setIso2(country.iso2);
      setIso3(country.iso3 ?? "");
      setPhoneCode(country.phone_code ?? "");
      setCurrencyCode(country.currency_code ?? "");
      setIsActive(country.is_active);
    }
  }, [open, country]);

  function handleSubmit() {
    updateCountry.mutate(
      {
        name,
        iso2,
        iso3: iso3 || null,
        phone_code: phoneCode || null,
        currency_code: currencyCode || null,
        is_active: isActive,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit country</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Country name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>ISO2</Label>
              <Input value={iso2} onChange={(e) => setIso2(e.target.value.toUpperCase())} maxLength={2} />
            </div>
            <div className="space-y-1.5">
              <Label>ISO3</Label>
              <Input value={iso3} onChange={(e) => setIso3(e.target.value.toUpperCase())} maxLength={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone code</Label>
              <Input value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} placeholder="+61" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Currency code</Label>
            <Input value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())} placeholder="AUD" maxLength={3} />
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
          <Button disabled={!name || iso2.length !== 2 || updateCountry.isPending} onClick={handleSubmit}>
            {updateCountry.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
