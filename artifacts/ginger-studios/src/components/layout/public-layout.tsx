import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

import { img } from "@/lib/assets";
const logoIcon = img("images/logo-icon.png");
const logoB    = img("images/logo-b.png");

// ─── Brand constants ──────────────────────────────────────────────────────────
const BRAND = {
  phone1: "07067310008",
  phone2: "07053444431",
  wa:     "https://wa.me/2347067310008?text=Hi%20Ginger%20Studios!%20I%27d%20like%20to%20book%20a%20session.",
  email:  "hi@gvs.com.ng",
  instagram: "https://www.instagram.com/ginger_visual_studios?igsh=bGdzbTZheWlqaXUx&utm_source=qr",
  pinterest: "https://pin.it/Xb0vIhvuX",
  twitter:   "https://x.com/gvsnig?s=11",
};

function Preloader({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 1900);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FBF6EE]"
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
    >
      <motion.img
        src={logoIcon}
        alt="Ginger Studios Icon"
        className="w-16 h-16 mb-10 object-contain"
        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
        transition={{ rotate: { duration: 10, ease: "linear", repeat: Infinity }, scale: { duration: 2, ease: "easeInOut", repeat: Infinity } }}
      />
      <div className="text-[#211C17] font-sans text-xs uppercase tracking-[0.4em] mb-6 font-semibold text-center">
        Ginger Studios &amp; Creatives
      </div>
      <div className="w-[180px] h-[1px] bg-[#211C17]/10 overflow-hidden">
        <motion.div
          className="h-full bg-[#F0961B]"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}

let _preloaderDone = false;

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [showPreloader, setShowPreloader] = useState(!_preloaderDone);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const shouldShow = showPreloader && location === "/";

  const handlePreloaderComplete = () => {
    _preloaderDone = true;
    setShowPreloader(false);
  };

  const navLinks = [
    { label: "Photography", href: "/photography" },
    { label: "Videography", href: "/videography" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#FBF6EE] selection:bg-[#F0961B]/20 selection:text-[#211C17]">
      <AnimatePresence>
        {shouldShow && (
          <Preloader key="preloader" onComplete={handlePreloaderComplete} />
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-40 w-full bg-[#FBF6EE]/90 backdrop-blur-xl border-b border-[#211C17]/5">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img src={logoIcon} alt="Ginger Studios & Creatives" className="h-10 object-contain" />
            <span className="font-serif text-lg tracking-tight text-[#211C17] leading-tight">
              Ginger Studios<br />
              <span className="text-sm text-[#211C17]/60 font-sans font-medium tracking-[0.05em]">&amp; Creatives</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => {
              const isActive = location === link.href || (link.href !== '/' && location.startsWith(link.href));
              return (
                <Link key={link.href} href={link.href} className="relative text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#211C17]/70 hover:text-[#211C17] transition-colors py-2">
                  {link.label}
                  {isActive && (
                    <motion.div layoutId="navIndicator" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#F0961B] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Nav Toggle */}
          <button className="md:hidden p-2 text-[#211C17]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden bg-[#FBF6EE] border-b border-[#211C17]/10"
            >
              <nav className="flex flex-col px-8 py-10 gap-8">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="text-3xl font-serif text-[#211C17] hover:text-[#F0961B] transition-colors">
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 flex flex-col w-full">
        {children}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-[#211C17] text-[#FBF6EE] pt-24 pb-12 border-t border-white/5 mt-auto">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-12 mb-20">

          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-8">
              <img src={logoIcon} alt="Ginger Studios" className="h-12 object-contain brightness-0 invert opacity-90" />
            </Link>
            <p className="text-white/60 font-serif italic text-3xl max-w-md leading-tight mb-8">
              Nigeria's warmest creative house. Perfectly preserving every moment.
            </p>
            {/* Contact details */}
            <div className="space-y-2 text-white/50 font-sans text-sm">
              <a href={`tel:${BRAND.phone1}`} className="flex items-center gap-2 hover:text-[#F0961B] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.03 1.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/></svg>
                {BRAND.phone1}
              </a>
              <a href={`tel:${BRAND.phone2}`} className="flex items-center gap-2 hover:text-[#F0961B] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.03 1.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/></svg>
                {BRAND.phone2}
              </a>
              <a href={`mailto:${BRAND.email}`} className="flex items-center gap-2 hover:text-[#F0961B] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                {BRAND.email}
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-sans text-[10px] font-bold text-[#F0961B] tracking-[0.2em] uppercase mb-8">Explore</h4>
            <ul className="space-y-5 text-white/60 font-sans text-sm tracking-wider">
              <li><Link href="/photography" className="hover:text-white transition-colors">Photography</Link></li>
              <li><Link href="/videography" className="hover:text-white transition-colors">Videography</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-sans text-[10px] font-bold text-[#F0961B] tracking-[0.2em] uppercase mb-8">Connect</h4>
            <ul className="space-y-5 text-white/60 font-sans text-sm tracking-wider">
              <li>
                <a href={BRAND.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  Instagram
                </a>
              </li>
              <li>
                <a href={BRAND.pinterest} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
                  Pinterest
                </a>
              </li>
              <li>
                <a href={BRAND.twitter} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  X (Twitter)
                </a>
              </li>
              <li>
                <a href={BRAND.wa} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.107 1.516 5.832L0 24l6.335-1.493A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.011-1.374l-.36-.214-3.732.879.894-3.648-.235-.374A9.818 9.818 0 1112 21.818z"/></svg>
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={`mailto:${BRAND.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  {BRAND.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40 font-sans tracking-[0.2em] uppercase font-bold">
          <p>© {new Date().getFullYear()} Ginger Studios & Creatives. All rights reserved.</p>
          <p>Based in Abeokuta, Nigeria</p>
        </div>
      </footer>
    </div>
  );
}
