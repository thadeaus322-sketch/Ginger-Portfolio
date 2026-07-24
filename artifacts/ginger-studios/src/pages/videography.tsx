import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";

const VIDEO_SRC = "/images/client-video-1.mp4";

const PROJECTS = [
  { id: 1, frame: "001", title: "The Kafidiyas",       sub: "A Short Story of an Unending Love", cat: "Wedding Film",     duration: "4:20", year: "2025", src: VIDEO_SRC },
  { id: 2, frame: "002", title: "Elevate Boutique",    sub: "Dressed in confidence",              cat: "Brand Commercial", duration: "1:45", year: "2025", src: null },
  { id: 3, frame: "003", title: "South Kitchen",       sub: "Food is an emotion",                 cat: "Commercial",       duration: "2:10", year: "2024", src: null },
  { id: 4, frame: "004", title: "The Archers Evening", sub: "An evening worth remembering",        cat: "Event Highlight",  duration: "3:10", year: "2025", src: null },
  { id: 5, frame: "005", title: "Jisola 30th",         sub: "Thirty and thriving",                cat: "Birthday Reel",    duration: "1:15", year: "2025", src: null },
  { id: 6, frame: "006", title: "Aisha & Tobi",        sub: "Where two worlds meet",              cat: "Wedding Film",     duration: "5:20", year: "2024", src: null },
];

const WORD_VARIANTS = {
  hidden: { y: "110%", opacity: 0 },
  visible: (i: number) => ({
    y: 0, opacity: 1,
    transition: { delay: i * 0.13, duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  }),
};

// ─── Animated headline ────────────────────────────────────────────────────────
function AnimHeadline({ text, className, delayStart = 0 }: { text: string; className?: string; delayStart?: number }) {
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.22em] mb-1">
          <motion.span
            className="inline-block"
            custom={delayStart + i}
            variants={WORD_VARIANTS}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// ─── Video Hero ───────────────────────────────────────────────────────────────
function VideoHero({ onWatch }: { onWatch: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {});
  }, []);

  return (
    <section ref={containerRef} className="relative w-full overflow-hidden" style={{ height: "100svh", minHeight: 600 }}>

      {/* Parallax video layer */}
      <motion.div className="absolute inset-0" style={{ y }}>
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          muted loop playsInline preload="auto"
          className="w-full h-full object-cover"
        />
        {/* Subtle vignette — keeps text readable without killing the video */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-transparent pointer-events-none" />
      </motion.div>

      {/* Dark bg visible only before video loads */}
      <div className="absolute inset-0 bg-[#1a100a] -z-10" />

      {/* REC pill */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="absolute top-8 left-8 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full"
      >
        <motion.div
          className="w-2 h-2 rounded-full bg-[#F0961B]"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
        />
        <span className="font-mono text-[9px] text-white/70 tracking-[0.25em] uppercase">REC • GVS 2025</span>
      </motion.div>

      {/* Frame counter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute top-8 right-8 z-20 font-mono text-[10px] text-white/40 tracking-widest"
      >
        001 / 006
      </motion.div>

      {/* Hero copy */}
      <motion.div
        className="absolute inset-0 z-10 flex flex-col justify-center px-8 md:px-16 lg:px-24"
        style={{ opacity }}
      >
        <p className="font-mono text-[#F0961B] text-[10px] tracking-[0.45em] uppercase mb-6">
          Ginger Studios · Motion
        </p>

        <h1 className="font-serif text-white leading-[0.9] tracking-tight mb-8 overflow-hidden"
          style={{ fontSize: "clamp(64px, 10vw, 148px)" }}>
          {"We make".split(" ").map((word, i) => (
            <span key={i} className="inline-block overflow-hidden mr-[0.22em]">
              <motion.span
                className="inline-block"
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.13, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              >
                {word}
              </motion.span>
            </span>
          ))}
          <br />
          <span className="inline-block overflow-hidden">
            <motion.span
              className="inline-block text-[#F0961B] italic"
              initial={{ y: "110%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.48, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              films.
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="font-serif italic text-white/50 text-xl md:text-2xl max-w-md mb-12"
        >
          Every frame, a feeling. Every second, preserved.
        </motion.p>

        {/* Watch CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.7 }}
          onClick={onWatch}
          className="group w-fit flex items-center gap-4"
        >
          <motion.div
            className="w-14 h-14 rounded-full bg-[#F0961B] flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
          </motion.div>
          <div className="text-left">
            <p className="text-white font-serif text-lg group-hover:text-[#F0961B] transition-colors">
              Watch The Kafidiyas
            </p>
            <p className="text-white/40 font-mono text-[10px] tracking-widest">WEDDING FILM · 4:20</p>
          </div>
        </motion.button>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        <motion.div
          className="w-px h-10 bg-gradient-to-b from-[#F0961B] to-transparent"
          animate={{ scaleY: [0, 1, 0], originY: 0 }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        />
        <span className="font-mono text-[8px] text-white/30 tracking-[0.3em] uppercase">Scroll</span>
      </motion.div>
    </section>
  );
}

// ─── Featured film card (cream bg, video visible) ────────────────────────────
function FeaturedFilm({ onWatch }: { onWatch: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const previewRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);

  // Autoplay muted from mount so the video is always visible
  useEffect(() => {
    const v = previewRef.current;
    if (!v) return;
    v.play().catch(() => {});
  }, []);

  return (
    <section className="bg-[#FBF6EE] py-24 lg:py-40 px-8 md:px-16 lg:px-24 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-16"
        >
          <div className="w-10 h-px bg-[#F0961B]" />
          <span className="font-mono text-[10px] text-[#211C17]/50 tracking-[0.35em] uppercase">
            Featured Film · 001
          </span>
        </motion.div>

        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Video player */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-video bg-[#211C17] rounded-2xl overflow-hidden cursor-pointer group shadow-[0_32px_80px_-16px_rgba(33,28,23,0.35)]"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onWatch}
          >
            <video
              ref={previewRef}
              src={VIDEO_SRC}
              muted loop playsInline preload="metadata"
              className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
            />
            {/* Dark scrim */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-700" />

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-20 h-20 rounded-full bg-[#F0961B] flex items-center justify-center shadow-2xl"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                animate={{ scale: hovered ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </motion.div>
            </div>

            {/* Badge */}
            <div className="absolute top-5 left-5 bg-[#F0961B] px-3 py-1 rounded-sm">
              <span className="font-mono text-[9px] text-white tracking-[0.25em] uppercase font-bold">Wedding Film</span>
            </div>
            <div className="absolute bottom-5 right-5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-sm border border-white/10">
              <span className="font-mono text-[10px] text-white/80 tracking-widest">4:20</span>
            </div>
          </motion.div>

          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-mono text-[#F0961B] text-[10px] tracking-[0.4em] uppercase mb-5">2025</p>
            <h2 className="font-serif text-[#211C17] text-5xl md:text-6xl leading-[1.05] mb-6">
              The Kafidiyas
            </h2>
            <p className="font-serif italic text-[#211C17]/50 text-2xl mb-8">
              A Short Story of an Unending Love
            </p>
            <p className="font-sans text-[#211C17]/60 text-base leading-relaxed mb-12 max-w-sm">
              From a quiet morning in Abeokuta to a rooftop celebration under the stars — this is the full cinematic record of a love story that refused to be ordinary.
            </p>

            <div className="flex items-center gap-6 mb-12">
              {[["Duration", "4:20"], ["Year", "2025"], ["Type", "Wedding"]].map(([k, v]) => (
                <div key={k}>
                  <p className="font-mono text-[8px] text-[#211C17]/40 tracking-[0.25em] uppercase mb-1">{k}</p>
                  <p className="font-serif text-[#211C17] text-lg">{v}</p>
                </div>
              ))}
            </div>

            <motion.button
              onClick={onWatch}
              className="group flex items-center gap-3 bg-[#211C17] text-[#FBF6EE] px-8 py-4 rounded-sm font-sans text-sm tracking-[0.15em] uppercase font-bold hover:bg-[#F0961B] transition-colors duration-400"
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
            >
              Watch Full Film
              <svg className="group-hover:translate-x-1 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Film strip (CSS only) ────────────────────────────────────────────────────
function FilmStrip() {
  const items = [
    "WEDDING · 2025", "BRAND FILM · 2025", "COMMERCIAL · 2024", "EVENT · 2025",
    "PORTRAIT · 2025", "BIRTHDAY REEL · 2025", "WEDDING · 2024", "DOCUMENTARY · 2024",
  ];
  const doubled = [...items, ...items];

  return (
    <div className="w-full overflow-hidden bg-[#211C17] border-y border-[#FBF6EE]/5">
      {/* Top sprockets */}
      <div className="h-7 bg-[#111] flex items-center justify-around px-2">
        {[...Array(60)].map((_, i) => (
          <div key={i} className="w-3.5 h-4 rounded-[2px] bg-[#211C17] border border-[#333] flex-shrink-0" />
        ))}
      </div>

      <div className="relative overflow-hidden" style={{ height: 130 }}>
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 50 }}
          className="absolute top-0 left-0 flex h-full"
        >
          {doubled.map((label, i) => (
            <div
              key={i}
              className="flex-shrink-0 h-full flex flex-col items-center justify-center border-r border-[#FBF6EE]/5 relative"
              style={{ width: 170 }}
            >
              {/* Warm amber tint frame */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#F0961B]/4 to-transparent" />
              <span className="font-mono text-[#F0961B]/15 text-4xl font-bold mb-1">
                {String((i % 8) + 1).padStart(4, "0")}
              </span>
              <span className="font-mono text-[9px] text-[#FBF6EE]/25 tracking-[0.2em] uppercase text-center px-2">
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom sprockets */}
      <div className="h-7 bg-[#111] flex items-center justify-around px-2">
        {[...Array(60)].map((_, i) => (
          <div key={i} className="w-3.5 h-4 rounded-[2px] bg-[#211C17] border border-[#333] flex-shrink-0" />
        ))}
      </div>
    </div>
  );
}

// ─── Project grid ─────────────────────────────────────────────────────────────
function ProjectsGrid({ onPlayVideo }: { onPlayVideo: (src: string) => void }) {
  return (
    <section className="bg-[#FBF6EE] py-24 lg:py-40 px-8 md:px-16 lg:px-24">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <h2 className="font-serif text-[#211C17] leading-tight"
            style={{ fontSize: "clamp(40px, 6vw, 80px)" }}>
            <AnimHeadline text="Our films." />
          </h2>
          <p className="font-sans text-[#211C17]/50 text-base max-w-xs leading-relaxed">
            Six stories. Shot with intention. Delivered with care.
          </p>
        </div>

        {/* Grid — skip first (featured above) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PROJECTS.slice(1).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="group cursor-pointer"
              onClick={() => p.src && onPlayVideo(p.src)}
            >
              {/* Card face */}
              <div className="relative aspect-[4/3] bg-[#211C17] rounded-xl overflow-hidden mb-5">
                {/* Warm gradient pattern */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(ellipse at ${20 + i * 15}% ${30 + i * 10}%, rgba(240,150,27,0.18) 0%, transparent 65%)`,
                  }}
                />
                {/* Grid texture */}
                <div className="absolute inset-0 opacity-[0.04]"
                  style={{ backgroundImage: "linear-gradient(#FBF6EE 1px, transparent 1px), linear-gradient(90deg, #FBF6EE 1px, transparent 1px)", backgroundSize: "32px 32px" }}
                />

                {/* Frame number */}
                <div className="absolute top-4 left-4 font-mono text-white/20 text-xs tracking-widest">{p.frame}</div>

                {/* Category pill */}
                <div className="absolute top-4 right-4 bg-[#F0961B]/15 border border-[#F0961B]/30 px-3 py-1 rounded-full">
                  <span className="font-mono text-[8px] text-[#F0961B] tracking-[0.25em] uppercase">{p.cat}</span>
                </div>

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {p.src ? (
                    <motion.div
                      className="w-14 h-14 rounded-full border-2 border-[#F0961B]/40 group-hover:border-[#F0961B] group-hover:bg-[#F0961B]/10 flex items-center justify-center transition-colors duration-500"
                      whileHover={{ scale: 1.15 }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                    </motion.div>
                  ) : (
                    <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Amber hover glow */}
                <motion.div
                  className="absolute inset-0 pointer-events-none rounded-xl"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  style={{ boxShadow: "inset 0 0 60px rgba(240,150,27,0.10)" }}
                />

                {/* Duration bottom */}
                <div className="absolute bottom-4 right-4 font-mono text-xs text-white/35 tracking-widest">{p.duration}</div>
              </div>

              {/* Card text */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-[#211C17] text-2xl group-hover:text-[#F0961B] transition-colors duration-400 mb-1">
                    {p.title}
                  </h3>
                  <p className="font-serif italic text-[#211C17]/40 text-sm">{p.sub}</p>
                </div>
                <span className="font-mono text-[9px] text-[#211C17]/30 tracking-widest mt-1.5">{p.year}</span>
              </div>

              {/* Underline reveal */}
              <motion.div
                className="h-px bg-[#F0961B] mt-4 origin-left"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Services marquee ─────────────────────────────────────────────────────────
function ServicesMarquee() {
  const items = ["Wedding Films", "Brand Commercials", "Event Highlights", "Birthday Reels", "Product Videos", "Documentaries"];
  return (
    <div className="w-full bg-[#5C1A20] py-14 overflow-hidden border-y border-white/5">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 35 }}
        className="flex whitespace-nowrap"
      >
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center px-6 gap-10 text-[#FBF6EE] text-3xl md:text-4xl font-serif italic">
            {items.map((s, j) => (
              <span key={j} className="flex items-center gap-10">
                {s}
                <span className="text-[#F0961B] opacity-40 not-italic">·</span>
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Stats section ────────────────────────────────────────────────────────────
function Stats() {
  const stats = [
    { num: "100+", label: "Films Delivered" },
    { num: "240+", label: "Happy Clients" },
    { num: "4.9★", label: "Client Rating" },
    { num: "7",    label: "Years Shooting" },
  ];
  return (
    <section className="bg-[#211C17] py-24 px-8 md:px-16 lg:px-24">
      <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-[#FBF6EE]/5">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.7 }}
            className="flex flex-col items-center justify-center py-16 bg-[#211C17] group hover:bg-[#261F1A] transition-colors"
          >
            <span className="font-serif text-5xl md:text-6xl text-[#F0961B] mb-3">{s.num}</span>
            <span className="font-mono text-[9px] text-[#FBF6EE]/40 tracking-[0.3em] uppercase">{s.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Fullscreen modal player ──────────────────────────────────────────────────
function VideoModal({ src, onClose }: { src: string; onClose: () => void }) {
  const project = PROJECTS.find(p => p.src === src);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black"
    >
      {/* Letterbox bars */}
      <motion.div
        className="absolute top-0 left-0 right-0 bg-black z-10 origin-top"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
        style={{ height: "12vh" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-black z-10 origin-bottom"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
        style={{ height: "12vh" }}
      />

      <video
        key={src}
        src={src}
        controls autoPlay
        className="w-full h-full object-contain"
      />

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-6 z-20 w-10 h-10 rounded-full border border-white/20 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Info bar */}
      {project && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="absolute bottom-5 left-8 z-20 flex items-center gap-5"
        >
          <span className="font-mono text-[9px] text-[#F0961B] tracking-[0.3em] uppercase">{project.cat}</span>
          <span className="font-serif text-white/60 text-sm">{project.title}</span>
          <span className="font-mono text-[9px] text-white/30">{project.frame} / 006</span>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Videography() {
  const [playingSrc, setPlayingSrc] = useState<string | null>(null);

  return (
    <div className="w-full flex flex-col bg-[#FBF6EE] overflow-hidden">
      <VideoHero onWatch={() => setPlayingSrc(VIDEO_SRC)} />
      <FeaturedFilm onWatch={() => setPlayingSrc(VIDEO_SRC)} />
      <FilmStrip />
      <ProjectsGrid onPlayVideo={setPlayingSrc} />
      <Stats />
      <ServicesMarquee />

      <AnimatePresence>
        {playingSrc && (
          <VideoModal key="modal" src={playingSrc} onClose={() => setPlayingSrc(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
