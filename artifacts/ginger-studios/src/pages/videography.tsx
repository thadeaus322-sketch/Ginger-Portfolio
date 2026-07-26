import { useState, useRef, useEffect, useCallback } from "react";
import {
  motion, AnimatePresence,
  useScroll, useTransform, useInView,
  useMotionValue, useSpring,
} from "framer-motion";

// ─── Brand ────────────────────────────────────────────────────────────────────
const WA_LINK  = "https://wa.me/2347067310008?text=Hi%20Ginger%20Studios!%20I%27d%20like%20to%20book%20a%20film.";
const EMAIL    = "hi@gvs.com.ng";
const PHONE1   = "07067310008";

// ─── Real uploaded videos ─────────────────────────────────────────────────────
const REAL_VIDEOS = [
  {
    id: 1,
    src:      "/images/video-reel-1.mp4",
    title:    "The Kafidiyas",
    sub:      "A Short Story of an Unending Love",
    cat:      "Wedding Film",
    duration: "4:20",
    year:     "2025",
    frame:    "001",
  },
  {
    id: 2,
    src:      "/images/video-reel-2.mp4",
    title:    "SOEY",
    sub:      "A Vision. A Brand. A Story.",
    cat:      "Brand Commercial",
    duration: "2:15",
    year:     "2025",
    frame:    "002",
  },
  {
    id: 3,
    src:      "/images/video-reel-3.mp4",
    title:    "GVS Reel 2026",
    sub:      "Moments worth keeping",
    cat:      "Studio Showreel",
    duration: "1:30",
    year:     "2026",
    frame:    "003",
  },
];

const ALL_PROJECTS = [
  ...REAL_VIDEOS,
  { id: 4, src: "/images/video-reel-1.mp4", title: "The Archers Evening", sub: "An evening worth remembering", cat: "Event Highlight",  duration: "3:10", year: "2025", frame: "004" },
  { id: 5, src: "/images/video-reel-2.mp4", title: "Jisola 30th",         sub: "Thirty and thriving",         cat: "Birthday Reel",    duration: "1:15", year: "2025", frame: "005" },
  { id: 6, src: "/images/video-reel-3.mp4", title: "Elevate Boutique",    sub: "Dressed in confidence",        cat: "Brand Commercial", duration: "1:45", year: "2025", frame: "006" },
];

// ─── Count-up ─────────────────────────────────────────────────────────────────
function useCountUp(to: number, inView: boolean, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.round(p * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return val;
}

// ─── Word-by-word entrance ────────────────────────────────────────────────────
function SplitText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.18em]">
          <motion.span
            className="inline-block"
            initial={{ y: "108%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: delay + i * 0.1, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function SplitScroll({ text, className, delayStart = 0 }: { text: string; className?: string; delayStart?: number }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.2em] mb-1">
          <motion.span
            className="inline-block"
            custom={delayStart + i}
            variants={{
              hidden: { y: "108%", opacity: 0 },
              visible: (d: number) => ({
                y: 0, opacity: 1,
                transition: { delay: d * 0.09, duration: 0.72, ease: [0.16, 1, 0.3, 1] },
              }),
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// ─── Film Sprocket decoration ─────────────────────────────────────────────────
function Sprockets({ side }: { side: "left" | "right" }) {
  return (
    <div className={`absolute top-0 bottom-0 ${side === "left" ? "left-0" : "right-0"} w-7 flex flex-col justify-around items-center bg-[#211C17] z-10 py-2`}>
      {[...Array(14)].map((_, i) => (
        <div key={i} className="w-3.5 h-2.5 rounded-[2px] bg-[#FBF6EE]/15 border border-[#FBF6EE]/8" />
      ))}
    </div>
  );
}

// ─── Cinema Hero ──────────────────────────────────────────────────────────────
function CinemaHero({ onWatch, onBook }: { onWatch: (src: string) => void; onBook: () => void }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const vid1Ref = useRef<HTMLVideoElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  useEffect(() => { vid1Ref.current?.play().catch(() => {}); }, []);

  return (
    <section ref={heroRef} className="relative bg-[#FBF6EE] overflow-hidden min-h-[100svh] flex items-center">
      {/* Subtle grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] z-0"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundSize: "180px" }} />

      <motion.div style={{ opacity: heroOpacity }} className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-16 xl:px-24 py-28 lg:py-0 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">

        {/* Left: Copy */}
        <div className="order-2 lg:order-1">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}
            className="flex items-center gap-3 mb-8">
            <div className="w-8 h-px bg-[#F0961B]" />
            <span className="font-mono text-[#F0961B] text-[10px] tracking-[0.5em] uppercase">Ginger Studios · Motion</span>
          </motion.div>

          <h1 className="font-serif text-[#211C17] leading-[0.9] tracking-tight mb-8"
            style={{ fontSize: "clamp(56px, 8.5vw, 130px)" }}>
            <SplitText text="We make" delay={0.18} />
            <br />
            <span className="inline-block overflow-hidden">
              <motion.span
                className="inline-block text-[#F0961B] italic"
                initial={{ y: "115%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.44, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
                films.
              </motion.span>
            </span>
          </h1>

          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.68, duration: 0.7 }}
            className="font-serif italic text-[#211C17]/45 text-xl md:text-2xl max-w-sm mb-12 leading-relaxed">
            Every frame, a feeling. Every second, preserved.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.88, duration: 0.7 }}
            className="flex flex-wrap items-center gap-5">
            <button onClick={() => onWatch(REAL_VIDEOS[0].src)}
              className="group flex items-center gap-4">
              <motion.div
                className="w-14 h-14 rounded-full border-2 border-[#211C17]/30 bg-[#211C17]/5 flex items-center justify-center"
                whileHover={{ scale: 1.12, borderColor: "#F0961B", backgroundColor: "rgba(240,150,27,0.1)" }}
                whileTap={{ scale: 0.95 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#211C17"><path d="M8 5v14l11-7z" /></svg>
              </motion.div>
              <div>
                <p className="text-[#211C17] font-serif text-base group-hover:text-[#F0961B] transition-colors duration-300">Watch The Kafidiyas</p>
                <p className="text-[#211C17]/35 font-mono text-[9px] tracking-[0.22em] uppercase mt-0.5">Wedding Film · 4:20</p>
              </div>
            </button>

            <div className="hidden sm:block w-px h-10 bg-[#211C17]/12" />

            <motion.button onClick={onBook}
              className="flex items-center gap-2 bg-[#211C17] text-[#FBF6EE] px-6 py-3 rounded-sm font-sans text-sm tracking-[0.15em] uppercase font-semibold"
              whileHover={{ scale: 1.04, backgroundColor: "#F0961B" }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.25 }}>
              Book Your Film
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </motion.button>
          </motion.div>

          {/* Stats row */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.6 }}
            className="flex gap-10 mt-16 pt-12 border-t border-[#211C17]/10">
            {[["100+", "Films"], ["240+", "Clients"], ["7", "Years"]].map(([n, l]) => (
              <div key={l}>
                <p className="font-serif text-3xl text-[#211C17]">{n}</p>
                <p className="font-mono text-[9px] text-[#211C17]/35 tracking-[0.28em] uppercase mt-1">{l}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Cinema Frame */}
        <motion.div
          className="order-1 lg:order-2 relative"
          initial={{ opacity: 0, x: 40, y: 10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}>

          {/* Outer shadow frame */}
          <div className="relative mx-auto" style={{ maxWidth: 580 }}>
            {/* Film frame border */}
            <div className="relative bg-[#211C17] rounded-lg overflow-hidden shadow-[0_40px_100px_-20px_rgba(33,28,23,0.35)]">
              <Sprockets side="left" />
              <Sprockets side="right" />

              {/* Video inside */}
              <div className="mx-7 relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                <motion.div style={{ y: videoY }} className="w-full h-full">
                  <video ref={vid1Ref} src={REAL_VIDEOS[0].src} muted loop playsInline preload="auto"
                    className="w-full h-full object-cover" />
                </motion.div>
                {/* Subtle cream vignette */}
                <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.35)] pointer-events-none" />

                {/* REC badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#211C17]/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                  <motion.div className="w-1.5 h-1.5 rounded-full bg-[#F0961B]"
                    animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 1.4 }} />
                  <span className="font-mono text-[8px] text-white/65 tracking-[0.25em] uppercase">REC</span>
                </div>

                {/* Film info */}
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                  <div>
                    <p className="font-mono text-[8px] text-[#F0961B] tracking-[0.3em] uppercase">{REAL_VIDEOS[0].cat}</p>
                    <p className="font-serif text-white text-sm">{REAL_VIDEOS[0].title}</p>
                  </div>
                  <span className="font-mono text-[8px] text-white/35">{REAL_VIDEOS[0].frame} / 003</span>
                </div>

                {/* Play button */}
                <button
                  onClick={() => onWatch(REAL_VIDEOS[0].src)}
                  className="absolute inset-0 flex items-center justify-center group">
                  <motion.div
                    className="w-14 h-14 rounded-full bg-[#F0961B]/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ scale: 1.1 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                  </motion.div>
                </button>
              </div>

              {/* Bottom film data bar */}
              <div className="mx-7 py-3 flex justify-between items-center border-t border-white/5">
                <span className="font-mono text-[8px] text-white/30 tracking-[0.2em]">GVS · MOTION · 2025</span>
                <span className="font-mono text-[8px] text-white/20 tracking-widest">4K · COLOR GRADE</span>
              </div>
            </div>

            {/* Floating label */}
            <motion.div
              className="absolute -bottom-6 -right-4 bg-[#F0961B] text-white px-4 py-2 rounded-sm shadow-lg"
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}>
              <p className="font-mono text-[9px] tracking-[0.22em] uppercase font-bold">Now Playing</p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
        <motion.div className="w-px h-10 bg-gradient-to-b from-[#211C17]/40 to-transparent"
          animate={{ scaleY: [0, 1, 0], originY: 0 }}
          transition={{ repeat: Infinity, duration: 1.7, ease: "easeInOut" }} />
        <span className="font-mono text-[8px] text-[#211C17]/25 tracking-[0.32em] uppercase">Scroll</span>
      </motion.div>
    </section>
  );
}

// ─── Now Screening (3 real videos) ───────────────────────────────────────────
function NowScreening({ onPlay, onBook }: { onPlay: (src: string) => void; onBook: () => void }) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const handleMouseEnter = useCallback((idx: number) => {
    setHoveredId(REAL_VIDEOS[idx].id);
    videoRefs.current[idx]?.play().catch(() => {});
  }, []);

  const handleMouseLeave = useCallback((idx: number) => {
    setHoveredId(null);
    const v = videoRefs.current[idx];
    if (v) { v.pause(); v.currentTime = 0; }
  }, []);

  return (
    <section className="bg-[#FBF6EE] py-24 lg:py-40 px-6 lg:px-16 xl:px-24 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-20">
          <div>
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.55 }} className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-[#F0961B]" />
              <span className="font-mono text-[10px] text-[#211C17]/40 tracking-[0.38em] uppercase">Currently Screening</span>
            </motion.div>
            <h2 className="font-serif text-[#211C17] leading-tight" style={{ fontSize: "clamp(38px, 6vw, 80px)" }}>
              <SplitScroll text="Our films." />
            </h2>
          </div>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="font-sans text-[#211C17]/40 text-sm max-w-xs leading-relaxed text-right">
            Hover to preview. Click to watch in full.
          </motion.p>
        </div>

        {/* Three real video cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {REAL_VIDEOS.map((film, idx) => (
            <motion.div
              key={film.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: idx * 0.1, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="cursor-pointer group"
              onMouseEnter={() => handleMouseEnter(idx)}
              onMouseLeave={() => handleMouseLeave(idx)}
              onClick={() => onPlay(film.src)}>

              {/* Film frame card */}
              <div className="relative bg-[#211C17] rounded-xl overflow-hidden shadow-[0_20px_60px_-12px_rgba(33,28,23,0.22)] mb-5">
                <Sprockets side="left" />
                <Sprockets side="right" />

                <div className="mx-7 relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                  <video
                    ref={(el) => { videoRefs.current[idx] = el; }}
                    src={film.src}
                    muted
                    loop
                    playsInline
                    preload="none"
                    className="w-full h-full object-cover transition-transform duration-[2.5s] group-hover:scale-[1.04]"
                  />
                  {/* Dark overlay that lifts on hover */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500" />

                  {/* Frame num */}
                  <div className="absolute top-2.5 left-2.5 font-mono text-white/25 text-[9px] tracking-widest">{film.frame}</div>

                  {/* Category pill */}
                  <div className="absolute top-2.5 right-2.5 bg-[#F0961B] px-2.5 py-0.5 rounded-sm">
                    <span className="font-mono text-[7px] text-white tracking-[0.2em] uppercase font-bold">{film.cat}</span>
                  </div>

                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="w-12 h-12 rounded-full border-2 border-white/40 flex items-center justify-center"
                      animate={{ scale: hoveredId === film.id ? 1.15 : 1, borderColor: hoveredId === film.id ? "#F0961B" : "rgba(255,255,255,0.4)", backgroundColor: hoveredId === film.id ? "rgba(240,150,27,0.15)" : "transparent" }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                    </motion.div>
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-2.5 right-2.5 font-mono text-[9px] text-white/35">{film.duration}</div>
                </div>

                {/* Film data row */}
                <div className="mx-7 py-2.5 flex justify-between border-t border-white/5">
                  <span className="font-mono text-[7px] text-white/25 tracking-[0.15em] uppercase">{film.year}</span>
                  <span className="font-mono text-[7px] text-white/15 tracking-widest">GVS · {film.frame}</span>
                </div>
              </div>

              {/* Text */}
              <div className="flex items-start justify-between px-1">
                <div>
                  <motion.h3 className="font-serif text-[#211C17] text-xl mb-1"
                    whileHover={{ color: "#F0961B" }} transition={{ duration: 0.2 }}>
                    {film.title}
                  </motion.h3>
                  <p className="font-serif italic text-[#211C17]/38 text-sm">{film.sub}</p>
                </div>
              </div>

              {/* Amber underline reveal */}
              <motion.div className="h-px bg-[#F0961B] mt-3 mx-1 origin-left"
                initial={{ scaleX: 0 }} whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} />
            </motion.div>
          ))}
        </div>

        {/* View all CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-[#211C17]/10 pt-12">
          <div>
            <p className="font-serif text-[#211C17] text-2xl">Don't see your story yet?</p>
            <p className="font-sans text-[#211C17]/40 text-sm mt-1">Every shoot is unique. Let's create yours.</p>
          </div>
          <motion.button onClick={onBook}
            className="flex-shrink-0 flex items-center gap-2 bg-[#211C17] text-[#FBF6EE] px-8 py-4 rounded-sm font-sans text-sm tracking-[0.16em] uppercase font-semibold whitespace-nowrap"
            whileHover={{ backgroundColor: "#F0961B", x: 4 }} whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.25 }}>
            Request a Custom Film
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Film Ticker ──────────────────────────────────────────────────────────────
function FilmTicker() {
  const items = [
    "WEDDING FILM", "BRAND COMMERCIAL", "EVENT HIGHLIGHT", "BIRTHDAY REEL",
    "DOCUMENTARY", "PORTRAIT FILM", "PRODUCT VIDEO", "STUDIO SHOWREEL",
  ];
  const doubled = [...items, ...items];
  return (
    <div className="w-full overflow-hidden bg-[#211C17] border-y border-[#FBF6EE]/5">
      {/* Sprocket row */}
      <div className="h-6 bg-[#111] flex items-center justify-around px-2">
        {[...Array(60)].map((_, i) => (
          <div key={i} className="w-3 h-3.5 rounded-[2px] bg-[#211C17] border border-[#333] flex-shrink-0" />
        ))}
      </div>

      {/* Ticker */}
      <div className="relative overflow-hidden" style={{ height: 80 }}>
        <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ repeat: Infinity, ease: "linear", duration: 42 }}
          className="absolute top-0 left-0 flex h-full items-center whitespace-nowrap">
          {doubled.map((label, i) => (
            <span key={i} className="flex items-center gap-5 px-8 font-mono text-sm tracking-[0.28em] uppercase">
              <span className="text-[#FBF6EE]/25">{label}</span>
              <span className="text-[#F0961B]/40">·</span>
            </span>
          ))}
        </motion.div>
      </div>

      <div className="h-6 bg-[#111] flex items-center justify-around px-2">
        {[...Array(60)].map((_, i) => (
          <div key={i} className="w-3 h-3.5 rounded-[2px] bg-[#211C17] border border-[#333] flex-shrink-0" />
        ))}
      </div>
    </div>
  );
}

// ─── Portfolio Grid ───────────────────────────────────────────────────────────
function PortfolioGrid({ onPlay, onBook }: { onPlay: (src: string) => void; onBook: () => void }) {
  return (
    <section className="bg-[#FBF6EE] py-24 lg:py-40 px-6 lg:px-16 xl:px-24">
      <div className="max-w-[1400px] mx-auto">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <h2 className="font-serif text-[#211C17] leading-tight" style={{ fontSize: "clamp(36px, 5.5vw, 72px)" }}>
            <SplitScroll text="Full portfolio." />
          </h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="font-mono text-[9px] text-[#F0961B] tracking-[0.3em] uppercase pb-1">
            006 works · 2024 – 2026
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {ALL_PROJECTS.map((p, i) => (
            <motion.div key={p.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.07, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="group cursor-pointer"
              onClick={() => onPlay(p.src)}>

              {/* Card */}
              <div className="relative aspect-[4/3] bg-[#211C17] rounded-xl overflow-hidden mb-5 shadow-[0_12px_40px_-8px_rgba(33,28,23,0.18)]">
                {/* Warm radial glow */}
                <div className="absolute inset-0"
                  style={{ background: `radial-gradient(ellipse at ${20 + i * 13}% ${25 + i * 9}%, rgba(240,150,27,0.18) 0%, transparent 60%)` }} />

                <div className="absolute top-4 left-4 font-mono text-white/18 text-xs tracking-widest">{p.frame}</div>
                <div className="absolute top-4 right-4 bg-[#F0961B]/12 border border-[#F0961B]/25 px-3 py-0.5 rounded-full">
                  <span className="font-mono text-[7px] text-[#F0961B] tracking-[0.2em] uppercase">{p.cat}</span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-12 h-12 rounded-full border-2 border-[#F0961B]/30 flex items-center justify-center"
                    whileHover={{ scale: 1.2, borderColor: "#F0961B", backgroundColor: "rgba(240,150,27,0.1)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                  </motion.div>
                </div>

                {/* Amber glow on hover */}
                <motion.div className="absolute inset-0 pointer-events-none rounded-xl"
                  initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ boxShadow: "inset 0 0 60px rgba(240,150,27,0.12)" }} />

                <div className="absolute bottom-4 right-4 font-mono text-xs text-white/28 tracking-widest">{p.duration}</div>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <motion.h3 className="font-serif text-[#211C17] text-xl mb-1"
                    whileHover={{ color: "#F0961B" }} transition={{ duration: 0.2 }}>
                    {p.title}
                  </motion.h3>
                  <p className="font-serif italic text-[#211C17]/38 text-sm">{p.sub}</p>
                </div>
                <span className="font-mono text-[9px] text-[#211C17]/25 tracking-widest mt-1">{p.year}</span>
              </div>

              <motion.div className="h-px bg-[#F0961B] mt-4 origin-left"
                initial={{ scaleX: 0 }} whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Services Marquee ─────────────────────────────────────────────────────────
function ServicesMarquee({ onBook }: { onBook: () => void }) {
  const items = ["Wedding Films", "Brand Commercials", "Event Highlights", "Birthday Reels", "Product Videos", "Documentaries"];
  return (
    <div className="w-full bg-[#5C1A20] py-12 overflow-hidden border-t border-white/5">
      <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ repeat: Infinity, ease: "linear", duration: 38 }}
        className="flex whitespace-nowrap">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center px-6 gap-9 text-[#FBF6EE] text-3xl md:text-4xl font-serif italic">
            {items.map((s, j) => (
              <span key={j} className="flex items-center gap-9">
                {s}
                <span className="text-[#F0961B] opacity-35 not-italic">·</span>
              </span>
            ))}
          </div>
        ))}
      </motion.div>
      <div className="mt-10 flex items-center justify-center gap-6 px-8">
        <p className="font-sans text-[#FBF6EE]/45 text-sm">Ready to create your film?</p>
        <motion.button onClick={onBook}
          className="font-mono text-[9px] text-[#F0961B] tracking-[0.3em] uppercase border border-[#F0961B]/50 px-5 py-2.5 rounded-sm hover:bg-[#F0961B]/10 transition-colors"
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          Book Now →
        </motion.button>
      </div>
    </div>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function StatCard({ num, suffix, label }: { num: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const val = useCountUp(num, inView, 1400);
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center py-16 bg-[#211C17] hover:bg-[#271e18] transition-colors">
      <span className="font-serif text-5xl md:text-6xl text-[#F0961B] mb-3">{val}{suffix}</span>
      <span className="font-mono text-[9px] text-[#FBF6EE]/32 tracking-[0.32em] uppercase">{label}</span>
    </motion.div>
  );
}

function Stats() {
  return (
    <section className="bg-[#211C17] border-t border-[#FBF6EE]/5">
      <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-[#FBF6EE]/5">
        <StatCard num={100} suffix="+" label="Films Delivered" />
        <StatCard num={240} suffix="+" label="Happy Clients" />
        <StatCard num={49} suffix="★" label="Client Rating (÷10)" />
        <StatCard num={7}   suffix=""  label="Years Shooting" />
      </div>
    </section>
  );
}

// ─── Booking Band ─────────────────────────────────────────────────────────────
function BookingBand({ onBook }: { onBook: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="bg-[#211C17] py-24 lg:py-36 px-6 lg:px-16 xl:px-24 overflow-hidden" ref={ref}>
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-28 items-center">

          {/* Left */}
          <div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.55 }} className="flex items-center gap-4 mb-10">
              <div className="w-10 h-px bg-[#F0961B]" />
              <span className="font-mono text-[10px] text-[#FBF6EE]/35 tracking-[0.38em] uppercase">Book Your Film</span>
            </motion.div>

            <motion.h2 initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-[#FBF6EE] leading-[1.05] mb-6"
              style={{ fontSize: "clamp(34px, 5vw, 68px)" }}>
              Every moment deserves to be<br />
              <span className="text-[#F0961B] italic">preserved forever.</span>
            </motion.h2>

            <motion.p initial={{ opacity: 0, y: 14 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="font-sans text-[#FBF6EE]/45 text-base leading-relaxed max-w-md mb-10">
              Whether it's your wedding, a brand story, or a milestone birthday — we craft cinematic films that feel exactly like you.
              Delivered within <strong className="text-[#FBF6EE]/70">7 days</strong>.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-6 mb-12">
              {["★★★★★ · 4.9 Rating", "240+ Happy Clients", "100+ Films Delivered", "Abeokuta, Nigeria"].map(t => (
                <span key={t} className="font-mono text-[9px] text-[#F0961B]/70 tracking-[0.22em] uppercase">{t}</span>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 14 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.38 }}
              className="flex flex-wrap gap-3">
              <a href={WA_LINK} target="_blank" rel="noreferrer"
                className="flex items-center gap-3 bg-[#25D366] text-white px-7 py-3.5 rounded-sm font-sans text-sm tracking-[0.14em] uppercase font-semibold hover:bg-[#20bd5a] transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.107 1.516 5.832L0 24l6.335-1.493A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.011-1.374l-.36-.214-3.732.879.894-3.648-.235-.374A9.818 9.818 0 1112 21.818z"/>
                </svg>
                WhatsApp · {PHONE1}
              </a>
              <a href={`mailto:${EMAIL}`}
                className="flex items-center gap-2 border border-[#FBF6EE]/20 text-[#FBF6EE]/65 hover:border-[#FBF6EE]/40 hover:text-[#FBF6EE] px-7 py-3.5 rounded-sm font-sans text-sm tracking-[0.14em] uppercase font-semibold transition-colors">
                {EMAIL}
              </a>
            </motion.div>
          </div>

          {/* Right — services card */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.85, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}>
            <div className="bg-[#FBF6EE]/4 border border-[#FBF6EE]/8 rounded-2xl p-10 backdrop-blur-sm">
              <p className="font-mono text-[10px] text-[#F0961B] tracking-[0.4em] uppercase mb-8">What We Offer</p>
              <div className="space-y-6">
                {[
                  ["Wedding Films",     "Full ceremony + reception, delivered in 4K"],
                  ["Brand Commercials", "Product & story ads that convert viewers"],
                  ["Event Highlights",  "Parties, launches, corporate, celebrations"],
                  ["Birthday Reels",    "Emotional, fun, shareable recap films"],
                  ["Documentaries",     "Long-form storytelling for brands & people"],
                ].map(([title, desc]) => (
                  <motion.div key={title} className="flex gap-4 group"
                    whileHover={{ x: 6 }} transition={{ type: "spring", stiffness: 280, damping: 24 }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#F0961B] flex-shrink-0 mt-2.5" />
                    <div>
                      <p className="font-serif text-[#FBF6EE] text-lg group-hover:text-[#F0961B] transition-colors duration-200">{title}</p>
                      <p className="font-sans text-[#FBF6EE]/32 text-xs leading-relaxed mt-0.5">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-10 pt-8 border-t border-[#FBF6EE]/8">
                <p className="font-mono text-[9px] text-[#FBF6EE]/22 tracking-[0.3em] uppercase">Pricing</p>
                <p className="font-serif text-[#FBF6EE]/65 text-lg mt-1">Packages starting from <span className="text-[#F0961B]">₦150,000</span></p>
                <p className="font-sans text-[#FBF6EE]/28 text-xs mt-1">Custom quotes available — reach out to get yours.</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

// ─── Video Modal ──────────────────────────────────────────────────────────────
function VideoModal({ src, onClose }: { src: string; onClose: () => void }) {
  const project = ALL_PROJECTS.find(p => p.src === src);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }} className="fixed inset-0 z-[500] flex items-center justify-center bg-black">
      {(["top", "bottom"] as const).map(pos => (
        <motion.div key={pos} className={`absolute ${pos}-0 inset-x-0 bg-black z-10`}
          style={{ height: "10vh", originY: pos === "top" ? "top" : "bottom" }}
          initial={{ scaleY: 1 }} animate={{ scaleY: 0 }}
          transition={{ delay: 0.12, duration: 0.5, ease: [0.76, 0, 0.24, 1] }} />
      ))}
      <video key={src} src={src} controls autoPlay className="w-full h-full object-contain" />
      <button onClick={onClose}
        className="absolute top-5 right-6 z-20 w-10 h-10 rounded-full border border-white/20 hover:bg-white/10 flex items-center justify-center text-white transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      {project && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
          className="absolute bottom-5 left-8 z-20 flex items-center gap-5">
          <span className="font-mono text-[9px] text-[#F0961B] tracking-[0.3em] uppercase">{project.cat}</span>
          <span className="font-serif text-white/55 text-sm">{project.title}</span>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Booking Modal ────────────────────────────────────────────────────────────
function BookingModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
      onClick={onClose}>
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, y: 60, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.96 }} transition={{ type: "spring", stiffness: 220, damping: 26 }}
        className="relative bg-[#211C17] border border-[#FBF6EE]/10 rounded-2xl p-8 sm:p-12 max-w-lg w-full z-10"
        onClick={e => e.stopPropagation()}>

        <button onClick={onClose} className="absolute top-5 right-5 w-9 h-9 rounded-full border border-white/15 hover:bg-white/8 flex items-center justify-center text-white/60 hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>

        <p className="font-mono text-[#F0961B] text-[10px] tracking-[0.4em] uppercase mb-5">Book Your Film</p>
        <h3 className="font-serif text-[#FBF6EE] text-3xl mb-3">Let's create something<br /><span className="text-[#F0961B] italic">unforgettable.</span></h3>
        <p className="font-sans text-[#FBF6EE]/45 text-sm leading-relaxed mb-8">
          Reach out via WhatsApp or email — tell us your date, event type, and vision. We'll get back within 24 hours.
        </p>

        <div className="space-y-3">
          <a href={WA_LINK} target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white px-6 py-4 rounded-sm font-sans text-sm tracking-[0.12em] uppercase font-semibold hover:bg-[#20bd5a] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.107 1.516 5.832L0 24l6.335-1.493A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.011-1.374l-.36-.214-3.732.879.894-3.648-.235-.374A9.818 9.818 0 1112 21.818z"/>
            </svg>
            Chat on WhatsApp · {PHONE1}
          </a>
          <a href={`mailto:${EMAIL}`}
            className="flex items-center justify-center gap-2 w-full border border-[#FBF6EE]/15 text-[#FBF6EE]/65 hover:border-[#FBF6EE]/30 hover:text-[#FBF6EE] px-6 py-4 rounded-sm font-sans text-sm tracking-[0.12em] uppercase font-semibold transition-colors">
            Email · {EMAIL}
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function Videography() {
  const [playingSrc, setPlayingSrc] = useState<string | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  return (
    <div className="w-full flex flex-col bg-[#FBF6EE]">
      <CinemaHero  onWatch={setPlayingSrc}  onBook={() => setShowBooking(true)} />
      <NowScreening onPlay={setPlayingSrc}  onBook={() => setShowBooking(true)} />
      <FilmTicker />
      <PortfolioGrid onPlay={setPlayingSrc} onBook={() => setShowBooking(true)} />
      <ServicesMarquee                      onBook={() => setShowBooking(true)} />
      <Stats />
      <BookingBand                          onBook={() => setShowBooking(true)} />

      <AnimatePresence>
        {playingSrc  && <VideoModal   key="vid"  src={playingSrc} onClose={() => setPlayingSrc(null)} />}
        {showBooking && <BookingModal key="book"                   onClose={() => setShowBooking(false)} />}
      </AnimatePresence>
    </div>
  );
}
