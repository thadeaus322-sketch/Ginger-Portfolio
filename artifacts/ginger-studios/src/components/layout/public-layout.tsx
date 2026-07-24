import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const logoIcon = "/images/logo-icon.png";
const logoB = "/images/logo-b.png";

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
      <div className="text-[#211C17] font-sans text-xs uppercase tracking-[0.4em] mb-6 font-semibold">
        Ginger Studios
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

// Module-level flag — resets on every hard page load, never on HMR or client nav
let _preloaderDone = false;

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [showPreloader, setShowPreloader] = useState(!_preloaderDone);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Only show on the home route
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
          <Link href="/" className="flex items-center gap-4 group">
            <img src={logoB} alt="Ginger Studios" className="h-8 object-contain" />
            <span className="font-serif text-xl tracking-tight text-[#211C17]">
              Ginger Studios
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

      <footer className="bg-[#211C17] text-[#FBF6EE] py-24 border-t border-white/5 mt-auto">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-8">
              <img src={logoIcon} alt="Ginger Studios" className="h-12 object-contain brightness-0 invert opacity-90" />
            </Link>
            <p className="text-white/60 font-serif italic text-3xl max-w-md leading-tight">
              Nigeria's warmest creative house. Perfectly preserving every moment.
            </p>
          </div>
          <div>
            <h4 className="font-sans text-[10px] font-bold text-[#F0961B] tracking-[0.2em] uppercase mb-8">Explore</h4>
            <ul className="space-y-5 text-white/60 font-sans text-sm tracking-wider">
              <li><Link href="/photography" className="hover:text-white transition-colors">Photography</Link></li>
              <li><Link href="/videography" className="hover:text-white transition-colors">Videography</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans text-[10px] font-bold text-[#F0961B] tracking-[0.2em] uppercase mb-8">Connect</h4>
            <ul className="space-y-5 text-white/60 font-sans text-sm tracking-wider">
              <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-white transition-colors">TikTok</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Studio Login</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 mt-24 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-white/40 font-sans tracking-[0.2em] uppercase font-bold">
          <p>© {new Date().getFullYear()} Ginger Studios. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}