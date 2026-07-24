import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// All available images for the film strip
const FILM_STRIP_IMAGES = [
  "/images/wedding-bride.jpg",
  "/images/event-1.jpg",
  "/images/food-3.jpg",
  "/images/portrait-studio-1.jpg",
  "/images/product-1.jpg",
  "/images/birthday-portrait-1.jpg",
  "/images/food-2.jpg",
  "/images/event-2.jpg",
  "/images/food-6.jpg",
  "/images/wedding-detail.jpg",
  "/images/event-5.jpg",
  "/images/product-2.jpg",
  "/images/birthday-portrait-2.jpg",
  "/images/food-4.jpg",
  "/images/event-4.jpg",
  "/images/food-5.jpg",
  "/images/product-3.jpg",
  "/images/food-1.jpg",
];

const VIDEOS = [
  { id: 1, title: "The Kafidiyas",        cat: "Wedding Reel",     duration: "4:20", thumb: "/images/wedding-bride.jpg",      src: "/images/client-video-1.mp4" },
  { id: 2, title: "Elevate Boutique",     cat: "Brand Film",       duration: "1:45", thumb: "/images/product-1.jpg",          src: null },
  { id: 3, title: "South Kitchen",        cat: "Commercial Shoot", duration: "2:10", thumb: "/images/food-2.jpg",             src: null },
  { id: 4, title: "The Archers Evening",  cat: "Event Highlight",  duration: "3:10", thumb: "/images/event-1.jpg",            src: null },
  { id: 5, title: "Jisola 30th",          cat: "Birthday Reel",    duration: "1:15", thumb: "/images/birthday-portrait-2.jpg",src: null },
  { id: 6, title: "Aisha & Tobi",         cat: "Wedding Reel",     duration: "5:20", thumb: "/images/wedding-detail.jpg",     src: null },
];

// ─── Custom film cursor ────────────────────────────────────────────────────────
function VideoCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const check = (e: MouseEvent) => setHovering(!!(e.target as HTMLElement).closest(".video-card"));
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", check);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseover", check); };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[100] flex items-center justify-center"
      animate={{ x: pos.x - 32, y: pos.y - 32, opacity: hovering ? 1 : 0, scale: hovering ? 1 : 0.4 }}
      transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.5 }}
    >
      <div className="w-16 h-16 rounded-full bg-[#F0961B] flex items-center justify-center shadow-2xl">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
      </div>
    </motion.div>
  );
}

export default function Videography() {
  const [activeVideo, setActiveVideo] = useState<number | null>(null);

  // Doubled array for seamless loop
  const stripImages = [...FILM_STRIP_IMAGES, ...FILM_STRIP_IMAGES];

  return (
    <div className="w-full flex flex-col bg-[#0d0d0e] min-h-screen overflow-hidden">
      <VideoCursor />

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[80vh] flex items-center justify-center px-6">
        {/* Animated SVG lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.12] z-0" preserveAspectRatio="none">
          <motion.path
            d="M -200 300 Q 400 100 700 500 T 1600 200"
            stroke="#F0961B" strokeWidth="1.5" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 5, ease: "easeInOut" }}
          />
          <motion.path
            d="M -100 600 Q 600 800 900 300 T 1700 700"
            stroke="#F0961B" strokeWidth="1" fill="none" opacity="0.6"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 6.5, ease: "easeInOut", delay: 0.6 }}
          />
          <motion.path
            d="M 200 100 Q 700 400 1000 200 T 1800 400"
            stroke="#5C1A20" strokeWidth="2" fill="none" opacity="0.8"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 8, ease: "easeInOut", delay: 1 }}
          />
        </svg>

        {/* Rotated "FILM" spine text */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 origin-left text-[#FBF6EE] opacity-[0.03] font-serif italic pointer-events-none select-none z-0 tracking-tight"
          style={{ fontSize: "clamp(100px, 22vw, 320px)", writingMode: "vertical-rl", transform: "translateY(-50%) rotate(180deg)" }}
        >
          FILM
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.33, 1, 0.68, 1] }}
            className="font-serif text-7xl md:text-[100px] lg:text-[130px] text-white mb-8 tracking-tight leading-[1.0]"
          >
            We make films.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.9 }}
            className="font-serif italic text-3xl md:text-5xl text-white/30"
          >
            Every frame tells a story worth telling.
          </motion.p>
        </div>
      </section>

      {/* ══ FILM STRIP ════════════════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden bg-[#0d0d0e] my-20">
        {/* Film strip border perforations — top */}
        <div className="w-full h-8 bg-[#111] flex items-center justify-around px-2 z-10 relative">
          {[...Array(50)].map((_, i) => (
            <div key={`t-${i}`} className="w-4 h-4 rounded-sm bg-[#0d0d0e] border border-[#FBF6EE]/8 flex-shrink-0" />
          ))}
        </div>

        {/* Scrolling images */}
        <div className="relative overflow-hidden" style={{ height: "clamp(140px, 22vw, 260px)" }}>
          {/* Forward strip */}
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 45 }}
            className="flex gap-2 px-2 h-full absolute top-0 left-0"
          >
            {stripImages.map((src, i) => (
              <div
                key={`f-${i}`}
                className="relative h-full flex-shrink-0 overflow-hidden"
                style={{ width: "clamp(130px, 20vw, 240px)" }}
              >
                <img
                  src={src}
                  className="h-full w-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105"
                  loading="lazy"
                />
                {/* Scan line effect */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
                  }}
                />
              </div>
            ))}
          </motion.div>
        </div>

        {/* Film strip border perforations — bottom */}
        <div className="w-full h-8 bg-[#111] flex items-center justify-around px-2 z-10 relative">
          {[...Array(50)].map((_, i) => (
            <div key={`b-${i}`} className="w-4 h-4 rounded-sm bg-[#0d0d0e] border border-[#FBF6EE]/8 flex-shrink-0" />
          ))}
        </div>
      </section>

      {/* ══ PROJECTS GRID ═════════════════════════════════════════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full py-12 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
          {VIDEOS.map((vid, i) => (
            <motion.div
              key={vid.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: (i % 2) * 0.15, duration: 0.8 }}
              className="video-card group cursor-pointer flex flex-col"
              onClick={() => setActiveVideo(vid.id)}
            >
              <div className="relative w-full aspect-video overflow-hidden bg-black mb-8 border border-white/5 group-hover:border-[#F0961B]/20 transition-colors duration-700 rounded-sm">
                <img
                  src={vid.thumb}
                  alt={vid.title}
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transform group-hover:scale-[1.04] transition-all duration-1000 ease-out"
                />

                {/* Animated play ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div className="relative w-20 h-20 lg:w-28 lg:h-28" initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}>
                    <svg className="absolute inset-0 w-full h-full text-[#F0961B] -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
                      <motion.circle
                        cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="2" fill="none"
                        strokeDasharray="289.03"
                        initial={{ strokeDashoffset: 289.03 }}
                        whileHover={{ strokeDashoffset: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </motion.div>
                </div>

                <div className="absolute top-5 left-5 bg-black/70 backdrop-blur-sm px-4 py-1.5 rounded-sm border border-white/10">
                  <span className="text-[#F0961B] text-[9px] uppercase font-bold tracking-[0.25em]">{vid.cat}</span>
                </div>
                <div className="absolute bottom-5 right-5 text-white/80 font-mono text-xs tracking-widest bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-sm">
                  {vid.duration}
                </div>

                {/* Amber glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ boxShadow: "inset 0 0 60px rgba(240,150,27,0.08)" }}
                />
              </div>

              <div>
                <h3 className="font-serif text-4xl text-white/90 group-hover:text-white transition-colors mb-3">{vid.title}</h3>
                <motion.span
                  className="text-[#F0961B] text-[9px] uppercase tracking-[0.35em] font-bold block"
                  initial={{ opacity: 0, y: 4 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {vid.src ? "Watch Film" : "Film coming soon"}
                </motion.span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ SERVICES STRIP ════════════════════════════════════════════════════ */}
      <div className="w-full bg-[#5C1A20] py-16 lg:py-20 overflow-hidden border-y border-white/10 mt-12">
        <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ ease: "linear", duration: 38, repeat: Infinity }} className="flex whitespace-nowrap">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-[#FBF6EE] text-5xl md:text-6xl px-10 flex items-center gap-16 font-serif italic">
              <span>Wedding Films</span> <span className="text-[#F0961B] opacity-40">·</span>
              <span>Brand Commercials</span> <span className="text-[#F0961B] opacity-40">·</span>
              <span>Event Highlights</span> <span className="text-[#F0961B] opacity-40">·</span>
              <span>Birthday Reels</span> <span className="text-[#F0961B] opacity-40">·</span>
              <span>Product Videos</span> <span className="text-[#F0961B] opacity-40">·</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ══ MODAL ═════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activeVideo !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a] p-0"
          >
            {/* Letterbox bars */}
            <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} exit={{ scaleY: 0 }} transition={{ duration: 0.4 }} className="absolute top-0 w-full bg-black z-20 origin-top" style={{ height: "10vh" }} />
            <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} exit={{ scaleY: 0 }} transition={{ duration: 0.4 }} className="absolute bottom-0 w-full bg-black z-20 origin-bottom flex items-center justify-between px-8 md:px-16" style={{ height: "10vh" }}>
              <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6">
                <span className="text-[#F0961B] text-[9px] font-bold uppercase tracking-[0.3em]">
                  {VIDEOS.find(v => v.id === activeVideo)?.cat}
                </span>
                <span className="text-white font-serif text-xl md:text-2xl">
                  {VIDEOS.find(v => v.id === activeVideo)?.title}
                </span>
              </div>
            </motion.div>

            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-6 lg:right-12 text-white/50 hover:text-white z-30 transition-colors"
              style={{ top: "2vh" }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="w-full flex items-center justify-center" style={{ height: "80vh", paddingTop: "10vh", paddingBottom: "10vh" }}>
              {(() => {
                const vid = VIDEOS.find(v => v.id === activeVideo);
                return vid?.src ? (
                  <video
                    key={vid.id}
                    src={vid.src}
                    controls
                    autoPlay
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-white/20">
                    <div className="w-24 h-24 border border-white/10 rounded-full flex items-center justify-center mb-8">
                      <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                    <p className="font-serif text-2xl mb-3">Film coming soon</p>
                    <p className="text-xs uppercase tracking-[0.3em] opacity-60">Connect with us to see the full film</p>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
