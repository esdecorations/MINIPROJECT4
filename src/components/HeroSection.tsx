import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuroraBackground } from './ui/aurora-background';
import { FlipWords } from './ui/flip-words';
import { Link as ScrollLink } from 'react-scroll';
import { Sparkles, Heart, Star } from 'lucide-react';

const HeroSection = () => {
  const [showContent, setShowContent] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const words = [
    "Elevating Events",
    "Creating Memories", 
    "Crafting Experiences",
    "Inspiring Moments"
  ];

  useEffect(() => {
    // Generate new key on each mount to force fresh animations
    setAnimationKey(Date.now());
    setShowContent(false);
    
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Floating decorative elements
  const floatingElements = Array.from({ length: 6 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute opacity-20"
      style={{
        left: `${10 + (i * 15)}%`,
        top: `${20 + (i % 3) * 20}%`,
      }}
      animate={{
        y: [0, -20, 0],
        rotate: [0, 10, 0],
        opacity: [0.1, 0.3, 0.1],
      }}
      transition={{
        duration: 4 + i,
        repeat: Infinity,
        delay: i * 0.5,
        ease: "easeInOut",
      }}
    >
      {i % 3 === 0 && <Sparkles className="w-4 h-4 text-white" />}
      {i % 3 === 1 && <Heart className="w-4 h-4 text-white" />}
      {i % 3 === 2 && <Star className="w-4 h-4 text-white" />}
    </motion.div>
  ));

  return (
    <AuroraBackground className="min-h-[100svh] md:min-h-screen relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingElements}
      </div>

      {/* Subtle animated shapes */}
      <motion.div
        className="absolute top-1/4 right-20 w-20 h-20 border border-white/10 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          rotate: 360,
        }}
        transition={{
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
        }}
      />

      <motion.div
        className="absolute bottom-1/4 left-16 w-16 h-16 border border-white/10 rotate-45"
        animate={{
          y: [0, -15, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 text-center flex flex-col justify-center min-h-screen">
        <AnimatePresence mode="wait">
          {showContent && (
            <motion.div
              key={animationKey}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Main heading */}
              <motion.h1
                initial={{ y: 60, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
                className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 sm:mb-8 text-white relative"
              >
                <motion.span
                  animate={{
                    textShadow: [
                      "0 0 20px rgba(255,255,255,0.2)",
                      "0 0 40px rgba(255,255,255,0.4)", 
                      "0 0 20px rgba(255,255,255,0.2)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  E&S DECORATIONS
                </motion.span>
              </motion.h1>

              {/* Subtitle with FlipWords */}
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mb-8 sm:mb-12"
              >
                <div className="text-xl sm:text-2xl md:text-3xl text-white/90 font-light">
                  <FlipWords 
                    words={words} 
                    duration={2500}
                    className="text-white font-light"
                  />
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="text-white/70 text-base sm:text-lg mt-4 max-w-2xl mx-auto"
                >
                  Transforming your special moments into unforgettable experiences with creativity and passion
                </motion.p>
              </motion.div>

              {/* Call to action buttons */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
              >
                <ScrollLink to="latest-work" smooth={true} duration={500} offset={-80}>
                  <motion.button
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 15px 35px rgba(255,255,255,0.2)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="group px-8 py-4 bg-white text-black rounded-full font-semibold text-lg transition-all duration-300 w-full sm:w-auto relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-0 group-hover:opacity-100"
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                    />
                    <span className="relative z-10">View Our Work</span>
                  </motion.button>
                </ScrollLink>
                
                <ScrollLink to="contact" smooth={true} duration={500} offset={-80}>
                  <motion.button
                    whileHover={{ 
                      scale: 1.05,
                      backgroundColor: "rgba(255,255,255,0.15)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold text-lg transition-all duration-300 w-full sm:w-auto relative"
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-white"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                    <span className="relative z-10">Get In Touch</span>
                  </motion.button>
                </ScrollLink>
              </motion.div>

              {/* Quality promise */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="text-white/60 text-sm sm:text-base"
              >
                <motion.div
                  animate={{
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Dedicated to Excellence • Based in Kerala</span>
                  <Sparkles className="w-4 h-4" />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden sm:block"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <motion.div
          animate={{
            y: [0, 8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="cursor-pointer"
        >
          <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center relative group hover:border-white transition-colors">
            <motion.div 
              className="w-1 h-3 bg-white/60 rounded-full mt-2 group-hover:bg-white transition-colors"
              animate={{
                opacity: [1, 0.3, 1],
                height: ["12px", "6px", "12px"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none" />
    </AuroraBackground>
  );
};

export default HeroSection;