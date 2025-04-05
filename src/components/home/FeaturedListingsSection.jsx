"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { featuredListings } from "@/lib/homeMockData";
import ListingCard from "./ListingCard"; // Importa el nuevo componente de tarjeta

const FeaturedListingsSection = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const scrollToLeft = () => {
    const container = document.getElementById("featured-listings-container");
    if (container) {
      container.scrollBy({ left: -container.offsetWidth, behavior: "smooth" });
    }
  };

  const scrollToRight = () => {
    const container = document.getElementById("featured-listings-container");
    if (container) {
      container.scrollBy({ left: container.offsetWidth, behavior: "smooth" });
    }
  };

  return (
    <section
      ref={ref}
      className="py-16 sm:py-20 relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #f8f9ff, #f3f4f8)",
        backgroundImage: "radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)",
        backgroundSize: "30px 30px"
      }}
    >
      {/* Decorative elements - platinum styling */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-gray-200/40 via-white/30 to-gray-300/40 blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-tr from-gray-200/50 via-white/40 to-gray-300/50 blur-2xl"></div>
      <div className="absolute top-1/4 right-1/3 w-6 h-6 rounded-full bg-white/50 shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
      <div className="absolute bottom-1/3 left-1/4 w-3 h-3 rounded-full bg-white/60 shadow-[0_0_5px_rgba(255,255,255,0.6)]"></div>

      {/* Animated patterns - more subtle for platinum look */}
      <motion.div
        className="absolute inset-0 opacity-5 z-0"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)",
          backgroundSize: "40px 40px"
        }}
        animate={{
          backgroundPosition: ["0px 0px", "100px 100px"],
        }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 20,
          ease: "linear",
        }}
      ></motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Encabezado */}
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mb-4 sm:mb-0 relative">
            {/* Light glow effect behind badge */}
            <div className="absolute top-0 left-0 w-40 h-10 bg-gradient-to-r from-blue-200/20 via-purple-200/20 to-blue-200/20 blur-xl rounded-full"></div>
            
            <div className="flex items-center mb-3 relative">
              <motion.span
                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-sm font-medium inline-flex items-center shadow-sm border border-gray-300/40 relative overflow-hidden"
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <SparklesIcon className="h-4 w-4 mr-1.5 text-blue-500 animate-[pulse_1.5s_infinite]" />
                <span className="relative z-10">Recomendados para ti</span>
                {/* Platinum shimmer effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-gray-200/0 via-white/80 to-gray-200/0 rounded-full animate-shimmer"></span>
              </motion.span>
            </div>
            
            <motion.h2
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Anuncios <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Destacados</span>
            </motion.h2>
            
            <motion.div
              className="h-1 w-24 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-500 rounded-full mb-4"
              initial={{ width: 0, opacity: 0 }}
              animate={inView ? { width: 96, opacity: 1 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
            ></motion.div>
            
            <motion.p
              className="text-lg text-gray-700 max-w-xl"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Oportunidades seleccionadas en Cusco y alrededores que podrían
              interesarte.
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.6, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Link
              href="/buscar?destacado=true"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium transition-all duration-200 shadow-md hover:shadow-xl relative overflow-hidden group"
            >
              {/* Platinum shimmer effect */}
              <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/0 via-white/40 to-white/0 transform -skew-x-30 -translate-x-full transition-transform duration-1000 ease-out group-hover:translate-x-full"></span>
              
              <span className="relative z-10">Ver Todos los Destacados</span>
              <ArrowRightIcon className="ml-1.5 h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Navigation controls for mobile scrolling - platinum styled */}
        <div className="flex justify-end gap-2 mb-4 lg:hidden">
          <motion.button
            onClick={scrollToLeft}
            className="p-2 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 text-gray-700 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200"
            aria-label="Desplazar a la izquierda"
            whileTap={{ scale: 0.95 }}
          >
            <ArrowRightIcon className="h-5 w-5 transform rotate-180" />
          </motion.button>
          
          <motion.button
            onClick={scrollToRight}
            className="p-2 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 text-gray-700 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200"
            aria-label="Desplazar a la derecha"
            whileTap={{ scale: 0.95 }}
          >
            <ArrowRightIcon className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Grid de Anuncios - Con scroll horizontal en móvil */}
        <motion.div
          id="featured-listings-container"
          className="flex lg:grid lg:grid-cols-4 gap-6 lg:gap-8 overflow-x-auto pb-4 lg:overflow-visible snap-x snap-mandatory lg:snap-none"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {featuredListings.slice(0, 6).map((listing, index) => (
            <div
              key={listing.id}
              className="snap-center flex-shrink-0 w-[85%] sm:w-[45%] lg:w-auto"
            >
              <ListingCard listing={listing} index={index} />
            </div>
          ))}
        </motion.div>

        {/* Scroll indicators - platinum styled */}
        <motion.div
          className="mt-6 flex justify-center gap-1.5 lg:hidden"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          {[
            ...Array(
              Math.min(4, Math.ceil(featuredListings.slice(0, 6).length / 2))
            ),
          ].map((_, i) => (
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
      </div>
    </section>
  );
};

export default FeaturedListingsSection; 