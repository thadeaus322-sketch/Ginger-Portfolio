import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

// Assets
const logoIcon = "/images/logo-icon.png";
const logoB = "/images/logo-b.png";

function Preloader({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    // Loading bar takes 1.5 s; give 0.4 s grace then dismiss.
    // Empty dep array: run once on mount only — onComplete ref is stable via useCallback in parent.
    const t = setTimeout(onComplete, 1900);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
    >
      <motion.img
        src={logoIcon}
        alt="Ginger Studios Icon"
        className="w-16 h-16 mb-8 object-contain"
        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
        transition={{ rotate: { duration: 8, ease: "linear", repeat: Infinity }, scale: { duration: 2, ease: "easeInOut", repeat: Infinity } }}
      />
      <div className="text-primary font-sans text-xs uppercase tracking-[0.3em] mb-4">
        Ginger Studios & Creatives
      </div>
      <div className="w-[200px] h-[2px] bg-border overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [hasSeenPreloader, setHasSeenPreloader] = useState(true);
  const [isPreloaderActive, setIsPreloaderActive] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const seen = sessionStorage.getItem("hasSeenPreloader");
    if (!seen && location === "/") {
      setHasSeenPreloader(false);
      setIsPreloaderActive(true);
    }
  }, [location]);

  const handlePreloaderComplete = () => {
    sessionStorage.setItem("hasSeenPreloader", "true");
    setIsPreloaderActive(false);
  };

  const navLinks = [
    { label: "Photography", href: "/photography" },
    { label: "Videography", href: "/videography" },
    { label: "Client Gallery", href: "/gallery" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <AnimatePresence>
        {!hasSeenPreloader && isPreloaderActive && (
          <Preloader key="preloader" onComplete={handlePreloaderComplete} />
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img src={logoB} alt="Ginger Studios" className="h-8 object-contain" />
            <span className="font-serif text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
              Ginger Studios
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                {link.label}
              </Link>
            ))}
            <Link href="/contact" className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              Book a shoot
            </Link>
          </nav>

          {/* Mobile Nav Toggle */}
          <button className="md:hidden p-2 text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
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
              className="md:hidden overflow-hidden bg-background border-b border-border"
            >
              <nav className="flex flex-col px-6 py-6 gap-6">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="text-lg font-serif text-foreground hover:text-primary">
                    {link.label}
                  </Link>
                ))}
                <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="inline-block text-center mt-4 px-6 py-3 bg-primary text-primary-foreground text-sm font-medium">
                  Book a shoot
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="bg-card py-20 border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <img src={logoB} alt="Ginger Studios" className="h-10 object-contain" />
            </Link>
            <p className="text-muted-foreground font-serif italic text-xl max-w-sm">
              Nigeria's warmest creative house. Perfectly preserving every moment.
            </p>
          </div>
          <div>
            <h4 className="font-sans text-sm font-bold text-foreground tracking-widest uppercase mb-6">Explore</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li><Link href="/photography" className="hover:text-primary transition-colors">Photography</Link></li>
              <li><Link href="/videography" className="hover:text-primary transition-colors">Videography</Link></li>
              <li><Link href="/gallery" className="hover:text-primary transition-colors">Client Galleries</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans text-sm font-bold text-foreground tracking-widest uppercase mb-6">Connect</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">TikTok</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              <li><Link href="/admin" className="hover:text-primary transition-colors">Admin Login</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Ginger Studios & Creatives. All rights reserved.</p>
          <p>Abeokuta, Nigeria</p>
        </div>
      </footer>
    </div>
  );
}
