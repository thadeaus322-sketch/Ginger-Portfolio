import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2, Play, HeartHandshake, Camera, Film, Star } from "lucide-react";

// Assets
const weddingDetail = "/images/wedding-detail.jpg";
const weddingBride = "/images/wedding-bride.jpg";
const birthdayPortrait1 = "/images/birthday-portrait-1.jpg";
const birthdayPortrait2 = "/images/birthday-portrait-2.jpg";
const genWed1 = "/images/gen-wedding-1.jpg";
const genWed2 = "/images/gen-wedding-2.jpg";
const genBirth1 = "/images/gen-birthday-1.jpg";
const genBrand1 = "/images/gen-brand-film-1.jpg";

const heroSlides = [
  { img: weddingBride, tag: "Weddings", title: "#BecomingTheKafidiya" },
  { img: genWed1, tag: "Weddings", title: "Editorial Golden Hour" },
  { img: birthdayPortrait1, tag: "Portraits", title: "Zarah's 25th" },
  { img: genBrand1, tag: "Brand", title: "Cinematic Reel" },
];

const selectedWork = [
  { id: 1, img: weddingDetail, category: "Weddings", title: "The Details" },
  { id: 2, img: weddingBride, category: "Weddings", title: "A Short Story" },
  { id: 3, img: birthdayPortrait2, category: "Portraits", title: "Jisola xo" },
  { id: 4, img: genWed1, category: "Weddings", title: "Golden Hour Editorial" },
  { id: 5, img: genBirth1, category: "Portraits", title: "Fashion Portrait" },
  { id: 6, img: genWed2, category: "Weddings", title: "Rich Cultural Heritage" },
];

const services = [
  { icon: HeartHandshake, title: "Weddings", desc: "A narrative of your most important day, crafted with love." },
  { icon: Camera, title: "Portraits", desc: "Intimate, editorial-style portraits that capture your essence." },
  { icon: Star, title: "Birthdays", desc: "Celebrate milestones with vibrant, timeless imagery." },
  { icon: Film, title: "Brand Films", desc: "Cinematic visuals that tell your brand's unique story." },
];

const testimonials = [
  { quote: "Every single picture felt like a movie. Ginger Studios didn't just take photos, they captured the actual feeling of our wedding day.", name: "Aisha & Tobi", service: "Wedding Photography" },
  { quote: "The warmth in their lighting and their attention to detail is unmatched in Abeokuta. Highly highly recommend.", name: "Zarah", service: "Birthday Portraits" },
  { quote: "Professional, creative, and delivered beyond our expectations. The brand film gave our business a whole new level of class.", name: "Elevate Boutique", service: "Brand Film" },
];

export default function Home() {
  const prefersReducedMotion = useReducedMotion();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  // Auto-advance hero carousel
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isHovered]);

  // Auto-advance testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = offset.x;
    if (swipe < -40) {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    } else if (swipe > 40) {
      setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    }
  };

  const staggerVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
    })
  };

  return (
    <div className="w-full flex flex-col">
      {/* HERO SECTION */}
      <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden px-6 py-12 md:py-20">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          
          {/* Left Column - Copy */}
          <div className="flex flex-col z-10 order-2 lg:order-1">
            <motion.span 
              custom={0} initial="hidden" animate="visible" variants={staggerVariants}
              className="text-[11px] font-sans text-primary tracking-[0.15em] uppercase font-bold mb-6 block"
            >
              Abeokuta — Photography & Film
            </motion.span>
            
            <motion.h1 
              custom={1} initial="hidden" animate="visible" variants={staggerVariants}
              className="font-serif text-5xl md:text-7xl lg:text-[72px] leading-[1.1] text-foreground mb-6"
            >
              We capture <em className="text-primary italic font-light">love</em> in every frame
            </motion.h1>
            
            <motion.p 
              custom={2} initial="hidden" animate="visible" variants={staggerVariants}
              className="font-sans text-lg md:text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed"
            >
              Step into a beautifully lit space where your most important moments are intentionally crafted and perfectly preserved.
            </motion.p>
            
            <motion.div custom={3} initial="hidden" animate="visible" variants={staggerVariants} className="flex flex-wrap items-center gap-6 mb-12">
              <Link href="/photography" className="group relative inline-flex items-center justify-center bg-primary text-primary-foreground px-8 py-4 text-base font-medium overflow-hidden transition-all hover:bg-primary/90">
                <span className="relative z-10 flex items-center gap-2">
                  View the portfolio
                  <motion.span className="inline-block" whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                    <ArrowRight size={18} />
                  </motion.span>
                </span>
              </Link>
              
              <Link href="/videography" className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition-colors border-b border-transparent hover:border-foreground pb-1">
                <Play size={16} className="fill-current" /> Showreel, 45s
              </Link>
            </motion.div>
            
            <motion.div custom={4} initial="hidden" animate="visible" variants={staggerVariants} className="flex items-center gap-3 text-xs md:text-sm font-sans text-muted-foreground">
              <span>240+ weddings shot</span>
              <span className="text-border">|</span>
              <span>3 mo gallery access</span>
              <span className="text-border">|</span>
              <span className="flex items-center gap-1">4.9 <Star size={12} className="fill-primary text-primary" /> rating</span>
            </motion.div>
          </div>

          {/* Right Column - Phone Mockup */}
          <div className="relative flex justify-center items-center h-full order-1 lg:order-2">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
              className="relative w-full max-w-[280px] md:max-w-[320px] aspect-[9/19]"
            >
              {/* Amber Glow Behind */}
              <motion.div 
                className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full"
                animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Floating Chips */}
              <motion.div 
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-12 top-20 z-20 bg-card border border-border shadow-xl px-4 py-2.5 rounded-lg flex items-center gap-2"
              >
                <span className="text-xs font-semibold text-foreground">New gallery ready</span>
                <CheckCircle2 size={16} className="text-green-500" />
              </motion.div>

              <motion.div 
                animate={{ y: [8, -8, 8] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -left-12 bottom-32 z-20 bg-card border border-border shadow-xl px-4 py-2.5 rounded-lg flex items-center gap-2"
              >
                <span className="text-xs font-semibold text-foreground">Saved to Drive</span>
                <CheckCircle2 size={16} className="text-blue-500" />
              </motion.div>

              {/* Phone Frame */}
              <div className="absolute inset-0 bg-[#1a1a1a] rounded-[40px] shadow-2xl overflow-hidden border-[6px] border-[#2a2a2a] ring-1 ring-border/20 z-10 flex flex-col relative">
                {/* Notch */}
                <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-30">
                  <div className="w-1/3 h-full bg-[#1a1a1a] rounded-b-xl"></div>
                </div>

                {/* Screen Content - Carousel */}
                <div 
                  className="flex-1 w-full h-full relative overflow-hidden bg-black"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <AnimatePresence initial={false} mode="wait">
                    <motion.div
                      key={activeSlide}
                      className="absolute inset-0 cursor-grab active:cursor-grabbing"
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={handleDragEnd}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                      <img 
                        src={heroSlides[activeSlide].img} 
                        alt={heroSlides[activeSlide].title} 
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                      
                      {/* Lower Third Overlay */}
                      <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col gap-1 pointer-events-none">
                        <span className="text-[10px] font-bold tracking-wider text-white/80 uppercase">{heroSlides[activeSlide].tag}</span>
                        <span className="text-white font-serif text-lg">{heroSlides[activeSlide].title}</span>
                      </div>
                      
                      {/* Top Right Pill */}
                      <div className="absolute top-8 right-4 bg-white/20 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] text-white font-medium uppercase tracking-wider">
                        Reel
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Dot Indicators */}
              <div className="absolute -bottom-8 inset-x-0 flex justify-center gap-2">
                {heroSlides.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveSlide(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === activeSlide ? "bg-primary w-6" : "bg-border hover:bg-muted-foreground"}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SELECTED WORK */}
      <section className="py-24 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
          >
            <div>
              <h2 className="font-serif text-4xl text-foreground mb-4">Selected Work</h2>
              <p className="text-muted-foreground font-sans max-w-md">A curated collection of our favorite moments across weddings, portraits, and films.</p>
            </div>
            <Link href="/photography" className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors">
              View full gallery <ArrowRight size={16} />
            </Link>
          </motion.div>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {selectedWork.map((work, i) => (
              <motion.div 
                key={work.id}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="relative group overflow-hidden bg-muted break-inside-avoid cursor-pointer rounded-sm"
                onClick={() => setSelectedImage(work.id)}
              >
                <motion.img 
                  layoutId={`image-${work.id}`}
                  src={work.img} 
                  alt={work.title} 
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-background/0 group-hover:bg-background/80 transition-colors duration-300 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 p-6 text-center">
                  <span className="text-xs uppercase tracking-widest text-primary font-bold mb-2">{work.category}</span>
                  <h3 className="font-serif text-xl text-foreground">{work.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-12 cursor-pointer"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-5xl w-full h-full flex items-center justify-center cursor-default" onClick={e => e.stopPropagation()}>
              {selectedWork.map(work => work.id === selectedImage && (
                <motion.img 
                  key={work.id}
                  layoutId={`image-${work.id}`}
                  src={work.img} 
                  alt={work.title} 
                  className="max-w-full max-h-full object-contain"
                />
              ))}
              <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 text-white hover:text-primary transition-colors">
                <span className="sr-only">Close</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SERVICES STRIP */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, i) => (
              <motion.div 
                key={service.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex flex-col p-8 bg-card border border-border hover:border-primary/30 transition-colors group"
              >
                <div className="w-12 h-12 bg-background border border-border flex items-center justify-center rounded-full mb-6 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors text-foreground">
                  <service.icon size={24} />
                </div>
                <h3 className="font-serif text-2xl text-foreground mb-3">{service.title}</h3>
                <p className="text-muted-foreground font-sans leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STUDIO STORY */}
      <section className="py-32 bg-secondary text-secondary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <blockquote className="font-serif text-3xl md:text-5xl italic leading-tight text-primary">
              "We believe that every person, every couple, and every brand has a unique rhythm. Our job is to catch it before it fades."
            </blockquote>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6 text-secondary-foreground/80 font-sans text-lg">
            <p>
              Based in the heart of Abeokuta, Ginger Studios & Creatives was born from a desire to elevate visual storytelling in Nigeria. We are more than just a camera and a lens; we are a warm, intentional space where memories are treated as art.
            </p>
            <p>
              Whether we are shooting a quiet portrait session, a grand traditional wedding, or a sleek brand film, our approach remains the same: genuine connection, cinematic lighting, and a relentless pursuit of the perfect frame.
            </p>
            <div className="pt-6">
              <Link href="/contact" className="inline-block border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors px-8 py-3 font-medium uppercase tracking-widest text-sm">
                Get in touch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-32 bg-background border-t border-border">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-xs uppercase tracking-[0.2em] font-bold text-primary mb-6 block">Client Love</motion.span>
          
          <div className="relative h-[250px] md:h-[200px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <p className="font-serif text-2xl md:text-4xl text-foreground leading-snug mb-8">
                  "{testimonials[activeTestimonial].quote}"
                </p>
                <div className="flex flex-col items-center">
                  <span className="font-sans font-semibold text-foreground uppercase tracking-wider text-sm">{testimonials[activeTestimonial].name}</span>
                  <span className="text-sm text-muted-foreground mt-1">{testimonials[activeTestimonial].service}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-3 mt-12">
            {testimonials.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setActiveTestimonial(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === activeTestimonial ? "bg-primary scale-125" : "bg-border hover:bg-muted-foreground"}`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
