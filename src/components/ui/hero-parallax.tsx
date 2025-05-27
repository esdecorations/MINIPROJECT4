import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";
import { cn } from "../../lib/utils";

export const HeroParallax = ({
  products,
}: {
  products: {
    title: string;
    thumbnail: string;
    category: string;
  }[];
}) => {
  // Dynamic column distribution
  const totalProducts = products.length;
  
  // Determine number of columns based on total products
  const numColumns = totalProducts <= 12 ? 2 : 3;
  
  // Calculate products per column (distribute evenly)
  const productsPerColumn = Math.ceil(totalProducts / numColumns);
  
  // Create columns by distributing products evenly
  const columns = [];
  for (let i = 0; i < numColumns; i++) {
    const startIndex = i * productsPerColumn;
    const endIndex = Math.min(startIndex + productsPerColumn, totalProducts);
    columns.push(products.slice(startIndex, endIndex));
  }
  
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 400]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -400]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-100, 100]),
    springConfig
  );

  // Helper function to get the correct image path
  const getImageSrc = (thumbnail: string) => {
    // If it's already a data URL (base64), return as is
    if (thumbnail.startsWith('data:')) {
      return thumbnail;
    }
    
    // If it's a full URL, return as is
    if (thumbnail.startsWith('http')) {
      return thumbnail;
    }
    
    // If it's just a filename or relative path, prepend the images path
    if (thumbnail.startsWith('/')) {
      return thumbnail; // Already has leading slash
    }
    
    // Default case: assume it's a filename in the images folder
    return `/images/${thumbnail}`;
  };

  return (
    <div
      ref={ref}
      className={cn(
        "h-[120vh] py-0 overflow-hidden antialiased relative flex flex-col self-auto -mt-20",
        "[perspective:1000px] [transform-style:preserve-3d]"
      )}
    >
      {/* Enhanced background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient mesh background that blends with hero */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black" />
        
        {/* Subtle animated grid */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        {/* Floating particles */}
        {Array.from({ length: 12 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* Subtle geometric shapes */}
        <motion.div
          className="absolute top-20 right-1/4 w-32 h-32 border border-white/5 rounded-full"
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 30, repeat: Infinity, ease: "linear" },
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          }}
        />
        
        <motion.div
          className="absolute bottom-1/3 left-1/4 w-24 h-24 border border-white/5 rotate-45"
          animate={{
            rotate: [45, 135, 45],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
        className="relative max-w-7xl mx-auto px-4 md:px-6 pt-20 md:pt-32 z-10"
      >
        {/* Render columns dynamically */}
        {columns.map((columnProducts, columnIndex) => {
          // Alternate the direction for parallax effect
          const isReverse = columnIndex % 2 === 0;
          const translate = isReverse ? translateX : translateXReverse;
          const flexDirection = isReverse ? "flex-row-reverse" : "flex-row";
          
          return (
            <motion.div 
              key={columnIndex}
              className={`flex ${flexDirection} gap-6 md:gap-8 ${columnIndex < columns.length - 1 ? 'mb-8 md:mb-12' : ''}`}
            >
              {columnProducts.map((product) => (
                <ProductCard
                  product={product}
                  translate={translate}
                  key={product.title}
                  getImageSrc={getImageSrc}
                />
              ))}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export const Header = () => {
  return (
    <div className="max-w-7xl relative mx-auto py-20 md:py-40 px-4 w-full left-0 top-0 z-10">
      <h1 className="text-2xl md:text-7xl font-bold dark:text-white text-center">
        Latest Work
      </h1>
      <p className="max-w-2xl text-base md:text-xl mt-8 dark:text-neutral-200 text-center mx-auto">
        Explore our portfolio of successful events that showcase our creativity and
        expertise.
      </p>
    </div>
  );
};

export const ProductCard = ({
  product,
  translate,
  getImageSrc,
}: {
  product: {
    title: string;
    thumbnail: string;
    category: string;
  };
  translate: MotionValue<number>;
  getImageSrc: (thumbnail: string) => string;
}) => {
  return (
    <motion.div
      style={{
        x: translate,
      }}
      whileHover={{
        y: -20,
      }}
      key={product.title}
      className="group/product h-48 sm:h-64 md:h-96 w-[240px] sm:w-[320px] md:w-[480px] relative flex-shrink-0"
    >
      <div className="block group-hover/product:shadow-2xl w-full h-full">
        <div className="relative w-full h-full overflow-hidden rounded-xl border border-white/10 backdrop-blur-sm">
          <img
            src={getImageSrc(product.thumbnail)}
            alt={product.title}
            className="w-full h-full object-cover transition-all duration-500 group-hover/product:scale-110 group-hover/product:brightness-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover/product:opacity-100 transition-all duration-300"></div>
          <div className="absolute inset-0 ring-1 ring-white/10 rounded-xl opacity-0 group-hover/product:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute bottom-4 left-4 text-left opacity-0 group-hover/product:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/product:translate-y-0">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-1 drop-shadow-lg">{product.title}</h2>
            <span className="text-xs sm:text-sm text-gray-300 drop-shadow-lg">{product.category}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};