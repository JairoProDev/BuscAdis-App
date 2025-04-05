"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { categories } from "@/lib/constants"; // Asume que las categorías están aquí
import CategoryCard from "./CategoryCard"; // Importa el componente Card
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { useState, useRef, useEffect } from "react";

const CategoriesSection = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Update scroll buttons visibility based on scroll position
  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      // Initial check
      handleScroll();
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Scroll the container horizontally
  const scrollToLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollToRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  return (
    <section
      ref={ref}
      className="py-16 sm:py-24 relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #f7f9fc, #f3f4f6)",
        backgroundImage: "radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)",
        backgroundSize: "30px 30px"
      }}
    >
      {/* Decorative elements - with platinum/silver effects */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full 
        bg-gradient-to-br from-gray-200 via-white to-gray-300 animate-[spin_60s_linear_infinite] 
        shadow-[0_0_40px_rgba(220,220,230,0.6)] opacity-60"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full 
        bg-gradient-to-tl from-gray-200 via-white to-gray-300 animate-[spin_80s_linear_infinite] 
        shadow-[0_0_60px_rgba(220,220,230,0.4)] opacity-60"></div>

      {/* Premium border effect */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Encabezado */}
        <motion.div
          className="text-center mb-12 sm:mb-16 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Subtle light effect behind badge for premium look */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-10 bg-gradient-to-r from-blue-200/30 via-purple-200/30 to-blue-200/30 blur-xl rounded-full"></div>
          
          <motion.span
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 text-sm font-medium mb-3 inline-block shadow-sm relative border border-gray-300/40"
            initial={{ opacity: 0, y: -10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <span className="relative z-10">Encuentra lo que buscas</span>
            {/* Subtle platinum shimmer effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-gray-200/0 via-white/80 to-gray-200/0 rounded-full animate-shimmer"></span>
          </motion.span>
          
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Explora por <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Categorías</span>
          </motion.h2>
          
          <motion.p
            className="text-lg text-gray-700 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Encuentra rápidamente lo que necesitas navegando nuestras secciones
            principales.
          </motion.p>
          
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-500 rounded-full mx-auto mt-8"
            initial={{ width: 0, opacity: 0 }}
            animate={inView ? { width: 96, opacity: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
          ></motion.div>
        </motion.div>

        {/* Navigation controls for mobile scrolling - styled with platinum effects */}
        <div className="flex justify-end gap-2 mb-4 lg:hidden">
          <motion.button
            onClick={scrollToLeft}
            className={`p-2 rounded-full ${
              canScrollLeft 
                ? "bg-gradient-to-br from-gray-100 to-gray-300 text-gray-700 shadow-md" 
                : "bg-gray-200 text-gray-400"
            } transition-all duration-200 border border-gray-200`}
            disabled={!canScrollLeft}
            aria-label="Desplazar a la izquierda"
            whileTap={{ scale: 0.95 }}
          >
            <ArrowRightIcon className="h-5 w-5 transform rotate-180" />
          </motion.button>
          
          <motion.button
            onClick={scrollToRight}
            className={`p-2 rounded-full ${
              canScrollRight 
                ? "bg-gradient-to-br from-gray-100 to-gray-300 text-gray-700 shadow-md" 
                : "bg-gray-200 text-gray-400"
            } transition-all duration-200 border border-gray-200`}
            disabled={!canScrollRight}
            aria-label="Desplazar a la derecha"
            whileTap={{ scale: 0.95 }}
          >
            <ArrowRightIcon className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Grid/Scrollable Categories Container */}
        <motion.div
          ref={containerRef}
          className="flex lg:grid lg:grid-cols-4 gap-6 lg:gap-8 overflow-x-auto pb-6 lg:overflow-visible snap-x snap-mandatory lg:snap-none"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          onScroll={handleScroll}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="snap-center flex-shrink-0 w-[85%] sm:w-[45%] lg:w-auto"
            >
              <CategoryCard category={category} index={index} />
            </div>
          ))}
        </motion.div>

        {/* Scroll indicators for mobile - more subtle platinum styling */}
        <motion.div
          className="mt-2 flex justify-center gap-1.5 lg:hidden"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          {categories.map((_, i) => (
            <div
              key={i}
              className={`w-8 h-1.5 rounded-full transition-all duration-300 ${
                i === 0 
                  ? "bg-gradient-to-r from-gray-300 to-gray-500" 
                  : "bg-gray-300"
              }`}
            ></div>
          ))}
        </motion.div>

        {/* View All Button - with premium styling */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <motion.a
            href="/buscar"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-xl relative overflow-hidden group"
            whileHover={{
              boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Platinum shimmer effect */}
            <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/0 via-white/40 to-white/0 transform -skew-x-30 -translate-x-full transition-transform duration-1000 ease-out group-hover:translate-x-full"></span>
            
            <span className="relative z-10">Ver todas las categorías</span>
            <span className="relative z-10 ml-2 inline-block">
              <ArrowRightIcon className="h-5 w-5 inline-block group-hover:translate-x-1 transition-transform duration-200" />
            </span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

// Add the shimmer animation to tailwind styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
    .animate-shimmer {
      animation: shimmer 2.5s infinite;
    }
  `;
  document.head.appendChild(style);
}

export default CategoriesSection; 