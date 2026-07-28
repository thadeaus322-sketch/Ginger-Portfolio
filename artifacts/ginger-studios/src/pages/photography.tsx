import { img } from "@/lib/assets";
import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

// ─── Category config ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all",      label: "All",      accent: "#F0961B" },
  { id: "weddings", label: "Weddings", accent: "#e85d75" },
  { id: "portraits",label: "Portraits",accent: "#7c6de0" },
  { id: "events",   label: "Events",   accent: "#38bdf8" },
  { id: "food",     label: "Food",     accent: "#4ade80" },
  { id: "products", label: "Products", accent: "#fb923c" },
  { id: "birthday", label: "Birthday", accent: "#f472b6" },
];

// ─── Portfolio data ───────────────────────────────────────────────────────────
const PORTFOLIO = [
  // Weddings
  { id:  1, src: img("images/wedding-bride.jpg"),     category: "weddings", title: "A Short Story of Love",      tall: true  },
  { id:  2, src: img("images/wedding-detail.jpg"),    category: "weddings", title: "The Details",               tall: false },

  // Portraits
  { id:  3, src: img("images/portrait-studio-1.jpg"), category: "portraits",title: "Majestic in Her Own Way",    tall: true  },
  { id:  4, src: img("images/birthday-portrait-2.jpg"),category:"portraits",title: "Jisola Studio Session",     tall: false },

  // Events
  { id:  5, src: img("images/event-1.jpg"),           category: "events",   title: "The Archers Evening",       tall: true  },
  { id:  6, src: img("images/event-2.jpg"),           category: "events",   title: "Christmas at The Archers",  tall: false },
  { id:  7, src: img("images/event-4.jpg"),           category: "events",   title: "Arriving in Style",         tall: false },
  { id:  8, src: img("images/event-5.jpg"),           category: "events",   title: "The Art Hotel",             tall: false },

  // Food
  { id:  9, src: img("images/food-1.jpg"),            category: "food",     title: "Fufu & Egusi",              tall: false },
  { id: 10, src: img("images/food-2.jpg"),            category: "food",     title: "Feast of the Season",       tall: true  },
  { id: 11, src: img("images/food-3.jpg"),            category: "food",     title: "Jollof & Suya",             tall: false },
  { id: 12, src: img("images/food-4.jpg"),            category: "food",     title: "The Full Plate",            tall: false },
  { id: 13, src: img("images/food-5.jpg"),            category: "food",     title: "Grilled Wings Board",       tall: false },
  { id: 14, src: img("images/food-6.jpg"),            category: "food",     title: "Ribs & Fries",              tall: true  },

  // Products
  { id: 15, src: img("images/product-1.jpg"),         category: "products", title: "OkunRiin Men's Skincare",   tall: true  },
  { id: 16, src: img("images/product-2.jpg"),         category: "products", title: "Hair Care Series",          tall: false },
  { id: 17, src: img("images/product-3.jpg"),         category: "products", title: "Hair Softener — Single",   tall: false },

  // Birthday
  { id: 18, src: img("images/birthday-portrait-1.jpg"),category:"birthday", title: "Zarah's 25th",             tall: true  },
  { id: 19, src: img("images/birthday-portrait-2.jpg"),category:"birthday", title: "Jisola xo",                tall: false },
];

type Item = typeof PORTFOLIO[number];

function getCatMeta(id: string) {
  return CATEGORIES.find(c => c.id === id) ?? CATEGORIES[0];
}

// ─── Gallery Card ─────────────────────────────────────────────────────────────
function GalleryCard({ item, onClick }: { item: Item; onClick: () => void }) {
  const cat = getCatMeta(item.category);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative group overflow-hidden break-inside-avoid cursor-pointer"
      style={{ borderRadius: 14, marginBottom: 18 }}
      onClick={onClick}
    >
      <img
        src={item.src}
        alt={item.title}
        className="w-full object-cover"
        style={{ display: "block", aspectRatio: item.tall ? "3/4" : "4/3" }}
        loading="lazy"
      />

      {/* Hover overlay */}
      <div
        className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "linear-gradient(to top, rgba(33,28,23,0.92) 0%, rgba(33,28,23,0.2) 55%, transparent 100%)" }}
      >
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1.5 block" style={{ color: cat.accent }}>
          {cat.label}
        </span>
        <h3 className="font-serif text-base text-white leading-tight">{item.title}</h3>
      </div>

      {/* Category dot */}
      <div className="absolute top-3 left-3 w-2 h-2 rounded-full" style={{ background: cat.accent }} />
    </motion.div>
  );
}

// ─── Category Card Stack ──────────────────────────────────────────────────────
function CategoryCardStack({ items }: { items: Item[] }) {
  const [front, setFront] = useState(0);
  const total = items.length;

  if (total === 0) return (
    <div className="text-center py-24 text-muted-foreground">
      <p className="font-serif text-2xl mb-2">Coming soon</p>
      <p className="text-sm">We're adding more work in this category.</p>
    </div>
  );

  const next = () => setFront(i => (i + 1) % total);
  const prev = () => setFront(i => (i - 1 + total) % total);

  const orderedItems = Array.from({ length: Math.min(total, 4) }, (_, i) => items[(front + i) % total]);

  return (
    <div className="flex flex-col items-center py-16">
      <div
        className="relative cursor-pointer select-none"
        style={{ width: "min(500px, 90vw)", height: "min(660px, 85vw)" }}
        onClick={next}
      >
        {orderedItems.map((item, i) => {
          const isTop = i === 0;
          const rotations = [0, -6, -2, 4];
          return (
            <motion.div
              key={item.id}
              layout
              initial={false}
              animate={{
                scale: 1 - i * 0.035,
                y: i * 18,
                rotate: isTop ? 0 : rotations[i],
                zIndex: 4 - i,
              }}
              whileHover={isTop ? { scale: 1.02, y: -10 } : {}}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="absolute inset-0 rounded-2xl overflow-hidden"
              style={{
                boxShadow: isTop
                  ? "0 40px 80px -12px rgba(33,28,23,0.5), 0 0 0 1px rgba(240,150,27,0.1)"
                  : "0 10px 30px -8px rgba(33,28,23,0.3)",
              }}
            >
              <img src={item.src} alt={item.title} className="w-full h-full object-cover" draggable={false} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#211C17]/90 via-transparent to-transparent" />
              {isTop && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-10 left-10 right-10"
                >
                  <p className="text-[#F0961B] text-[11px] font-bold tracking-[0.22em] uppercase mb-3">
                    {getCatMeta(item.category).label}
                  </p>
                  <p className="text-white font-serif text-3xl leading-tight">{item.title}</p>
                  <p className="text-white/40 text-xs uppercase tracking-[0.2em] mt-4 font-bold">
                    {front + 1} / {total} — Tap to browse
                  </p>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-6 mt-16">
        <button
          onClick={prev}
          className="w-12 h-12 rounded-full border border-[#211C17]/20 flex items-center justify-center hover:bg-[#F0961B] hover:border-[#F0961B] hover:text-white transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex gap-2">
          {items.map((_, i) => (
            <motion.div
              key={i}
              animate={{ width: i === front ? 24 : 6, background: i === front ? "#F0961B" : "#211C1730" }}
              className="h-1.5 rounded-full cursor-pointer"
              onClick={() => setFront(i)}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="w-12 h-12 rounded-full border border-[#211C17]/20 flex items-center justify-center hover:bg-[#F0961B] hover:border-[#F0961B] hover:text-white transition-all"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Photography() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const filtered = activeCategory === "all"
    ? PORTFOLIO
    : PORTFOLIO.filter(i => i.category === activeCategory);

  const activeMeta = getCatMeta(activeCategory);

  const openLightbox = (id: number) => {
    const idx = filtered.findIndex(i => i.id === id);
    setLightboxIdx(idx);
  };
  const prev = () => setLightboxIdx(i => (i! - 1 + filtered.length) % filtered.length);
  const next = () => setLightboxIdx(i => (i! + 1) % filtered.length);

  const categoryCounts: Record<string, number> = {};
  PORTFOLIO.forEach(item => {
    categoryCounts[item.category] = (categoryCounts[item.category] ?? 0) + 1;
  });
  const allCount = PORTFOLIO.length;

  return (
    <div className="w-full flex flex-col bg-[#FBF6EE] pt-16 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 w-full">

        {/* ── Header ── */}
        <div className="mb-12">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span
              className="inline-flex items-center gap-2 text-[11px] font-sans tracking-[0.2em] uppercase font-bold mb-4 block"
              style={{ color: activeMeta.accent }}
            >
              <span className="w-6 h-px inline-block" style={{ background: activeMeta.accent }} />
              Portfolio
            </span>
            <h1 className="font-serif text-7xl md:text-8xl text-[#211C17] mb-3 leading-none">Photography</h1>
            {/* Animated underline */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "40%" }}
              transition={{ duration: 1, delay: 0.3, ease: [0.76, 0, 0.24, 1] }}
              className="h-[3px] mb-6"
              style={{ background: activeMeta.accent }}
            />
            <p className="text-[#211C17]/60 font-sans text-lg max-w-xl">
              A visual archive of life's most meaningful moments — from intimate portraits
              to grand celebrations, across every season.
            </p>
          </motion.div>
        </div>

        {/* ── Filter Tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="flex flex-wrap gap-2 mb-14"
        >
          <LayoutGroup id="photo-filters">
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat.id;
              const count = cat.id === "all" ? allCount : (categoryCounts[cat.id] ?? 0);
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="relative px-5 py-2.5 text-sm font-bold transition-colors rounded-full overflow-hidden flex items-center gap-2"
                  style={{ color: isActive ? "#fff" : "#211C17" }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activePhotoTab"
                      className="absolute inset-0 rounded-full"
                      style={{ background: cat.accent }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 uppercase tracking-widest text-xs">{cat.label}</span>
                  <span
                    className="relative z-10 text-[10px] font-bold tabular-nums rounded-full px-1.5 py-0.5"
                    style={{ background: isActive ? "rgba(255,255,255,0.25)" : "rgba(33,28,23,0.1)" }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </LayoutGroup>
        </motion.div>

        {/* ── Gallery: Card Stack for specific categories, Masonry for All ── */}
        {activeCategory === "all" ? (
          <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map(item => (
                <GalleryCard key={item.id} item={item} onClick={() => openLightbox(item.id)} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <CategoryCardStack items={filtered} />
            {filtered.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-2 flex items-center gap-2 text-[#211C17]/60 text-sm font-sans"
              >
                <ArrowRight size={14} />
                <span>Click the card or arrows to browse all {filtered.length} photos</span>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0d0e]/97"
            style={{ backdropFilter: "blur(16px) saturate(50%)" }}
          >
            <button
              className="absolute top-5 right-5 text-white/60 hover:text-white z-10 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center transition-colors"
              onClick={() => setLightboxIdx(null)}
            >
              <X size={20} />
            </button>
            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/40 text-sm font-sans">
              {lightboxIdx + 1} / {filtered.length}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={lightboxIdx}
                initial={{ opacity: 0, scale: 0.93, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.28 }}
                className="relative max-w-4xl w-full mx-16 flex items-center justify-center"
              >
                <img
                  src={filtered[lightboxIdx]?.src}
                  alt={filtered[lightboxIdx]?.title}
                  className="max-h-[80vh] max-w-full object-contain rounded-xl"
                />
                <div className="absolute bottom-4 left-4">
                  <span
                    className="text-[10px] uppercase tracking-[0.2em] font-bold block mb-1"
                    style={{ color: getCatMeta(filtered[lightboxIdx]?.category ?? "all").accent }}
                  >
                    {getCatMeta(filtered[lightboxIdx]?.category ?? "all").label}
                  </span>
                  <p className="text-white font-serif text-lg">{filtered[lightboxIdx]?.title}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <button onClick={prev} className="absolute left-4 text-white/60 hover:text-white w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <ChevronLeft size={24} />
            </button>
            <button onClick={next} className="absolute right-4 text-white/60 hover:text-white w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <ChevronRight size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
