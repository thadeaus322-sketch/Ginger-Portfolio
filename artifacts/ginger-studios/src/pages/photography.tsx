import { useState, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

const weddingDetail = "/images/wedding-detail.jpg";
const weddingBride = "/images/wedding-bride.jpg";
const birthdayPortrait1 = "/images/birthday-portrait-1.jpg";
const birthdayPortrait2 = "/images/birthday-portrait-2.jpg";

const CATEGORIES = ["All", "Events", "Food", "Products", "Portraits", "Weddings", "Grad", "Birthday"];

const GRADIENT_STYLES = {
  Events: { bg: "#0B192C", fg: "#F0961B" },
  Food: { bg: "#232619", fg: "#FBF6EE" },
  Products: { bg: "#1F2326", fg: "#FFFFFF" },
  Grad: { bg: "#361B2B", fg: "#E6B8D6" },
} as const;

const PORTFOLIO = [
  { id: 1, cat: "Weddings", src: weddingBride, title: "A Short Story of Love", tall: true },
  { id: 2, cat: "Weddings", src: weddingDetail, title: "The Details", tall: false },
  { id: 3, cat: "Portraits", src: birthdayPortrait2, title: "Jisola Studio Session", tall: true },
  { id: 4, cat: "Birthday", src: birthdayPortrait1, title: "Zarah's 25th", tall: false },
  { id: 5, cat: "Weddings", src: weddingBride, title: "Golden Hour", tall: false },
  { id: 6, cat: "Portraits", src: birthdayPortrait1, title: "Soft Light Series", tall: false },
  { id: 7, cat: "Birthday", src: birthdayPortrait2, title: "Glam Close Up", tall: true },
  { id: 8, cat: "Events", gradient: "Events", title: "Evening Gala Highlight", tall: false },
  { id: 9, cat: "Events", gradient: "Events", title: "Awards Night", tall: true },
  { id: 10, cat: "Food", gradient: "Food", title: "Farm-to-Table", tall: false },
  { id: 11, cat: "Food", gradient: "Food", title: "Menu Shoot", tall: true },
  { id: 12, cat: "Products", gradient: "Products", title: "Studio Lookbook", tall: false },
  { id: 13, cat: "Products", gradient: "Products", title: "Brand Launch", tall: true },
  { id: 14, cat: "Grad", gradient: "Grad", title: "Class of 2026", tall: false },
  { id: 15, cat: "Grad", gradient: "Grad", title: "Senior Portraits", tall: true },
];

function GradientFill({ cat }: { cat: string }) {
  const style = GRADIENT_STYLES[cat as keyof typeof GRADIENT_STYLES];
  if (!style) return <div className="absolute inset-0 bg-[#211C17]" />;
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: style.bg }}>
      {cat === 'Events' && <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, ${style.fg} 1.5px, transparent 0)`, backgroundSize: '24px 24px' }} />}
      {cat === 'Food' && <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ filter: "url(#noiseFilter)" }} />}
      {cat === 'Products' && <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `linear-gradient(45deg, ${style.fg} 1px, transparent 1px)`, backgroundSize: '16px 16px' }} />}
      {cat === 'Grad' && <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(${style.fg} 2px, transparent 2px)`, backgroundSize: '48px 48px' }} />}
    </div>
  );
}

function CategoryStack({ items, openLightbox }: { items: typeof PORTFOLIO, openLightbox: (id: number) => void }) {
  const stackItems = items.length >= 4 ? items.slice(0, 4) : [...items, ...items, ...items, ...items].slice(0, 4);
  const [frontId, setFrontId] = useState(stackItems[0].id);
  
  useEffect(() => { setFrontId(stackItems[0].id); }, [items]);

  const frontIndex = stackItems.findIndex(c => c.id === frontId);
  const orderedCards = [...stackItems.slice(frontIndex), ...stackItems.slice(0, frontIndex)];

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFrontId(orderedCards[1].id);
  };

  return (
    <div className="flex flex-col items-center py-10 lg:py-20 w-full">
      <div className="relative w-[340px] md:w-[500px] h-[480px] md:h-[660px] cursor-pointer" onClick={() => openLightbox(frontId)}>
        {orderedCards.map((c, i) => {
          const isTop = i === 0;
          const rotations = [0, -6, 4, -3];
          const rotation = isTop ? 0 : rotations[i % rotations.length];
          
          return (
            <motion.div
              key={`${c.id}-${i}`}
              layout
              initial={false}
              animate={{ 
                scale: isTop ? 1 : 1 - (i * 0.05),
                y: isTop ? 0 : i * 24,
                rotate: rotation,
                zIndex: stackItems.length - i
              }}
              whileHover={isTop ? { scale: 1.02, y: -10 } : {}}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute inset-0 bg-[#211C17] rounded-xl shadow-2xl p-4 md:p-6"
              style={{ boxShadow: isTop ? "0 40px 80px -20px rgba(0,0,0,0.5)" : "0 10px 30px -10px rgba(0,0,0,0.3)" }}
            >
              <div className="relative w-full h-full overflow-hidden rounded-lg">
                {c.src ? (
                  <img src={c.src} alt={c.title} className="w-full h-full object-cover" draggable={false} />
                ) : (
                  <GradientFill cat={c.cat} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 md:opacity-100" />
                {isTop && (
                  <button onClick={next} className="absolute top-4 right-4 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors">
                    <ArrowRight size={20} />
                  </button>
                )}
                <div className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#211C17] to-transparent transition-opacity duration-300 ${isTop ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="text-[#F0961B] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">{c.cat}</div>
                  <div className="text-[#FBF6EE] font-serif text-3xl">{c.title}</div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
      <div className="mt-20 md:mt-24 font-sans text-[#211C17]/60 font-semibold tracking-[0.2em] text-sm uppercase">
        {frontIndex + 1} / {stackItems.length}
      </div>
    </div>
  )
}

export default function Photography() {
  const [activeCat, setActiveCat] = useState("All");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const filtered = activeCat === "All" ? PORTFOLIO : PORTFOLIO.filter(i => i.cat === activeCat);

  const openLightbox = (id: number) => {
    const idx = filtered.findIndex(i => i.id === id);
    if (idx !== -1) setLightboxIdx(idx);
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#FBF6EE]">
      <svg className="hidden">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
      </svg>
      
      <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-12 pt-24 md:pt-32 pb-24">
        
        {/* Header */}
        <div className="mb-24">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="font-serif text-7xl md:text-8xl lg:text-[140px] text-[#211C17] relative inline-block mb-10 leading-none tracking-tight"
          >
            Photography
            <motion.div 
              initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
              className="absolute -bottom-2 md:-bottom-4 left-0 h-[2px] md:h-[4px] bg-[#F0961B]" 
            />
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="font-serif italic text-2xl md:text-4xl text-[#211C17]/50 max-w-2xl leading-relaxed"
          >
            A visual archive of life's most important moments.
          </motion.p>
        </div>

        {/* Filters */}
        <LayoutGroup>
          <div className="flex flex-wrap gap-3 md:gap-4 mb-24">
            {CATEGORIES.map(cat => {
              const isActive = activeCat === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  className={`relative px-6 md:px-8 py-3 md:py-4 rounded-full text-xs md:text-sm font-sans tracking-[0.15em] uppercase font-bold transition-colors ${isActive ? 'text-white' : 'text-[#211C17]/60 hover:text-[#211C17] hover:bg-[#211C17]/5'}`}
                >
                  {isActive && (
                    <motion.div layoutId="pill" className="absolute inset-0 bg-[#F0961B] rounded-full z-0" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                  )}
                  <span className="relative z-10 flex items-center gap-3">
                    {cat}
                    <span className={`opacity-80 text-[10px] bg-white/20 px-2 py-0.5 rounded-full ${!isActive && 'bg-[#211C17]/10'}`}>
                      {cat === "All" ? PORTFOLIO.length : PORTFOLIO.filter(p => p.cat === cat).length}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </LayoutGroup>

        {/* Gallery Display */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeCat}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
          >
            {activeCat === "All" ? (
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
                {filtered.map(item => (
                  <div key={item.id} onClick={() => openLightbox(item.id)} className="relative group mb-6 overflow-hidden bg-[#211C17] rounded-xl cursor-pointer" style={{ aspectRatio: item.tall ? '3/4' : '4/3' }}>
                    {item.src ? (
                      <img src={item.src} alt={item.title} className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" loading="lazy" />
                    ) : (
                      <GradientFill cat={item.cat} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#211C17]/90 via-[#211C17]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                      <span className="text-[#F0961B] text-[10px] uppercase tracking-[0.2em] font-bold mb-3">{item.cat}</span>
                      <h3 className="text-[#FBF6EE] font-serif text-2xl leading-tight transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{item.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <CategoryStack items={filtered} openLightbox={openLightbox} />
            ) : (
              <div className="py-40 text-center text-[#211C17]/30 font-serif text-3xl italic">No photos in this category yet.</div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#211C17]/95"
            style={{ backdropFilter: "blur(16px) saturate(50%)" }}
          >
            <button onClick={() => setLightboxIdx(null)} className="absolute top-6 right-6 w-14 h-14 flex items-center justify-center text-white/50 hover:text-white transition-colors z-10 bg-white/5 hover:bg-white/10 rounded-full">
              <X size={28} />
            </button>
            
            <div className="absolute top-10 left-1/2 -translate-x-1/2 text-white/40 font-sans tracking-[0.3em] font-bold text-xs uppercase">
              {lightboxIdx + 1} / {filtered.length}
            </div>

            <motion.div 
              key={lightboxIdx}
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} transition={{ type: "spring", damping: 25 }}
              className="relative max-w-6xl w-full mx-auto p-4 md:p-16 flex flex-col items-center"
            >
              {filtered[lightboxIdx].src ? (
                <img src={filtered[lightboxIdx].src} className="max-h-[75vh] w-auto object-contain shadow-2xl rounded-sm" />
              ) : (
                <div className="w-full max-w-3xl aspect-[4/3] relative shadow-2xl rounded-sm overflow-hidden">
                  <GradientFill cat={filtered[lightboxIdx].cat} />
                </div>
              )}
              <div className="mt-10 text-center">
                <span className="text-[#F0961B] text-[11px] tracking-[0.3em] uppercase font-bold block mb-4">{filtered[lightboxIdx].cat}</span>
                <h2 className="text-[#FBF6EE] font-serif text-4xl">{filtered[lightboxIdx].title}</h2>
              </div>
            </motion.div>

            <button onClick={() => setLightboxIdx(i => (i! - 1 + filtered.length) % filtered.length)} className="absolute left-6 lg:left-12 top-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full">
              <ArrowLeft size={32} />
            </button>
            <button onClick={() => setLightboxIdx(i => (i! + 1) % filtered.length)} className="absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full">
              <ArrowRight size={32} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}