import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useGetPublicGallery, useRecordGalleryView } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
const logoIcon = "/images/logo-icon.png";

const WA_CONTACT = "https://wa.me/2347067310008?text=Hi%20Ginger%20Studios!%20I%27d%20like%20to%20request%20extended%20gallery%20access.";
const EMAIL      = "hi@gvs.com.ng";

function SaveToGoogleDriveButton({ imageUrls, shootTitle }: { imageUrls: string[]; shootTitle: string }) {
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleSaveToDrive = async () => {
    setSaving(true);
    try {
      // Build a Google Drive upload URL using the "Save to Drive" API
      // This opens a Google picker that lets clients save photos to their own Drive
      const driveUrl = `https://drive.google.com/drive/folders`;
      // Open Google Drive in a new tab — clients can manually upload the downloaded files
      // For a fully automated experience, a server-side Google Drive API integration is needed
      window.open(driveUrl, "_blank", "noopener,noreferrer");

      // Trigger download of all images so client can easily upload to Drive
      for (let i = 0; i < imageUrls.length; i++) {
        await new Promise<void>(resolve => {
          setTimeout(() => {
            const a = document.createElement("a");
            a.href = imageUrls[i];
            a.download = `${shootTitle.replace(/[^a-z0-9]/gi, "-")}-${i + 1}.jpg`;
            a.target = "_blank";
            a.rel = "noreferrer";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            resolve();
          }, i * 300);
        });
      }
      setDone(true);
      setTimeout(() => setDone(false), 4000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      onClick={handleSaveToDrive}
      disabled={saving}
      className="group relative flex items-center gap-2 px-5 py-2.5 border border-border text-foreground hover:bg-muted transition-colors rounded-sm disabled:opacity-60"
      title="Download all photos and open Google Drive"
    >
      {/* Google Drive icon */}
      <svg width="18" height="18" viewBox="0 0 87.3 78" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066DA"/>
        <path d="M43.65 25L29.9 0c-1.35.8-2.5 1.9-3.3 3.3L1.2 48.5c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00AC47"/>
        <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.9 10.85z" fill="#EA4335"/>
        <path d="M43.65 25L57.4 0H29.9z" fill="#00832D"/>
        <path d="M59.8 53H27.5L13.75 76.8h49.9z" fill="#2684FC"/>
        <path d="M73.4 26.5c-.8-1.4-1.95-2.5-3.3-3.3L57.4 0H29.9l13.75 25H87.3c0-1.55-.4-3.1-1.2-4.5z" fill="#FFBA00"/>
      </svg>
      {saving ? "Opening Drive…" : done ? "✓ Downloads started!" : "Save to Google Drive"}
    </button>
  );
}

export default function ClientGallery() {
  const { token } = useParams<{ token?: string }>();
  const [, setLocation] = useLocation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [inputToken, setInputToken] = useState("");
  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputToken.trim()) {
      setLocation(`/gallery/${inputToken.trim()}`);
    }
  };

  const { data: gallery, isLoading, error } = useGetPublicGallery(token || "");

  const recordView = useRecordGalleryView();

  useEffect(() => {
    if (gallery && token) {
      recordView.mutate({ token });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gallery, token]);

  if (!token) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full bg-card p-10 border border-border text-center shadow-xl">
          <Lock className="w-12 h-12 text-primary mx-auto mb-6" />
          <h1 className="font-serif text-3xl text-foreground mb-4">Client Access</h1>
          <p className="text-muted-foreground mb-8 text-sm">Enter your gallery access code to view and download your photos.</p>
          <form onSubmit={handleTokenSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="e.g. abc123xyz"
              className="w-full px-4 py-3 bg-background border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary rounded-sm transition-all text-center"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
            />
            <button type="submit" className="w-full bg-primary text-primary-foreground py-3 font-medium rounded-sm hover:bg-primary/90 transition-colors">
              Access Gallery
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
        <p className="text-muted-foreground font-serif italic">Unlocking your memories…</p>
      </div>
    );
  }

  if (error || (gallery && gallery.isExpired)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full text-center">
          <img src={logoIcon} alt="Ginger Studios" className="w-16 h-16 mx-auto mb-8 opacity-50 grayscale" />
          <h1 className="font-serif text-4xl text-foreground mb-4">Gallery Expired</h1>
          <p className="text-muted-foreground text-lg mb-4 leading-relaxed">
            {gallery?.isExpired
              ? "The delivery window for this gallery has closed."
              : "We couldn't find a valid gallery for this link. It may have expired or been removed."}
          </p>
          <p className="text-muted-foreground text-sm mb-10">
            Please reach out to us to request a new delivery link or extended access.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={WA_CONTACT} target="_blank" rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 font-medium rounded-sm hover:bg-[#20bd5a] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.107 1.516 5.832L0 24l6.335-1.493A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.011-1.374l-.36-.214-3.732.879.894-3.648-.235-.374A9.818 9.818 0 1112 21.818z"/></svg>
              WhatsApp Us
            </a>
            <a href={`mailto:${EMAIL}`}
              className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3 font-medium rounded-sm hover:bg-muted transition-colors">
              {EMAIL}
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!gallery) return null;

  return (
    <div className="w-full flex flex-col bg-background min-h-screen">
      {/* Cover Header */}
      <div className="relative h-[40vh] md:h-[50vh] w-full bg-muted flex items-end justify-center pb-12 overflow-hidden">
        {gallery.coverUrl && (
          <div className="absolute inset-0">
            <img src={gallery.coverUrl} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
        )}
        <div className="relative z-10 text-center px-6">
          <h2 className="text-primary/90 text-sm font-bold tracking-[0.2em] uppercase mb-4">{gallery.clientName}</h2>
          <h1 className="font-serif text-4xl md:text-6xl text-white mb-6 drop-shadow-md">{gallery.shootTitle}</h1>
          <p className="text-white/70 text-sm">
            Gallery access expires in {formatDistanceToNow(new Date(gallery.expiresAt))}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full py-12 md:py-20">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 bg-card p-6 border border-border rounded-sm shadow-sm">
          <div className="text-center sm:text-left">
            <p className="text-foreground font-serif text-xl">{gallery.imageUrls.length} Memories</p>
            <p className="text-muted-foreground text-sm mt-1">Your high resolution photos, ready to download</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 justify-center">
            <SaveToGoogleDriveButton imageUrls={gallery.imageUrls} shootTitle={gallery.shootTitle} />
            <button
              onClick={() => {
                gallery.imageUrls.forEach((url, i) => {
                  setTimeout(() => {
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${gallery.shootTitle.replace(/[^a-z0-9]/gi, "-")}-${i + 1}.jpg`;
                    a.target = "_blank";
                    a.rel = "noreferrer";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }, i * 250);
                });
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-sm font-medium"
            >
              <Download size={18} /> Download All ({gallery.imageUrls.length})
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {gallery.imageUrls.map((url, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 1) }}
              className="relative group overflow-hidden break-inside-avoid bg-muted cursor-pointer rounded-sm"
              onClick={() => setSelectedImage(url)}
            >
              <img
                src={url}
                alt={`${gallery.shootTitle} image ${i + 1}`}
                className="w-full h-auto"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              {/* Download icon on hover */}
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href={url} download target="_blank" rel="noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-foreground hover:bg-white transition-colors shadow">
                  <Download size={14} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-20 text-center border-t border-border pt-12">
          <img src={logoIcon} alt="Ginger Studios" className="w-10 h-10 object-contain mx-auto mb-6 opacity-40" />
          <p className="font-serif italic text-muted-foreground text-lg mb-2">Thank you for trusting us with your memories.</p>
          <p className="text-muted-foreground text-sm">
            Questions? Reach us at{" "}
            <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">{EMAIL}</a>
            {" "}or{" "}
            <a href={WA_CONTACT} target="_blank" rel="noreferrer" className="text-primary hover:underline">WhatsApp</a>
          </p>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4 md:p-12 cursor-pointer"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-6xl w-full h-full flex items-center justify-center cursor-default" onClick={e => e.stopPropagation()}>
              <img src={selectedImage} alt="Selected memory" className="max-w-full max-h-full object-contain shadow-2xl" />

              <div className="absolute top-4 right-4 flex gap-3">
                <a href={selectedImage} download target="_blank" rel="noreferrer"
                  className="w-10 h-10 bg-background/80 hover:bg-background border border-border text-foreground flex items-center justify-center rounded-full transition-colors backdrop-blur-md">
                  <Download size={18} />
                </a>
                <button onClick={() => setSelectedImage(null)}
                  className="w-10 h-10 bg-background/80 hover:bg-background border border-border text-foreground flex items-center justify-center rounded-full transition-colors backdrop-blur-md">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
