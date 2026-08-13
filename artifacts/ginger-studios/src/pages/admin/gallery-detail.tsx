import { useEffect, useRef, useState, useCallback } from "react";
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
import { useUpload } from "@workspace/object-storage-web";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ArrowLeft, Save, Copy, RefreshCw, Trash2, Ban, ExternalLink, Upload, X, Loader2, Link2, Plus } from "lucide-react";
import { getGalleryUrl } from "@/lib/galleryLinks";

export default function GalleryDetail() {
  const { id } = useParams<{ id: string }>();
  const galleryId = Number(id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: gallery, isLoading } = useGetGallery(galleryId);

  const updateMutation = useUpdateGallery();
  const deleteMutation = useDeleteGallery();
  const regenerateMutation = useRegenerateGalleryLink();

  const [clientName, setClientName]   = useState("");
  const [shootTitle, setShootTitle]   = useState("");
  const [expiresAt, setExpiresAt]     = useState("");
  const [notes, setNotes]             = useState("");

  // Photo state
  const [localImageUrls, setLocalImageUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput]             = useState("");
  const [urlError, setUrlError]             = useState("");
  const [uploadingCount, setUploadingCount] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const initRef      = useRef<number | null>(null);

  // ── useUpload hook — presigned URL → GCS ──────────────────────────────────
  const { uploadFile, isUploading, progress } = useUpload({
    onError: (err) => toast({ variant: "destructive", title: "Upload failed", description: err.message }),
  });

  useEffect(() => {
    if (gallery && initRef.current !== gallery.id) {
      initRef.current = gallery.id;
      setClientName(gallery.clientName);
      setShootTitle(gallery.shootTitle);
      setExpiresAt(gallery.expiresAt.split("T")[0]);
      setNotes(gallery.notes || "");
      setLocalImageUrls(gallery.imageUrls);
    }
  }, [gallery]);

  // ── Persist URLs to DB ─────────────────────────────────────────────────────
  const saveUrls = useCallback(async (urls: string[]) => {
    await fetch(`/api/galleries/${galleryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ imageUrls: urls, coverUrl: urls[0] || null }),
    });
    queryClient.invalidateQueries({ queryKey: getGetGalleryQueryKey(galleryId) });
    queryClient.invalidateQueries({ queryKey: getListGalleriesQueryKey() });
  }, [galleryId, queryClient]);

  // ── File upload handler ────────────────────────────────────────────────────
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith("image/"));
    if (!files.length) return;

    setUploadingCount(files.length);
    const newUrls: string[] = [];

    for (const file of files) {
      const result = await uploadFile(file);
      if (result) {
        // The objectPath e.g. "/objects/uploads/<uuid>" — served via /api/storage
        newUrls.push(`/api/storage${result.objectPath}`);
      }
    }

    setUploadingCount(0);
    if (newUrls.length === 0) return;

    const allUrls = [...localImageUrls, ...newUrls];
    setLocalImageUrls(allUrls);
    try {
      await saveUrls(allUrls);
      toast({ title: `${newUrls.length} photo${newUrls.length > 1 ? "s" : ""} uploaded` });
    } catch {
      toast({ variant: "destructive", title: "Photos uploaded but failed to save to gallery" });
    }

    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [uploadFile, localImageUrls, saveUrls, toast]);

  // ── Drag-and-drop ──────────────────────────────────────────────────────────
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dt = e.dataTransfer;
    if (dt.files.length) {
      const fakeEvent = { target: { files: dt.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(fakeEvent);
    }
  }, [handleFileChange]);

  // ── URL paste handler ──────────────────────────────────────────────────────
  const handleAddUrl = useCallback(async () => {
    const raw = urlInput.trim();
    if (!raw) return;
    const urls = raw.split(/[\n,]+/).map(u => u.trim()).filter(u => u.startsWith("http"));
    if (urls.length === 0) {
      setUrlError("Please paste a valid image URL starting with http");
      return;
    }
    const allUrls = [...localImageUrls, ...urls.filter(u => !localImageUrls.includes(u))];
    setLocalImageUrls(allUrls);
    setUrlInput("");
    setUrlError("");
    try {
      await saveUrls(allUrls);
      toast({ title: `${urls.length} photo${urls.length > 1 ? "s" : ""} added` });
    } catch {
      toast({ variant: "destructive", title: "Failed to save photos" });
    }
  }, [urlInput, localImageUrls, saveUrls, toast]);

  // ── Remove photo ───────────────────────────────────────────────────────────
  const removeImage = useCallback((url: string) => {
    const newUrls = localImageUrls.filter(u => u !== url);
    setLocalImageUrls(newUrls);
    saveUrls(newUrls)
      .then(() => toast({ title: "Photo removed" }))
      .catch(() => toast({ variant: "destructive", title: "Failed to remove photo" }));
  }, [localImageUrls, saveUrls, toast]);

  const handleSave = () => {
    updateMutation.mutate({
      id: galleryId,
      data: { clientName, shootTitle, expiresAt: new Date(expiresAt).toISOString(), notes }
    }, {
      onSuccess: (updated) => {
        toast({ title: "Gallery updated" });
        queryClient.setQueryData(getGetGalleryQueryKey(galleryId), updated);
        queryClient.invalidateQueries({ queryKey: getListGalleriesQueryKey() });
      }
    });
  };

  const handleRevokeRestore = () => {
    const newStatus = gallery?.status === "revoked" ? "active" : "revoked";
    updateMutation.mutate({ id: galleryId, data: { status: newStatus } }, {
      onSuccess: (updated) => {
        toast({ title: `Gallery ${newStatus === "revoked" ? "access revoked" : "restored"}` });
        queryClient.setQueryData(getGetGalleryQueryKey(galleryId), updated);
        queryClient.invalidateQueries({ queryKey: getListGalleriesQueryKey() });
      }
    });
  };

  const handleDelete = () => {
    if (window.confirm("Delete this gallery? This cannot be undone.")) {
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
       navigator.clipboard.writeText(getGalleryUrl(window.location.origin, gallery.shootTitle, gallery.accessToken));
      toast({ title: "Link copied to clipboard" });
    }
  };

  if (isLoading) return <div className="p-8">Loading gallery details…</div>;
  if (!gallery)  return <div className="p-8">Gallery not found.</div>;

   const publicUrl  = getGalleryUrl(window.location.origin, gallery.shootTitle, gallery.accessToken);
  const busy       = isUploading || uploadingCount > 0;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard" className="p-2 bg-card border border-border rounded-sm hover:bg-muted transition-colors text-muted-foreground">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl text-foreground">{gallery.shootTitle}</h1>
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
              gallery.status === "active"        ? "bg-green-500/10 text-green-600" :
              gallery.status === "expiring_soon" ? "bg-amber-500/10 text-amber-600" :
              gallery.status === "revoked"       ? "bg-destructive/10 text-destructive" :
              "bg-muted text-muted-foreground"
            }`}>
              {gallery.status.toUpperCase()}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {gallery.clientName} • Created {format(new Date(gallery.createdAt), "MMM d, yyyy")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery Details form */}
          <div className="bg-card border border-border shadow-sm p-6 rounded-sm space-y-6">
            <h2 className="font-serif text-xl border-b border-border pb-4">Gallery Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Client Name</label>
                <input value={clientName} onChange={e => setClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Shoot Title</label>
                <input value={shootTitle} onChange={e => setShootTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Expiry Date</label>
              <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                className="w-full px-3 py-2 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Internal notes…" />
            </div>
            <div className="pt-4 flex justify-end">
              <button onClick={handleSave} disabled={updateMutation.isPending}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-sm font-medium flex items-center gap-2 hover:bg-primary/90">
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>

          {/* Photos section */}
          <div className="bg-card border border-border shadow-sm p-6 rounded-sm">
            <div className="flex justify-between items-center border-b border-border pb-4 mb-6">
              <h2 className="font-serif text-xl">Photos ({localImageUrls.length})</h2>
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={busy}
                className="flex items-center gap-2 border border-primary text-primary hover:bg-primary/10 px-4 py-2 rounded-sm text-sm font-medium transition-colors disabled:opacity-50">
                {busy
                  ? <><Loader2 size={14} className="animate-spin" /> Uploading {progress > 0 ? `${progress}%` : "…"}</>
                  : <><Upload size={14} /> Add Photos</>}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                onChange={handleFileChange} />
            </div>

            {/* Drop zone */}
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => !busy && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-sm p-8 text-center mb-6 transition-colors
                ${busy ? "border-primary/40 bg-primary/5 cursor-default" : "border-border hover:border-primary/50 cursor-pointer"}`}
            >
              {busy ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={28} className="text-primary animate-spin" />
                  <p className="text-sm text-primary font-medium">Uploading… {progress > 0 ? `${progress}%` : ""}</p>
                  <div className="w-48 h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              ) : (
                <>
                  <Upload size={28} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Drop photos here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP • Multiple files supported</p>
                </>
              )}
            </div>

            {/* URL paste — alternative for hosted images */}
            <details className="mb-6">
              <summary className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground select-none">
                <Link2 size={13} /> Or paste a hosted image URL instead
              </summary>
              <div className="mt-3 space-y-2">
                <div className="flex gap-2">
                  <input
                    value={urlInput}
                    onChange={e => { setUrlInput(e.target.value); setUrlError(""); }}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddUrl(); } }}
                    placeholder="https://… (one per line)"
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button type="button" onClick={handleAddUrl}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-sm text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Plus size={14} /> Add
                  </button>
                </div>
                {urlError && <p className="text-xs text-destructive">{urlError}</p>}
              </div>
            </details>

            {/* Photo grid */}
            {localImageUrls.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-6">No photos yet — upload some above.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {localImageUrls.map((url, i) => (
                  <div key={i} className="aspect-square bg-muted rounded-sm overflow-hidden relative group">
                    <img src={url} className="w-full h-full object-cover" alt="" loading="lazy" />
                    {i === 0 && (
                      <div className="absolute top-2 left-2 bg-primary text-[8px] px-2 py-0.5 rounded text-white font-medium">Cover</div>
                    )}
                    <button type="button" onClick={() => removeImage(url)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col */}
        <div className="space-y-6">
          {/* Shareable Link */}
          <div className="bg-card border border-border shadow-sm p-6 rounded-sm">
            <h2 className="font-serif text-xl mb-4">Shareable Link</h2>
            <div className="p-3 bg-muted border border-border rounded-sm mb-4 break-all text-sm font-mono text-foreground/80">
              {publicUrl}
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={copyLink}
                className="w-full flex items-center justify-center gap-2 border border-primary text-primary hover:bg-primary/10 px-4 py-2 rounded-sm font-medium transition-colors">
                <Copy size={16} /> Copy Link
              </button>
              <a href={publicUrl} target="_blank" rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-background border border-border hover:bg-muted text-foreground px-4 py-2 rounded-sm font-medium transition-colors">
                <ExternalLink size={16} /> Open Gallery
              </a>
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <button onClick={handleRegenerateLink}
                className="w-full flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors p-2">
                <RefreshCw size={16} /> Regenerate Access Token
              </button>
              <p className="text-xs text-muted-foreground mt-1 px-2">Old link will break immediately.</p>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-card border-destructive/20 border shadow-sm p-6 rounded-sm bg-red-50/50">
            <h2 className="font-serif text-xl text-destructive mb-4">Danger Zone</h2>
            <div className="space-y-3">
              <button onClick={handleRevokeRestore}
                className="w-full flex items-center justify-between px-4 py-2 border border-destructive text-destructive hover:bg-destructive/10 rounded-sm font-medium transition-colors">
                <span className="flex items-center gap-2">
                  <Ban size={16} /> {gallery.status === "revoked" ? "Restore Access" : "Revoke Access"}
                </span>
              </button>
              <button onClick={handleDelete}
                className="w-full flex items-center justify-between px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-sm font-medium transition-colors">
                <span className="flex items-center gap-2"><Trash2 size={16} /> Delete Gallery</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-card border border-border shadow-sm p-6 rounded-sm">
            <h2 className="font-serif text-xl mb-4">Stats</h2>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Views</span>
              <span className="font-medium text-lg">{gallery.viewCount}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Photos</span>
              <span className="font-medium text-lg">{localImageUrls.length}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Gallery ID</span>
              <span className="font-mono text-sm">{gallery.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
