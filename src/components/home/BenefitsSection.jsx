"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { benefits } from "@/lib/homeMockData";
import BenefitItem from "./BenefitItem"; // Importa el item individual

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
      className="py-16 sm:py-24 bg-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 xl:gap-24 items-center">
          {/* Columna de Texto y Beneficios */}
          <motion.div
            variants={textVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mb-5">
              Diseñado para <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-500">tu Éxito</span>{" "}
              en Cusco
            </h2>
            <p className="text-lg text-neutral-700 mb-10 leading-relaxed">
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

            {/* CTA */}
            <div className="mt-12">
              <Link
                href="/publicar"
                className="inline-flex items-center justify-center px-7 py-3 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Publica tu Anuncio Ahora
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
            {/* Imagen con mejor relación de aspecto y sombra */}
            <div className="relative aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3] xl:aspect-[1/1] max-h-[600px] mx-auto lg:mx-0 overflow-hidden rounded-xl shadow-2xl">
              <Image
                src="/images/benefits-collaboration.jpg"
                alt="Personas conectando y colaborando gracias a Buscadis"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                quality={80}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/30 via-transparent to-amber-500/20 pointer-events-none mix-blend-overlay"></div>
            </div>
            
            {/* Badges flotantes */}
            <motion.div 
              className="absolute -top-4 -left-4 bg-pink-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              +50,000 Anuncios activos
            </motion.div>
            
            <motion.div 
              className="absolute -bottom-4 -right-4 bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold"
              initial={{ opacity: 0, y: -20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1, duration: 0.5 }}
            >
              95% de satisfacción
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection; 