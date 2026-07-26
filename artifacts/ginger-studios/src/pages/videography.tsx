import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";

const VIDEO_SRC = "/images/client-video-1.mp4";

const PROJECTS = [
  { id: 1, frame: "001", title: "The Kafidiyas",       sub: "A Short Story of an Unending Love", cat: "Wedding Film",     duration: "4:20", year: "2025", src: VIDEO_SRC, thumb: "/images/gen-wedding-1.jpg" },
  { id: 2, frame: "002", title: "Elevate Boutique",    sub: "Dressed in confidence",              cat: "Brand Commercial", duration: "1:45", year: "2025", src: VIDEO_SRC, thumb: "/images/gen-brand-film-1.jpg" },
  { id: 3, frame: "003", title: "South Kitchen",       sub: "Food is an emotion",                 cat: "Commercial",       duration: "2:10", year: "2024", src: VIDEO_SRC, thumb: "/images/food-1.jpg" },
  { id: 4, frame: "004", title: "The Archers Evening", sub: "An evening worth remembering",       cat: "Event Highlight",  duration: "3:10", year: "2025", src: VIDEO_SRC, thumb: "/images/gen-event-1.jpg" },
  { id: 5, frame: "005", title: "Jisola 30th",         sub: "Thirty and thriving",                cat: "Birthday Reel",    duration: "1:15", year: "2025", src: VIDEO_SRC, thumb: "/images/gen-birthday-1.jpg" },
  { id: 6, frame: "006", title: "Aisha & Tobi",        sub: "Where two worlds meet",              cat: "Wedding Film",     duration: "5:20", year: "2024", src: VIDEO_SRC, thumb: "/images/gen-wedding-2.jpg" },
];

// ─── Grain overlay ────────────────────────────────────────────────────────────
function Grain() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[900] opacity-[0.025] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundSize: "128px 128px",
      }}
    />
  );
}

// ─── Video Hero ───────────────────────────────────────────────────────────────
function VideoHero({ onWatch }: { onWatch: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const yVid = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const barsScale = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ height: "100svh", minHeight: 620, background: "#0D0B09" }}
    >
      {/* Parallax video */}
      <motion.div className="absolute inset-0" style={{ y: yVid }}>
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          muted loop playsInline preload="auto"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Cinematic vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent pointer-events-none" />

      {/* Cinematic bars — letterbox */}
      <motion.div
        className="absolute top-0 inset-x-0 bg-black origin-top pointer-events-none z-30"
        style={{ height: "8vh", scaleY: barsScale }}
      />
      <motion.div
        className="absolute bottom-0 inset-x-0 bg-black origin-bottom pointer-events-none z-30"
        style={{ height: "8vh", scaleY: barsScale }}
      />

      {/* REC indicator */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-9 left-8 z-20 flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10"
      >
        <motion.div
          className="w-2 h-2 rounded-full bg-[#F0961B]"
          animate={{ opacity: [1, 0.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.3 }}
        />
        <span className="font-mono text-[9px] text-white/60 tracking-[0.3em] uppercase">REC · GVS 2025</span>
      </motion.div>

      {/* Frame counter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="absolute top-9 right-8 z-20 font-mono text-[10px] text-white/30 tracking-[0.2em]"
      >
        001 / 006
      </motion.div>

      {/* Hero copy */}
      <motion.div
        className="absolute inset-0 z-10 flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-[8vh]"
        style={{ opacity }}
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="font-mono text-[#F0961B] text-[10px] tracking-[0.55em] uppercase mb-8"
        >
          Ginger Studios · Motion
        </motion.p>

        <h1
          className="font-serif text-white leading-[0.88] tracking-tight mb-10 overflow-hidden"
          style={{ fontSize: "clamp(60px, 11vw, 160px)" }}
        >
          {"We make".split(" ").map((word, i) => (
            <span key={i} className="inline-block overflow-hidden mr-[0.2em]">
              <motion.span
                className="inline-block"
                initial={{ y: "115%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                {word}
              </motion.span>
            </span>
          ))}
          <br />
          <span className="inline-block overflow-hidden">
            <motion.span
              className="inline-block text-[#F0961B] italic"
              initial={{ y: "115%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.44, duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
            >
              films.
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="font-serif italic text-white/45 text-xl md:text-2xl max-w-sm mb-14"
        >
          Every frame, a feeling. Every second, preserved.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.7 }}
          onClick={onWatch}
          className="group w-fit flex items-center gap-4"
        >
          <motion.div
            className="w-16 h-16 rounded-full border-2 border-[#F0961B] flex items-center justify-center"
            whileHover={{ scale: 1.12, backgroundColor: "rgba(240,150,27,0.15)" }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#F0961B"><path d="M8 5v14l11-7z" /></svg>
          </motion.div>
          <div className="text-left">
            <p className="text-white font-serif text-lg group-hover:text-[#F0961B] transition-colors duration-300">
              Watch The Kafidiyas
            </p>
            <p className="text-white/35 font-mono text-[10px] tracking-[0.25em] uppercase mt-0.5">Wedding Film · 4:20</p>
          </div>
        </motion.button>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          className="w-px h-12 bg-gradient-to-b from-[#F0961B] to-transparent"
          animate={{ scaleY: [0, 1, 0], originY: 0 }}
          transition={{ repeat: Infinity, duration: 1.7, ease: "easeInOut" }}
        />
        <span className="font-mono text-[8px] text-white/25 tracking-[0.35em] uppercase">Scroll</span>
      </motion.div>
    </section>
  );
}

// ─── Showreel / Featured section ──────────────────────────────────────────────
function Showreel({ onWatch }: { onWatch: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <section className="bg-[#0D0B09] py-28 lg:py-44 px-6 md:px-14 lg:px-20 overflow-hidden">
      <div className="max-w-[1500px] mx-auto">
        {/* Label row */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-5 mb-14"
        >
          <div className="w-12 h-px bg-[#F0961B]" />
          <span className="font-mono text-[10px] text-white/35 tracking-[0.4em] uppercase">Featured Film · 001</span>
        </motion.div>

        {/* Main split */}
        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 lg:gap-20 items-center">
          {/* Video */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group"
            style={{ boxShadow: "0 40px 120px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onWatch}
          >
            {/* Video playing muted as preview */}
            <video
              ref={videoRef}
              src={VIDEO_SRC}
              muted loop playsInline preload="auto"
              className="w-full h-full object-cover transition-transform duration-[2.5s] group-hover:scale-[1.04]"
            />

            {/* Scrim */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-700" />

            {/* Top-left badge */}
            <div className="absolute top-5 left-5 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-[#F0961B]" />
              <span className="font-mono text-[8px] text-white/70 tracking-[0.25em] uppercase">Wedding Film</span>
            </div>

            {/* Duration */}
            <div className="absolute top-5 right-5 font-mono text-[10px] text-white/50 tracking-widest bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded">
              4:20
            </div>

            {/* Center play */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-20 h-20 rounded-full border-2 border-[#F0961B]/60 flex items-center justify-center"
                animate={{
                  scale: hovered ? 1.15 : 1,
                  borderColor: hovered ? "rgba(240,150,27,1)" : "rgba(240,150,27,0.6)",
                  backgroundColor: hovered ? "rgba(240,150,27,0.18)" : "rgba(240,150,27,0)",
                }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
              </motion.div>
            </div>

            {/* Bottom info bar */}
            <motion.div
              className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/80 to-transparent"
              initial={{ opacity: 0, y: 8 }}
              animate={hovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.35 }}
            >
              <p className="font-serif text-white text-lg">The Kafidiyas</p>
              <p className="font-mono text-[9px] text-white/50 tracking-widest mt-1 uppercase">Click to watch full film</p>
            </motion.div>
          </motion.div>

          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-mono text-[#F0961B] text-[10px] tracking-[0.45em] uppercase mb-6">2025</p>
            <h2 className="font-serif text-white leading-[1.0] mb-5" style={{ fontSize: "clamp(36px, 4.5vw, 64px)" }}>
              The Kafidiyas
            </h2>
            <p className="font-serif italic text-white/40 text-xl mb-7">
              A Short Story of an Unending Love
            </p>
            <p className="font-sans text-white/35 text-sm leading-relaxed mb-10 max-w-xs">
              From a quiet morning in Abeokuta to a rooftop celebration under the stars — this is the full cinematic record of a love story that refused to be ordinary.
            </p>

            <div className="grid grid-cols-3 gap-6 mb-12 border-t border-b border-white/8 py-7">
              {[["Duration", "4:20"], ["Year", "2025"], ["Type", "Wedding"]].map(([k, v]) => (
                <div key={k}>
                  <p className="font-mono text-[8px] text-white/25 tracking-[0.3em] uppercase mb-2">{k}</p>
                  <p className="font-serif text-white/80 text-lg">{v}</p>
                </div>
              ))}
            </div>

            <motion.button
              onClick={onWatch}
              className="group flex items-center gap-3 border border-[#F0961B]/50 hover:border-[#F0961B] hover:bg-[#F0961B]/10 text-[#F0961B] px-7 py-4 rounded-sm font-mono text-[10px] tracking-[0.25em] uppercase transition-all duration-300"
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
            >
              Watch Full Film
              <svg className="group-hover:translate-x-1 transition-transform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Divider strip ────────────────────────────────────────────────────────────
function FilmDivider() {
  const items = [
    "WEDDING · 2025", "BRAND FILM · 2025", "COMMERCIAL · 2024",
    "EVENT · 2025", "PORTRAIT · 2025", "BIRTHDAY · 2025",
    "WEDDING · 2024", "DOCUMENTARY · 2024",
  ];
  const doubled = [...items, ...items];
  return (
    <div className="w-full overflow-hidden border-y border-white/5 bg-[#0D0B09]">
      <div className="h-6 bg-[#090806] flex items-center justify-around px-2">
        {[...Array(64)].map((_, i) => (
          <div key={i} className="w-3 h-3.5 rounded-[2px] bg-[#161210] border border-[#222] flex-shrink-0" />
        ))}
      </div>
      <div className="relative overflow-hidden" style={{ height: 96 }}>
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 55 }}
          className="absolute top-0 left-0 flex h-full"
        >
          {doubled.map((label, i) => (
            <div
              key={i}
              className="flex-shrink-0 h-full flex flex-col items-center justify-center border-r border-white/5 relative"
              style={{ width: 160 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#F0961B]/3 to-transparent" />
              <span className="font-mono text-[#F0961B]/10 text-3xl font-bold mb-1">
                {String((i % 8) + 1).padStart(4, "0")}
              </span>
              <span className="font-mono text-[8px] text-white/20 tracking-[0.18em] uppercase text-center px-2">
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
      <div className="h-6 bg-[#090806] flex items-center justify-around px-2">
        {[...Array(64)].map((_, i) => (
          <div key={i} className="w-3 h-3.5 rounded-[2px] bg-[#161210] border border-[#222] flex-shrink-0" />
        ))}
      </div>
    </div>
  );
}

// ─── Film index (6-card grid with real thumbnails) ───────────────────────────
function FilmIndex({ onPlayVideo }: { onPlayVideo: (src: string) => void }) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section className="bg-[#0D0B09] py-28 lg:py-44 px-6 md:px-14 lg:px-20">
      <div className="max-w-[1500px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-20">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="font-mono text-[#F0961B] text-[10px] tracking-[0.5em] uppercase mb-5"
            >
              Film Catalogue
            </motion.p>
            <h2
              className="font-serif text-white leading-[0.92]"
              style={{ fontSize: "clamp(42px, 7vw, 96px)" }}
            >
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block"
              >
                Our films.
              </motion.span>
            </h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-sans text-white/30 text-sm max-w-[260px] leading-relaxed pb-2"
          >
            Six stories. Shot with intention. Delivered with care.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
          {PROJECTS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.65 }}
              className="relative bg-[#0D0B09] cursor-pointer group overflow-hidden"
              style={{ aspectRatio: "4/3" }}
              onClick={() => onPlayVideo(p.src)}
              onMouseEnter={() => setHoveredId(p.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Thumbnail image */}
              <motion.img
                src={p.thumb}
                alt={p.title}
                className="absolute inset-0 w-full h-full object-cover"
                animate={{ scale: hoveredId === p.id ? 1.08 : 1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* Persistent dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

              {/* Hover amber tint */}
              <motion.div
                className="absolute inset-0 bg-[#F0961B]/10 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: hoveredId === p.id ? 1 : 0 }}
                transition={{ duration: 0.45 }}
              />

              {/* Frame # top-left */}
              <div className="absolute top-5 left-5 font-mono text-[10px] text-white/30 tracking-widest">{p.frame}</div>

              {/* Category top-right */}
              <div className="absolute top-5 right-5">
                <span className="font-mono text-[8px] text-white/50 tracking-[0.2em] uppercase">{p.cat}</span>
              </div>

              {/* Play button center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-16 h-16 rounded-full border-2 flex items-center justify-center"
                  animate={{
                    scale: hoveredId === p.id ? 1.15 : 0.85,
                    opacity: hoveredId === p.id ? 1 : 0.4,
                    borderColor: hoveredId === p.id ? "#F0961B" : "rgba(255,255,255,0.4)",
                    backgroundColor: hoveredId === p.id ? "rgba(240,150,27,0.2)" : "transparent",
                  }}
                  transition={{ type: "spring", stiffness: 280, damping: 24 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                </motion.div>
              </div>

              {/* Bottom info */}
              <div className="absolute bottom-0 inset-x-0 p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <motion.h3
                      className="font-serif text-xl leading-tight mb-1"
                      animate={{ color: hoveredId === p.id ? "#F0961B" : "#F5F0E8" }}
                      transition={{ duration: 0.3 }}
                    >
                      {p.title}
                    </motion.h3>
                    <p className="font-serif italic text-white/40 text-xs">{p.sub}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-mono text-[10px] text-white/30 tracking-widest">{p.duration}</p>
                    <p className="font-mono text-[9px] text-white/20 tracking-widest mt-0.5">{p.year}</p>
                  </div>
                </div>
                {/* Amber underline reveal */}
                <motion.div
                  className="h-px mt-4 bg-[#F0961B] origin-left"
                  animate={{ scaleX: hoveredId === p.id ? 1 : 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function Stats() {
  const stats = [
    { num: "100+", label: "Films Delivered" },
    { num: "240+", label: "Happy Clients" },
    { num: "4.9★", label: "Client Rating" },
    { num: "7",    label: "Years Shooting" },
  ];
  return (
    <section className="bg-[#090806] py-24 px-6 md:px-14 lg:px-20 border-t border-white/5">
      <div className="max-w-[1500px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.65 }}
            className="flex flex-col items-center justify-center py-16 bg-[#090806] hover:bg-[#111009] transition-colors"
          >
            <span className="font-serif text-5xl md:text-6xl text-[#F0961B] mb-3">{s.num}</span>
            <span className="font-mono text-[9px] text-white/30 tracking-[0.32em] uppercase">{s.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Services marquee ─────────────────────────────────────────────────────────
function ServicesMarquee() {
  const items = ["Wedding Films", "Brand Commercials", "Event Highlights", "Birthday Reels", "Product Videos", "Documentaries"];
  return (
    <div className="w-full bg-[#3A0E12] py-14 overflow-hidden border-t border-white/5">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 38 }}
        className="flex whitespace-nowrap"
      >
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center px-8 gap-10 text-[#F5F0E8] text-3xl md:text-4xl font-serif italic">
            {items.map((s, j) => (
              <span key={j} className="flex items-center gap-10">
                {s}
                <span className="text-[#F0961B] opacity-30 not-italic">·</span>
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
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
      className="fixed inset-0 z-[500] bg-black flex items-center justify-center"
    >
      {/* Letterbox animation */}
      {(["top", "bottom"] as const).map(pos => (
        <motion.div
          key={pos}
          className={`absolute ${pos}-0 inset-x-0 bg-black z-10`}
          style={{ height: "10vh", originY: pos === "top" ? "top" : "bottom" }}
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ delay: 0.15, duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
        />
      ))}

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

      {project && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="absolute bottom-6 left-8 z-20 flex items-center gap-5"
        >
          <span className="font-mono text-[9px] text-[#F0961B] tracking-[0.3em] uppercase">{project.cat}</span>
          <span className="font-serif text-white/55 text-sm">{project.title}</span>
          <span className="font-mono text-[9px] text-white/25">{project.frame} / 006</span>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Videography() {
  const [playingSrc, setPlayingSrc] = useState<string | null>(null);

  return (
    <div className="w-full flex flex-col" style={{ background: "#0D0B09" }}>
      <Grain />
      <VideoHero onWatch={() => setPlayingSrc(VIDEO_SRC)} />
      <Showreel onWatch={() => setPlayingSrc(VIDEO_SRC)} />
      <FilmDivider />
      <FilmIndex onPlayVideo={setPlayingSrc} />
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
