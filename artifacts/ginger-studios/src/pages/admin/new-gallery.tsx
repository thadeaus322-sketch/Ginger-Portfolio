import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateGallery, getListGalleriesQueryKey, getGetGalleryStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "wouter";

// Default expiry 90 days from now
const defaultExpiry = new Date();
defaultExpiry.setDate(defaultExpiry.getDate() + 90);
const defaultExpiryString = defaultExpiry.toISOString().split('T')[0];

const gallerySchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  shootTitle: z.string().min(1, "Shoot title is required"),
  expiresAt: z.string().min(1, "Expiry date is required"),
  notes: z.string().optional(),
  imageUrls: z.string().min(1, "At least one image URL is required"),
  coverUrl: z.string().optional(),
});

type GalleryFormValues = z.infer<typeof gallerySchema>;

export default function NewGallery() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateGallery();

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
    // Parse the multi-line text into array of URLs, filter empty lines
    const urls = data.imageUrls.split("\n").map(u => u.trim()).filter(u => u.length > 0);
    
    if (urls.length === 0) {
      form.setError("imageUrls", { message: "Please provide valid URLs" });
      return;
    }

    createMutation.mutate({
      data: {
        clientName: data.clientName,
        shootTitle: data.shootTitle,
        expiresAt: new Date(data.expiresAt).toISOString(),
        notes: data.notes || null,
        imageUrls: urls,
        coverUrl: data.coverUrl || urls[0] || null, // default cover to first image
      }
    }, {
      onSuccess: (newGallery) => {
        toast({ title: "Gallery created successfully" });
        queryClient.invalidateQueries({ queryKey: getListGalleriesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetGalleryStatsQueryKey() });
        setLocation(`/admin/galleries/${newGallery.id}`);
      },
      onError: (err: any) => {
        toast({
          variant: "destructive",
          title: "Failed to create gallery",
          description: err?.error || "An unexpected error occurred.",
        });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard" className="p-2 bg-card border border-border rounded-sm hover:bg-muted transition-colors text-muted-foreground">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-serif text-3xl text-foreground">Create New Gallery</h1>
          <p className="text-muted-foreground text-sm mt-1">Deliver a new set of memories</p>
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
              <label className="text-sm font-medium text-foreground">Expiry Date</label>
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
              <label className="text-sm font-medium text-foreground">Cover Image URL (Optional)</label>
              <input
                {...form.register("coverUrl")}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="Leave blank to use the first image"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex justify-between">
              <span>Image URLs</span>
              <span className="text-muted-foreground font-normal text-xs">Enter one URL per line</span>
            </label>
            <textarea
              {...form.register("imageUrls")}
              rows={10}
              className="w-full px-4 py-3 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono text-xs"
              placeholder="https://example.com/img1.jpg&#10;https://example.com/img2.jpg"
            />
            {form.formState.errors.imageUrls && (
              <p className="text-destructive text-xs">{form.formState.errors.imageUrls.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Private Notes (Admin only)</label>
            <textarea
              {...form.register("notes")}
              rows={3}
              className="w-full px-4 py-3 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="Internal notes about this client..."
            />
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? "Creating..." : <><Save size={18} /> Create Gallery</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
