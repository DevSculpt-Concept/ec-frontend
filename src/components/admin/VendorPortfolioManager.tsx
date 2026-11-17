import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/lib/toast";
import { useCreateVendorPortfolioItem, useDeleteVendorPortfolioItem, useVendorPortfolio } from "@/hooks/useAdmin";
import type { PortfolioItem } from "@/services/api/portfolio.service";

const MAX_ITEMS = 10;
const youtubeId = (url?: string) => url?.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{6,})/)?.[1];

export function VendorPortfolioManager({ vendorId, serviceTypes }: { vendorId: string; serviceTypes: string[] }) {
  const { data, isLoading } = useVendorPortfolio(vendorId);
  const create = useCreateVendorPortfolioItem(vendorId);
  const remove = useDeleteVendorPortfolioItem(vendorId);
  const items: PortfolioItem[] = data?.data?.items ?? [];
  const fileInput = useRef<HTMLInputElement>(null);

  const empty = { title: "", description: "", serviceType: serviceTypes[0] ?? "", cost: "", youtubeUrl: "" };
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState<File | null>(null);

  const reset = () => {
    setForm({ ...empty, serviceType: form.serviceType });
    setFile(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return showToast.error("Give the item a title");
    if (!form.serviceType) return showToast.error("Choose a service type");
    if (!file && !form.youtubeUrl.trim()) return showToast.error("Upload an image/video or paste a YouTube link");
    if (file && file.size > 50 * 1024 * 1024) return showToast.error("File is too large (max 50 MB)");

    const body = new FormData();
    body.append("title", form.title.trim());
    body.append("serviceType", form.serviceType);
    if (form.description.trim()) body.append("description", form.description.trim());
    if (form.cost) body.append("cost", form.cost);
    if (file) body.append("media", file);
    else body.append("youtubeUrl", form.youtubeUrl.trim());

    try {
      await create.mutateAsync(body);
      showToast.success("Portfolio item added");
      reset();
    } catch (err) {
      showToast.error("Could not add item", err instanceof Error ? err.message : "Please try again");
    }
  };

  const onDelete = async (item: PortfolioItem) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try {
      await remove.mutateAsync(item.id);
      showToast.success("Item deleted");
    } catch (err) {
      showToast.error("Could not delete", err instanceof Error ? err.message : "Please try again");
    }
  };

  const thumb = (it: PortfolioItem) => {
    if (it.media_type === "image") return <img src={it.media_url} alt={it.title} className="w-full h-36 object-cover" />;
    if (it.media_type === "video") return <video src={it.media_url} className="w-full h-36 object-cover bg-black" muted />;
    const id = youtubeId(it.youtube_url || it.media_url);
    return id ? (
      <img src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} alt={it.title} className="w-full h-36 object-cover" />
    ) : (
      <div className="w-full h-36 bg-gray-100 flex items-center justify-center"><Youtube className="w-8 h-8 text-red-500" /></div>
    );
  };

  if (serviceTypes.length === 0) {
    return <p className="text-sm text-gray-500">Add at least one service type on the Profile tab (and save) before adding portfolio items.</p>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onAdd} className="border border-gray-200 rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Add portfolio item <span className="text-xs font-normal text-gray-500">({items.length}/{MAX_ITEMS})</span></h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select
            value={form.serviceType}
            onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
            className="h-10 rounded-md border border-gray-300 px-3 text-sm bg-white capitalize"
          >
            {serviceTypes.map((s) => <option key={s} value={s}>{s.replace(/-/g, " ")}</option>)}
          </select>
          <Input type="number" min={0} placeholder="Cost (₦, optional)" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
          <Input
            placeholder="…or a YouTube link"
            value={form.youtubeUrl}
            onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
            disabled={!!file}
          />
          <div className="md:col-span-2">
            <Textarea rows={2} placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-primary"
            />
            <p className="text-xs text-gray-500 mt-1">Image or video, max 50 MB. Choosing a file replaces the YouTube link.</p>
          </div>
        </div>
        <Button type="submit" disabled={create.isPending || items.length >= MAX_ITEMS} className="cursor-pointer">
          {create.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImagePlus className="w-4 h-4 mr-2" />}
          {items.length >= MAX_ITEMS ? "Limit reached" : "Add item"}
        </Button>
      </form>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading portfolio…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500">No portfolio items yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => (
            <div key={it.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              {thumb(it)}
              <div className="p-3 space-y-1">
                <div className="font-medium text-gray-900 truncate">{it.title}</div>
                <div className="text-xs text-gray-500 capitalize">
                  {it.service_type.replace(/-/g, " ")}{it.cost ? ` · ₦${Number(it.cost).toLocaleString()}` : ""}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => onDelete(it)} disabled={remove.isPending} className="cursor-pointer text-red-600 mt-2">
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
