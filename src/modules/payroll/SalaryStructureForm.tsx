import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpsertSalaryStructure } from "./hooks";
import type { SalaryStructure } from "./types";

const CURRENCIES = ["NPR", "USD", "EUR", "GBP", "INR", "AUD"];

export function SalaryStructureForm({ userId, structure }: { userId: string; structure: SalaryStructure | null }) {
  const upsert = useUpsertSalaryStructure(userId);
  const [basicSalary, setBasicSalary] = useState("");
  const [currency, setCurrency] = useState("NPR");
  const [bankName, setBankName] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");

  useEffect(() => {
    setBasicSalary(structure ? String(structure.basic_salary) : "");
    setCurrency(structure?.currency ?? "NPR");
    setBankName(structure?.bank_name ?? "");
    setBankAccountName(structure?.bank_account_name ?? "");
    setBankAccountNumber(structure?.bank_account_number ?? "");
  }, [structure]);

  function handleSave() {
    const salary = Number(basicSalary);
    if (!salary || salary <= 0) return;
    upsert.mutate({
      basic_salary: salary,
      currency,
      bank_name: bankName || null,
      bank_account_name: bankAccountName || null,
      bank_account_number: bankAccountNumber || null,
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-foreground">Salary</h2>
        <Button size="sm" disabled={!basicSalary || upsert.isPending} onClick={handleSave}>
          {upsert.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Basic salary</Label>
          <Input type="number" min={0} value={basicSalary} onChange={(e) => setBasicSalary(e.target.value)} placeholder="50000" />
        </div>
        <div className="space-y-1.5">
          <Label>Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((code) => (
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Bank name</Label>
          <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Optional" />
        </div>
        <div className="space-y-1.5">
          <Label>Account holder name</Label>
          <Input value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} placeholder="Optional" />
        </div>
        <div className="space-y-1.5">
          <Label>Account number</Label>
          <Input value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} placeholder="Optional" />
        </div>
      </div>
    </div>
  );
}
