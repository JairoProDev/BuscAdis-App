"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { benefits } from "@/lib/homeMockData";
import BenefitItem from "./BenefitItem"; // Importa el item individual
import { SparklesIcon } from "@heroicons/react/24/solid";

const BenefitsSection = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 }); // Umbral un poco mayor

  // Animaciones
  const textVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };
  const imageVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, delay: 0.1, ease: "easeOut" },
    },
  };
  const benefitsContainerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } }, // Stagger para los items de beneficio
  };

  return (
    <section
      ref={ref}
      className="py-16 sm:py-24 overflow-hidden relative"
      style={{
        background: "linear-gradient(to bottom, #f8f9ff, #f5f6f9)",
        backgroundImage: "radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)",
        backgroundSize: "30px 30px"
      }}
    >
      {/* Platinum decorative elements */}
      <div className="absolute -top-20 left-20 w-80 h-80 rounded-full bg-gradient-to-br from-gray-200/30 via-white/20 to-gray-300/30 blur-3xl"></div>
      <div className="absolute -bottom-40 right-20 w-96 h-96 rounded-full bg-gradient-to-tl from-gray-200/40 via-white/20 to-gray-300/40 blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 xl:gap-24 items-center">
          {/* Columna de Texto y Beneficios */}
          <motion.div
            variants={textVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="relative"
          >
            {/* Subtle light effect behind heading */}
            <div className="absolute -top-10 -left-10 w-40 h-20 bg-gradient-to-r from-blue-200/20 via-purple-200/20 to-blue-200/20 blur-xl rounded-full"></div>
            
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 text-sm font-medium mb-5 shadow-sm relative border border-gray-300/40 overflow-hidden"
            >
              <SparklesIcon className="h-4 w-4 mr-1.5 text-blue-500" />
              <span className="relative z-10">Diseñado para ti</span>
              {/* Platinum shimmer effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-gray-200/0 via-white/80 to-gray-200/0 rounded-full animate-shimmer"></span>
            </motion.div>
            
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-5">
              Plataforma para <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">tu Éxito</span>{" "}
              en Cusco
            </h2>
            
            <motion.div
              className="w-24 h-1 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-500 rounded-full mb-6"
              initial={{ width: 0, opacity: 0 }}
              animate={inView ? { width: 96, opacity: 1 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
            ></motion.div>
            
            <p className="text-lg text-gray-700 mb-10 leading-relaxed">
              Buscadis no es solo un portal de anuncios; es tu aliado
              estratégico para encontrar oportunidades y conectar con la
              comunidad local de forma rápida, segura y efectiva.
            </p>

            {/* Lista de Beneficios con Stagger */}
            <motion.div
              className="space-y-8"
              variants={benefitsContainerVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
            >
              {benefits.map((benefit, index) => (
                <BenefitItem key={benefit.id} benefit={benefit} index={index} />
              ))}
            </motion.div>

            {/* CTA con estilo platinum */}
            <div className="mt-12">
              <Link
                href="/publicar"
                className="inline-flex items-center justify-center px-7 py-3 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105 relative overflow-hidden group"
              >
                {/* Platinum shimmer effect */}
                <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/0 via-white/40 to-white/0 transform -skew-x-30 -translate-x-full transition-transform duration-1000 ease-out group-hover:translate-x-full"></span>
                
                <span className="relative z-10 flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-2" />
                  Publica tu Anuncio Ahora
                </span>
              </Link>
            </div>
          </motion.div>

          {/* Columna de Imagen */}
          <motion.div
            className="mt-12 lg:mt-0 relative"
            variants={imageVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            {/* Premium shadow frame around image */}
            <div className="absolute inset-0 -m-6 bg-gradient-to-tr from-gray-100 to-white rounded-2xl transform rotate-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-200/50"></div>
            
            {/* Imagen con mejor relación de aspecto y sombra */}
            <div className="relative aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3] xl:aspect-[1/1] max-h-[600px] mx-auto lg:mx-0 overflow-hidden rounded-xl shadow-[0_10px_40px_-5px_rgba(59,130,246,0.2)] border border-white/80">
              <Image
                src="/images/benefits-collaboration.jpg"
                alt="Personas conectando y colaborando gracias a Buscadis"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                quality={90}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-transparent to-purple-600/20 pointer-events-none mix-blend-overlay"></div>
              
              {/* Premium glass reflection effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-30"></div>
            </div>
            
            {/* Badges flotantes con estilo platinum */}
            <motion.div 
              className="absolute -top-4 -left-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-5 py-2.5 rounded-lg shadow-[0_10px_30px_-5px_rgba(0,0,0,0.3)] text-sm font-semibold flex items-center space-x-2 border border-gray-700/50"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8, duration: 0.5 }}
              whileHover={{ y: -5, boxShadow: "0 15px 30px -5px rgba(59,130,246,0.3)" }}
            >
              <SparklesIcon className="h-4 w-4 text-blue-300 mr-2" />
              <span>+50,000 Anuncios activos</span>
            </motion.div>
            
            <motion.div 
              className="absolute -bottom-4 -right-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-5 py-2.5 rounded-lg shadow-[0_10px_30px_-5px_rgba(0,0,0,0.3)] text-sm font-semibold flex items-center space-x-2 border border-gray-700/50"
              initial={{ opacity: 0, y: -20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1, duration: 0.5 }}
              whileHover={{ y: 5, boxShadow: "0 15px 30px -5px rgba(59,130,246,0.3)" }}
            >
              <SparklesIcon className="h-4 w-4 text-purple-300 mr-2" />
              <span>95% de satisfacción</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection; 