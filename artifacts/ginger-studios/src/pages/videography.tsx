import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";

const genBrand1 = "/images/gen-brand-film-1.jpg";
const genEvent1 = "/images/gen-event-1.jpg";
const weddingBride = "/images/wedding-bride.jpg";
const birthdayPortrait2 = "/images/birthday-portrait-2.jpg";

const videos = [
  { id: 1, thumb: genBrand1, title: "Elevate Boutique", duration: "1:45", category: "Brand Film" },
  { id: 2, thumb: weddingBride, title: "Aisha & Tobi", duration: "5:20", category: "Wedding Reel" },
  { id: 3, thumb: genEvent1, title: "The Evening Gala", duration: "3:10", category: "Event Highlight" },
  { id: 4, thumb: birthdayPortrait2, title: "Jisola 30th", duration: "1:15", category: "Birthday Reel" },
  { id: 5, thumb: genBrand1, title: "Lagos Fashion Week", duration: "2:30", category: "Brand Film" },
  { id: 6, thumb: weddingBride, title: "The Kafidiyas", duration: "4:00", category: "Wedding Reel" },
];

export default function Videography() {
  const [activeVideo, setActiveVideo] = useState<number | null>(null);

  return (
    <div className="w-full flex flex-col bg-background pt-12 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-6">Videography</h1>
          <p className="text-muted-foreground font-sans text-lg">
            Cinematic storytelling. We create motion pictures that make you feel the moment all over again.
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((vid, i) => (
            <motion.div 
              key={vid.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer relative"
              onClick={() => setActiveVideo(vid.id)}
            >
              <div className="relative aspect-video overflow-hidden bg-muted rounded-sm mb-4">
                <img 
                  src={vid.thumb} 
                  alt={vid.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300">
                    <Play className="text-white ml-1" fill="currentColor" size={24} />
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 text-xs text-white font-medium rounded-sm">
                  {vid.duration}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-primary uppercase font-bold tracking-widest block mb-1">{vid.category}</span>
                <h3 className="font-serif text-xl text-foreground">{vid.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Video Modal Placeholder */}
      <AnimatePresence>
        {activeVideo !== null && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-12 cursor-pointer"
            onClick={() => setActiveVideo(null)}
          >
            <div className="relative max-w-5xl w-full aspect-video bg-black flex items-center justify-center border border-white/10" onClick={e => e.stopPropagation()}>
              <div className="text-center text-white/50">
                <Play className="mx-auto mb-4 opacity-50" size={48} />
                <p className="font-serif text-2xl">Video Player Embedded Here</p>
                <p className="font-sans text-sm mt-2">YouTube / Vimeo / Direct video</p>
              </div>
              <button onClick={() => setActiveVideo(null)} className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors">
                <span className="sr-only">Close</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
