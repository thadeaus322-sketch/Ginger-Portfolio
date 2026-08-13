import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateGallery, getListGalleriesQueryKey, getGetGalleryStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Copy, ExternalLink, CheckCircle2, Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { getGalleryUrl } from "@/lib/gallery-link";

const defaultExpiry = new Date();
defaultExpiry.setMonth(defaultExpiry.getMonth() + 3); // 3 months
const defaultExpiryString = defaultExpiry.toISOString().split("T")[0];

const gallerySchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  shootTitle:  z.string().min(1, "Shoot title is required"),
  expiresAt:   z.string().min(1, "Expiry date is required"),
  notes:       z.string().optional(),
});

type GalleryFormValues = z.infer<typeof gallerySchema>;

interface UploadedImage {
  id: string;
  name: string;
  url: string;
  previewUrl: string;
}

interface CreatedResult {
  id: number;
  accessToken: string;
  publicUrl: string;
}

// ─── Upload a single file to GCS via presigned URL ───────────────────────────
async function uploadFileToStorage(file: File): Promise<string> {
  // 1. Request presigned URL from our admin API
  const res = await fetch("/api/storage/uploads/request-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to get upload URL");
  }
  const { uploadURL, objectPath } = await res.json();

  // 2. Upload directly to GCS
  const putRes = await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!putRes.ok) throw new Error("Upload to storage failed");

  // 3. Return the serving URL (accessible via our API)
  // objectPath is like "/objects/uuid", serving URL is /api/storage/objects/uuid
  return `/api/storage${objectPath}`;
}

export default function NewGallery() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateGallery();
  const [created, setCreated] = useState<CreatedResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Upload state
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [coverImageId, setCoverImageId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<GalleryFormValues>({
    resolver: zodResolver(gallerySchema),
    defaultValues: {
      clientName: "",
      shootTitle: "",
      expiresAt: defaultExpiryString,
      notes: "",
    },
  });

  // ── File upload handler ─────────────────────────────────────────────────────
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArr = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (fileArr.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    const newImages: UploadedImage[] = [];

    for (let i = 0; i < fileArr.length; i++) {
      const file = fileArr[i];
      try {
        const url = await uploadFileToStorage(file);
        const previewUrl = URL.createObjectURL(file);
        newImages.push({ id: `${Date.now()}-${i}`, name: file.name, url, previewUrl });
        setUploadProgress(Math.round(((i + 1) / fileArr.length) * 100));
      } catch (err: any) {
        toast({ variant: "destructive", title: `Failed to upload ${file.name}`, description: err.message });
      }
    }

    setUploadedImages(prev => {
      const next = [...prev, ...newImages];
      if (!coverImageId && next[0]) setCoverImageId(next[0].id);
      return next;
    });
    setUploading(false);
    setUploadProgress(0);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeImage = (id: string) => {
    setUploadedImages(prev => {
      const next = prev.filter(img => img.id !== id);
      if (id === coverImageId) setCoverImageId(next[0]?.id ?? null);
      return next;
    });
  };

  // ── Form submit ─────────────────────────────────────────────────────────────
  const onSubmit = (data: GalleryFormValues) => {
    if (uploadedImages.length === 0) {
      toast({ variant: "destructive", title: "No photos", description: "Please upload at least one photo." });
      return;
    }

    const imageUrls = uploadedImages.map(img => img.url);
    const coverUrl = uploadedImages.find(img => img.id === coverImageId)?.url ?? imageUrls[0] ?? null;

    createMutation.mutate(
      {
        data: {
          clientName: data.clientName,
          shootTitle:  data.shootTitle,
          expiresAt:   new Date(data.expiresAt).toISOString(),
          notes:       data.notes || null,
          imageUrls,
           coverUrl,
        },
      },
      {
        onSuccess: (newGallery) => {
          queryClient.invalidateQueries({ queryKey: getListGalleriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetGalleryStatsQueryKey() });
           const publicUrl = getGalleryUrl(window.location.origin, data.clientName, data.shootTitle, newGallery.accessToken);
          setCreated({ id: newGallery.id, accessToken: newGallery.accessToken, publicUrl });
          navigator.clipboard.writeText(publicUrl).catch(() => {});
        },
        onError: (err: any) => {
          toast({
            variant: "destructive",
            title: "Failed to create gallery",
            description: err?.error || "An unexpected error occurred.",
          });
        },
      }
    );
  };

  const handleCopy = () => {
    if (!created) return;
    navigator.clipboard.writeText(created.publicUrl).then(() => {
      setCopied(true);
      toast({ title: "Link copied to clipboard!" });
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (created) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-sm">
            <CheckCircle2 size={20} className="text-green-600" />
          </div>
          <div>
            <h1 className="font-serif text-3xl text-foreground">Gallery Created!</h1>
            <p className="text-muted-foreground text-sm mt-0.5">The client link has been auto-generated and copied.</p>
          </div>
        </div>

        <div className="bg-card border border-border shadow-sm p-8 rounded-sm space-y-6">
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              Shareable Client Link
              <span className="ml-2 text-xs text-green-600 font-normal">✓ Expires in 3 months</span>
            </p>
            <div className="flex items-stretch gap-2">
              <div className="flex-1 p-3 bg-muted border border-border rounded-sm font-mono text-sm text-foreground/80 break-all">
                {created.publicUrl}
              </div>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-4 border rounded-sm font-medium text-sm transition-colors whitespace-nowrap ${
                  copied
                    ? "bg-green-500/10 border-green-500/30 text-green-600"
                    : "border-primary text-primary hover:bg-primary/10"
                }`}
              >
                {copied ? <><CheckCircle2 size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Send this link to your client. It expires in 3 months and works only for their gallery.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
            <a
              href={created.publicUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 border border-border text-foreground hover:bg-muted px-5 py-2.5 rounded-sm font-medium text-sm transition-colors"
            >
              <ExternalLink size={15} /> Preview Gallery
            </a>
            <button
              onClick={() => setLocation(`/admin/galleries/${created.id}`)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-sm font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              Go to Gallery Settings →
            </button>
            <button
              onClick={() => setLocation("/admin/dashboard")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground px-3 py-2.5 text-sm transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

           <button
           onClick={() => { setCreated(null); setCopied(false); setUploadedImages([]); setCoverImageId(null); form.reset(); }}
          className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
        >
          + Create another gallery
        </button>
      </div>
    );
  }

  // ── Creation form ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard" className="p-2 bg-card border border-border rounded-sm hover:bg-muted transition-colors text-muted-foreground">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-serif text-3xl text-foreground">Create New Gallery</h1>
          <p className="text-muted-foreground text-sm mt-1">Upload your client's photos, then generate a shareable link.</p>
        </div>
      </div>

      <div className="bg-card border border-border shadow-sm p-8 rounded-sm">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          {/* Client info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Client Name</label>
              <input
                {...form.register("clientName")}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="e.g. Aisha & Tobi"
              />
              {form.formState.errors.clientName && (
                <p className="text-destructive text-xs">{form.formState.errors.clientName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Shoot Title / Hashtag</label>
              <input
                {...form.register("shootTitle")}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="e.g. #BecomingTheKafidiyas"
              />
              {form.formState.errors.shootTitle && (
                <p className="text-destructive text-xs">{form.formState.errors.shootTitle.message}</p>
              )}
            </div>
          </div>

          {/* Expiry */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Expiry Date
              <span className="ml-2 text-xs text-muted-foreground font-normal">(default: 3 months)</span>
            </label>
            <input
              type="date"
              {...form.register("expiresAt")}
              className="w-full max-w-xs px-4 py-2.5 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
            {form.formState.errors.expiresAt && (
              <p className="text-destructive text-xs">{form.formState.errors.expiresAt.message}</p>
            )}
          </div>

          {/* ── Photo Upload Area ── */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-foreground flex justify-between items-center">
              <span className="flex items-center gap-2"><ImageIcon size={16} /> Client Photos</span>
              <span className="text-muted-foreground font-normal text-xs">{uploadedImages.length} uploaded</span>
            </label>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-border hover:border-primary rounded-sm p-8 text-center cursor-pointer transition-colors hover:bg-muted/30 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => e.target.files && handleFiles(e.target.files)}
              />

              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 size={36} className="text-primary animate-spin" />
                  <p className="text-sm font-medium text-foreground">Uploading {uploadProgress}%…</p>
                  <div className="w-full max-w-xs h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload size={36} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Drop photos here or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP — multiple files supported</p>
                  </div>
                </div>
              )}
            </div>

            {/* Uploaded preview grid */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                {uploadedImages.map((img, idx) => (
                  <div key={img.id} className="relative aspect-square rounded-sm overflow-hidden bg-muted group">
                    <img src={img.previewUrl} alt={img.name} className="w-full h-full object-cover" loading="lazy" />
                    {img.id === coverImageId && (
                      <div className="absolute top-1 left-1 bg-primary text-[8px] px-1.5 py-0.5 rounded text-white font-bold leading-none">Cover</div>
                    )}
                    <button
                      type="button"
                      title="Use as cover photo"
                      onClick={e => { e.stopPropagation(); setCoverImageId(img.id); }}
                      className={`absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold leading-none transition-opacity ${
                        img.id === coverImageId
                          ? "bg-white/90 text-foreground"
                          : "bg-black/60 text-white"
                      }`}
                    >
                      {img.id === coverImageId ? "Cover photo" : "Set cover"}
                    </button>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); removeImage(img.id); }}
                      className="absolute top-1 right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                ))}
                {/* Add more button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-sm border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Upload size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Private Notes <span className="text-muted-foreground font-normal text-xs">(admin-only)</span></label>
            <textarea
              {...form.register("notes")}
              rows={3}
              className="w-full px-4 py-3 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="Internal notes about this client..."
            />
          </div>

          {/* Info banner */}
          <div className="flex items-start gap-3 bg-primary/5 border border-primary/15 rounded-sm px-4 py-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            <p className="text-sm text-foreground/70">
              Photos are uploaded securely to cloud storage. A unique client link (valid for <strong>3 months</strong>) will be generated automatically when you create the gallery.
            </p>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={createMutation.isPending || uploading || uploadedImages.length === 0}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <><Loader2 size={18} className="animate-spin" /> Creating…</>
              ) : (
                <><Save size={18} /> Create Gallery & Generate Link ({uploadedImages.length} photos)</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
