"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { HeartIcon, MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { useCallback, useState } from "react";

const ListingCard = ({ listing, index }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  
  const toggleFavorite = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
  }, []);

  // Determinar la fecha relativa (simulada por ahora)
  const getRelativeDate = () => "hace 1 semana";

  // Delay incrementales para animación de entrada
  const delay = 0.1 + index * 0.1;

  // Animación para la tarjeta
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
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

  // Determinar si hay una imagen o usar fallback
  const imageSrc = listing.image || "/images/placeholder.jpg";
  
  // Formatear precio
  const formattedPrice = new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: listing.currency || "PEN",
    maximumFractionDigits: 0,
  }).format(listing.price);

  return (
    <motion.div
      variants={cardVariants}
      className="group relative w-full perspective"
      whileHover={{ 
        y: -8, 
        transition: { duration: 0.2 },
        rotateX: 1,
        rotateY: 2,
      }}
    >
      <Link href={`/anuncio/${listing.id}`}>
        <div className="flex flex-col overflow-hidden rounded-xl bg-gradient-to-b from-white to-slate-50
          border border-teal-500/10
          shadow-[0_10px_30px_rgba(0,0,0,0.1)] 
          transition-all duration-300 
          group-hover:shadow-[0_20px_40px_rgba(20,184,166,0.15)]
          group-hover:border-teal-500/20
          h-full">
          {/* Shine effect on top border */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-teal-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Badge de 'Destacado' con estilo premium */}
          {listing.premium && (
            <div className="absolute top-3 left-3 z-10">
              <motion.span 
                className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide 
                  bg-gradient-to-r from-teal-900 to-slate-900 text-white 
                  shadow-[0_4px_15px_rgba(20,184,166,0.3)] border border-teal-600/30 
                  flex items-center relative overflow-hidden"
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <SparklesIcon className="h-3 w-3 mr-1 text-teal-300" />
                <span className="relative z-10">Premium</span>
                {/* Platinum shimmer effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-teal-700/0 via-teal-500/30 to-teal-700/0 rounded-full animate-shimmer"></span>
              </motion.span>
            </div>
          )}

          {/* Área de imagen con botón de favorito */}
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={imageSrc}
              alt={listing.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            
            {/* Overlay con gradiente premium */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Reflective platinum highlighting */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 via-teal-500/0 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Botón de favorito con estilo premium */}
            <button
              onClick={toggleFavorite}
              className="absolute top-3 right-3 rounded-full 
                bg-gradient-to-br from-white/80 to-slate-100/80 
                p-2 shadow-lg backdrop-blur-md 
                transition-all duration-300 hover:scale-110 
                hover:shadow-[0_4px_15px_rgba(20,184,166,0.25)]
                border border-teal-500/10 hover:border-teal-500/20
                focus:outline-none"
              aria-label="Añadir a favoritos"
            >
              <HeartIcon
                className={`h-5 w-5 transition-colors ${
                  isFavorite
                    ? "fill-teal-500 text-teal-500"
                    : "text-slate-600"
                }`}
              />
            </button>
          </div>

          {/* Contenido con estilo premium */}
          <div className="flex flex-col flex-grow p-5">
            <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 mb-2 group-hover:text-teal-900 transition-colors duration-300">
              {listing.title}
            </h3>
            
            {/* Información de ubicación */}
            <div className="flex items-center mb-3">
              <MapPinIcon className="h-4 w-4 text-teal-500 mr-1.5" />
              <p className="text-sm text-slate-600 truncate">
                {listing.location}
              </p>
            </div>
            
            {/* Fecha */}
            <div className="flex items-center text-sm text-slate-500 mt-auto mb-4">
              <ClockIcon className="h-4 w-4 mr-1.5" />
              <span>{getRelativeDate()}</span>
            </div>
            
            {/* Precio con estilo premium */}
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600">
                {formattedPrice}
              </span>
              <span className="text-xs uppercase tracking-wider text-teal-700 px-2.5 py-1 rounded-md bg-teal-50 border border-teal-200/50">
                {listing.category}
              </span>
            </div>
          </div>
          
          {/* Bottom bar for premium listings */}
          {listing.premium && (
            <motion.div 
              className="h-1 w-full bg-gradient-to-r from-teal-600/0 via-teal-500 to-cyan-500/0"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, delay: delay + 0.4 }}
            ></motion.div>
          )}
          
          {/* Card glow effect on hover */}
          <div className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-t from-teal-500/10 via-cyan-500/0 to-transparent pointer-events-none"></div>
          
          {/* Diamond reflections */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/10 via-teal-300/5 to-transparent transform rotate-45 translate-x-5 -translate-y-5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 via-teal-300/5 to-transparent transform rotate-45 -translate-x-5 translate-y-5 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100"></div>
        </div>
      </Link>
    </motion.div>
  );
};

// Add perspective if in browser
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .perspective {
      perspective: 1000px;
    }
    
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    
    .animate-shimmer {
      animation: shimmer 2s infinite;
    }
  `;
  document.head.appendChild(style);
}

export default ListingCard; 