import { useState, useRef, useEffect } from "react";
import {
  motion, AnimatePresence,
  useScroll, useTransform, useInView,
  useMotionValue, useSpring,
} from "framer-motion";

// ─── Data ─────────────────────────────────────────────────────────────────────
const VIDEO_SRC = "/images/client-video-1.mp4";

const PROJECTS = [
  { id: 1, frame: "001", title: "The Kafidiyas",       sub: "A Short Story of an Unending Love", cat: "Wedding Film",     duration: "4:20", year: "2025", src: VIDEO_SRC },
  { id: 2, frame: "002", title: "Elevate Boutique",    sub: "Dressed in confidence",              cat: "Brand Commercial", duration: "1:45", year: "2025", src: VIDEO_SRC },
  { id: 3, frame: "003", title: "South Kitchen",       sub: "Food is an emotion",                 cat: "Commercial",       duration: "2:10", year: "2024", src: VIDEO_SRC },
  { id: 4, frame: "004", title: "The Archers Evening", sub: "An evening worth remembering",       cat: "Event Highlight",  duration: "3:10", year: "2025", src: VIDEO_SRC },
  { id: 5, frame: "005", title: "Jisola 30th",         sub: "Thirty and thriving",                cat: "Birthday Reel",    duration: "1:15", year: "2025", src: VIDEO_SRC },
  { id: 6, frame: "006", title: "Aisha & Tobi",        sub: "Where two worlds meet",              cat: "Wedding Film",     duration: "5:20", year: "2024", src: VIDEO_SRC },
];

// ─── Count-up hook ─────────────────────────────────────────────────────────────
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

// ─── Magnetic button ───────────────────────────────────────────────────────────
function MagneticBtn({
  children,
  className,
  onClick,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const xMV = useMotionValue(0);
  const yMV = useMotionValue(0);
  const x = useSpring(xMV, { stiffness: 220, damping: 18 });
  const y = useSpring(yMV, { stiffness: 220, damping: 18 });

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    xMV.set((e.clientX - (r.left + r.width / 2)) * 0.35);
    yMV.set((e.clientY - (r.top + r.height / 2)) * 0.35);
  };
  const onLeave = () => { xMV.set(0); yMV.set(0); };

  const inner = (
    <motion.div
      className={`cursor-pointer select-none ${className}`}
      style={{ x, y }}
      whileTap={{ scale: 0.96 }}
    >
      {children}
    </motion.div>
  );

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} onClick={onClick}>
      {href ? <a href={href} target="_blank" rel="noreferrer">{inner}</a> : inner}
    </div>
  );
}

// ─── Word-by-word animated headline (animate, not whileInView) ────────────────
function AnimHero({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.2em]">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// ─── Scroll-reveal headline (whileInView) ─────────────────────────────────────
function AnimScroll({ text, className, delayStart = 0 }: { text: string; className?: string; delayStart?: number }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.22em] mb-1">
          <motion.span
            className="inline-block"
            custom={delayStart + i}
            variants={{
              hidden: { y: "110%", opacity: 0 },
              visible: (d: number) => ({
                y: 0, opacity: 1,
                transition: { delay: d * 0.1, duration: 0.75, ease: [0.16, 1, 0.3, 1] },
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

// ─── Video Hero ────────────────────────────────────────────────────────────────
function VideoHero({ onWatch, onBook }: { onWatch: () => void; onBook: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const y        = useTransform(scrollYProgress, [0, 1], ["0%", "32%"]);
  const opacity  = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const barScale = useTransform(scrollYProgress, [0, 0.28], [1, 0]);

  useEffect(() => { videoRef.current?.play().catch(() => {}); }, []);

  return (
    <section ref={containerRef} className="relative w-full overflow-hidden bg-[#1a100a]" style={{ height: "100svh", minHeight: 620 }}>

      {/* Parallax video */}
      <motion.div className="absolute inset-0" style={{ y }}>
        <video ref={videoRef} src={VIDEO_SRC} muted loop playsInline preload="auto"
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/15 to-black/70 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />
      </motion.div>
      {/* Fallback bg */}
      <div className="absolute inset-0 bg-[#1a100a] -z-10" />

      {/* Cinematic letterbox bars */}
      <motion.div className="absolute top-0 inset-x-0 bg-black z-30 origin-top pointer-events-none" style={{ height: "7vh", scaleY: barScale }} />
      <motion.div className="absolute bottom-0 inset-x-0 bg-black z-30 origin-bottom pointer-events-none" style={{ height: "7vh", scaleY: barScale }} />

      {/* REC */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="absolute top-8 left-8 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full">
        <motion.div className="w-2 h-2 rounded-full bg-[#F0961B]"
          animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 1.4 }} />
        <span className="font-mono text-[9px] text-white/65 tracking-[0.28em] uppercase">REC · GVS 2025</span>
      </motion.div>

      {/* Frame counter */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        className="absolute top-8 right-8 z-20 font-mono text-[10px] text-white/35 tracking-[0.2em]">
        001 / 006
      </motion.div>

      {/* Hero copy */}
      <motion.div className="absolute inset-0 z-10 flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-[7vh]" style={{ opacity }}>

        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.7 }}
          className="font-mono text-[#F0961B] text-[10px] tracking-[0.5em] uppercase mb-7">
          Ginger Studios · Motion
        </motion.p>

        <h1 className="font-serif text-white leading-[0.88] tracking-tight mb-9 overflow-hidden"
          style={{ fontSize: "clamp(58px, 10.5vw, 152px)" }}>
          <AnimHero text="We make" />
          <br />
          <span className="inline-block overflow-hidden">
            <motion.span className="inline-block text-[#F0961B] italic"
              initial={{ y: "115%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.46, duration: 0.95, ease: [0.16, 1, 0.3, 1] }}>
              films.
            </motion.span>
          </span>
        </h1>

        <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.72, duration: 0.8 }}
          className="font-serif italic text-white/45 text-xl md:text-2xl max-w-sm mb-12">
          Every frame, a feeling. Every second, preserved.
        </motion.p>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0, duration: 0.7 }}
          className="flex flex-wrap items-center gap-5">
          {/* Watch */}
          <button onClick={onWatch} className="group flex items-center gap-4">
            <motion.div className="w-14 h-14 rounded-full border-2 border-[#F0961B]/70 flex items-center justify-center"
              whileHover={{ scale: 1.12, borderColor: "#F0961B", backgroundColor: "rgba(240,150,27,0.12)" }}
              whileTap={{ scale: 0.94 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#F0961B"><path d="M8 5v14l11-7z" /></svg>
            </motion.div>
            <div>
              <p className="text-white font-serif text-base group-hover:text-[#F0961B] transition-colors duration-300">Watch The Kafidiyas</p>
              <p className="text-white/35 font-mono text-[9px] tracking-[0.22em] uppercase mt-0.5">Wedding Film · 4:20</p>
            </div>
          </button>

          {/* Divider */}
          <div className="hidden sm:block w-px h-10 bg-white/15" />

          {/* Book */}
          <motion.button onClick={onBook}
            className="flex items-center gap-2 bg-[#F0961B] text-white px-6 py-3 rounded-sm font-sans text-sm tracking-[0.15em] uppercase font-semibold"
            whileHover={{ scale: 1.04, backgroundColor: "#e8870f" }}
            whileTap={{ scale: 0.97 }}>
            Book Your Film
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
        <motion.div className="w-px h-10 bg-gradient-to-b from-[#F0961B] to-transparent"
          animate={{ scaleY: [0, 1, 0], originY: 0 }}
          transition={{ repeat: Infinity, duration: 1.7, ease: "easeInOut" }} />
        <span className="font-mono text-[8px] text-white/28 tracking-[0.32em] uppercase">Scroll</span>
      </motion.div>
    </section>
  );
}

// ─── Featured film (cream section) ────────────────────────────────────────────
function FeaturedFilm({ onWatch, onBook }: { onWatch: () => void; onBook: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const previewRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => { previewRef.current?.play().catch(() => {}); }, []);

  return (
    <section className="bg-[#FBF6EE] py-24 lg:py-40 px-8 md:px-16 lg:px-24 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">

        {/* Label */}
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.55 }} className="flex items-center gap-4 mb-16">
          <div className="w-10 h-px bg-[#F0961B]" />
          <span className="font-mono text-[10px] text-[#211C17]/45 tracking-[0.38em] uppercase">Featured Film · 001</span>
        </motion.div>

        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Video card */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-video bg-[#211C17] rounded-2xl overflow-hidden cursor-pointer group shadow-[0_32px_80px_-16px_rgba(33,28,23,0.3)]"
            onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={onWatch}>

            <video ref={previewRef} src={VIDEO_SRC} muted loop playsInline preload="auto"
              className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-[1.04]" />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/12 transition-colors duration-600" />

            {/* Category badge */}
            <div className="absolute top-5 left-5 flex items-center gap-2 bg-[#F0961B] px-3 py-1 rounded-sm">
              <span className="font-mono text-[9px] text-white tracking-[0.22em] uppercase font-bold">Wedding Film</span>
            </div>
            <div className="absolute top-5 right-5 bg-black/55 backdrop-blur-sm px-3 py-1.5 rounded-sm border border-white/10">
              <span className="font-mono text-[10px] text-white/80 tracking-widest">4:20</span>
            </div>

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div className="w-20 h-20 rounded-full bg-[#F0961B] flex items-center justify-center shadow-2xl"
                animate={{ scale: hovered ? 1.12 : 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 20 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
              </motion.div>
            </div>

            {/* Hover label */}
            <motion.div className="absolute bottom-5 left-5 right-5"
              initial={{ opacity: 0, y: 6 }} animate={hovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
              transition={{ duration: 0.3 }}>
              <p className="font-mono text-[9px] text-white/55 tracking-[0.25em] uppercase">Click to watch full film</p>
            </motion.div>
          </motion.div>

          {/* Copy */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}>

            <p className="font-mono text-[#F0961B] text-[10px] tracking-[0.42em] uppercase mb-5">2025</p>
            <h2 className="font-serif text-[#211C17] leading-[1.02] mb-5" style={{ fontSize: "clamp(36px, 5vw, 64px)" }}>
              The Kafidiyas
            </h2>
            <p className="font-serif italic text-[#211C17]/45 text-2xl mb-8">A Short Story of an Unending Love</p>
            <p className="font-sans text-[#211C17]/55 text-sm leading-relaxed mb-10 max-w-xs">
              From a quiet morning in Abeokuta to a rooftop celebration under the stars — a cinematic record of a love story that refused to be ordinary.
            </p>

            <div className="grid grid-cols-3 gap-5 mb-10 border-t border-b border-[#211C17]/10 py-6">
              {[["Duration", "4:20"], ["Year", "2025"], ["Type", "Wedding"]].map(([k, v]) => (
                <div key={k}>
                  <p className="font-mono text-[8px] text-[#211C17]/35 tracking-[0.28em] uppercase mb-1.5">{k}</p>
                  <p className="font-serif text-[#211C17] text-lg">{v}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.button onClick={onWatch}
                className="group flex items-center gap-2 bg-[#211C17] text-[#FBF6EE] px-7 py-3.5 rounded-sm font-sans text-sm tracking-[0.14em] uppercase font-semibold"
                whileHover={{ backgroundColor: "#3a2a22", x: 3 }} whileTap={{ scale: 0.97 }}>
                Watch Full Film
                <svg className="group-hover:translate-x-1 transition-transform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </motion.button>

              <motion.button onClick={onBook}
                className="flex items-center gap-2 border border-[#F0961B] text-[#F0961B] px-7 py-3.5 rounded-sm font-sans text-sm tracking-[0.14em] uppercase font-semibold"
                whileHover={{ backgroundColor: "rgba(240,150,27,0.08)", x: 3 }} whileTap={{ scale: 0.97 }}>
                Book a Film Like This
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Film strip ────────────────────────────────────────────────────────────────
function FilmStrip() {
  const items = [
    "WEDDING · 2025", "BRAND FILM · 2025", "COMMERCIAL · 2024", "EVENT · 2025",
    "PORTRAIT · 2025", "BIRTHDAY REEL · 2025", "WEDDING · 2024", "DOCUMENTARY · 2024",
  ];
  const doubled = [...items, ...items];
  return (
    <div className="w-full overflow-hidden bg-[#211C17] border-y border-[#FBF6EE]/5">
      <div className="h-7 bg-[#111] flex items-center justify-around px-2">
        {[...Array(60)].map((_, i) => <div key={i} className="w-3.5 h-4 rounded-[2px] bg-[#211C17] border border-[#333] flex-shrink-0" />)}
      </div>
      <div className="relative overflow-hidden" style={{ height: 120 }}>
        <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ repeat: Infinity, ease: "linear", duration: 52 }}
          className="absolute top-0 left-0 flex h-full">
          {doubled.map((label, i) => (
            <div key={i} className="flex-shrink-0 h-full flex flex-col items-center justify-center border-r border-[#FBF6EE]/5 relative" style={{ width: 168 }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[#F0961B]/5 to-transparent" />
              <span className="font-mono text-[#F0961B]/14 text-4xl font-bold mb-1">
                {String((i % 8) + 1).padStart(4, "0")}
              </span>
              <span className="font-mono text-[9px] text-[#FBF6EE]/22 tracking-[0.18em] uppercase text-center px-2">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
      <div className="h-7 bg-[#111] flex items-center justify-around px-2">
        {[...Array(60)].map((_, i) => <div key={i} className="w-3.5 h-4 rounded-[2px] bg-[#211C17] border border-[#333] flex-shrink-0" />)}
      </div>
    </div>
  );
}

// ─── Projects grid ─────────────────────────────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 52 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.09, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

function ProjectsGrid({ onPlayVideo, onBook }: { onPlayVideo: (src: string) => void; onBook: () => void }) {
  return (
    <section className="bg-[#FBF6EE] py-24 lg:py-40 px-8 md:px-16 lg:px-24">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <h2 className="font-serif text-[#211C17] leading-tight" style={{ fontSize: "clamp(40px, 6.5vw, 88px)" }}>
            <AnimScroll text="Our films." />
          </h2>
          <div className="md:text-right pb-1">
            <p className="font-sans text-[#211C17]/45 text-sm max-w-xs leading-relaxed">
              Six stories. Shot with intention. Delivered with care.
            </p>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="font-mono text-[9px] text-[#F0961B] tracking-[0.3em] uppercase mt-3">
              006 works · 2024 – 2025
            </motion.p>
          </div>
        </div>

        {/* Cards — skip first (featured above) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PROJECTS.slice(1).map((p, i) => (
            <motion.div key={p.id} custom={i} variants={cardVariants} initial="hidden"
              whileInView="visible" viewport={{ once: true, margin: "-50px" }}
              className="group cursor-pointer" onClick={() => onPlayVideo(p.src)}>

              {/* Card face */}
              <div className="relative aspect-[4/3] bg-[#211C17] rounded-xl overflow-hidden mb-5">
                {/* Warm radial glow — unique per card */}
                <div className="absolute inset-0"
                  style={{ background: `radial-gradient(ellipse at ${18 + i * 16}% ${28 + i * 11}%, rgba(240,150,27,0.2) 0%, transparent 62%)` }} />
                {/* Grid texture */}
                <div className="absolute inset-0 opacity-[0.035]"
                  style={{ backgroundImage: "linear-gradient(#FBF6EE 1px,transparent 1px),linear-gradient(90deg,#FBF6EE 1px,transparent 1px)", backgroundSize: "30px 30px" }} />

                <div className="absolute top-4 left-4 font-mono text-white/20 text-xs tracking-widest">{p.frame}</div>
                <div className="absolute top-4 right-4 bg-[#F0961B]/14 border border-[#F0961B]/28 px-3 py-1 rounded-full">
                  <span className="font-mono text-[8px] text-[#F0961B] tracking-[0.22em] uppercase">{p.cat}</span>
                </div>

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-14 h-14 rounded-full border-2 border-[#F0961B]/35 flex items-center justify-center"
                    whileHover={{ scale: 1.18, borderColor: "#F0961B", backgroundColor: "rgba(240,150,27,0.12)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                  </motion.div>
                </div>

                {/* Amber edge glow on hover */}
                <motion.div className="absolute inset-0 pointer-events-none rounded-xl"
                  initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.35 }}
                  style={{ boxShadow: "inset 0 0 60px rgba(240,150,27,0.13)" }} />

                <div className="absolute bottom-4 right-4 font-mono text-xs text-white/32 tracking-widest">{p.duration}</div>
              </div>

              {/* Text */}
              <div className="flex items-start justify-between">
                <div>
                  <motion.h3 className="font-serif text-[#211C17] text-2xl mb-1"
                    whileHover={{ color: "#F0961B" }} transition={{ duration: 0.25 }}>
                    {p.title}
                  </motion.h3>
                  <p className="font-serif italic text-[#211C17]/38 text-sm">{p.sub}</p>
                </div>
                <span className="font-mono text-[9px] text-[#211C17]/28 tracking-widest mt-1.5">{p.year}</span>
              </div>

              {/* Underline reveal */}
              <motion.div className="h-px bg-[#F0961B] mt-4 origin-left"
                initial={{ scaleX: 0 }} whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} />
            </motion.div>
          ))}
        </div>

        {/* In-grid booking nudge */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-20 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-[#211C17]/10 pt-12">
          <div>
            <p className="font-serif text-[#211C17] text-2xl">Don't see your story yet?</p>
            <p className="font-sans text-[#211C17]/45 text-sm mt-1">Every shoot is unique. Let's create yours together.</p>
          </div>
          <motion.button onClick={onBook}
            className="flex-shrink-0 flex items-center gap-2 bg-[#211C17] text-[#FBF6EE] px-8 py-4 rounded-sm font-sans text-sm tracking-[0.16em] uppercase font-semibold whitespace-nowrap"
            whileHover={{ backgroundColor: "#F0961B", x: 4 }} whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.3 }}>
            Request a Custom Film
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Booking band ──────────────────────────────────────────────────────────────
function BookingBand() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  // WhatsApp link — replace number with real Ginger Studios number
  const WA_LINK = "https://wa.me/2348000000000?text=Hi%20Ginger%20Studios!%20I%27d%20like%20to%20book%20a%20film.";

  return (
    <section className="bg-[#211C17] py-24 lg:py-36 px-8 md:px-16 lg:px-24 overflow-hidden" ref={ref}>
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
              style={{ fontSize: "clamp(36px, 5.5vw, 72px)" }}>
              Every moment deserves to be<br />
              <span className="text-[#F0961B] italic">preserved forever.</span>
            </motion.h2>

            <motion.p initial={{ opacity: 0, y: 14 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="font-sans text-[#FBF6EE]/45 text-base leading-relaxed max-w-md mb-10">
              Whether it's your wedding, a brand story, or a milestone birthday — we craft cinematic films that feel exactly like you.
              Delivered within <strong className="text-[#FBF6EE]/70">7 days</strong>.
            </motion.p>

            {/* Trust signals */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-6 mb-12">
              {["★★★★★ · 4.9 Rating", "240+ Happy Clients", "100+ Films Delivered", "Based in Abeokuta"].map(t => (
                <span key={t} className="font-mono text-[9px] text-[#F0961B]/70 tracking-[0.22em] uppercase">{t}</span>
              ))}
            </motion.div>

            {/* CTA buttons */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.38 }}
              className="flex flex-wrap gap-4">
              <MagneticBtn
                href={WA_LINK}
                className="flex items-center gap-3 bg-[#F0961B] text-white px-8 py-4 rounded-sm font-sans text-sm tracking-[0.16em] uppercase font-semibold hover:bg-[#e8870f] transition-colors">
                {/* WhatsApp icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.107 1.516 5.832L0 24l6.335-1.493A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.011-1.374l-.36-.214-3.732.879.894-3.648-.235-.374A9.818 9.818 0 1112 21.818z"/>
                </svg>
                Book on WhatsApp
              </MagneticBtn>

              <MagneticBtn
                href="mailto:hello@gingerstudios.com"
                className="flex items-center gap-2 border border-[#FBF6EE]/25 text-[#FBF6EE]/70 hover:border-[#FBF6EE]/50 hover:text-[#FBF6EE] px-7 py-4 rounded-sm font-sans text-sm tracking-[0.14em] uppercase font-semibold transition-colors">
                Send an Email
              </MagneticBtn>
            </motion.div>
          </div>

          {/* Right — decorative price card */}
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
                      <p className="font-serif text-[#FBF6EE] text-lg group-hover:text-[#F0961B] transition-colors duration-250">{title}</p>
                      <p className="font-sans text-[#FBF6EE]/35 text-xs leading-relaxed mt-0.5">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-10 pt-8 border-t border-[#FBF6EE]/8">
                <p className="font-mono text-[9px] text-[#FBF6EE]/25 tracking-[0.3em] uppercase">Pricing</p>
                <p className="font-serif text-[#FBF6EE]/70 text-lg mt-1">Packages starting from <span className="text-[#F0961B]">₦150,000</span></p>
                <p className="font-sans text-[#FBF6EE]/30 text-xs mt-1">Custom quotes available — reach out to get yours.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats (with count-up) ─────────────────────────────────────────────────────
function StatCard({ num, suffix, label }: { num: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const val = useCountUp(num, inView, 1400);
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.65 }}
      className="flex flex-col items-center justify-center py-16 bg-[#211C17] hover:bg-[#271e18] transition-colors">
      <span className="font-serif text-5xl md:text-6xl text-[#F0961B] mb-3">{val}{suffix}</span>
      <span className="font-mono text-[9px] text-[#FBF6EE]/35 tracking-[0.32em] uppercase">{label}</span>
    </motion.div>
  );
}

function Stats() {
  return (
    <section className="bg-[#211C17] border-t border-[#FBF6EE]/5 py-0 px-8 md:px-16 lg:px-24">
      <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-[#FBF6EE]/5">
        <StatCard num={100} suffix="+" label="Films Delivered" />
        <StatCard num={240} suffix="+" label="Happy Clients" />
        <StatCard num={49} suffix="★" label="Client Rating (÷10)" />
        <StatCard num={7} suffix="" label="Years Shooting" />
      </div>
    </section>
  );
}

// ─── Services marquee ──────────────────────────────────────────────────────────
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
      {/* Book CTA below marquee */}
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

// ─── Booking modal (scroll to contact) ────────────────────────────────────────
function BookingModal({ onClose }: { onClose: () => void }) {
  const WA_LINK = "https://wa.me/2348000000000?text=Hi%20Ginger%20Studios!%20I%27d%20like%20to%20book%20a%20film.";
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
      onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
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
            Chat on WhatsApp
          </a>
          <a href="mailto:hello@gingerstudios.com"
            className="flex items-center justify-center gap-2 w-full border border-[#FBF6EE]/15 text-[#FBF6EE]/65 hover:border-[#FBF6EE]/30 hover:text-[#FBF6EE] px-6 py-4 rounded-sm font-sans text-sm tracking-[0.12em] uppercase font-semibold transition-colors">
            Send an Email
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Video modal ───────────────────────────────────────────────────────────────
function VideoModal({ src, onClose }: { src: string; onClose: () => void }) {
  const project = PROJECTS.find(p => p.src === src);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }} className="fixed inset-0 z-[500] flex items-center justify-center bg-black">
      {(["top", "bottom"] as const).map(pos => (
        <motion.div key={pos} className={`absolute ${pos}-0 inset-x-0 bg-black z-10`}
          style={{ height: "10vh", originY: pos === "top" ? "top" : "bottom" }}
          initial={{ scaleY: 1 }} animate={{ scaleY: 0 }}
          transition={{ delay: 0.15, duration: 0.52, ease: [0.76, 0, 0.24, 1] }} />
      ))}
      <video key={src} src={src} controls autoPlay className="w-full h-full object-contain" />
      <button onClick={onClose}
        className="absolute top-5 right-6 z-20 w-10 h-10 rounded-full border border-white/20 hover:bg-white/10 flex items-center justify-center text-white transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      {project && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="absolute bottom-5 left-8 z-20 flex items-center gap-5">
          <span className="font-mono text-[9px] text-[#F0961B] tracking-[0.3em] uppercase">{project.cat}</span>
          <span className="font-serif text-white/55 text-sm">{project.title}</span>
          <span className="font-mono text-[9px] text-white/25">{project.frame} / 006</span>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function Videography() {
  const [playingSrc, setPlayingSrc] = useState<string | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  return (
    <div className="w-full flex flex-col bg-[#FBF6EE]">
      <VideoHero onWatch={() => setPlayingSrc(VIDEO_SRC)} onBook={() => setShowBooking(true)} />
      <FeaturedFilm onWatch={() => setPlayingSrc(VIDEO_SRC)} onBook={() => setShowBooking(true)} />
      <FilmStrip />
      <ProjectsGrid onPlayVideo={setPlayingSrc} onBook={() => setShowBooking(true)} />
      <BookingBand />
      <Stats />
      <ServicesMarquee onBook={() => setShowBooking(true)} />

      <AnimatePresence>
        {playingSrc && <VideoModal key="vid" src={playingSrc} onClose={() => setPlayingSrc(null)} />}
        {showBooking && <BookingModal key="book" onClose={() => setShowBooking(false)} />}
      </AnimatePresence>
    </div>
  );
}
