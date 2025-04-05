"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { HeartIcon, MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";
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
        <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-xl h-full">
          {/* Badge de 'Destacado' */}
          {listing.premium && (
            <div className="absolute top-3 left-3 z-10">
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-gradient-to-r from-amber-500 to-amber-400 text-white shadow-lg">
                Destacado
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
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
            
            {/* Botón de favorito */}
            <button
              onClick={toggleFavorite}
              className="absolute top-3 right-3 rounded-full bg-white/90 p-2 shadow-md backdrop-blur-sm transition-transform duration-300 hover:scale-110 focus:outline-none"
              aria-label="Añadir a favoritos"
            >
              <HeartIcon
                className={`h-5 w-5 transition-colors ${
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : "text-neutral-600"
                }`}
              />
            </button>
          </div>

          {/* Contenido */}
          <div className="flex flex-col flex-grow p-4">
            <h3 className="line-clamp-2 text-lg font-semibold text-neutral-900 mb-2">
              {listing.title}
            </h3>
            
            {/* Información de ubicación */}
            <div className="flex items-center mb-3">
              <MapPinIcon className="h-4 w-4 text-neutral-500 mr-1" />
              <p className="text-sm text-neutral-600 truncate">
                {listing.location}
              </p>
            </div>
            
            {/* Fecha */}
            <div className="flex items-center text-sm text-neutral-500 mt-auto mb-4">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>{getRelativeDate()}</span>
            </div>
            
            {/* Precio */}
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-primary-600">
                {formattedPrice}
              </span>
              <span className="text-xs uppercase tracking-wider text-neutral-500">
                {listing.category}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ListingCard; 