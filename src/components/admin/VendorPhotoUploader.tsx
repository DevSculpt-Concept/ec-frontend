import { useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
import { useUploadVendorPicture } from "@/hooks/useAdmin";

export function VendorPhotoUploader({ vendorId, imageUrl, name }: { vendorId: string; imageUrl?: string; name: string }) {
  const input = useRef<HTMLInputElement>(null);
  const upload = useUploadVendorPicture(vendorId);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
      showToast.error("Please choose a JPG, PNG, WebP or GIF image");
      return;
    }
    try {
      await upload.mutateAsync(file);
      showToast.success("Photo updated");
    } catch (err) {
      showToast.error("Upload failed", err instanceof Error ? err.message : "Please try again");
    }
  };

  return (
    <div className="flex items-center gap-4">
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="w-20 h-20 rounded-full object-cover border border-gray-200" />
      ) : (
        <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
          {name.trim().charAt(0).toUpperCase() || "V"}
        </div>
      )}
      <div>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onPick} />
        <Button type="button" variant="outline" onClick={() => input.current?.click()} disabled={upload.isPending} className="cursor-pointer">
          {upload.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
          {imageUrl ? "Change photo" : "Upload photo"}
        </Button>
        <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP or GIF · max 5 MB</p>
      </div>
    </div>
  );
}
