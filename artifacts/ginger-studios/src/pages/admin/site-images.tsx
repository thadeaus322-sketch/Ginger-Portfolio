import { useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListSiteImages,
  useCreateSiteImage,
  useUpdateSiteImage,
  useDeleteSiteImage,
  getListSiteImagesQueryKey,
} from "@workspace/api-client-react";
import { useUpload } from "@workspace/object-storage-web";
import { useToast } from "@/hooks/use-toast";
import {
  Upload, Trash2, Plus, Loader2, ImageIcon, Edit2, Check, X, GripVertical,
} from "lucide-react";

type Section = "hero_slide" | "card_stack" | "portfolio";

const SECTIONS: { id: Section; label: string; desc: string }[] = [
  { id: "hero_slide",  label: "Hero Slider",   desc: "Auto-playing hero images on the homepage" },
  { id: "card_stack",  label: "Card Stack",    desc: "Interactive card stack on the homepage" },
  { id: "portfolio",   label: "Photography Portfolio", desc: "Images shown on the Photography page" },
];

const PHOTO_CATS = [
  { id: "weddings",  label: "Weddings" },
  { id: "portraits", label: "Portraits" },
  { id: "events",    label: "Events" },
  { id: "food",      label: "Food" },
  { id: "products",  label: "Products" },
  { id: "birthday",  label: "Birthday" },
];

const HERO_CATS = [
  "WEDDINGS","PORTRAITS","EVENTS","FOOD","PRODUCTS","BIRTHDAY","BRAND FILMS","CELEBRATIONS",
];

interface EditState {
  title: string;
  label: string;
  category: string;
  tall: boolean;
  isActive: boolean;
}

export default function SiteImages() {
  const [activeSection, setActiveSection] = useState<Section>("hero_slide");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editState, setEditState] = useState<EditState>({ title: "", label: "", category: "all", tall: false, isActive: true });
  const [addMode, setAddMode] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<EditState & { imageUrl: string }>>({});
  const [uploadingNew, setUploadingNew] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const newFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allImages = [], isLoading } = useListSiteImages();
  const createMutation = useCreateSiteImage();
  const updateMutation = useUpdateSiteImage();
  const deleteMutation = useDeleteSiteImage();

  const { uploadFile, isUploading } = useUpload({
    onError: (err) => toast({ variant: "destructive", title: "Upload failed", description: err.message }),
  });

  const images = allImages.filter((img) => img.section === activeSection);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListSiteImagesQueryKey() });

  // ── Upload a new image file ─────────────────────────────────────────────────
  const handleNewFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingNew(true);
    const result = await uploadFile(file);
    setUploadingNew(false);
    if (result) {
      const url = `/api/storage${result.objectPath}`;
      setNewEntry(prev => ({ ...prev, imageUrl: url }));
      toast({ title: "Photo uploaded — fill in details and save" });
    }
    if (newFileInputRef.current) newFileInputRef.current.value = "";
  }, [uploadFile, toast]);

  // ── Upload replacement image for existing row ───────────────────────────────
  const [replacingId, setReplacingId] = useState<number | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  const handleReplaceUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replacingId === null) return;
    const result = await uploadFile(file);
    if (result) {
      await updateMutation.mutateAsync({ id: replacingId, data: { imageUrl: `/api/storage${result.objectPath}` } });
      invalidate();
      toast({ title: "Image replaced" });
    }
    setReplacingId(null);
    if (replaceFileInputRef.current) replaceFileInputRef.current.value = "";
  }, [uploadFile, updateMutation, replacingId, invalidate, toast]);

  // ── Save edit ───────────────────────────────────────────────────────────────
  const saveEdit = async (id: number) => {
    await updateMutation.mutateAsync({ id, data: editState });
    invalidate();
    setEditingId(null);
    toast({ title: "Image updated" });
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!window.confirm("Remove this image from the site?")) return;
    await deleteMutation.mutateAsync({ id });
    invalidate();
    toast({ title: "Image removed" });
  };

  // ── Create ──────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!newEntry.imageUrl) {
      toast({ variant: "destructive", title: "Upload a photo first" });
      return;
    }
    await createMutation.mutateAsync({
      section: activeSection,
      imageUrl: newEntry.imageUrl,
      title: newEntry.title ?? "",
      label: newEntry.label ?? "",
      category: newEntry.category ?? (activeSection === "portfolio" ? "weddings" : "all"),
      tall: newEntry.tall ?? false,
      isActive: true,
      sortOrder: images.length,
    });
    invalidate();
    setAddMode(false);
    setNewEntry({});
    toast({ title: "Image added to site" });
  };

  const startEdit = (img: typeof allImages[0]) => {
    setEditingId(img.id);
    setEditState({ title: img.title, label: img.label, category: img.category, tall: img.tall, isActive: img.isActive });
  };

  const isPortfolio = activeSection === "portfolio";
  const isHeroOrCard = activeSection === "hero_slide" || activeSection === "card_stack";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-foreground">Site Images</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage images shown on the public homepage and photography page
        </p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-3 flex-wrap">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => { setActiveSection(s.id); setAddMode(false); setEditingId(null); }}
            className={`px-5 py-2.5 rounded-sm text-sm font-medium transition-colors border ${
              activeSection === s.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {s.label}
            <span className="ml-2 text-xs opacity-60">
              {allImages.filter(i => i.section === s.id).length}
            </span>
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground -mt-2">
        {SECTIONS.find(s => s.id === activeSection)?.desc}
      </p>

      {/* Image grid */}
      <div className="bg-card border border-border rounded-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-xl">
            {SECTIONS.find(s => s.id === activeSection)?.label} ({images.length})
          </h2>
          <button
            onClick={() => { setAddMode(true); setNewEntry({}); }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-sm text-sm font-medium hover:bg-primary/90"
          >
            <Plus size={14} /> Add Image
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : images.length === 0 && !addMode ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-sm">
            <ImageIcon size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No images yet — click Add Image to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {images.map((img) => {
              const isEditing = editingId === img.id;
              return (
                <div
                  key={img.id}
                  className={`flex gap-4 p-4 border rounded-sm transition-colors ${
                    isEditing ? "border-primary/40 bg-primary/3" : "border-border hover:bg-muted/30"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-16 rounded-sm overflow-hidden bg-muted flex-shrink-0 relative group">
                    <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" />
                    <button
                      onClick={() => { setReplacingId(img.id); replaceFileInputRef.current?.click(); }}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold uppercase tracking-wide"
                    >
                      Replace
                    </button>
                  </div>

                  {/* Fields */}
                  {isEditing ? (
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Title</label>
                        <input
                          value={editState.title}
                          onChange={(e) => setEditState(s => ({ ...s, title: e.target.value }))}
                          className="w-full mt-1 px-2 py-1.5 text-sm bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      {isHeroOrCard && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Label (e.g. WEDDINGS)</label>
                          <select
                            value={editState.label}
                            onChange={(e) => setEditState(s => ({ ...s, label: e.target.value }))}
                            className="w-full mt-1 px-2 py-1.5 text-sm bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="">— none —</option>
                            {HERO_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      )}
                      {isPortfolio && (
                        <>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Category</label>
                            <select
                              value={editState.category}
                              onChange={(e) => setEditState(s => ({ ...s, category: e.target.value }))}
                              className="w-full mt-1 px-2 py-1.5 text-sm bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              {PHOTO_CATS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                          </div>
                          <div className="flex items-center gap-3 mt-5">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editState.tall}
                                onChange={(e) => setEditState(s => ({ ...s, tall: e.target.checked }))}
                                className="rounded"
                              />
                              Tall card (portrait ratio)
                            </label>
                          </div>
                        </>
                      )}
                      <div className="flex items-center gap-2 mt-5">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editState.isActive}
                            onChange={(e) => setEditState(s => ({ ...s, isActive: e.target.checked }))}
                            className="rounded"
                          />
                          Show on site
                        </label>
                      </div>
                      <div className="col-span-2 flex gap-2 justify-end">
                        <button onClick={() => setEditingId(null)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-sm hover:bg-muted">
                          <X size={13} /> Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(img.id)}
                          disabled={updateMutation.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 disabled:opacity-50"
                        >
                          <Check size={13} /> Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{img.title || <span className="text-muted-foreground italic">No title</span>}</p>
                        <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                          {img.label && <span className="text-primary font-bold">{img.label}</span>}
                          {isPortfolio && <span className="capitalize">{img.category}</span>}
                          {isPortfolio && img.tall && <span>Tall</span>}
                          {!img.isActive && <span className="text-destructive font-medium">Hidden</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => startEdit(img)} className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors">
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(img.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive rounded transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add new entry */}
        {addMode && (
          <div className="mt-4 border-2 border-dashed border-primary/40 rounded-sm p-5 bg-primary/3 space-y-4">
            <h3 className="font-medium text-sm">New image</h3>

            {/* Upload area */}
            {newEntry.imageUrl ? (
              <div className="relative w-24 h-20 rounded-sm overflow-hidden bg-muted">
                <img src={newEntry.imageUrl} alt="New" className="w-full h-full object-cover" />
                <button
                  onClick={() => setNewEntry(p => ({ ...p, imageUrl: undefined }))}
                  className="absolute top-1 right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => newFileInputRef.current?.click()}
                disabled={uploadingNew}
                className="flex items-center gap-2 border border-dashed border-border rounded-sm px-5 py-3 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors disabled:opacity-50"
              >
                {uploadingNew ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploadingNew ? "Uploading…" : "Upload photo"}
              </button>
            )}
            <input ref={newFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleNewFileUpload} />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Title</label>
                <input
                  value={newEntry.title ?? ""}
                  onChange={(e) => setNewEntry(p => ({ ...p, title: e.target.value }))}
                  className="w-full mt-1 px-2 py-1.5 text-sm bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. A Short Story of Love"
                />
              </div>
              {isHeroOrCard && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Label</label>
                  <select
                    value={newEntry.label ?? ""}
                    onChange={(e) => setNewEntry(p => ({ ...p, label: e.target.value }))}
                    className="w-full mt-1 px-2 py-1.5 text-sm bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">— none —</option>
                    {HERO_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
              {isPortfolio && (
                <>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Category</label>
                    <select
                      value={newEntry.category ?? "weddings"}
                      onChange={(e) => setNewEntry(p => ({ ...p, category: e.target.value }))}
                      className="w-full mt-1 px-2 py-1.5 text-sm bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {PHOTO_CATS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 mt-5">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newEntry.tall ?? false}
                        onChange={(e) => setNewEntry(p => ({ ...p, tall: e.target.checked }))}
                        className="rounded"
                      />
                      Tall card (portrait ratio)
                    </label>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={() => { setAddMode(false); setNewEntry({}); }} className="px-4 py-2 text-sm border border-border rounded-sm hover:bg-muted">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending || !newEntry.imageUrl}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 disabled:opacity-50"
              >
                {createMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                Add to site
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file inputs */}
      <input ref={replaceFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleReplaceUpload} />
    </div>
  );
}
