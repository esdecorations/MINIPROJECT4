import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { HeroParallax } from "./ui/hero-parallax";
import axios from "axios";

interface LatestWork {
  _id: string;
  title: string;
  thumbnail: string;
  category: string;
}

const LatestSection = () => {
  const [works, setWorks] = useState<LatestWork[]>([]);
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const opacity = useTransform(scrollYProgress, [0.8, 0.9], [1, 0]);
  const scale = useTransform(scrollYProgress, [0.8, 0.9], [1, 0.97]);

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const response = await axios.get(
          "https://es-decorations.onrender.com/latest-works"
        );
        // Transform the works data to include the base64 image data
        const transformedWorks = response.data.map((work: LatestWork) => ({
          ...work,
          thumbnail: `data:image/jpeg;base64,${work.thumbnail}`,
        }));
        setWorks(transformedWorks);
      } catch (error) {
        console.error("Error fetching works:", error);
      }
    };

    fetchWorks();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="latest-works"
      className="relative w-full bg-black"
    >
      <motion.div
        style={{ opacity }}
        className="sticky top-[25vh] md:top-[30vh] z-[40] text-left max-w-4xl mx-auto px-4 md:px-6 mb-10 md:mb-20"
      >
        <motion.h2
          style={{ scale }}
          className="text-4xl md:text-6xl font-bold mb-4 md:mb-6"
        >
          Latest Work
        </motion.h2>
        <motion.p
          style={{ scale }}
          className="text-lg md:text-2xl text-gray-300"
        >
          Explore our portfolio of successful events that showcase our
          creativity and expertise.
        </motion.p>
      </motion.div>

      <div className="relative z-10">
        <HeroParallax products={works} />
      </div>
    </section>
  );
};

export default LatestSection;
