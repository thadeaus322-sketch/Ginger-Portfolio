import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { img } from "@/lib/assets";
import { useListSiteImages } from "@workspace/api-client-react";

// ─── Fallback static images (shown while API loads or if empty) ────────────────
const FALLBACK_HERO = [
  { src: img("images/wedding-bride.jpg"),       label: "WEDDINGS",   title: "A Short Story of Love"      },
  { src: img("images/portrait-studio-1.jpg"),   label: "PORTRAITS",  title: "Majestic in Her Own Way"    },
  { src: img("images/event-1.jpg"),             label: "EVENTS",     title: "The Archers Evening"        },
  { src: img("images/food-3.jpg"),              label: "FOOD",       title: "South Kitchen & Lounge"     },
  { src: img("images/product-1.jpg"),           label: "PRODUCTS",   title: "OkunRiin Studio"            },
  { src: img("images/birthday-portrait-1.jpg"), label: "BIRTHDAY",   title: "Zarah's 25th"              },
  { src: img("images/event-2.jpg"),             label: "EVENTS",     title: "Christmas at The Archers"   },
  { src: img("images/food-2.jpg"),              label: "FOOD",       title: "Feast of the Season"        },
];

const FALLBACK_CARDS = [
  { id: 1, src: img("images/wedding-bride.jpg"),       cat: "WEDDINGS",  title: "A Short Story of Love"    },
  { id: 2, src: img("images/portrait-studio-1.jpg"),   cat: "PORTRAITS", title: "Majestic in Her Own Way"  },
  { id: 3, src: img("images/birthday-portrait-1.jpg"), cat: "BIRTHDAY",  title: "Zarah's 25th"             },
  { id: 4, src: img("images/event-1.jpg"),             cat: "EVENTS",    title: "The Archers Evening"      },
  { id: 5, src: img("images/wedding-detail.jpg"),      cat: "WEDDINGS",  title: "The Details"              },
  { id: 6, src: img("images/birthday-portrait-2.jpg"), cat: "PORTRAITS", title: "Jisola Studio Session"    },
];

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ end, suffix = "", label, decimals = 0 }: { end: number; suffix?: string; label: string; decimals?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    const duration = 1500;
    const startTime = performance.now();
    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(ease * end);
      if (progress < 1) requestAnimationFrame(animate);
      else setCount(end);
    };
    requestAnimationFrame(animate);
  }, [inView, end]);

  return (
    <div ref={ref} className="flex flex-col py-6 border-b border-[#211C17]/10">
      <span className="font-serif text-5xl md:text-6xl text-[#211C17]">
        {count.toFixed(decimals)}{suffix}
      </span>
      <span className="text-xs font-sans uppercase tracking-[0.2em] text-[#211C17]/60 mt-2 font-medium">
        {label}
      </span>
    </div>
  );
}

// ─── Hero Slider ──────────────────────────────────────────────────────────────
function HeroSlider({ slides }: { slides: { src: string; label: string; title: string }[] }) {
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (slides.length === 0) return;
    const t = setInterval(() => {
      setDirection(1);
      setIdx(i => (i + 1) % slides.length);
    }, 4200);
    return () => clearInterval(t);
  }, [slides.length]);

  const goTo = (next: number) => {
    setDirection(next > idx ? 1 : -1);
    setIdx(next);
  };

  const slide = slides[idx] ?? slides[0];
  if (!slide) return null;

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? "-30%" : "30%", opacity: 0 }),
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl bg-[#211C17]">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={idx}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
          className="absolute inset-0"
        >
          <img src={slide.src} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#211C17]/70 via-transparent to-[#211C17]/10" />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="absolute bottom-24 left-8"
          >
            <span className="text-[#F0961B] text-[10px] uppercase font-bold tracking-[0.25em] block mb-2">
              {slide.label}
            </span>
            <p className="text-white font-serif text-2xl">{slide.title}</p>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute top-6 right-8 text-[120px] leading-none font-serif text-white/10 pointer-events-none select-none">
        {String(idx + 1).padStart(2, "0")}
      </div>

      <div className="absolute bottom-0 left-0 right-0 overflow-hidden whitespace-nowrap text-[#F0961B] text-xs tracking-[0.2em] uppercase font-bold flex bg-[#211C17]/50 backdrop-blur-sm py-3">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 22 }}
          className="flex"
        >
          <span className="px-4">WEDDINGS · PORTRAITS · EVENTS · BRAND FILMS · FOOD · PRODUCTS · CELEBRATIONS · </span>
          <span className="px-4">WEDDINGS · PORTRAITS · EVENTS · BRAND FILMS · FOOD · PRODUCTS · CELEBRATIONS · </span>
        </motion.div>
      </div>

      <div className="absolute bottom-10 right-6 flex gap-1.5 items-center">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="transition-all duration-500"
            style={{
              width: i === idx ? 24 : 6,
              height: 6,
              borderRadius: 9999,
              background: i === idx ? "#F0961B" : "rgba(255,255,255,0.35)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Card Stack ───────────────────────────────────────────────────────────────
function CardStack({ cards }: { cards: { id: number; src: string; cat: string; title: string }[] }) {
  const [frontIdx, setFrontIdx] = useState(0);
  const total = cards.length;
  const visible = 4;

  const next = () => setFrontIdx(i => (i + 1) % total);
  const orderedCards = Array.from({ length: total }, (_, i) => cards[(frontIdx + i) % total]);

  if (total === 0) return null;

  return (
    <div className="flex flex-col items-center w-full">
      <div
        className="relative cursor-pointer select-none w-full max-w-[340px]"
        style={{ aspectRatio: "340 / 480" }}
        onClick={next}
      >
        {orderedCards.slice(0, visible).map((card, i) => {
          const isTop = i === 0;
          const rotations = [0, -7, -2, 4];
          return (
            <motion.div
              key={card.id}
              layout
              initial={false}
              animate={{
                scale: 1 - i * 0.04,
                y: i * 14,
                rotate: isTop ? 0 : rotations[i],
                zIndex: visible - i,
              }}
              whileHover={isTop ? { scale: 1.025, y: -10, boxShadow: "0 40px 80px -12px rgba(0,0,0,0.7)" } : {}}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="absolute inset-0 rounded-2xl overflow-hidden"
              style={{ boxShadow: isTop ? "0 32px 64px -12px rgba(0,0,0,0.6)" : "0 8px 24px -6px rgba(0,0,0,0.4)" }}
            >
              <img src={card.src} alt={card.title} className="w-full h-full object-cover" draggable={false} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#211C17]/90 via-[#211C17]/10 to-transparent" />
              {isTop && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-8 left-8 right-8"
                >
                  <p className="text-[#F0961B] text-[10px] font-bold tracking-[0.22em] uppercase mb-3">{card.cat}</p>
                  <p className="text-white font-serif text-2xl leading-tight">{card.title}</p>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-14 flex gap-2">
        {cards.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === frontIdx ? 28 : 6,
              background: i === frontIdx ? "#F0961B" : "rgba(251,246,238,0.2)",
            }}
            className="h-1.5 rounded-full"
          />
        ))}
      </div>
      <p className="text-[#F0961B] text-[10px] uppercase tracking-[0.3em] font-bold mt-5 animate-pulse">
        Tap to browse ↓
      </p>
    </div>
  );
}

// ─── Services ─────────────────────────────────────────────────────────────────
const SERVICES = [
  { id: "01", title: "Weddings",     desc: "A full cinematic narrative of your most important day — from getting ready to the last dance." },
  { id: "02", title: "Portraits",    desc: "Intimate, editorial portraits that strip away the noise and reveal what makes you genuinely you." },
  { id: "03", title: "Celebrations", desc: "Birthdays, graduations, milestones — every celebration deserves a record this vivid." },
  { id: "04", title: "Brand Films",  desc: "Cinematic motion pictures that give your business a new level of credibility and class." },
];

const TESTIMONIALS = [
  { quote: "Every single picture felt like a movie. Ginger Studios didn't just take photos — they captured the actual feeling of our wedding day.", name: "Aisha & Tobi", rating: 5 },
  { quote: "The warmth in their lighting and attention to detail is unmatched. They made me feel like a star at my own birthday session.", name: "Zarah", rating: 5 },
  { quote: "Professional, creative, and delivered beyond our expectations. The brand film gave our business a whole new level of class.", name: "Elevate Boutique", rating: 5 },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const quoteWords = "We believe every moment has a rhythm. Our job is to catch it.".split(" ");

  const { data: siteImages = [] } = useListSiteImages();

  const heroSlides = siteImages.filter(i => i.section === "hero_slide" && i.isActive).length > 0
    ? siteImages.filter(i => i.section === "hero_slide" && i.isActive).map(i => ({ src: i.imageUrl, label: i.label || "MOMENTS", title: i.title || "" }))
    : FALLBACK_HERO;

  const cardItems = siteImages.filter(i => i.section === "card_stack" && i.isActive).length > 0
    ? siteImages.filter(i => i.section === "card_stack" && i.isActive).map(i => ({ id: i.id, src: i.imageUrl, cat: i.label || "MOMENTS", title: i.title || "" }))
    : FALLBACK_CARDS;

  return (
    <div className="w-full flex flex-col bg-[#FBF6EE]">

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[calc(100vh-96px)] flex flex-col lg:flex-row overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-10 z-0"
          style={{ backgroundImage: "radial-gradient(#211C17 1.5px, transparent 1.5px)", backgroundSize: "32px 32px" }}
        />

        <div className="w-full lg:w-[60%] relative h-[55vh] lg:h-auto z-10 p-4 lg:p-8 lg:pr-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
            className="relative w-full h-full"
          >
            <HeroSlider slides={heroSlides} />
          </motion.div>
        </div>

        <div className="w-full lg:w-[40%] flex flex-col justify-center px-8 lg:px-16 py-12 lg:py-0 z-10">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="font-serif text-6xl md:text-7xl lg:text-[5.5rem] leading-[1.05] text-[#211C17] mb-14 max-w-lg"
          >
            {"Moments captured forever.".split(" ").map((word, i) => (
              <span key={i} className="inline-block overflow-hidden mr-[0.25em] mb-2">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </motion.h1>

          <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-14 max-w-sm">
            <div className="col-span-2">
              <Counter end={240} suffix="+" label="Shoots Delivered" />
            </div>
            <Counter end={4.9} decimals={1} suffix="★" label="Client Rating" />
            <Counter end={7} label="Categories" />
          </div>

          <div className="flex flex-col gap-5 items-start">
            <Link href="/photography" className="group flex items-center gap-4 text-[#211C17] font-serif text-2xl italic hover:text-[#F0961B] transition-colors">
              <span className="w-10 h-[1px] bg-current transition-all duration-300 group-hover:w-16" />
              View Photography
            </Link>
            <Link href="/videography" className="group flex items-center gap-4 text-[#211C17] font-serif text-2xl italic hover:text-[#F0961B] transition-colors">
              <span className="w-10 h-[1px] bg-current transition-all duration-300 group-hover:w-16" />
              Watch Reels
            </Link>
          </div>
        </div>
      </section>

      {/* ══ MARQUEE ═══════════════════════════════════════════════════════════ */}
      <div className="w-full bg-[#5C1A20] py-10 overflow-hidden flex items-center">
        <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ ease: "linear", duration: 32, repeat: Infinity }} className="flex whitespace-nowrap">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-[#F0961B] text-2xl md:text-3xl px-6 flex items-center gap-8">
              <span className="font-serif italic tracking-wide">WEDDING PHOTOGRAPHY</span> <span className="opacity-30">·</span>
              <span className="font-sans uppercase font-bold tracking-[0.2em] text-lg">FOOD & PRODUCT SHOOTS</span> <span className="opacity-30">·</span>
              <span className="font-serif italic tracking-wide">BRAND FILMS</span> <span className="opacity-30">·</span>
              <span className="font-sans uppercase font-bold tracking-[0.2em] text-lg">EVENT COVERAGE</span> <span className="opacity-30">·</span>
              <span className="font-serif italic tracking-wide">PORTRAIT SESSIONS</span> <span className="opacity-30">·</span>
              <span className="font-sans uppercase font-bold tracking-[0.2em] text-lg">GRADUATION PORTRAITS</span> <span className="opacity-30">·</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ══ CARD STACK GALLERY ════════════════════════════════════════════════ */}
      <section className="py-20 md:py-32 lg:py-48 bg-[#211C17] overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="flex justify-center lg:justify-start order-2 lg:order-1"
          >
            <CardStack cards={cardItems} />
          </motion.div>

          <div className="flex flex-col order-1 lg:order-2">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="font-serif text-5xl md:text-7xl lg:text-[80px] leading-[1.05] text-[#FBF6EE] mb-10"
            >
              Every frame is a <span className="text-[#F0961B] italic font-light">feeling</span>, not just a photo.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15 }}
              className="font-sans text-lg md:text-xl text-[#FBF6EE]/60 max-w-lg leading-relaxed font-light"
            >
              We approach every session as an editorial feature. No stiff poses. No forced smiles. Just genuine connection, masterfully lit and thoughtfully curated to last lifetimes.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-10"
            >
              <Link
                href="/photography"
                className="group inline-flex items-center gap-3 text-[#F0961B] font-sans text-sm uppercase tracking-[0.2em] font-bold hover:gap-5 transition-all duration-300"
              >
                Explore full portfolio <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ SERVICES ══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-32 lg:py-40 bg-[#211C17] border-t border-[#FBF6EE]/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 lg:px-12">
            {SERVICES.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.7 }}
                className="relative bg-[#26211C] p-8 sm:p-10 md:p-12 rounded-2xl group hover:bg-[#2A241F] transition-colors duration-500 overflow-hidden border border-white/5"
              >
                <div className="absolute top-6 right-6 text-[120px] leading-[0.8] font-serif text-[#F0961B] opacity-[0.08] pointer-events-none select-none transition-transform duration-700 group-hover:scale-110 group-hover:-translate-y-2">
                  {s.id}
                </div>
                <div className="h-32 md:h-48" />
                <h3 className="text-[#FBF6EE] font-serif text-4xl mb-6 relative z-10">{s.title}</h3>
                <p className="text-[#FBF6EE]/60 font-sans text-base leading-relaxed mb-10 relative z-10 font-light">{s.desc}</p>
                <div className="w-0 h-[2px] bg-[#F0961B] group-hover:w-full transition-all duration-700 ease-out relative z-10" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STUDIO QUOTE ══════════════════════════════════════════════════════ */}
      <section className="bg-[#5C1A20] py-40 md:py-56 px-6 relative overflow-hidden">
        <div className="absolute -top-10 left-10 md:left-32 font-serif text-[#FBF6EE]/5 pointer-events-none select-none text-[300px] leading-none">"</div>
        <div className="max-w-[1000px] mx-auto text-center relative z-10">
          <h2 className="font-serif italic text-[#FBF6EE] text-5xl md:text-7xl lg:text-[90px] leading-[1.1]">
            {quoteWords.map((w, i) => (
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.06, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="inline-block mr-[0.25em] mb-2 md:mb-4"
                key={i}
              >
                {w}
              </motion.span>
            ))}
          </h2>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══════════════════════════════════════════════════════ */}
      <section className="py-32 md:py-48 bg-[#FBF6EE] overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 mb-20 flex flex-col md:flex-row justify-between items-end gap-6">
          <h2 className="font-serif text-5xl md:text-7xl text-[#211C17]">Client Stories</h2>
          <div className="flex gap-1 text-[#F0961B] mb-2 md:mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} size={28} fill="currentColor" />)}
          </div>
        </div>

        <div className="flex overflow-x-auto gap-10 px-6 lg:px-12 pb-16 snap-x">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.15, duration: 0.8 }}
              className="min-w-[340px] md:min-w-[480px] w-[85vw] md:w-[480px] flex-shrink-0 snap-center border border-[#211C17]/10 p-12 lg:p-16 bg-white rounded-2xl"
            >
              <div className="flex gap-1 text-[#F0961B] mb-10">
                {[...Array(t.rating)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
              </div>
              <p className="font-serif italic text-2xl md:text-3xl text-[#211C17] leading-relaxed mb-12">"{t.quote}"</p>
              <div className="w-16 h-[2px] bg-[#F0961B] mb-6" />
              <p className="font-sans text-xs font-bold tracking-[0.25em] uppercase text-[#211C17]">{t.name}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
