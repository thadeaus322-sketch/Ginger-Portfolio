import { useEffect, useRef, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { 
  useGetGallery, 
  useUpdateGallery, 
  useDeleteGallery, 
  useRegenerateGalleryLink,
  getGetGalleryQueryKey,
  getListGalleriesQueryKey,
  getGetGalleryStatsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ArrowLeft, Save, Copy, RefreshCw, Trash2, Ban, ExternalLink, Image as ImageIcon } from "lucide-react";

export default function GalleryDetail() {
  const { id } = useParams<{ id: string }>();
  const galleryId = Number(id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: gallery, isLoading } = useGetGallery(galleryId, {
    query: { enabled: !!galleryId }
  });

  const updateMutation = useUpdateGallery();
  const deleteMutation = useDeleteGallery();
  const regenerateMutation = useRegenerateGalleryLink();

  // Local state for editable fields
  const [clientName, setClientName] = useState("");
  const [shootTitle, setShootTitle] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [notes, setNotes] = useState("");
  
  const initRef = useRef<number | null>(null);

  useEffect(() => {
    if (gallery && initRef.current !== gallery.id) {
      initRef.current = gallery.id;
      setClientName(gallery.clientName);
      setShootTitle(gallery.shootTitle);
      // Format for date input (YYYY-MM-DD)
      setExpiresAt(gallery.expiresAt.split('T')[0]);
      setNotes(gallery.notes || "");
    }
  }, [gallery]);

  const handleSave = () => {
    updateMutation.mutate({
      id: galleryId,
      data: {
        clientName,
        shootTitle,
        expiresAt: new Date(expiresAt).toISOString(),
        notes
      }
    }, {
      onSuccess: (updated) => {
        toast({ title: "Gallery updated" });
        queryClient.setQueryData(getGetGalleryQueryKey(galleryId), updated);
        queryClient.invalidateQueries({ queryKey: getListGalleriesQueryKey() });
      }
    });
  };

  const handleRevokeRestore = () => {
    const newStatus = gallery?.status === 'revoked' ? 'active' : 'revoked';
    updateMutation.mutate({
      id: galleryId,
      data: { status: newStatus }
    }, {
      onSuccess: (updated) => {
        toast({ title: `Gallery ${newStatus === 'revoked' ? 'access revoked' : 'restored'}` });
        queryClient.setQueryData(getGetGalleryQueryKey(galleryId), updated);
        queryClient.invalidateQueries({ queryKey: getListGalleriesQueryKey() });
      }
    });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this gallery? This cannot be undone.")) {
      deleteMutation.mutate({ id: galleryId }, {
        onSuccess: () => {
          toast({ title: "Gallery deleted" });
          queryClient.invalidateQueries({ queryKey: getListGalleriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetGalleryStatsQueryKey() });
          setLocation("/admin/dashboard");
        }
      });
    }
  };

  const handleRegenerateLink = () => {
    if (window.confirm("Regenerate access token? The old link will stop working immediately.")) {
      regenerateMutation.mutate({ id: galleryId }, {
        onSuccess: (updated) => {
          toast({ title: "New link generated" });
          queryClient.setQueryData(getGetGalleryQueryKey(galleryId), updated);
        }
      });
    }
  };

  const copyLink = () => {
    if (gallery) {
      const url = `${window.location.origin}/gallery/${gallery.accessToken}`;
      navigator.clipboard.writeText(url);
      toast({ title: "Link copied to clipboard" });
    }
  };

  if (isLoading) return <div className="p-8">Loading gallery details...</div>;
  if (!gallery) return <div className="p-8">Gallery not found.</div>;

  const publicUrl = `${window.location.origin}/gallery/${gallery.accessToken}`;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard" className="p-2 bg-card border border-border rounded-sm hover:bg-muted transition-colors text-muted-foreground">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl text-foreground">{gallery.shootTitle}</h1>
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
              gallery.status === 'active' ? 'bg-green-500/10 text-green-600' :
              gallery.status === 'expiring_soon' ? 'bg-amber-500/10 text-amber-600' :
              gallery.status === 'revoked' ? 'bg-destructive/10 text-destructive' :
              'bg-muted text-muted-foreground'
            }`}>
              {gallery.status.toUpperCase()}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">{gallery.clientName} • Created {format(new Date(gallery.createdAt), "MMM d, yyyy")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border shadow-sm p-6 rounded-sm space-y-6">
            <h2 className="font-serif text-xl border-b border-border pb-4">Gallery Details</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Client Name</label>
                <input value={clientName} onChange={e => setClientName(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Shoot Title</label>
                <input value={shootTitle} onChange={e => setShootTitle(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Expiry Date</label>
              <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-sm" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full px-3 py-2 bg-background border border-border rounded-sm" placeholder="Internal notes..." />
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-sm font-medium flex items-center gap-2 hover:bg-primary/90"
              >
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>

          {/* Image Preview Grid */}
          <div className="bg-card border border-border shadow-sm p-6 rounded-sm">
            <div className="flex justify-between items-center border-b border-border pb-4 mb-6">
              <h2 className="font-serif text-xl">Images ({gallery.imageCount})</h2>
              <span className="text-sm text-muted-foreground"><ImageIcon size={14} className="inline mr-1"/> Cover is first image</span>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {gallery.imageUrls.map((url, i) => (
                <div key={i} className="aspect-square bg-muted rounded-sm overflow-hidden relative group">
                  <img src={url} className="w-full h-full object-cover" alt="" loading="lazy" />
                  {i === 0 && <div className="absolute top-2 left-2 bg-primary text-xs px-2 py-0.5 rounded text-white font-medium">Cover</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Actions & Link */}
        <div className="space-y-6">
          <div className="bg-card border border-border shadow-sm p-6 rounded-sm">
            <h2 className="font-serif text-xl mb-4">Shareable Link</h2>
            <div className="p-3 bg-muted border border-border rounded-sm mb-4 break-all text-sm font-mono text-foreground/80">
              {publicUrl}
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={copyLink} className="w-full flex items-center justify-center gap-2 border border-primary text-primary hover:bg-primary/10 px-4 py-2 rounded-sm font-medium transition-colors">
                <Copy size={16} /> Copy Link
              </button>
              <a href={publicUrl} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 bg-background border border-border hover:bg-muted text-foreground px-4 py-2 rounded-sm font-medium transition-colors">
                <ExternalLink size={16} /> Open Gallery
              </a>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border">
              <button 
                onClick={handleRegenerateLink}
                className="w-full flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors p-2"
              >
                <RefreshCw size={16} /> Regenerate Access Token
              </button>
              <p className="text-xs text-muted-foreground mt-1 px-2">Old link will break immediately.</p>
            </div>
          </div>

          <div className="bg-card border-destructive/20 border shadow-sm p-6 rounded-sm bg-red-50/50">
            <h2 className="font-serif text-xl text-destructive mb-4">Danger Zone</h2>
            <div className="space-y-3">
              <button 
                onClick={handleRevokeRestore}
                className="w-full flex items-center justify-between px-4 py-2 border border-destructive text-destructive hover:bg-destructive/10 rounded-sm font-medium transition-colors"
              >
                <span className="flex items-center gap-2"><Ban size={16} /> {gallery.status === 'revoked' ? 'Restore Access' : 'Revoke Access'}</span>
              </button>
              
              <button 
                onClick={handleDelete}
                className="w-full flex items-center justify-between px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-sm font-medium transition-colors"
              >
                <span className="flex items-center gap-2"><Trash2 size={16} /> Delete Gallery</span>
              </button>
            </div>
          </div>

          <div className="bg-card border border-border shadow-sm p-6 rounded-sm">
            <h2 className="font-serif text-xl mb-4">Stats</h2>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Views</span>
              <span className="font-medium text-lg">{gallery.viewCount}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Images</span>
              <span className="font-medium text-lg">{gallery.imageCount}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">ID</span>
              <span className="font-mono text-sm">{gallery.id}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
