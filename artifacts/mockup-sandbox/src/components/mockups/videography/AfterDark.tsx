import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AfterDark() {
  const [count, setCount] = useState<number>(3);
  const [showCountdown, setShowCountdown] = useState(true);

  useEffect(() => {
    // Inject Font
    if (!document.querySelector('link[href*="Fraunces"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    // Countdown logic
    if (count > 1) {
      const timer = setTimeout(() => setCount(count - 1), 600);
      return () => clearTimeout(timer);
    } else if (count === 1) {
      const timer = setTimeout(() => setShowCountdown(false), 600);
      return () => clearTimeout(timer);
    }
  }, [count]);

  return (
    <div className="min-h-screen bg-black font-['Fraunces'] text-white overflow-x-hidden selection:bg-[#F0961B] selection:text-black">
      {/* COUNTDOWN INTRO */}
      <AnimatePresence>
        {showCountdown && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="fixed inset-0 bg-white z-[100] flex items-center justify-center overflow-hidden"
          >
            {/* Film leader circle */}
            <div className="relative flex items-center justify-center w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full border-[3px] border-black">
              {/* Horizontal bars */}
              <div className="absolute top-[20%] left-[-100vw] right-[-100vw] h-[3px] bg-black"></div>
              <div className="absolute bottom-[20%] left-[-100vw] right-[-100vw] h-[3px] bg-black"></div>
              
              {/* Vertical crosshair */}
              <div className="absolute top-[-100vw] bottom-[-100vw] left-1/2 w-[1px] bg-black/20 -translate-x-1/2"></div>
              <div className="absolute left-[-100vw] right-[-100vw] top-1/2 h-[1px] bg-black/20 -translate-y-1/2"></div>

              {/* Number */}
              <span 
                key={count}
                className="text-black font-normal leading-none z-10"
                style={{ fontSize: "40vw" }}
              >
                {count}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 1 — PAGE HEADER */}
      <section className="bg-black pt-24 pb-12 px-6 md:px-12 relative z-10">
        <div className="flex justify-between items-center w-full uppercase tracking-[0.5em] text-[10px] md:text-[11px]">
          <span className="text-white w-1/3 text-left">GINGER</span>
          <span className="text-[#F0961B] w-1/3 text-center">& CREATIVES</span>
          <span className="text-white w-1/3 text-right">STUDIOS</span>
        </div>
        
        <div className="mt-20 md:mt-32 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="text-[#5C1A20] text-[11px] tracking-[0.5em] uppercase mb-4">
            PRESENTING
          </div>
          <h1 
            className="text-white italic font-light tracking-[-0.03em] leading-[0.9]"
            style={{ fontSize: "clamp(60px, 12vw, 160px)" }}
          >
            The Kafidiyas
          </h1>
          <div className="text-[#F0961B] text-[12px] tracking-[0.4em] mt-6 uppercase">
            A WEDDING FILM
          </div>
        </div>
      </section>

      {/* SECTION 2 — CINEMATIC VIDEO */}
      <section className="bg-black w-full relative">
        <div className="w-full relative border-y border-[#F0961B] overflow-hidden" style={{ aspectRatio: "21/9" }}>
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            src="https://00f92c19-5eca-4eee-b634-3243cf462959-00-2srflv9dubax1.riker.replit.dev/images/client-video-1.mp4"
          />
          <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 bg-black/50 backdrop-blur-sm px-3 py-1.5 text-white text-[10px] tracking-[0.3em] uppercase">
            4:20 &middot; 4K CINEMA &middot; WEDDING REEL
          </div>
        </div>
      </section>

      {/* SECTION 3 — PLAYBACK SECTION */}
      <section className="bg-[#0d0d0e] py-[80px] md:py-[120px] px-6 md:px-[12%] flex flex-col lg:flex-row gap-16 lg:gap-0">
        <div className="w-full lg:w-[55%] flex items-center">
          <div className="w-full relative bg-black shadow-2xl border border-white/5" style={{ aspectRatio: "16/9" }}>
            <video
              controls
              className="w-full h-full object-cover"
              src="https://00f92c19-5eca-4eee-b634-3243cf462959-00-2srflv9dubax1.riker.replit.dev/images/client-video-1.mp4"
            />
          </div>
        </div>
        
        <div className="w-full lg:w-[45%] lg:pl-16 flex flex-col justify-center">
          <div className="text-[#F0961B] text-[10px] tracking-[0.4em] uppercase mb-4">
            WATCH THE
          </div>
          <h2 className="text-white italic text-[50px] md:text-[70px] font-light leading-none">
            Full Film
          </h2>
          
          <div className="w-[80px] h-[2px] bg-[#F0961B] my-8"></div>
          
          <div className="flex flex-col gap-4">
            <CreditRow role="DIRECTED BY" name="Ginger Studios & Creatives" />
            <CreditRow role="CINEMATOGRAPHY" name="Emmanuel Adeyemi" />
            <CreditRow role="EDIT" name="Victor Segun" />
            <CreditRow role="COUPLE" name="Kafidiya × Kafidiya" />
            <CreditRow role="VENUE" name="The Landmark Lagos" />
            <CreditRow role="YEAR" name="MMXXIV" />
          </div>
          
          <a 
            href="#" 
            className="inline-block text-[#F0961B] italic text-[24px] md:text-[28px] font-light mt-12 hover:opacity-75 hover:translate-x-2 transition-all duration-300"
          >
            &gt; BOOK YOUR FILM
          </a>
        </div>
      </section>

      {/* SECTION 4 — WHAT WE DO */}
      <section className="bg-black py-[100px] md:py-[140px] px-6 text-center border-t border-white/5">
        <div 
          className="flex flex-col font-light text-white" 
          style={{ fontSize: "clamp(50px, 7vw, 100px)", lineHeight: "1.0" }}
        >
          <span>We</span>
          <span>tell</span>
          <span>stories</span>
          <span className="italic text-[#F0961B]">that</span>
          <span>last</span>
          <span>forever.</span>
        </div>
        
        <div className="mt-24 flex flex-wrap justify-center items-center gap-4 md:gap-6 text-white text-[10px] md:text-[11px] tracking-[0.4em] uppercase">
          <span>WEDDINGS</span>
          <span className="text-[#F0961B] opacity-70">|</span>
          <span>BRANDS</span>
          <span className="text-[#F0961B] opacity-70">|</span>
          <span>EVENTS</span>
          <span className="text-[#F0961B] opacity-70">|</span>
          <span>BIRTHDAYS</span>
        </div>
      </section>

      {/* SECTION 5 — FOOTER STRIP */}
      <footer className="bg-[#5C1A20] py-8 overflow-hidden whitespace-nowrap border-t border-[#5C1A20]">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 25, repeat: Infinity }}
          className="inline-flex items-center text-white italic text-[32px] font-light"
        >
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center whitespace-nowrap">
              <span className="mx-6">GINGER STUDIOS & CREATIVES</span>
              <span className="mx-6 text-[#F0961B]/80">&middot;</span>
              <span className="mx-6">BASED IN NIGERIA</span>
              <span className="mx-6 text-[#F0961B]/80">&middot;</span>
              <span className="mx-6">AVAILABLE WORLDWIDE</span>
              <span className="mx-6 text-[#F0961B]/80">&middot;</span>
              <span className="mx-6">WE MAKE FILMS</span>
              <span className="mx-6 text-[#F0961B]/80">&middot;</span>
            </div>
          ))}
        </motion.div>
      </footer>
    </div>
  );
}

// Sub-component for credits
function CreditRow({ role, name }: { role: string; name: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between py-2 border-b border-white/10 group hover:border-[#F0961B]/50 transition-colors duration-300">
      <span className="text-white text-[9px] tracking-[0.3em] uppercase mb-1 sm:mb-0 opacity-60">
        {role}
      </span>
      <span className="text-white text-[16px] md:text-[18px] text-left sm:text-right">
        {name}
      </span>
    </div>
  );
}
