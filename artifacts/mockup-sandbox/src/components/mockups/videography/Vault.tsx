import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X } from 'lucide-react';

export function Vault() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoUrl = "https://00f92c19-5eca-4eee-b634-3243cf462959-00-2srflv9dubax1.riker.replit.dev/images/client-video-1.mp4";

  useEffect(() => {
    // Inject Fraunces font
    if (!document.getElementById('font-fraunces')) {
      const link = document.createElement('link');
      link.id = 'font-fraunces';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen font-sans selection:bg-[#F0961B] selection:text-[#0a0a0a]">
      <style dangerouslySetInnerHTML={{__html: `
        .font-fraunces { font-family: 'Fraunces', serif; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 25s linear infinite;
        }
        .grain-overlay {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E");
        }
      `}} />

      {/* SECTION 1 — HERO */}
      <section className="relative w-full h-[100dvh] overflow-hidden">
        {/* Video Background */}
        <video 
          className="absolute inset-0 w-full h-full object-cover"
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
        />

        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0 z-[1]"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.8) 100%)'
          }}
        />

        {/* Grain Overlay */}
        <div className="absolute inset-0 z-[3] grain-overlay opacity-30 pointer-events-none mix-blend-overlay" />

        {/* TOP amber letterbox bar */}
        <div className="absolute top-0 left-0 w-full h-[80px] bg-black z-10 flex items-center justify-between px-8 md:px-12">
          <span className="text-white font-fraunces text-[14px] tracking-[0.3em]">GS</span>
          <span className="text-white font-fraunces text-[14px] tracking-[0.3em]">VIDEOGRAPHY</span>
        </div>

        {/* BOTTOM amber letterbox bar */}
        <div className="absolute bottom-0 left-0 w-full h-[80px] bg-black z-10 flex items-center overflow-hidden">
          <div className="animate-marquee flex text-[#F0961B] font-fraunces text-[14px] tracking-[0.2em] whitespace-nowrap">
            <span>WEDDING FILMS · BRAND COMMERCIALS · EVENT HIGHLIGHTS · BIRTHDAY REELS · PRODUCT VIDEOS · </span>
            <span>WEDDING FILMS · BRAND COMMERCIALS · EVENT HIGHLIGHTS · BIRTHDAY REELS · PRODUCT VIDEOS · </span>
            <span>WEDDING FILMS · BRAND COMMERCIALS · EVENT HIGHLIGHTS · BIRTHDAY REELS · PRODUCT VIDEOS · </span>
            <span>WEDDING FILMS · BRAND COMMERCIALS · EVENT HIGHLIGHTS · BIRTHDAY REELS · PRODUCT VIDEOS · </span>
          </div>
        </div>

        {/* CENTER text */}
        <div className="relative z-[5] w-full h-full flex flex-col items-center justify-center pt-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <h1 className="font-fraunces font-light text-white leading-none tracking-[-0.02em] text-[clamp(60px,10vw,120px)]">
              THE
            </h1>
            <h2 className="font-fraunces font-bold italic text-[#F0961B] leading-none tracking-[-0.04em] text-[clamp(80px,14vw,180px)] -mt-[5px] md:-mt-[20px]">
              KAFIDIYAS
            </h2>
            
            <div className="w-[120px] h-[1px] bg-[#F0961B] mt-8 md:mt-10 mb-6" />
            
            <p className="text-white text-[11px] tracking-[0.4em] uppercase font-medium">
              A Wedding Film
            </p>

            <button 
              onClick={() => setIsFullscreen(true)}
              className="mt-12 w-[80px] h-[80px] rounded-full border-[1.5px] border-white/40 bg-white/5 backdrop-blur-md flex items-center justify-center group transition-all duration-500 hover:border-[#F0961B] hover:bg-white/10 hover:scale-110"
              aria-label="Play full film"
            >
              <Play className="w-[28px] h-[28px] text-white fill-white translate-x-[2px] transition-colors duration-500 group-hover:text-[#F0961B] group-hover:fill-[#F0961B]" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2 — FEATURED FILM */}
      <section className="bg-[#0a0a0a] w-full py-[120px] px-6 md:px-12 lg:px-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-16 md:mb-24">
            <h2 className="font-fraunces font-light text-white text-[40px] sm:text-[60px] md:text-[80px] leading-[1.1]">
              THE KAFIDIYAS
            </h2>
            <h3 className="font-fraunces italic text-[#F0961B] text-[32px] sm:text-[48px] md:text-[60px] leading-[1.1]">
              A Short Story of Love
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            {/* Left: Video */}
            <div className="lg:col-span-8">
              <div className="relative w-full aspect-video border border-[#F0961B] bg-black">
                <video 
                  className="w-full h-full object-cover"
                  src={videoUrl}
                  controls
                  playsInline
                  preload="metadata"
                />
              </div>
            </div>

            {/* Right: Metadata */}
            <div className="lg:col-span-4 flex flex-col justify-center">
              <div className="flex flex-col w-full">
                <MetadataRow label="DIRECTOR" value="Ginger Studios" />
                <MetadataRow label="YEAR" value="2024" />
                <MetadataRow label="RUNTIME" value="4:20" />
                <MetadataRow label="FORMAT" value="4K CINEMA" />
                <MetadataRow label="CATEGORY" value="WEDDING FILM" isLast />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — SERVICES */}
      <section className="bg-[#0a0a0a] py-[80px]">
        <div className="w-full bg-[#5C1A20] py-8 overflow-hidden flex items-center">
          <div className="animate-marquee flex text-white font-fraunces italic text-[32px] sm:text-[40px] whitespace-nowrap">
            <span className="px-8">WEDDING FILMS · BRAND COMMERCIALS · EVENT HIGHLIGHTS · BIRTHDAY REELS · </span>
            <span className="px-8">WEDDING FILMS · BRAND COMMERCIALS · EVENT HIGHLIGHTS · BIRTHDAY REELS · </span>
            <span className="px-8">WEDDING FILMS · BRAND COMMERCIALS · EVENT HIGHLIGHTS · BIRTHDAY REELS · </span>
            <span className="px-8">WEDDING FILMS · BRAND COMMERCIALS · EVENT HIGHLIGHTS · BIRTHDAY REELS · </span>
          </div>
        </div>
      </section>

      {/* FULLSCREEN VIDEO OVERLAY */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          >
            <button 
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 md:top-8 md:right-8 z-[110] w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-105"
            >
              <X className="w-6 h-6" />
            </button>
            <video 
              className="w-full h-full max-h-screen object-contain"
              src={videoUrl}
              autoPlay
              controls
              playsInline
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetadataRow({ label, value, isLast = false }: { label: string, value: string, isLast?: boolean }) {
  return (
    <div className={`py-6 flex flex-col ${!isLast ? 'border-b border-[#F0961B]/30' : ''}`}>
      <div className="text-[#F0961B] text-[9px] uppercase tracking-[0.3em] mb-2 font-sans font-semibold">
        {label}
      </div>
      <div className="text-white font-fraunces text-[22px] tracking-wide">
        {value}
      </div>
    </div>
  );
}
