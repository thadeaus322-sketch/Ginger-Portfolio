import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const weddingDetail = "/images/wedding-detail.jpg";
const weddingBride = "/images/wedding-bride.jpg";
const birthdayPortrait1 = "/images/birthday-portrait-1.jpg";
const birthdayPortrait2 = "/images/birthday-portrait-2.jpg";

const VIDEOS = [
  { id: 1, title: "The Kafidiyas", cat: "Wedding Reel", duration: "4:20", thumb: weddingBride },
  { id: 2, title: "Elevate Boutique", cat: "Brand Film", duration: "1:45", thumb: weddingDetail },
  { id: 3, title: "Evening Gala", cat: "Event Highlight", duration: "3:10", thumb: birthdayPortrait1 },
  { id: 4, title: "Jisola 30th", cat: "Birthday Reel", duration: "1:15", thumb: birthdayPortrait2 },
  { id: 5, title: "Lagos Fashion Week", cat: "Brand Film", duration: "2:30", thumb: weddingDetail },
  { id: 6, title: "Aisha & Tobi", cat: "Wedding Reel", duration: "5:20", thumb: weddingBride },
];

function VideoCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  useEffect(() => {
    const checkHover = (e: MouseEvent) => {
      setHovering(!!(e.target as HTMLElement).closest('.video-card'));
    };
    window.addEventListener('mouseover', checkHover);
    return () => window.removeEventListener('mouseover', checkHover);
  }, []);

  return (
    <motion.div 
      className="fixed top-0 left-0 pointer-events-none z-[100] flex items-center justify-center text-4xl lg:text-5xl"
      animate={{ 
        x: pos.x - 24, 
        y: pos.y - 24, 
        opacity: hovering ? 1 : 0, 
        scale: hovering ? 1 : 0.5,
        rotate: hovering ? 0 : -45
      }}
      transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.5 }}
    >
      🎥
    </motion.div>
  )
}

export default function Videography() {
  const [activeVideo, setActiveVideo] = useState<number | null>(null);

  return (
    <div className="w-full flex flex-col bg-[#0d0d0e] min-h-screen overflow-hidden">
      <VideoCursor />
      
      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[80vh] flex items-center justify-center px-6">
        {/* Animated abstract lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 z-0">
          <motion.path 
            d="M -100 200 Q 300 100 600 400 T 1500 200" 
            stroke="#F0961B" strokeWidth="1.5" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 4, ease: "easeInOut" }}
          />
          <motion.path 
            d="M -200 500 Q 400 700 800 300 T 1600 600" 
            stroke="#F0961B" strokeWidth="1" fill="none" opacity="0.5"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 5, ease: "easeInOut", delay: 0.5 }}
          />
        </svg>

        {/* Giant Spine Text */}
        <div className="absolute left-0 lg:left-4 top-1/2 -translate-y-1/2 origin-left -rotate-90 text-[#FBF6EE] opacity-[0.04] font-serif italic pointer-events-none select-none whitespace-nowrap z-0 tracking-tight" style={{ fontSize: 'clamp(100px, 20vw, 300px)' }}>
          FILM
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="font-serif text-7xl md:text-8xl lg:text-[110px] text-white mb-8 tracking-tight"
          >
            We make films.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}
            className="font-serif italic text-3xl md:text-5xl text-white/40"
          >
            Every frame tells a story worth telling.
          </motion.p>
        </div>
      </section>

      {/* ══ FILM STRIP ════════════════════════════════════════════════════ */}
      <section className="relative w-full h-[180px] md:h-[260px] bg-[#0d0d0e] border-y-[12px] md:border-y-[16px] border-black overflow-hidden flex items-center my-20">
        <div className="absolute top-1 lg:top-2 left-0 w-full flex justify-around overflow-hidden z-10">
          {[...Array(60)].map((_, i) => <div key={`t-${i}`} className="w-3 h-2 md:h-3 bg-[#FBF6EE] rounded-[1px] opacity-15" />)}
        </div>
        <div className="absolute bottom-1 lg:bottom-2 left-0 w-full flex justify-around overflow-hidden z-10">
          {[...Array(60)].map((_, i) => <div key={`b-${i}`} className="w-3 h-2 md:h-3 bg-[#FBF6EE] rounded-[1px] opacity-15" />)}
        </div>
        
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 35 }}
          className="flex gap-4 md:gap-6 px-4 md:px-6 h-[120px] md:h-[180px]"
        >
          {[weddingBride, birthdayPortrait1, weddingDetail, birthdayPortrait2, weddingBride, birthdayPortrait1, weddingDetail, birthdayPortrait2].map((src, i) => (
            <img key={i} src={src} className="h-full aspect-video object-cover filter grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700 rounded-sm" />
          ))}
        </motion.div>
      </section>

      {/* ══ PROJECTS GRID ═════════════════════════════════════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full py-20 lg:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
          {VIDEOS.map((vid, i) => (
            <motion.div 
              key={vid.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: (i % 2) * 0.2, duration: 0.8 }}
              className="video-card group cursor-pointer flex flex-col"
              onClick={() => setActiveVideo(vid.id)}
            >
              <div className="relative w-full aspect-video overflow-hidden bg-black mb-8 border border-white/5 group-hover:border-[#F0961B]/30 transition-colors duration-500 rounded-sm">
                <img src={vid.thumb} className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out opacity-70 group-hover:opacity-100" />
                
                {/* Play Button Animation */}
                <div className="absolute inset-0 flex items-center justify-center">
                   <motion.svg className="w-24 h-24 lg:w-32 lg:h-32 text-[#F0961B] drop-shadow-2xl pointer-events-none" viewBox="0 0 100 100" initial="rest" whileHover="hover" variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}>
                      <motion.circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1.5" fill="none" className="transform -rotate-90 origin-center" variants={{ rest: { pathLength: 0 }, hover: { pathLength: 1 } }} transition={{ duration: 0.8, ease: "easeOut" }} />
                      <motion.polygon points="44,36 44,64 64,50" fill="currentColor" variants={{ rest: { opacity: 0, scale: 0.8 }, hover: { opacity: 1, scale: 1 } }} transition={{ delay: 0.2, duration: 0.4 }} />
                   </motion.svg>
                </div>

                <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-md px-4 py-2 border border-white/10 rounded-sm">
                  <span className="text-[#F0961B] text-[10px] uppercase font-bold tracking-[0.2em]">{vid.cat}</span>
                </div>
                <div className="absolute bottom-6 right-6 text-white/80 font-mono text-xs tracking-widest bg-black/80 px-3 py-1.5 rounded-sm">
                  {vid.duration}
                </div>
                
                {/* Glow */}
                <div className="absolute inset-0 shadow-[0_0_50px_rgba(240,150,27,0)] group-hover:shadow-[0_0_50px_rgba(240,150,27,0.15)] transition-shadow duration-700 pointer-events-none" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-serif text-4xl text-white/90 group-hover:text-white transition-colors">{vid.title}</h3>
                <span className="text-[#F0961B] text-[10px] uppercase tracking-[0.3em] mt-4 font-bold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">Play Film</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ SERVICES STRIP ════════════════════════════════════════════════ */}
      <div className="w-full bg-[#5C1A20] py-16 lg:py-20 overflow-hidden flex items-center border-y border-white/10">
        <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ ease: "linear", duration: 35, repeat: Infinity }} className="flex whitespace-nowrap">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-[#FBF6EE] text-5xl md:text-6xl px-10 flex items-center gap-16 font-serif italic">
              <span>Wedding Films</span> <span className="text-[#F0961B] opacity-50">·</span>
              <span>Brand Commercials</span> <span className="text-[#F0961B] opacity-50">·</span>
              <span>Event Highlights</span> <span className="text-[#F0961B] opacity-50">·</span>
              <span>Birthday Reels</span> <span className="text-[#F0961B] opacity-50">·</span>
              <span>Product Videos</span> <span className="text-[#F0961B] opacity-50">·</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ══ MODAL ═════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activeVideo !== null && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0d0e] p-0"
          >
            {/* Cinematic Letterbox */}
            <motion.div initial={{ height: 0 }} animate={{ height: "12vh" }} exit={{ height: 0 }} className="absolute top-0 w-full bg-black z-20 border-b border-white/5" />
            <motion.div initial={{ height: 0 }} animate={{ height: "12vh" }} exit={{ height: 0 }} className="absolute bottom-0 w-full bg-black z-20 flex flex-col md:flex-row items-center md:items-center justify-center md:justify-between px-8 md:px-16 py-4 md:py-0 border-t border-white/5" >
               <div className="flex flex-col md:flex-row md:gap-6 items-center md:items-baseline opacity-0 animate-[fadeIn_1s_ease-out_1s_forwards] mb-2 md:mb-0">
                  <span className="text-[#F0961B] text-[10px] font-bold uppercase tracking-[0.3em] mb-1 md:mb-0">{VIDEOS.find(v=>v.id===activeVideo)?.cat}</span>
                  <span className="text-white font-serif text-2xl md:text-3xl">{VIDEOS.find(v=>v.id===activeVideo)?.title}</span>
               </div>
               <button className="text-[#F0961B] font-serif italic text-xl hover:text-white transition-colors opacity-0 animate-[fadeIn_1s_ease-out_1s_forwards] flex items-center gap-3">
                 Connect to see the full film <span className="font-sans text-2xl">→</span>
               </button>
            </motion.div>

            <button onClick={() => setActiveVideo(null)} className="absolute top-6 right-6 lg:top-8 lg:right-12 text-white/50 hover:text-white transition-colors z-30 mix-blend-difference">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>

            <div className="w-full h-full flex items-center justify-center relative overflow-hidden group bg-black">
               {/* Video placeholder */}
               <img src={VIDEOS.find(v=>v.id===activeVideo)?.thumb} className="w-full h-full object-cover opacity-20 filter grayscale" />
               <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30">
                  <span className="text-xs font-sans tracking-[0.3em] font-bold uppercase mb-6 opacity-40">Demo Player</span>
                  <div className="w-24 h-24 border border-white/10 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 ml-1 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
               </div>
            </div>
            <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}