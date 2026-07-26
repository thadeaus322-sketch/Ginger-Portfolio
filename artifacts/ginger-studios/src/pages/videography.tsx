import { useState, useRef, useEffect, useCallback } from "react";
import {
  motion, AnimatePresence,
  useScroll, useTransform, useInView, useMotionValue, useSpring,
} from "framer-motion";

// ─── Brand ────────────────────────────────────────────────────────────────────
const WA_LINK = "https://wa.me/2347067310008?text=Hi%20Ginger%20Studios!%20I%27d%20like%20to%20book%20a%20film.";
const EMAIL   = "hi@gvs.com.ng";
const PHONE1  = "07067310008";

// ─── The 3 real films ─────────────────────────────────────────────────────────
const FILMS = [
  {
    id:    1,
    src:   "/images/video-reel-1.mp4",
    title: "The Kafidiyas",
    sub:   "A short story of an unending love",
    cat:   "Couples Film",
    frame: "001 / 003",
    year:  "2025",
    color: "#C8853A",
  },
  {
    id:    2,
    src:   "/images/video-reel-2.mp4",
    title: "SOEY",
    sub:   "A vision. A brand. A story.",
    cat:   "Brand Commercial",
    frame: "002 / 003",
    year:  "2025",
    color: "#A0522D",
  },
  {
    id:    3,
    src:   "/images/video-reel-3.mp4",
    title: "GVS Reel 2026",
    sub:   "Moments worth keeping",
    cat:   "Studio Showreel",
    frame: "003 / 003",
    year:  "2026",
    color: "#8B4513",
  },
];

// ─── Count-up ─────────────────────────────────────────────────────────────────
function useCountUp(to: number, inView: boolean, duration = 1400) {
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

// ─── Word entrance ────────────────────────────────────────────────────────────
function SplitText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.18em]">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: delay + i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >{w}</motion.span>
        </span>
      ))}
    </span>
  );
}

function SplitScroll({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.2em] mb-1">
          <motion.span
            className="inline-block"
            custom={i}
            variants={{
              hidden: { y: "110%", opacity: 0 },
              visible: (d: number) => ({
                y: 0, opacity: 1,
                transition: { delay: d * 0.09, duration: 0.75, ease: [0.16, 1, 0.3, 1] },
              }),
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >{w}</motion.span>
        </span>
      ))}
    </span>
  );
}

// ─── Film sprocket strip ───────────────────────────────────────────────────────
function Sprockets({ side }: { side: "left" | "right" }) {
  return (
    <div className={`absolute top-0 bottom-0 ${side === "left" ? "left-0" : "right-0"} w-7 flex flex-col justify-around items-center bg-[#1a1410] z-10 py-2`}>
      {[...Array(18)].map((_, i) => (
        <div key={i} className="w-3.5 h-2.5 rounded-[2px] bg-[#FBF6EE]/10 border border-[#FBF6EE]/6" />
      ))}
    </div>
  );
}

// ─── Grain overlay ────────────────────────────────────────────────────────────
function Grain({ opacity = 0.04 }: { opacity?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-0"
      style={{
        opacity,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundSize: "160px",
      }} />
  );
}

// ─── Cinema Hero ──────────────────────────────────────────────────────────────
function CinemaHero({ onBook }: { onBook: () => void }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const vidRef  = useRef<HTMLVideoElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const videoY      = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const scaleFrame  = useTransform(scrollYProgress, [0, 0.5], [1, 1.05]);
  const textY       = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);

  // Mouse tilt on frame
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 120, damping: 22 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 120, damping: 22 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    v.play().catch(() => {});
  }, []);

  return (
    <section ref={heroRef} className="relative bg-[#FBF6EE] overflow-hidden min-h-[100svh] flex items-center">
      <Grain opacity={0.03} />

      {/* Ambient warm glow top-right */}
      <div className="absolute top-0 right-0 w-[60vw] h-[60vw] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(240,150,27,0.08) 0%, transparent 65%)" }} />

      <motion.div style={{ opacity: heroOpacity }}
        className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-16 xl:px-24 py-32 lg:py-0 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left copy */}
        <motion.div style={{ y: textY }} className="order-2 lg:order-1">
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.6 }}
            className="flex items-center gap-3 mb-8">
            <motion.div className="h-px bg-[#F0961B]"
              initial={{ width: 0 }} animate={{ width: 32 }}
              transition={{ delay: 0.3, duration: 0.6 }} />
            <span className="font-mono text-[#F0961B] text-[10px] tracking-[0.5em] uppercase">Ginger Studios · Motion</span>
          </motion.div>

          <h1 className="font-serif text-[#211C17] leading-[0.88] tracking-tight mb-8"
            style={{ fontSize: "clamp(54px, 8.5vw, 128px)" }}>
            <SplitText text="We make" delay={0.2} />
            <br />
            <span className="inline-block overflow-hidden">
              <motion.span className="inline-block text-[#F0961B] italic"
                initial={{ y: "115%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.48, duration: 0.95, ease: [0.16, 1, 0.3, 1] }}>
                films.
              </motion.span>
            </span>
          </h1>

          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.72, duration: 0.7 }}
            className="font-serif italic text-[#211C17]/40 text-xl md:text-2xl max-w-sm mb-12 leading-relaxed">
            Every frame, a feeling.<br />Every second, preserved.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.7 }}
            className="flex flex-wrap gap-4 items-center">
            <motion.button onClick={onBook}
              className="group flex items-center gap-3 bg-[#211C17] text-[#FBF6EE] px-7 py-4 rounded-sm font-sans text-sm tracking-[0.16em] uppercase font-semibold shadow-lg"
              whileHover={{ backgroundColor: "#F0961B", scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.22 }}>
              Book Your Film
              <motion.svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                whileHover={{ x: 3 }}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </motion.svg>
            </motion.button>

            <motion.a href="#films"
              className="flex items-center gap-2 text-[#211C17]/50 hover:text-[#211C17] font-mono text-[10px] tracking-[0.25em] uppercase transition-colors group"
              whileHover={{ y: 1 }}>
              <motion.div className="w-5 h-5 rounded-full border border-[#211C17]/25 flex items-center justify-center group-hover:border-[#F0961B] transition-colors">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
              </motion.div>
              View Films
            </motion.a>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.7 }}
            className="flex gap-10 mt-16 pt-12 border-t border-[#211C17]/8">
            {[["100+", "Films"], ["240+", "Clients"], ["7yrs", "Shooting"]].map(([n, l]) => (
              <div key={l}>
                <p className="font-serif text-[28px] text-[#211C17] leading-none">{n}</p>
                <p className="font-mono text-[9px] text-[#211C17]/30 tracking-[0.28em] uppercase mt-2">{l}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: Cinema Frame — keeps playing */}
        <div className="order-1 lg:order-2 relative" onMouseMove={handleMouse} onMouseLeave={() => { mx.set(0); my.set(0); }}>
          <motion.div
            style={{ scale: scaleFrame, rotateX: rx, rotateY: ry, maxWidth: 590, transformStyle: "preserve-3d" } as React.CSSProperties}
            initial={{ opacity: 0, x: 50, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.28, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto">
            <div className="relative bg-[#1a1410] rounded-xl overflow-hidden shadow-[0_60px_140px_-20px_rgba(33,28,23,0.45)]">
              <Sprockets side="left" />
              <Sprockets side="right" />

              <div className="mx-7 relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                <motion.div style={{ y: videoY }} className="w-full h-[115%] -top-[5%] absolute inset-x-0">
                  <video
                    ref={vidRef}
                    src={FILMS[0].src}
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload="auto"
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* Vignette */}
                <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.5)] pointer-events-none" />
                {/* Bottom grad */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

                {/* REC */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/55 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/8">
                  <motion.div className="w-1.5 h-1.5 rounded-full bg-[#F0961B]"
                    animate={{ opacity: [1, 0.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }} />
                  <span className="font-mono text-[7px] text-white/60 tracking-[0.3em] uppercase">REC</span>
                </div>

                {/* Film info */}
                <motion.div className="absolute bottom-3 left-3 right-3 flex items-end justify-between"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.6 }}>
                  <div>
                    <p className="font-mono text-[7px] text-[#F0961B] tracking-[0.3em] uppercase mb-1">{FILMS[0].cat}</p>
                    <p className="font-serif text-white text-sm leading-tight">{FILMS[0].title}</p>
                    <p className="font-serif italic text-white/40 text-xs mt-0.5">{FILMS[0].sub}</p>
                  </div>
                  <span className="font-mono text-[7px] text-white/30 tracking-widest">{FILMS[0].frame}</span>
                </motion.div>
              </div>

              {/* Data bar */}
              <div className="mx-7 py-3 flex justify-between border-t border-white/5">
                <span className="font-mono text-[7px] text-white/25 tracking-[0.2em]">GVS · MOTION · 2025</span>
                <span className="font-mono text-[7px] text-white/15 tracking-widest">4K · COLOR GRADE</span>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              className="absolute -bottom-5 -right-3 bg-[#F0961B] text-white px-4 py-2 rounded-sm shadow-lg z-20"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}>
              <p className="font-mono text-[9px] tracking-[0.22em] uppercase font-bold">Now Playing</p>
            </motion.div>

            {/* Glow */}
            <div className="absolute -inset-6 -z-10 rounded-2xl opacity-20"
              style={{ background: "radial-gradient(ellipse at 60% 50%, #F0961B 0%, transparent 70%)" }} />
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>
        <motion.div className="w-px h-12 bg-gradient-to-b from-[#211C17]/35 to-transparent origin-top"
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }} />
        <span className="font-mono text-[8px] text-[#211C17]/22 tracking-[0.38em] uppercase">Scroll</span>
      </motion.div>
    </section>
  );
}

// ─── Live Video Reel Strip ─────────────────────────────────────────────────────
// All 3 videos auto-playing silently in a cinematic marquee
function VideoReelStrip() {
  const stripRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          videoRefs.current.forEach(v => {
            if (!v) return;
            if (entry.isIntersecting) v.play().catch(() => {});
            else v.pause();
          });
        });
      },
      { threshold: 0.1 }
    );
    if (stripRef.current) observer.observe(stripRef.current);
    return () => observer.disconnect();
  }, []);

  // 3 videos repeated to fill the strip
  const items = [...FILMS, ...FILMS, ...FILMS];

  return (
    <div ref={stripRef} className="w-full overflow-hidden bg-[#0f0c09] border-y border-[#FBF6EE]/4 relative">
      {/* Sprocket top */}
      <div className="h-5 bg-[#070504] flex items-center gap-1 px-2 overflow-hidden">
        {[...Array(100)].map((_, i) => (
          <div key={i} className="w-3 h-3 rounded-[2px] bg-[#1a1410] border border-[#333] flex-shrink-0" />
        ))}
      </div>

      {/* Scrolling video strip */}
      <div className="relative overflow-hidden" style={{ height: 220 }}>
        {/* Left/right fade */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, #0f0c09, transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, #0f0c09, transparent)" }} />

        <motion.div
          animate={{ x: ["0%", "-33.33%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 28 }}
          className="absolute top-0 left-0 flex h-full gap-4 items-center px-4"
          style={{ width: "300%" }}>
          {items.map((f, i) => (
            <div key={i} className="relative flex-shrink-0 rounded-md overflow-hidden group cursor-pointer"
              style={{ width: 360, height: 200 }}>
              <video
                ref={el => { if (i < 3) videoRefs.current[i] = el; }}
                src={f.src}
                muted
                loop
                playsInline
                preload="metadata"
                className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="font-mono text-[7px] text-[#F0961B] tracking-[0.28em] uppercase">{f.cat}</span>
                <p className="font-serif text-white text-sm leading-tight mt-0.5">{f.title}</p>
              </div>
              {/* Play pulse */}
              <div className="absolute top-3 right-3">
                <motion.div className="w-2 h-2 rounded-full bg-[#F0961B]"
                  animate={{ opacity: [1, 0.2, 1], scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }} />
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Sprocket bottom */}
      <div className="h-5 bg-[#070504] flex items-center gap-1 px-2 overflow-hidden">
        {[...Array(100)].map((_, i) => (
          <div key={i} className="w-3 h-3 rounded-[2px] bg-[#1a1410] border border-[#333] flex-shrink-0" />
        ))}
      </div>
    </div>
  );
}

// ─── Portfolio Grid ────────────────────────────────────────────────────────────
function PortfolioSection({ onPlay, onBook }: { onPlay: (src: string) => void; onBook: () => void }) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const timerRef  = useRef<ReturnType<typeof setTimeout>>();

  const goTo = useCallback((idx: number, dir: 1 | -1) => {
    setDirection(dir);
    setActive(idx);
  }, []);

  const next = useCallback(() => {
    goTo((active + 1) % FILMS.length, 1);
  }, [active, goTo]);

  const prev = useCallback(() => {
    goTo((active - 1 + FILMS.length) % FILMS.length, -1);
  }, [active, goTo]);

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) { v.currentTime = 0; v.play().catch(() => {}); }
      else { v.pause(); v.currentTime = 0; }
    });
  }, [active]);

  useEffect(() => {
    timerRef.current = setTimeout(next, 10000);
    return () => clearTimeout(timerRef.current);
  }, [active, next]);

  const slideV = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0, scale: 0.94 }),
    center: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const } },
    exit:   (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0, scale: 0.94, transition: { duration: 0.55, ease: [0.55, 0, 0.45, 1] as const } }),
  };

  const film = FILMS[active];

  return (
    <section id="films" className="bg-[#FBF6EE] py-24 lg:py-40 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 xl:px-24 mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-[#F0961B]" />
              <span className="font-mono text-[10px] text-[#211C17]/38 tracking-[0.4em] uppercase">Portfolio · 2025–2026</span>
            </motion.div>
            <h2 className="font-serif text-[#211C17] leading-[1.05]" style={{ fontSize: "clamp(38px, 5.5vw, 80px)" }}>
              <SplitScroll text="Our films." />
            </h2>
            <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="font-sans text-[#211C17]/40 text-sm mt-4 max-w-md leading-relaxed">
              Three stories. Three worlds. Each one cinematic, personal, and permanent.
            </motion.p>
          </div>

          {/* Nav + CTA */}
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="flex items-center gap-3">
            {[{ fn: prev, icon: "M15 19l-7-7 7-7" }, { fn: next, icon: "M9 5l7 7-7 7" }].map((btn, i) => (
              <motion.button key={i} onClick={btn.fn}
                className="w-12 h-12 rounded-full border border-[#211C17]/20 flex items-center justify-center text-[#211C17]/50 hover:border-[#F0961B] hover:text-[#F0961B] transition-colors"
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={btn.icon} /></svg>
              </motion.button>
            ))}
            <motion.button onClick={onBook}
              className="ml-2 bg-[#211C17] text-[#FBF6EE] px-5 py-3 rounded-sm font-mono text-[9px] tracking-[0.28em] uppercase"
              whileHover={{ backgroundColor: "#F0961B", scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}>
              Book a Film →
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Slider */}
      <div className="relative overflow-hidden" style={{ height: "min(75vh, 660px)" }}>
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={active}
            custom={direction}
            variants={slideV}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 flex items-center justify-center px-6 lg:px-16 xl:px-24">
            <div className="relative w-full max-w-[1120px] mx-auto group">
              <div className="relative bg-[#1a1410] rounded-2xl overflow-hidden shadow-[0_60px_160px_-30px_rgba(33,28,23,0.40)]">
                <Sprockets side="left" />
                <Sprockets side="right" />

                <div className="mx-7 relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                  {FILMS.map((f, i) => (
                    <video
                      key={f.id}
                      ref={el => { videoRefs.current[i] = el; }}
                      src={f.src}
                      muted loop playsInline preload="metadata"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ opacity: i === active ? 1 : 0, transition: "opacity 0.5s" }}
                    />
                  ))}

                  {/* Overlays */}
                  <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.55)] pointer-events-none z-10" />
                  <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />

                  {/* Frame num */}
                  <div className="absolute top-4 left-4 z-20 font-mono text-white/22 text-[10px] tracking-[0.2em]">{film.frame}</div>

                  {/* Category pill */}
                  <motion.div key={`cat-${active}`}
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.45 }}
                    className="absolute top-4 right-4 z-20 bg-[#F0961B] px-3 py-1.5 rounded-sm">
                    <span className="font-mono text-[8px] text-white tracking-[0.22em] uppercase font-bold">{film.cat}</span>
                  </motion.div>

                  {/* REC */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/8">
                    <motion.div className="w-1.5 h-1.5 rounded-full bg-[#F0961B]"
                      animate={{ opacity: [1, 0.15, 1] }} transition={{ repeat: Infinity, duration: 1.4 }} />
                    <span className="font-mono text-[7px] text-white/55 tracking-[0.3em] uppercase">LIVE</span>
                  </div>

                  {/* Film info */}
                  <motion.div key={`info-${active}`}
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.55 }}
                    className="absolute bottom-5 left-6 right-6 z-20 flex items-end justify-between">
                    <div>
                      <p className="font-serif text-white text-3xl md:text-4xl leading-tight">{film.title}</p>
                      <p className="font-serif italic text-white/50 text-base mt-1">{film.sub}</p>
                    </div>
                    <div className="flex gap-3 items-center flex-shrink-0 ml-4">
                      <motion.button onClick={() => onBook()}
                        className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-[#F0961B] backdrop-blur-sm border border-white/20 hover:border-[#F0961B] text-white text-xs font-mono tracking-[0.18em] uppercase px-4 py-2.5 rounded-sm transition-all duration-300"
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                        Book Film
                      </motion.button>
                      <motion.button onClick={() => onPlay(film.src)}
                        className="w-14 h-14 rounded-full border-2 border-white/30 hover:border-[#F0961B] bg-black/25 hover:bg-[#F0961B]/20 flex items-center justify-center transition-all duration-300"
                        whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.92 }}>
                        <motion.svg width="20" height="20" viewBox="0 0 24 24" fill="white"
                          animate={{ x: [0, 2, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
                          <path d="M8 5v14l11-7z" />
                        </motion.svg>
                      </motion.button>
                    </div>
                  </motion.div>
                </div>

                {/* Data strip */}
                <div className="mx-7 py-3 flex items-center justify-between border-t border-white/5">
                  <span className="font-mono text-[7px] text-white/22 tracking-[0.18em]">GVS · MOTION · {film.year}</span>
                  <div className="flex gap-2">
                    {FILMS.map((_, i) => (
                      <button key={i} onClick={() => goTo(i, i > active ? 1 : -1)}>
                        <motion.div
                          className="h-1 rounded-full bg-white/20"
                          animate={{ width: i === active ? 28 : 8, backgroundColor: i === active ? "#F0961B" : "rgba(255,255,255,0.2)" }}
                          transition={{ duration: 0.35 }}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="font-mono text-[7px] text-white/15 tracking-widest">4K · COLOR GRADE</span>
                </div>
              </div>

              {/* Glow behind frame */}
              <motion.div key={`glow-${active}`}
                className="absolute -inset-10 -z-10 rounded-3xl"
                initial={{ opacity: 0 }} animate={{ opacity: 0.18 }} transition={{ duration: 0.9 }}
                style={{ background: `radial-gradient(ellipse at 50% 85%, ${film.color} 0%, transparent 65%)` }} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Film index tabs */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 xl:px-24 mt-12">
        <div className="flex flex-col md:flex-row gap-4">
          {FILMS.map((f, i) => (
            <motion.button
              key={f.id}
              onClick={() => goTo(i, i > active ? 1 : -1)}
              className={`flex-1 text-left px-5 py-5 border rounded-sm transition-all duration-300 ${
                i === active ? "border-[#F0961B]/60 bg-[#F0961B]/5" : "border-[#211C17]/10 hover:border-[#211C17]/25"
              }`}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[8px] text-[#F0961B] tracking-[0.28em] uppercase">{f.cat}</span>
                <span className="font-mono text-[8px] text-[#211C17]/25 tracking-widest">{f.year}</span>
              </div>
              <p className={`font-serif text-xl transition-colors ${i === active ? "text-[#211C17]" : "text-[#211C17]/50"}`}>{f.title}</p>
              <p className="font-serif italic text-[#211C17]/30 text-xs mt-1">{f.sub}</p>
              {i === active && (
                <motion.div className="h-px bg-[#F0961B] mt-4 origin-left"
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                  transition={{ duration: 10, ease: "linear" }} />
              )}
            </motion.button>
          ))}
        </div>

        {/* Mid-section CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="mt-16 rounded-2xl bg-[#211C17] px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative">
          <Grain opacity={0.04} />
          {/* Amber glow */}
          <div className="absolute right-0 top-0 w-72 h-72 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 80% 30%, rgba(240,150,27,0.18) 0%, transparent 70%)" }} />
          <div className="relative z-10">
            <p className="font-mono text-[#F0961B] text-[10px] tracking-[0.4em] uppercase mb-3">Ready to tell your story?</p>
            <h3 className="font-serif text-[#FBF6EE] text-3xl md:text-4xl leading-tight">
              Your film starts<br /><span className="text-[#F0961B] italic">with a conversation.</span>
            </h3>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-4 flex-shrink-0">
            <motion.a href={WA_LINK} target="_blank" rel="noreferrer"
              className="flex items-center gap-3 bg-[#25D366] text-white px-7 py-4 rounded-sm font-sans text-sm tracking-[0.14em] uppercase font-semibold"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.107 1.516 5.832L0 24l6.335-1.493A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.011-1.374l-.36-.214-3.732.879.894-3.648-.235-.374A9.818 9.818 0 1112 21.818z"/></svg>
              WhatsApp Us
            </motion.a>
            <motion.button onClick={onBook}
              className="flex items-center justify-center gap-2 border border-[#FBF6EE]/18 text-[#FBF6EE]/70 hover:text-[#FBF6EE] hover:border-[#FBF6EE]/35 px-7 py-4 rounded-sm font-sans text-sm tracking-[0.14em] uppercase font-semibold transition-colors"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              Get a Quote
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Services / Offerings Section ─────────────────────────────────────────────
function ServicesSection({ onBook }: { onBook: () => void }) {
  const SERVICES = [
    { icon: "♥", title: "Couples & Wedding Films", desc: "Full ceremony + reception, colour-graded and scored to your love story. Delivered in 4K.", cta: "Plan Your Day" },
    { icon: "✦", title: "Brand Commercials", desc: "Product launches, brand stories, and social ads that stop the scroll and convert.", cta: "Pitch Your Brand" },
    { icon: "◈", title: "Event Highlights", desc: "Parties, corporate events, launches — cut into a cinematic 3–5 min highlight film.", cta: "Book an Event" },
    { icon: "○", title: "Birthday Reels", desc: "Emotional, fun, shareable films that capture the energy of your milestone moment.", cta: "Celebrate Big" },
    { icon: "◉", title: "Studio Showreels", desc: "Your brand story, told in motion — for socials, websites, and pitches.", cta: "Build Your Reel" },
  ];

  return (
    <section className="bg-[#1a1410] py-24 lg:py-40 overflow-hidden relative">
      <Grain opacity={0.035} />
      <div className="absolute top-0 left-0 w-[50vw] h-[50vw] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 20% 10%, rgba(240,150,27,0.07) 0%, transparent 60%)" }} />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 xl:px-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

          {/* Left label */}
          <div className="lg:sticky lg:top-32">
            <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="flex items-center gap-3 mb-8">
              <div className="w-8 h-px bg-[#F0961B]" />
              <span className="font-mono text-[10px] text-[#FBF6EE]/28 tracking-[0.4em] uppercase">What We Create</span>
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-[#FBF6EE] leading-[1.05] mb-8"
              style={{ fontSize: "clamp(36px, 5vw, 68px)" }}>
              Films for every milestone.
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.22, duration: 0.6 }}
              className="font-sans text-[#FBF6EE]/38 text-base leading-relaxed max-w-sm mb-10">
              From intimate couples films to full commercial productions — we handle every genre with the same dedication to craft.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="space-y-3">
              <p className="font-mono text-[9px] text-[#FBF6EE]/20 tracking-[0.3em] uppercase">Starting from</p>
              <p className="font-serif text-[#FBF6EE]/80 text-4xl">₦150,000</p>
              <p className="font-sans text-[#FBF6EE]/22 text-xs">Custom packages available</p>
            </motion.div>
            <motion.button onClick={onBook}
              className="mt-10 flex items-center gap-3 bg-[#F0961B] text-white px-7 py-4 rounded-sm font-sans text-sm tracking-[0.16em] uppercase font-semibold shadow-lg"
              whileHover={{ scale: 1.05, backgroundColor: "#e08010" }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              // @ts-ignore
              transition={{ delay: 0.45, duration: 0.55 }}>
              Get a Custom Quote
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </motion.button>
          </div>

          {/* Right: service cards */}
          <div className="space-y-4">
            {SERVICES.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.65 }}
                whileHover={{ x: 8, backgroundColor: "rgba(255,255,255,0.04)" }}
                // @ts-ignore
                transition={{ type: "spring", stiffness: 280, damping: 26 }}
                className="flex gap-5 p-6 border border-[#FBF6EE]/6 rounded-xl cursor-pointer group">
                <div className="w-10 h-10 rounded-lg bg-[#F0961B]/10 flex items-center justify-center flex-shrink-0 text-[#F0961B] text-lg group-hover:bg-[#F0961B]/20 transition-colors">
                  {s.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-serif text-[#FBF6EE] text-xl group-hover:text-[#F0961B] transition-colors duration-200">{s.title}</p>
                    <motion.button onClick={onBook}
                      className="flex-shrink-0 font-mono text-[8px] text-[#F0961B] tracking-[0.22em] uppercase opacity-0 group-hover:opacity-100 transition-opacity border border-[#F0961B]/30 px-3 py-1.5 rounded-sm hover:bg-[#F0961B]/10"
                      whileTap={{ scale: 0.96 }}>
                      {s.cta} →
                    </motion.button>
                  </div>
                  <p className="font-sans text-[#FBF6EE]/30 text-sm leading-relaxed mt-1.5">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Marquee strip ────────────────────────────────────────────────────────────
function ServicesMarquee({ onBook }: { onBook: () => void }) {
  const items = ["Couples Films", "Wedding Coverages", "Brand Commercials", "Event Highlights", "Birthday Reels", "Studio Showreels", "Brand Films"];
  return (
    <div className="w-full bg-[#5C1A20] py-8 overflow-hidden border-t border-white/5">
      <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ repeat: Infinity, ease: "linear", duration: 38 }}
        className="flex whitespace-nowrap">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-10 px-8 text-[#FBF6EE] text-3xl md:text-4xl font-serif italic">
            {items.map((s, j) => (
              <span key={j} className="flex items-center gap-10">
                {s}<span className="text-[#F0961B]/40 not-italic">·</span>
              </span>
            ))}
          </div>
        ))}
      </motion.div>
      <div className="mt-7 flex items-center justify-center gap-6">
        <p className="font-sans text-[#FBF6EE]/38 text-sm">Ready to create your film?</p>
        <motion.button onClick={onBook}
          className="font-mono text-[9px] text-[#F0961B] tracking-[0.3em] uppercase border border-[#F0961B]/45 px-5 py-2.5 rounded-sm hover:bg-[#F0961B]/10 transition-colors"
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
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.65 }}
      className="flex flex-col items-center justify-center py-16 bg-[#1a1410] hover:bg-[#211C17] transition-colors duration-300">
      <motion.span
        className="font-serif text-5xl md:text-6xl text-[#F0961B] mb-3"
        initial={{ scale: 0.8 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}>
        {val}{suffix}
      </motion.span>
      <span className="font-mono text-[9px] text-[#FBF6EE]/28 tracking-[0.32em] uppercase">{label}</span>
    </motion.div>
  );
}

function Stats() {
  return (
    <section className="border-t border-[#FBF6EE]/4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#FBF6EE]/5">
        <StatCard num={100} suffix="+" label="Films Delivered" />
        <StatCard num={240} suffix="+" label="Happy Clients" />
        <StatCard num={49}  suffix="★" label="Client Rating (÷10)" />
        <StatCard num={7}   suffix=""  label="Years Shooting" />
      </div>
    </section>
  );
}

// ─── Final CTA Band ───────────────────────────────────────────────────────────
function ClosingCTA({ onBook }: { onBook: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section ref={ref} className="relative bg-[#0f0c09] py-32 lg:py-52 px-6 lg:px-16 xl:px-24 overflow-hidden">
      <Grain opacity={0.04} />
      {/* Parallax amber glow */}
      <motion.div style={{ y: bgY }}
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(240,150,27,0.14) 0%, transparent 65%)" }} />

      <div className="max-w-[1400px] mx-auto relative z-10 text-center">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="flex items-center justify-center gap-3 mb-10">
          <div className="w-8 h-px bg-[#F0961B]" />
          <span className="font-mono text-[10px] text-[#FBF6EE]/28 tracking-[0.4em] uppercase">Book Your Film</span>
          <div className="w-8 h-px bg-[#F0961B]" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 36 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.95, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-[#FBF6EE] leading-[1.02] mb-8"
          style={{ fontSize: "clamp(38px, 6vw, 92px)" }}>
          Every moment deserves to be<br />
          <span className="text-[#F0961B] italic">preserved forever.</span>
        </motion.h2>

        <motion.p initial={{ opacity: 0, y: 14 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="font-sans text-[#FBF6EE]/38 text-lg leading-relaxed max-w-xl mx-auto mb-14">
          Whether it's a wedding, a brand story, or a milestone birthday — we craft cinematic films that feel exactly like you. Delivered within <strong className="text-[#FBF6EE]/65">7 days</strong>.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.38 }}
          className="flex flex-wrap items-center justify-center gap-4">
          <motion.a href={WA_LINK} target="_blank" rel="noreferrer"
            className="flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-sm font-sans text-sm tracking-[0.14em] uppercase font-semibold shadow-xl"
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.107 1.516 5.832L0 24l6.335-1.493A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.011-1.374l-.36-.214-3.732.879.894-3.648-.235-.374A9.818 9.818 0 1112 21.818z"/></svg>
            WhatsApp · {PHONE1}
          </motion.a>
          <motion.button onClick={onBook}
            className="flex items-center gap-3 bg-[#F0961B] text-white px-8 py-4 rounded-sm font-sans text-sm tracking-[0.14em] uppercase font-semibold shadow-xl"
            whileHover={{ scale: 1.06, backgroundColor: "#e08010" }} whileTap={{ scale: 0.97 }}>
            Get a Custom Quote
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </motion.button>
          <motion.a href={`mailto:${EMAIL}`}
            className="flex items-center gap-2 border border-[#FBF6EE]/18 text-[#FBF6EE]/55 hover:border-[#FBF6EE]/35 hover:text-[#FBF6EE] px-8 py-4 rounded-sm font-sans text-sm tracking-[0.14em] uppercase font-semibold transition-colors"
            whileHover={{ scale: 1.03 }}>
            {EMAIL}
          </motion.a>
        </motion.div>

        {/* Trust signals */}
        <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-12 border-t border-white/8">
          {["4K Delivery", "7-Day Turnaround", "Color Graded", "100+ Films Done"].map(tag => (
            <div key={tag} className="flex items-center gap-2 font-mono text-[9px] text-[#FBF6EE]/28 tracking-[0.25em] uppercase">
              <div className="w-1 h-1 rounded-full bg-[#F0961B]" />
              {tag}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Video Modal ──────────────────────────────────────────────────────────────
function VideoModal({ src, onClose }: { src: string; onClose: () => void }) {
  const film = FILMS.find(f => f.src === src);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black">
      {(["top", "bottom"] as const).map(pos => (
        <motion.div key={pos}
          className={`absolute ${pos}-0 inset-x-0 bg-black z-10`}
          style={{ height: "10vh" }}
          initial={{ scaleY: 1, originY: pos === "top" ? 0 : 1 }}
          animate={{ scaleY: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.76, 0, 0.24, 1] }} />
      ))}
      <video key={src} src={src} controls autoPlay className="w-full h-full object-contain" />
      <button onClick={onClose}
        className="absolute top-5 right-6 z-20 w-10 h-10 rounded-full border border-white/20 hover:bg-white/10 flex items-center justify-center text-white transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      {film && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="absolute bottom-5 left-8 z-20 flex items-center gap-5">
          <span className="font-mono text-[9px] text-[#F0961B] tracking-[0.3em] uppercase">{film.cat}</span>
          <span className="font-serif text-white/50 text-sm">{film.title}</span>
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 70, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 70, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        className="relative bg-[#1a1410] border border-[#FBF6EE]/10 rounded-2xl p-8 sm:p-12 max-w-lg w-full z-10"
        onClick={e => e.stopPropagation()}>

        <button onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full border border-white/15 hover:bg-white/8 flex items-center justify-center text-white/55 hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <p className="font-mono text-[#F0961B] text-[10px] tracking-[0.4em] uppercase mb-5">Book Your Film</p>
        <h3 className="font-serif text-[#FBF6EE] text-3xl mb-3">
          Let's create something<br /><span className="text-[#F0961B] italic">unforgettable.</span>
        </h3>
        <p className="font-sans text-[#FBF6EE]/40 text-sm leading-relaxed mb-8">
          Reach out via WhatsApp or email — tell us your date, event type, and vision. We'll get back within 24 hours.
        </p>

        <div className="space-y-3">
          <motion.a href={WA_LINK} target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white px-6 py-4 rounded-sm font-sans text-sm tracking-[0.12em] uppercase font-semibold hover:bg-[#20bd5a] transition-colors"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.107 1.516 5.832L0 24l6.335-1.493A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.011-1.374l-.36-.214-3.732.879.894-3.648-.235-.374A9.818 9.818 0 1112 21.818z"/></svg>
            Chat on WhatsApp · {PHONE1}
          </motion.a>
          <motion.a href={`mailto:${EMAIL}`}
            className="flex items-center justify-center gap-2 w-full border border-[#FBF6EE]/15 text-[#FBF6EE]/60 hover:border-[#FBF6EE]/28 hover:text-[#FBF6EE] px-6 py-4 rounded-sm font-sans text-sm tracking-[0.12em] uppercase font-semibold transition-colors"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            Email · {EMAIL}
          </motion.a>
        </div>

        {/* Trust */}
        <div className="mt-8 pt-6 border-t border-white/8 flex flex-wrap gap-4">
          {["4K Delivery", "7-Day Turnaround", "Color Graded"].map(t => (
            <span key={t} className="font-mono text-[8px] text-[#FBF6EE]/25 tracking-[0.2em] uppercase flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#F0961B]" />{t}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function Videography() {
  const [playingSrc, setPlayingSrc]   = useState<string | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  return (
    <div className="w-full flex flex-col bg-[#FBF6EE]">
      <CinemaHero      onBook={() => setShowBooking(true)} />
      <VideoReelStrip />
      <PortfolioSection onPlay={setPlayingSrc} onBook={() => setShowBooking(true)} />
      <ServicesSection onBook={() => setShowBooking(true)} />
      <ServicesMarquee onBook={() => setShowBooking(true)} />
      <Stats />
      <ClosingCTA      onBook={() => setShowBooking(true)} />

      <AnimatePresence>
        {playingSrc  && <VideoModal   key="vid"  src={playingSrc} onClose={() => setPlayingSrc(null)} />}
        {showBooking && <BookingModal key="book"                  onClose={() => setShowBooking(false)} />}
      </AnimatePresence>
    </div>
  );
}
