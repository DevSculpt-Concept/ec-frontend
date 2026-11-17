import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/lib/toast";
import { useSetVendorPricing, useVendorPricing } from "@/hooks/useAdmin";

/** One price per service the vendor offers. Add services on the Profile tab first. */
export function VendorPricingEditor({ vendorId }: { vendorId: string }) {
  const { data, isLoading } = useVendorPricing(vendorId);
  const save = useSetVendorPricing(vendorId);
  const rows = data?.data?.pricing ?? [];
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    setValues(Object.fromEntries(rows.map((r) => [r.serviceType, r.price == null ? "" : String(r.price)])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const onSave = async (serviceType: string) => {
    const price = Number(values[serviceType]);
    if (values[serviceType] === "" || Number.isNaN(price) || price < 0) {
      showToast.error("Enter a valid price (0 or more)");
      return;
    }
    setSaving(serviceType);
    try {
      await save.mutateAsync({ serviceType, price });
      showToast.success("Price saved", serviceType);
    } catch (err) {
      showToast.error("Could not save price", err instanceof Error ? err.message : "Please try again");
    } finally {
      setSaving(null);
    }
  };

  if (isLoading) return <p className="text-sm text-gray-500">Loading pricing…</p>;
  if (rows.length === 0) {
    return <p className="text-sm text-gray-500">This vendor has no service types yet. Add some on the Profile tab, save, then set prices here.</p>;
  }

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.serviceType} className="flex flex-col sm:flex-row sm:items-center gap-3 border border-gray-200 rounded-lg p-3">
          <div className="sm:w-1/3 font-medium text-gray-800 capitalize">{r.serviceType.replace(/-/g, " ")}</div>
          <div className="flex-1 flex items-center gap-2">
            <span className="text-gray-500">₦</span>
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="e.g. 150000"
              value={values[r.serviceType] ?? ""}
              onChange={(e) => setValues({ ...values, [r.serviceType]: e.target.value })}
            />
          </div>
          <Button type="button" onClick={() => onSave(r.serviceType)} disabled={saving === r.serviceType} className="cursor-pointer">
            {saving === r.serviceType ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save
          </Button>
        </div>
      ))}
    </div>
  );
}
