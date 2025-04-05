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
      className="group relative w-full"
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      <Link href={`/anuncio/${listing.id}`}>
        <div className="flex flex-col overflow-hidden rounded-xl bg-white border border-gray-100 
          shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] 
          transition-all duration-300 
          group-hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)] 
          h-full">
          {/* Shine effect on top border */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-70"></div>
          
          {/* Badge de 'Destacado' con estilo premium */}
          {listing.premium && (
            <div className="absolute top-3 left-3 z-10">
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide 
                bg-gradient-to-r from-gray-800 to-gray-700 text-white 
                shadow-[0_4px_10px_rgba(0,0,0,0.1)] border border-gray-600/20 
                flex items-center relative overflow-hidden">
                <SparklesIcon className="h-3 w-3 mr-1 text-yellow-300" />
                <span className="relative z-10">Premium</span>
                {/* Platinum shimmer effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-gray-700/0 via-gray-500/30 to-gray-700/0 rounded-full animate-shimmer"></span>
              </span>
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
            
            {/* Overlay con gradiente sutil */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Botón de favorito con estilo premium */}
            <button
              onClick={toggleFavorite}
              className="absolute top-3 right-3 rounded-full 
                bg-gradient-to-br from-white/95 to-gray-100/95 
                p-2 shadow-md backdrop-blur-sm 
                transition-all duration-300 hover:scale-110 
                hover:shadow-[0_4px_10px_rgba(0,0,0,0.1)]
                border border-white/50
                focus:outline-none"
              aria-label="Añadir a favoritos"
            >
              <HeartIcon
                className={`h-5 w-5 transition-colors ${
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : "text-gray-600"
                }`}
              />
            </button>
          </div>

          {/* Contenido con estilo premium */}
          <div className="flex flex-col flex-grow p-5">
            <h3 className="line-clamp-2 text-lg font-semibold text-gray-900 mb-2">
              {listing.title}
            </h3>
            
            {/* Información de ubicación */}
            <div className="flex items-center mb-3">
              <MapPinIcon className="h-4 w-4 text-gray-500 mr-1.5" />
              <p className="text-sm text-gray-600 truncate">
                {listing.location}
              </p>
            </div>
            
            {/* Fecha */}
            <div className="flex items-center text-sm text-gray-500 mt-auto mb-4">
              <ClockIcon className="h-4 w-4 mr-1.5" />
              <span>{getRelativeDate()}</span>
            </div>
            
            {/* Precio con estilo premium */}
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                {formattedPrice}
              </span>
              <span className="text-xs uppercase tracking-wider text-gray-500 px-2 py-1 rounded-md bg-gray-100/80 border border-gray-200/50">
                {listing.category}
              </span>
            </div>
          </div>
          
          {/* Bottom bar for premium listings */}
          {listing.premium && (
            <div className="h-1 w-full bg-gradient-to-r from-blue-600/0 via-blue-600 to-purple-600/0"></div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ListingCard; 