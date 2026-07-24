import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const VIDEO_SRC = "/images/client-video-1.mp4";

const PROJECTS = [
  { id: 1, title: "The Kafidiyas",       cat: "Wedding Film",     duration: "4:20", year: "2025", src: VIDEO_SRC, frame: "001" },
  { id: 2, title: "Elevate Boutique",    cat: "Brand Commercial", duration: "1:45", year: "2025", src: null,      frame: "002" },
  { id: 3, title: "South Kitchen",       cat: "Commercial Shoot", duration: "2:10", year: "2024", src: null,      frame: "003" },
  { id: 4, title: "The Archers Evening", cat: "Event Highlight",  duration: "3:10", year: "2025", src: null,      frame: "004" },
  { id: 5, title: "Jisola 30th",         cat: "Birthday Reel",    duration: "1:15", year: "2025", src: null,      frame: "005" },
  { id: 6, title: "Aisha & Tobi",        cat: "Wedding Film",     duration: "5:20", year: "2024", src: null,      frame: "006" },
];

// ─── Film grain overlay ───────────────────────────────────────────────────────
function Grain() {
  return (
    <>
      <svg className="hidden">
        <defs>
          <filter id="noise" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="linearRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.80" numOctaves="4" seed="2" stitchTiles="stitch" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="grey" />
            <feBlend in="SourceGraphic" in2="grey" mode="overlay" result="blend" />
            <feComposite in="blend" in2="SourceGraphic" operator="in" />
          </filter>
        </defs>
      </svg>
      <motion.div
        className="absolute inset-0 pointer-events-none z-10 opacity-[0.28]"
        style={{ filter: "url(#noise)" }}
        animate={{ opacity: [0.22, 0.32, 0.22] }}
        transition={{ repeat: Infinity, duration: 0.12, ease: "linear" }}
      >
        <div className="w-full h-full bg-[#111]" />
      </motion.div>
    </>
  );
}

// ─── Scanlines ────────────────────────────────────────────────────────────────
function Scanlines() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-10 opacity-20"
      style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.4) 3px, rgba(0,0,0,0.4) 4px)",
      }}
    />
  );
}

// ─── Film perforations strip ───────────────────────────────────────────────────
function FilmPerfs({ side = "left", count = 18 }: { side?: "left" | "right"; count?: number }) {
  return (
    <div className={`absolute top-0 bottom-0 ${side === "left" ? "left-0" : "right-0"} w-10 z-20 bg-black flex flex-col justify-around items-center py-4`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="w-5 h-7 rounded-[3px] bg-[#0d0d0e] border border-[#2a2a2a]" />
      ))}
    </div>
  );
}

// ─── Custom play cursor ───────────────────────────────────────────────────────
function PlayCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const over = (e: MouseEvent) => setHovering(!!(e.target as HTMLElement).closest(".project-card"));
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseover", over); };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[200] flex items-center justify-center mix-blend-difference"
      animate={{ x: pos.x - 36, y: pos.y - 36, opacity: hovering ? 1 : 0, scale: hovering ? 1 : 0.3 }}
      transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.4 }}
    >
      <div className="w-[72px] h-[72px] rounded-full bg-[#F0961B] flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
      </div>
    </motion.div>
  );
}

// ─── Video hero ───────────────────────────────────────────────────────────────
function VideoHero({ onWatch }: { onWatch: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <section className="relative w-full overflow-hidden" style={{ height: "100svh" }}>
      {/* Perforations on both sides */}
      <FilmPerfs side="left" count={20} />
      <FilmPerfs side="right" count={20} />

      {/* Video background */}
      <div className="absolute inset-x-10 inset-y-0 overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover opacity-60"
        />
        {/* Cinematic vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
      </div>

      {/* Letterbox bars */}
      <div className="absolute top-0 inset-x-10 h-[8vh] bg-black z-20" />
      <div className="absolute bottom-0 inset-x-10 h-[8vh] bg-black z-20" />

      <Grain />
      <Scanlines />

      {/* REC indicator */}
      <motion.div
        className="absolute top-[10vh] left-[72px] z-30 flex items-center gap-2"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
      >
        <div className="w-2 h-2 rounded-full bg-[#F0961B]" />
        <span className="text-white/70 font-mono text-[10px] tracking-[0.25em]">REC</span>
      </motion.div>

      {/* Frame counter */}
      <div className="absolute top-[10vh] right-[72px] z-30 font-mono text-[10px] text-white/40 tracking-[0.2em] flex flex-col items-end gap-1">
        <span>001 / 006</span>
        <span className="text-[8px]">GVS · ISO 800</span>
      </div>

      {/* Hero text */}
      <div className="absolute inset-x-10 top-0 bottom-0 flex flex-col justify-center px-16 lg:px-28 z-30">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="text-[#F0961B] font-mono text-[10px] tracking-[0.4em] mb-6 uppercase">
            Ginger Studios · Motion Films
          </div>
          <h1 className="font-serif text-white leading-[0.92] tracking-tight"
            style={{ fontSize: "clamp(60px, 11vw, 160px)" }}>
            We make<br />
            <em className="not-italic text-[#F0961B]">films.</em>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.9 }}
            className="mt-8 font-serif italic text-white/40 text-xl md:text-3xl max-w-md"
          >
            Every frame. Every feeling. Every second — preserved.
          </motion.p>
        </motion.div>

        {/* Watch CTA */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          onClick={onWatch}
          className="mt-14 w-fit group flex items-center gap-5 text-white"
        >
          <div className="w-16 h-16 rounded-full border border-[#F0961B]/50 flex items-center justify-center group-hover:bg-[#F0961B] group-hover:border-[#F0961B] transition-all duration-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </div>
          <span className="font-serif text-lg group-hover:text-[#F0961B] transition-colors">
            Watch The Kafidiyas — 4:20
          </span>
        </motion.button>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-[10vh] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-[#F0961B] to-transparent" />
        <span className="font-mono text-[9px] text-white/30 tracking-[0.3em] uppercase">Scroll</span>
      </motion.div>
    </section>
  );
}

// ─── Pure CSS film strip (no images) ─────────────────────────────────────────
function FilmStrip() {
  const frames = [
    "WEDDING · 2025", "BRAND FILM · 2025", "COMMERCIAL · 2024",
    "EVENT · 2025", "PORTRAIT · 2025", "BIRTHDAY · 2025",
    "WEDDING · 2024", "BRAND FILM · 2024", "COMMERCIAL · 2025",
    "EVENT · 2024", "PORTRAIT · 2024", "BIRTHDAY · 2024",
  ];

  const doubled = [...frames, ...frames];

  return (
    <section className="relative w-full overflow-hidden bg-black border-y border-[#1a1a1a] my-16 lg:my-28">
      {/* Top perforations */}
      <div className="w-full h-9 bg-[#111] border-b border-[#222] flex items-center justify-around px-2">
        {[...Array(60)].map((_, i) => (
          <div key={i} className="w-4 h-5 rounded-[2px] bg-black border border-[#333] flex-shrink-0" />
        ))}
      </div>

      {/* Scrolling film frames */}
      <div className="relative overflow-hidden" style={{ height: "clamp(100px, 14vw, 180px)" }}>
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 55 }}
          className="flex h-full absolute top-0 left-0"
        >
          {doubled.map((label, i) => (
            <div
              key={i}
              className="flex-shrink-0 h-full relative flex flex-col items-center justify-center border-r border-[#1e1e1e]"
              style={{ width: "clamp(120px, 16vw, 200px)" }}
            >
              {/* Frame grain */}
              <div className="absolute inset-0 bg-[#0a0a0a] opacity-80" />
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: "radial-gradient(circle at 50% 50%, #F0961B 0.5px, transparent 0.5px)",
                  backgroundSize: "8px 8px",
                }}
              />
              {/* Frame number */}
              <span className="relative z-10 font-mono text-[#F0961B]/20 text-3xl font-bold leading-none mb-1">
                {String(i % 12 + 1).padStart(4, "0")}
              </span>
              <span className="relative z-10 font-mono text-[8px] text-white/20 tracking-[0.2em] uppercase text-center px-2">
                {label}
              </span>
              {/* Scanline */}
              <div className="absolute inset-0 pointer-events-none opacity-20"
                style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 3px)" }}
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom perforations */}
      <div className="w-full h-9 bg-[#111] border-t border-[#222] flex items-center justify-around px-2">
        {[...Array(60)].map((_, i) => (
          <div key={i} className="w-4 h-5 rounded-[2px] bg-black border border-[#333] flex-shrink-0" />
        ))}
      </div>
    </section>
  );
}

// ─── Project card ─────────────────────────────────────────────────────────────
function ProjectCard({ project, index, onClick }: { project: typeof PROJECTS[0]; index: number; onClick: () => void }) {
  const isFeatured = index === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: (index % 2) * 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className={`project-card group cursor-pointer ${isFeatured ? "md:col-span-2" : ""}`}
      onClick={onClick}
    >
      {/* Aspect container */}
      <div
        className={`relative w-full overflow-hidden bg-[#080808] border border-[#1a1a1a] group-hover:border-[#F0961B]/30 transition-all duration-700 ${isFeatured ? "aspect-video" : "aspect-[4/3]"}`}
      >
        {/* If featured and has src, show live silent video */}
        {isFeatured && project.src && (
          <video
            src={project.src}
            muted
            loop
            playsInline
            autoPlay
            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 scale-105 group-hover:scale-100 transition-all duration-[2s] ease-out"
          />
        )}

        {/* Dark cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-transparent to-black/90 z-10" />

        {/* Film grain always on */}
        <div
          className="absolute inset-0 z-10 opacity-20 pointer-events-none"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 3px)" }}
        />

        {/* Dot texture for non-featured */}
        {!isFeatured && (
          <div
            className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #F0961B 0.8px, transparent 0.8px)", backgroundSize: "12px 12px" }}
          />
        )}

        {/* Frame number top-left */}
        <div className="absolute top-5 left-5 z-20 font-mono text-white/20 text-sm tracking-widest">
          {project.frame}
        </div>

        {/* Category top-right */}
        <div className="absolute top-5 right-5 z-20 bg-black/60 backdrop-blur-sm px-3 py-1.5 border border-white/10">
          <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#F0961B]">{project.cat}</span>
        </div>

        {/* Play ring */}
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <motion.div
            className="relative"
            initial={{ opacity: 0.4, scale: 0.9 }}
            whileHover={{ opacity: 1, scale: 1 }}
          >
            {project.src ? (
              <div className={`${isFeatured ? "w-24 h-24" : "w-16 h-16"} rounded-full border border-[#F0961B]/40 group-hover:border-[#F0961B] group-hover:bg-[#F0961B]/10 flex items-center justify-center transition-all duration-500`}>
                <svg width={isFeatured ? 28 : 18} height={isFeatured ? 28 : 18} viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            ) : (
              <div className={`${isFeatured ? "w-24 h-24" : "w-16 h-16"} rounded-full border border-white/10 flex items-center justify-center`}>
                <svg width={isFeatured ? 22 : 16} height={isFeatured ? 22 : 16} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9 12h6M12 9v6"/>
                </svg>
              </div>
            )}
          </motion.div>
        </div>

        {/* Duration bottom-right */}
        <div className="absolute bottom-5 right-5 z-20 font-mono text-xs tracking-widest text-white/40">
          {project.duration}
        </div>

        {/* Amber hover glow */}
        <motion.div
          className="absolute inset-0 z-10 pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          style={{ boxShadow: "inset 0 0 120px rgba(240,150,27,0.07)" }}
        />
      </div>

      {/* Card footer */}
      <div className="mt-6 flex items-end justify-between">
        <div>
          <h3 className={`font-serif text-white group-hover:text-[#F0961B] transition-colors duration-500 leading-tight ${isFeatured ? "text-4xl md:text-5xl" : "text-2xl md:text-3xl"}`}>
            {project.title}
          </h3>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/30 mt-2">
            {project.src ? "Watch film" : "Film coming soon"} · {project.year}
          </p>
        </div>

        {/* Arrow indicator */}
        <motion.div
          className="text-[#F0961B]/30 group-hover:text-[#F0961B] transition-colors mb-1"
          animate={{ x: 0 }}
          whileHover={{ x: 4 }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function Videography() {
  const [activeVideo, setActiveVideo] = useState<typeof PROJECTS[0] | null>(null);

  const handleCardClick = (project: typeof PROJECTS[0]) => {
    if (project.src) setActiveVideo(project);
  };

  return (
    <div className="w-full flex flex-col bg-black min-h-screen overflow-hidden">
      <PlayCursor />

      {/* ══ VIDEO HERO ═════════════════════════════════════════════════════════ */}
      <VideoHero onWatch={() => setActiveVideo(PROJECTS[0])} />

      {/* ══ CSS FILM STRIP ════════════════════════════════════════════════════ */}
      <FilmStrip />

      {/* ══ INTRO TEXT ════════════════════════════════════════════════════════ */}
      <section className="max-w-[1400px] mx-auto px-10 lg:px-20 w-full pb-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="flex flex-col lg:flex-row items-start gap-12 lg:gap-24 border-b border-[#1a1a1a] pb-20"
        >
          <div className="lg:w-[55%]">
            <p className="font-mono text-[#F0961B] text-[10px] tracking-[0.4em] uppercase mb-6">Our Work</p>
            <h2 className="font-serif text-white text-5xl md:text-7xl leading-[1.05] tracking-tight">
              Six films.<br />
              <span className="text-white/25">Six stories.</span>
            </h2>
          </div>
          <div className="lg:w-[45%] flex flex-col justify-end pt-4">
            <p className="font-serif italic text-white/40 text-xl leading-relaxed">
              From the quiet joy of a birthday morning to the grand entrance of a wedding — we approach every shoot with the gravity of cinema. No filters. No faking. Just real moments, beautifully told.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ══ PROJECTS GRID ════════════════════════════════════════════════════ */}
      <section className="max-w-[1400px] mx-auto px-10 lg:px-20 w-full pb-24 lg:pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
          {PROJECTS.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              onClick={() => handleCardClick(project)}
            />
          ))}
        </div>
      </section>

      {/* ══ MARQUEE SERVICES ══════════════════════════════════════════════════ */}
      <div className="w-full bg-[#5C1A20] py-16 lg:py-20 overflow-hidden border-y border-white/5">
        <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ ease: "linear", duration: 40, repeat: Infinity }} className="flex whitespace-nowrap">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-[#FBF6EE] text-4xl md:text-5xl px-10 flex items-center gap-12 font-serif italic">
              <span>Wedding Films</span> <span className="text-[#F0961B] opacity-40">·</span>
              <span>Brand Commercials</span> <span className="text-[#F0961B] opacity-40">·</span>
              <span>Event Highlights</span> <span className="text-[#F0961B] opacity-40">·</span>
              <span>Birthday Reels</span> <span className="text-[#F0961B] opacity-40">·</span>
              <span>Product Videos</span> <span className="text-[#F0961B] opacity-40">·</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ══ FULLSCREEN MODAL PLAYER ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[300] bg-black"
          >
            {/* Letterbox entrance bars */}
            <motion.div initial={{ scaleY: 1 }} animate={{ scaleY: 0 }} transition={{ delay: 0.3, duration: 0.6, ease: [0.76, 0, 0.24, 1] }} className="absolute top-0 left-0 right-0 bg-black z-20 origin-top" style={{ height: "15vh" }} />
            <motion.div initial={{ scaleY: 1 }} animate={{ scaleY: 0 }} transition={{ delay: 0.3, duration: 0.6, ease: [0.76, 0, 0.24, 1] }} className="absolute bottom-0 left-0 right-0 bg-black z-20 origin-bottom" style={{ height: "15vh" }} />

            {/* Grain on modal */}
            <div className="absolute inset-0 z-10 opacity-10 pointer-events-none"
              style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.4) 3px, rgba(0,0,0,0.4) 4px)" }}
            />

            {/* Video */}
            <video
              key={activeVideo.id}
              src={activeVideo.src!}
              controls
              autoPlay
              className="absolute inset-0 w-full h-full object-contain z-0"
            />

            {/* Film perfs */}
            <div className="absolute left-0 top-0 bottom-0 w-8 z-30 bg-black flex flex-col justify-around items-center py-4">
              {[...Array(14)].map((_, i) => <div key={i} className="w-4 h-5 rounded-[2px] bg-[#111] border border-[#2a2a2a]" />)}
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-8 z-30 bg-black flex flex-col justify-around items-center py-4">
              {[...Array(14)].map((_, i) => <div key={i} className="w-4 h-5 rounded-[2px] bg-[#111] border border-[#2a2a2a]" />)}
            </div>

            {/* Close button */}
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-6 right-12 z-40 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/60 transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Film info bottom bar */}
            <div className="absolute bottom-4 left-12 right-12 z-40 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-mono text-[9px] text-[#F0961B] tracking-[0.3em] uppercase">{activeVideo.cat}</span>
                <span className="font-serif text-white/60 text-sm">{activeVideo.title}</span>
              </div>
              <span className="font-mono text-[9px] text-white/30 tracking-widest">{activeVideo.frame} / 006 · GVS</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
