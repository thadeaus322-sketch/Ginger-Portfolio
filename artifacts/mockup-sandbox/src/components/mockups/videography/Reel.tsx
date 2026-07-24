import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Reel() {
  useEffect(() => {
    if (!document.querySelector('link[href*="Fraunces"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const videoUrl =
    "https://00f92c19-5eca-4eee-b634-3243cf462959-00-2srflv9dubax1.riker.replit.dev/images/client-video-1.mp4";

  const FilmStrip = ({ text }: { text: string }) => (
    <div className="relative h-full w-full bg-[#111] overflow-hidden flex flex-col pointer-events-none">
      <div className="absolute inset-0 flex flex-col z-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="flex flex-col w-full">
            <div className="flex justify-between px-3 py-2 w-full">
              <div className="w-[8px] h-[14px] bg-white opacity-30 rounded-[2px]" />
              <div className="w-[8px] h-[14px] bg-white opacity-30 rounded-[2px]" />
            </div>
            <div className="h-[60px] bg-[#1a1a1a] border-t border-[#333] w-full shrink-0" />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div
          className="text-[#F0961B] text-[10px] uppercase tracking-[0.3em] bg-[#111] py-8 z-20 whitespace-nowrap"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {text}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d0d0e] text-white font-sans selection:bg-[#F0961B] selection:text-white">
      {/* SECTION 1 — HERO */}
      <section className="relative h-[100vh] w-full overflow-hidden bg-[#0d0d0e] grid grid-cols-[1fr] md:grid-cols-[80px_1fr_80px]">
        {/* LEFT COLUMN */}
        <div className="hidden md:block h-full relative">
          <FilmStrip text="GINGER STUDIOS" />
        </div>

        {/* CENTER COLUMN */}
        <div className="h-full bg-[#000] flex flex-col relative px-6 md:px-12 z-10">
          <div className="h-[15vh] md:h-[20vh] pt-8 md:pt-12">
            <div className="text-white text-[11px] tracking-[0.3em] font-['Fraunces'] uppercase">
              FILM №001
            </div>
          </div>
          <div className="h-[50vh] md:h-[60vh] w-full relative shrink-0">
            <video
              src={videoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover block shadow-[0_0_0_1px_rgba(240,150,27,0.3)]"
            />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h1
              className="text-white font-['Fraunces'] font-bold leading-[0.95] tracking-[-0.03em] flex flex-col mt-[-1vh] md:mt-[-2vh]"
              style={{ fontSize: "clamp(60px, 8vw, 120px)" }}
            >
              <span>WE MAKE</span>
              <span>FILMS.</span>
            </h1>
            <p className="text-[#F0961B] font-['Fraunces'] italic text-[20px] md:text-[24px] mt-2 md:mt-4">
              The story is everything.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="hidden md:block h-full relative">
          <FilmStrip text="EST. 2019" />
        </div>
      </section>

      {/* SECTION 2 — FEATURED PROJECT */}
      <section className="bg-[#0d0d0e] py-[80px] md:py-[100px] px-6 md:px-[80px]">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-0 max-w-[1600px] mx-auto">
          <div className="w-full lg:w-1/2">
            <div className="aspect-video w-full relative border border-[#F0961B] bg-black">
              <video
                src={videoUrl}
                controls
                className="w-full h-full object-cover block"
              />
            </div>
          </div>
          <div className="w-full lg:w-1/2 lg:pl-16 flex flex-col justify-center">
            <div className="text-[#5C1A20] text-[12px] tracking-[0.4em] uppercase">
              THE
            </div>
            <h2 className="text-white font-['Fraunces'] text-[48px] md:text-[72px] font-light tracking-[-0.02em] leading-[1] mt-2">
              KAFIDIYAS
            </h2>
            <div className="text-[#F0961B] text-[11px] tracking-[0.3em] uppercase mt-4">
              A WEDDING FILM
            </div>

            <div className="w-[100px] h-[1px] bg-[#F0961B] my-8" />

            <div className="flex flex-col border-t border-[#222]">
              {[
                { label: "DIRECTOR", value: "E. GINGER" },
                { label: "YEAR", value: "2023" },
                { label: "RUNTIME", value: "14:20" },
                { label: "CATEGORY", value: "MATRIMONIAL" },
              ].map((meta, idx) => (
                <div
                  key={idx}
                  className="flex flex-col py-4 border-b border-[#222]"
                >
                  <div className="text-[#F0961B] text-[9px] tracking-[0.3em] mb-1 font-sans">
                    {meta.label}
                  </div>
                  <div className="text-white font-['Fraunces'] text-[20px]">
                    {meta.value}
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-10 rounded-full bg-[#F0961B] hover:bg-[#d4800f] text-white font-['Fraunces'] italic text-[20px] py-5 transition-colors duration-300">
              WATCH FULL FILM
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 3 — SERVICES MARQUEE */}
      <section className="bg-[#5C1A20] py-12 md:py-16 overflow-hidden">
        <div className="relative w-full flex whitespace-nowrap items-center">
          <motion.div
            className="flex items-center"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 25, repeat: Infinity }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="text-white font-['Fraunces'] italic text-[32px] md:text-[48px] pr-8 whitespace-nowrap"
              >
                WEDDING FILMS · BRAND COMMERCIALS · EVENT HIGHLIGHTS · BIRTHDAY
                REELS · PRODUCT VIDEOS ·{" "}
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
