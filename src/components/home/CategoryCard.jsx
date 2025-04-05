"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const CategoryCard = ({ category, index }) => {
  // Retraso escalonado basado en el índice
  const delay = 0.1 + index * 0.1;

  // Animaciones
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: delay,
        ease: "easeOut",
      },
    },
  };

  // Determinar si hay una imagen o usar gradiente
  const hasImage = category.imageUrl && category.imageUrl !== "";

  return (
    <motion.div
      variants={cardVariants}
      className="group relative h-full"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Link href={`/buscar?category=${category.slug}`}>
        <div className="relative h-[320px] w-full overflow-hidden rounded-xl transition-all duration-300 bg-white 
          shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] 
          group-hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)]
          border border-gray-100">
          {/* Reflejo premium en el borde superior */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-70"></div>
          
          {/* Badge con contador si existe - estilo premium */}
          {category.count && (
            <div className="absolute top-3 right-3 z-10">
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-gray-100/90 to-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-gray-800 shadow-sm border border-white/40">
                <span className="relative">
                  {category.count}+ anuncios
                  {/* Subtle shine effect */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-full animate-shimmer"></span>
                </span>
              </span>
            </div>
          )}

          {/* Background con imagen o gradiente */}
          <div className="absolute inset-0 overflow-hidden">
            {hasImage ? (
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                priority={index < 4} // Priorizar primeras 4 categorías
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
            ) : (
              <div
                className={`absolute inset-0 bg-gradient-to-br ${category.gradient || "from-blue-600 to-purple-600"}`}
              />
            )}
            {/* Overlay con gradiente para mejor legibilidad - mejorado para look premium */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-800/40 to-gray-900/10`}
            />
          </div>

          {/* Icono (si está disponible) - estilo premium con efecto de brillo */}
          <div className="relative h-full flex flex-col justify-between p-6 text-white">
            <div>
              {category.icon && (
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full 
                  bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm mb-3
                  border border-white/10 shadow-[0_4px_10px_0px_rgba(0,0,0,0.1)]
                  group-hover:shadow-[0_4px_15px_0px_rgba(255,255,255,0.2)]
                  transition-all duration-300">
                  <category.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
              )}
              <h3 className="text-xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">{category.name}</h3>
              <p className="text-sm text-white/80 line-clamp-2 mb-2 group-hover:text-white/100 transition-colors duration-300">{category.description}</p>
            </div>

            {/* Botón de "Ver anuncios" - estilo platinum */}
            <div className="mt-auto">
              <span className="inline-flex items-center text-sm font-medium 
                text-gray-200 group-hover:text-white 
                transition-all duration-300 relative">
                <span className="relative z-10">Ver anuncios</span>
                <svg
                  className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                {/* Bottom border animated on hover */}
                <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"></span>
              </span>
            </div>
          </div>
          
          {/* Reflejo en la esquina - efecto premium */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/20 to-transparent"></div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard; 