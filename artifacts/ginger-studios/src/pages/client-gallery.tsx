import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useGetPublicGallery, useRecordGalleryView } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Cloud, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
const logoIcon = "/images/logo-icon.png";

export default function ClientGallery() {
  const { token } = useParams<{ token?: string }>();
  const [, setLocation] = useLocation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // If no token in URL, show simple form to enter token
  const [inputToken, setInputToken] = useState("");
  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputToken.trim()) {
      setLocation(`/gallery/${inputToken.trim()}`);
    }
  };

  const { data: gallery, isLoading, error } = useGetPublicGallery(token || "", {
    query: {
      enabled: !!token,
      retry: false
    }
  });

  const recordView = useRecordGalleryView();

  useEffect(() => {
    if (gallery && token) {
      recordView.mutate({ data: undefined, token });
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
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
        <p className="text-muted-foreground font-serif italic">Unlocking your memories...</p>
      </div>
    );
  }

  if (error || (gallery && gallery.isExpired)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full text-center">
          <img src={logoIcon} alt="Ginger Studios" className="w-16 h-16 mx-auto mb-8 opacity-50 grayscale" />
          <h1 className="font-serif text-4xl text-foreground mb-4">Gallery Expired</h1>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            {gallery?.isExpired 
              ? "The delivery window for this gallery has closed." 
              : "We couldn't find a valid gallery for this link. It may have expired or been removed."}
          </p>
          <p className="text-muted-foreground text-sm mb-8">
            Please reach out to us to request a new delivery link or extended access.
          </p>
          <a href="/contact" className="inline-block bg-primary text-primary-foreground px-8 py-3 font-medium rounded-sm hover:bg-primary/90 transition-colors">
            Contact Us
          </a>
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
          <p className="text-white/80 text-sm font-medium">
            Expires in {formatDistanceToNow(new Date(gallery.expiresAt))}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full py-12 md:py-20">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 bg-card p-6 border border-border rounded-sm shadow-sm">
          <div className="text-center sm:text-left">
            <p className="text-foreground font-serif text-xl">{gallery.imageUrls.length} Memories</p>
            <p className="text-muted-foreground text-sm mt-1">High resolution ready for download</p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`https://drive.google.com`}
              target="_blank"
              rel="noreferrer"
              className="group relative flex items-center gap-2 px-5 py-2.5 border border-border text-foreground hover:bg-muted transition-colors rounded-sm"
              title="Save photos to Google Drive (open Drive to upload)"
            >
              <Cloud size={18} /> Save to Drive
            </a>
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
            </motion.div>
          ))}
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
              
              <div className="absolute top-4 right-4 flex gap-4">
                <a href={selectedImage} download target="_blank" rel="noreferrer" className="w-10 h-10 bg-background/20 hover:bg-background border border-border text-foreground flex items-center justify-center rounded-full transition-colors backdrop-blur-md">
                  <Download size={18} />
                </a>
                <button onClick={() => setSelectedImage(null)} className="w-10 h-10 bg-background/20 hover:bg-background border border-border text-foreground flex items-center justify-center rounded-full transition-colors backdrop-blur-md">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
