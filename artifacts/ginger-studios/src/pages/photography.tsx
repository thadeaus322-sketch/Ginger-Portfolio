import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Assets
const weddingDetail = "/images/wedding-detail.jpg";
const weddingBride = "/images/wedding-bride.jpg";
const birthdayPortrait1 = "/images/birthday-portrait-1.jpg";
const birthdayPortrait2 = "/images/birthday-portrait-2.jpg";
const genWed1 = "/images/gen-wedding-1.jpg";
const genWed2 = "/images/gen-wedding-2.jpg";
const genBirth1 = "/images/gen-birthday-1.jpg";
const genEvent1 = "/images/gen-event-1.jpg";

const categories = ["All", "Weddings", "Portraits", "Birthdays", "Events"];

const portfolioImages = [
  { id: 1, src: weddingBride, category: "Weddings", title: "A Short Story of Love" },
  { id: 2, src: birthdayPortrait1, category: "Birthdays", title: "Zarah 25th" },
  { id: 3, src: genWed1, category: "Weddings", title: "Golden Hour Couple" },
  { id: 4, src: birthdayPortrait2, category: "Portraits", title: "Jisola Studio Session" },
  { id: 5, src: weddingDetail, category: "Weddings", title: "The Details" },
  { id: 6, src: genBirth1, category: "Birthdays", title: "Fashion Birthday" },
  { id: 7, src: genWed2, category: "Weddings", title: "Trad Day" },
  { id: 8, src: genEvent1, category: "Events", title: "Evening Reception" },
  { id: 9, src: genWed1, category: "Weddings", title: "Editorial Look" },
  { id: 10, src: genBirth1, category: "Portraits", title: "Soft Light Portrait" },
  { id: 11, src: birthdayPortrait1, category: "Birthdays", title: "Close Up Glam" },
  { id: 12, src: genWed2, category: "Weddings", title: "The Entrance" },
];

export default function Photography() {
  const [activeTab, setActiveTab] = useState("All");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const filteredImages = activeTab === "All" 
    ? portfolioImages 
    : portfolioImages.filter(img => img.category === activeTab);

  return (
    <div className="w-full flex flex-col bg-background pt-12 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-6">Photography</h1>
          <p className="text-muted-foreground font-sans text-lg">
            A visual archive of the moments we've preserved. From intimate portraits to grand celebrations.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-16">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`relative px-6 py-2.5 text-sm font-medium transition-colors ${activeTab === cat ? "text-primary-foreground" : "text-foreground hover:bg-muted"}`}
            >
              {activeTab === cat && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-sm -z-10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          <AnimatePresence>
            {filteredImages.map((img) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative group overflow-hidden break-inside-avoid bg-muted cursor-pointer rounded-sm"
                onClick={() => setSelectedImage(img.id)}
              >
                <img 
                  src={img.src} 
                  alt={img.title} 
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700" 
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-background/0 group-hover:bg-background/80 transition-colors duration-300 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 p-6 text-center">
                  <span className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">{img.category}</span>
                  <h3 className="font-serif text-lg text-foreground">{img.title}</h3>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-12 cursor-pointer"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-5xl w-full h-full flex items-center justify-center cursor-default" onClick={e => e.stopPropagation()}>
              {portfolioImages.map(img => img.id === selectedImage && (
                <img 
                  key={img.id}
                  src={img.src} 
                  alt={img.title} 
                  className="max-w-full max-h-full object-contain"
                />
              ))}
              <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
                <span className="sr-only">Close</span>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
