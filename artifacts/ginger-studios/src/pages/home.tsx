import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";

const weddingDetail = "/images/wedding-detail.jpg";
const weddingBride = "/images/wedding-bride.jpg";
const birthdayPortrait1 = "/images/birthday-portrait-1.jpg";
const birthdayPortrait2 = "/images/birthday-portrait-2.jpg";

function Counter({ end, suffix = "", label, decimals = 0 }: { end: number, suffix?: string, label: string, decimals?: number }) {
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
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(easeOutQuart * end);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
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

const CARDS = [
  { id: 1, src: weddingBride, cat: "WEDDINGS", title: "A Short Story of Love" },
  { id: 2, src: weddingDetail, cat: "DETAILS", title: "The Details" },
  { id: 3, src: birthdayPortrait1, cat: "PORTRAITS", title: "Zarah's 25th" },
  { id: 4, src: birthdayPortrait2, cat: "EDITORIAL", title: "Jisola Studio Session" }
];

function CardStack() {
  const [frontId, setFrontId] = useState(CARDS[0].id);
  
  const frontIndex = CARDS.findIndex(c => c.id === frontId);
  const orderedCards = [...CARDS.slice(frontIndex), ...CARDS.slice(0, frontIndex)];

  const next = () => {
    setFrontId(orderedCards[1].id);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[340px] md:w-[380px] h-[480px] md:h-[520px] cursor-pointer" onClick={next}>
        {orderedCards.map((c, i) => {
          const isTop = i === 0;
          const rotations = [0, -8, -3, 3, 8];
          const rotation = isTop ? 0 : rotations[i % rotations.length];
          
          return (
            <motion.div
              key={c.id}
              layout
              initial={false}
              animate={{ 
                scale: isTop ? 1 : 1 - (i * 0.04),
                y: isTop ? 0 : i * 12,
                rotate: rotation,
                zIndex: CARDS.length - i
              }}
              whileHover={isTop ? { scale: 1.02, y: -8 } : {}}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl bg-[#211C17]"
              style={{
                boxShadow: isTop ? "0 30px 60px -12px rgba(0,0,0,0.6)" : "0 10px 30px -10px rgba(0,0,0,0.4)"
              }}
            >
              <img src={c.src} alt={c.title} className="w-full h-full object-cover" draggable={false} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#211C17]/90 via-[#211C17]/20 to-transparent" />
              <div className={`absolute bottom-8 left-8 right-8 transition-opacity duration-300 ${isTop ? 'opacity-100' : 'opacity-0'}`}>
                <div className="text-[#F0961B] text-[10px] font-bold tracking-[0.2em] uppercase mb-3">{c.cat}</div>
                <div className="text-[#FBF6EE] font-serif text-3xl leading-tight">{c.title}</div>
              </div>
            </motion.div>
          )
        })}
      </div>
      <div className="mt-12 flex flex-col items-center gap-6">
        <div className="flex gap-2">
          {CARDS.map((c) => (
            <div key={c.id} className={`h-1.5 rounded-full transition-all duration-500 ${c.id === frontId ? 'w-8 bg-[#F0961B]' : 'w-2 bg-[#F0961B]/20'}`} />
          ))}
        </div>
        <p className="text-[#F0961B] text-[10px] uppercase tracking-[0.3em] font-bold animate-pulse">Tap to browse ↓</p>
      </div>
    </div>
  )
}

const SERVICES = [
  { id: "01", title: "Weddings", desc: "A full cinematic narrative of your most important day — from getting ready to the last dance." },
  { id: "02", title: "Portraits", desc: "Intimate, editorial portraits that strip away the noise and reveal what makes you genuinely you." },
  { id: "03", title: "Celebrations", desc: "Birthdays, graduations, milestones — every celebration deserves a record this vivid." },
  { id: "04", title: "Brand Films", desc: "Cinematic motion pictures that give your business a new level of credibility and class." }
];

const TESTIMONIALS = [
  { quote: "Every single picture felt like a movie. Ginger Studios didn't just take photos — they captured the actual feeling of our wedding day.", name: "Aisha & Tobi", rating: 5 },
  { quote: "The warmth in their lighting and attention to detail is unmatched. They made me feel like a star at my own birthday session.", name: "Zarah", rating: 5 },
  { quote: "Professional, creative, and delivered beyond our expectations. The brand film gave our business a whole new level of class.", name: "Elevate Boutique", rating: 5 },
];

export default function Home() {
  const heroWords = "Moments captured forever.".split(" ");
  const quoteWords = "We believe every moment has a rhythm. Our job is to catch it.".split(" ");

  return (
    <div className="w-full flex flex-col bg-[#FBF6EE]">
      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[calc(100vh-96px)] flex flex-col lg:flex-row overflow-hidden">
        {/* Dot grid background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10 z-0" 
          style={{ backgroundImage: 'radial-gradient(#211C17 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} 
        />

        {/* Left Side: Dramatic Image Reveal */}
        <div className="w-full lg:w-[60%] relative h-[50vh] lg:h-auto z-10 p-4 lg:p-8 pr-4 lg:pr-0">
          <motion.div 
            initial={{ clipPath: "inset(100% 0 0 0 round 16px)" }}
            animate={{ clipPath: "inset(0 0 0 0 round 16px)" }}
            transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }}
            className="relative w-full h-full overflow-hidden rounded-2xl"
          >
            <img src={weddingBride} alt="Cinematic Bride" className="w-full h-full object-cover" />
            
            {/* Amber grain noise overlay */}
            <div 
              className="absolute inset-0 mix-blend-overlay opacity-30 pointer-events-none bg-[#F0961B]" 
              style={{ filter: "url(#noiseFilter)" }} 
            />
            <svg className="hidden">
              <filter id="noiseFilter">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
              </filter>
            </svg>

            {/* Large 01 */}
            <div className="absolute top-4 lg:top-10 right-8 lg:right-10 text-[25vw] lg:text-[15vw] leading-none font-serif text-[#FBF6EE] opacity-20 pointer-events-none select-none">
              01
            </div>

            {/* Ticker */}
            <div className="absolute bottom-6 left-0 w-full overflow-hidden whitespace-nowrap text-[#F0961B] text-xs md:text-sm tracking-[0.2em] uppercase font-bold flex bg-[#211C17]/40 backdrop-blur-md py-4">
              <motion.div
                 animate={{ x: ["0%", "-50%"] }}
                 transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
                 className="flex"
              >
                 <span className="px-4">WEDDINGS · PORTRAITS · EVENTS · BRAND FILMS · CELEBRATIONS · </span>
                 <span className="px-4">WEDDINGS · PORTRAITS · EVENTS · BRAND FILMS · CELEBRATIONS · </span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Typography & Stats */}
        <div className="w-full lg:w-[40%] flex flex-col justify-center px-8 lg:px-16 py-16 lg:py-0 z-10">
          <h1 className="font-serif text-6xl md:text-7xl lg:text-[5.5rem] leading-[1.05] text-[#211C17] mb-16 max-w-lg">
            {heroWords.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden mr-[0.25em] mb-2">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.5 + (i * 0.1), duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-16 max-w-sm">
            <div className="col-span-2">
              <Counter end={240} suffix="+" label="Shoots Delivered" />
            </div>
            <Counter end={4.9} decimals={1} suffix="★" label="Client Rating" />
            <Counter end={7} label="Categories" />
          </div>

          <div className="flex flex-col gap-6 items-start">
            <Link href="/photography" className="group flex items-center gap-4 text-[#211C17] font-serif text-2xl italic hover:text-[#F0961B] transition-colors">
              <span className="w-12 h-[1px] bg-current transform origin-left group-hover:scale-x-150 transition-transform" />
              View Photography
            </Link>
            <Link href="/videography" className="group flex items-center gap-4 text-[#211C17] font-serif text-2xl italic hover:text-[#F0961B] transition-colors">
              <span className="w-12 h-[1px] bg-current transform origin-left group-hover:scale-x-150 transition-transform" />
              Watch Reels
            </Link>
          </div>
        </div>
      </section>

      {/* ══ MARQUEE ════════════════════════════════════════════════════════ */}
      <div className="w-full bg-[#5C1A20] py-10 overflow-hidden flex items-center">
        <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ ease: "linear", duration: 30, repeat: Infinity }} className="flex whitespace-nowrap">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-[#F0961B] text-2xl md:text-3xl px-6 flex items-center gap-8">
              <span className="font-serif italic tracking-wide">WEDDING PHOTOGRAPHY</span> <span className="text-xl opacity-30">·</span>
              <span className="font-sans uppercase font-bold tracking-[0.2em] text-lg">BIRTHDAY PORTRAITS</span> <span className="text-xl opacity-30">·</span>
              <span className="font-serif italic tracking-wide">BRAND FILMS</span> <span className="text-xl opacity-30">·</span>
              <span className="font-sans uppercase font-bold tracking-[0.2em] text-lg">PORTRAIT SESSIONS</span> <span className="text-xl opacity-30">·</span>
              <span className="font-serif italic tracking-wide">EVENT COVERAGE</span> <span className="text-xl opacity-30">·</span>
              <span className="font-sans uppercase font-bold tracking-[0.2em] text-lg">GRADUATION PORTRAITS</span> <span className="text-xl opacity-30">·</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ══ CARD STACK GALLERY ════════════════════════════════════════════ */}
      <section className="py-32 md:py-48 bg-[#211C17] overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="flex justify-center lg:justify-start order-2 lg:order-1"
          >
            <CardStack />
          </motion.div>

          <div className="flex flex-col order-1 lg:order-2">
            <h2 className="font-serif text-5xl md:text-7xl lg:text-[80px] leading-[1.05] text-[#FBF6EE] mb-10">
              Every frame is a <span className="text-[#F0961B] italic font-light">feeling</span>, not just a photo.
            </h2>
            <p className="font-sans text-lg md:text-xl text-[#FBF6EE]/60 max-w-lg leading-relaxed font-light">
              We approach every session as an editorial feature. No stiff poses. No forced smiles. Just genuine connection, masterfully lit and thoughtfully curated to last lifetimes.
            </p>
          </div>
        </div>
      </section>

      {/* ══ SERVICES ══════════════════════════════════════════════════════ */}
      <section className="py-32 md:py-40 bg-[#211C17] border-t border-[#FBF6EE]/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex overflow-x-auto md:grid md:grid-cols-4 gap-6 px-6 lg:px-12 pb-12 md:pb-0 snap-x hide-scrollbar">
            {SERVICES.map((s, i) => (
              <motion.div 
                key={s.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.7 }}
                className="min-w-[300px] md:min-w-0 flex-shrink-0 snap-start relative bg-[#26211C] p-10 md:p-12 rounded-2xl group hover:bg-[#2A241F] transition-colors duration-500 overflow-hidden border border-white/5"
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

      {/* ══ STUDIO QUOTE ══════════════════════════════════════════════════ */}
      <section className="bg-[#5C1A20] py-40 md:py-56 px-6 relative overflow-hidden">
        {/* Large decorative quote mark */}
        <div className="absolute -top-10 left-10 md:left-32 font-serif text-[#FBF6EE]/5 pointer-events-none select-none text-[300px] leading-none">
          "
        </div>
        
        <div className="max-w-[1000px] mx-auto text-center relative z-10">
          <h2 className="font-serif italic text-[#FBF6EE] text-5xl md:text-7xl lg:text-[90px] leading-[1.1]">
            {quoteWords.map((w, i) => (
              <motion.span 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.08, duration: 0.9, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="inline-block mr-[0.25em] mb-2 md:mb-4"
                key={i}
              >
                {w}
              </motion.span>
            ))}
          </h2>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══════════════════════════════════════════════════ */}
      <section className="py-32 md:py-48 bg-[#FBF6EE] overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 mb-20 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h2 className="font-serif text-5xl md:text-7xl text-[#211C17]">Client Stories</h2>
          </div>
          <div className="flex gap-1 text-[#F0961B] mb-2 md:mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} size={28} fill="currentColor" />)}
          </div>
        </div>
        
        <div className="flex overflow-x-auto gap-10 px-6 lg:px-12 pb-16 snap-x hide-scrollbar">
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
                {[...Array(t.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
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
