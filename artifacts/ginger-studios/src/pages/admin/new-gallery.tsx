import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateGallery, getListGalleriesQueryKey, getGetGalleryStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Copy, ExternalLink, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

const defaultExpiry = new Date();
defaultExpiry.setDate(defaultExpiry.getDate() + 90);
const defaultExpiryString = defaultExpiry.toISOString().split("T")[0];

const gallerySchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  shootTitle:  z.string().min(1, "Shoot title is required"),
  expiresAt:   z.string().min(1, "Expiry date is required"),
  notes:       z.string().optional(),
  imageUrls:   z.string().min(1, "At least one image URL is required"),
  coverUrl:    z.string().optional(),
});

type GalleryFormValues = z.infer<typeof gallerySchema>;

interface CreatedResult {
  id: number;
  accessToken: string;
  publicUrl: string;
}

export default function NewGallery() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateGallery();
  const [created, setCreated] = useState<CreatedResult | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<GalleryFormValues>({
    resolver: zodResolver(gallerySchema),
    defaultValues: {
      clientName: "",
      shootTitle: "",
      expiresAt: defaultExpiryString,
      notes: "",
      imageUrls: "",
      coverUrl: "",
    },
  });

  const onSubmit = (data: GalleryFormValues) => {
    const urls = data.imageUrls.split("\n").map(u => u.trim()).filter(u => u.length > 0);
    if (urls.length === 0) {
      form.setError("imageUrls", { message: "Please provide valid URLs" });
      return;
    }

    createMutation.mutate(
      {
        data: {
          clientName: data.clientName,
          shootTitle:  data.shootTitle,
          expiresAt:   new Date(data.expiresAt).toISOString(),
          notes:       data.notes || null,
          imageUrls:   urls,
          coverUrl:    data.coverUrl || urls[0] || null,
        },
      },
      {
        onSuccess: (newGallery) => {
          queryClient.invalidateQueries({ queryKey: getListGalleriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetGalleryStatsQueryKey() });
          const publicUrl = `${window.location.origin}/gallery/${newGallery.accessToken}`;
          setCreated({ id: newGallery.id, accessToken: newGallery.accessToken, publicUrl });
          // Auto-copy to clipboard
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
          {/* Auto-generated URL */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              Shareable Client Link
              <span className="ml-2 text-xs text-green-600 font-normal">✓ Auto-generated</span>
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
              Send this link to your client. It expires in 90 days and works only for their gallery.
            </p>
          </div>

          {/* Actions */}
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

        {/* Create another */}
        <button
          onClick={() => { setCreated(null); setCopied(false); form.reset(); }}
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
          <p className="text-muted-foreground text-sm mt-1">The client link will be auto-generated on save.</p>
        </div>
      </div>

      <div className="bg-card border border-border shadow-sm p-8 rounded-sm">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Expiry Date
                <span className="ml-2 text-xs text-muted-foreground font-normal">(default: 90 days)</span>
              </label>
              <input
                type="date"
                {...form.register("expiresAt")}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              {form.formState.errors.expiresAt && (
                <p className="text-destructive text-xs">{form.formState.errors.expiresAt.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Cover Image URL
                <span className="ml-2 text-xs text-muted-foreground font-normal">(optional — defaults to first image)</span>
              </label>
              <input
                {...form.register("coverUrl")}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex justify-between">
              <span>Image URLs</span>
              <span className="text-muted-foreground font-normal text-xs">One URL per line</span>
            </label>
            <textarea
              {...form.register("imageUrls")}
              rows={10}
              className="w-full px-4 py-3 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono text-xs"
              placeholder={"https://example.com/img1.jpg\nhttps://example.com/img2.jpg"}
            />
            {form.formState.errors.imageUrls && (
              <p className="text-destructive text-xs">{form.formState.errors.imageUrls.message}</p>
            )}
          </div>

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
              A unique client link will be <strong>automatically generated</strong> when you create the gallery. No extra step needed — you'll be able to copy it immediately.
            </p>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? "Creating…" : <><Save size={18} /> Create Gallery & Generate Link</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
