"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { useEffect } from "react";
import { getDefaultImageByCategory } from "@/utils/image-helpers";

// Helper function to get relative date
const getRelativeDate = (dateString?: string): string => {
  if (!dateString) return "Fecha no disponible";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Fecha inválida";

  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSecs < 60) return "Hace un momento";
  if (diffInMins < 60) return `Hace ${diffInMins} min${diffInMins !== 1 ? "s" : ""}`;
  if (diffInHours < 24) return `Hace ${diffInHours} hr${diffInHours !== 1 ? "s" : ""}`;
  if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays !== 1 ? "s" : ""}`;
  
  return date.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
  });
};

interface Listing {
  id: string;
  title: string;
  image?: string;
  currency?: string;
  price?: number | null;
  premium?: boolean;
  location?: string;
  category?: string;
  createdAt?: string;
}

interface ListingCardProps {
  listing: Listing;
  index: number;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, index }) => {
  // Inyectar estilos globales necesarios para este componente
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const styleId = 'listing-card-global-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          .perspective {
            perspective: 1200px;
          }
          .preserve-3d {
            transform-style: preserve-3d;
          }
          @keyframes shimmer {
            0% { transform: translateX(-120%) skewX(-20deg); }
            100% { transform: translateX(120%) skewX(-20deg); }
          }
          .animate-shimmer {
            animation: shimmer 2.2s infinite linear;
            opacity: 0.6;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  const delay = 0.05 + index * 0.05;

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: delay,
      },
    },
  };

  const imageSrc = listing.image || getDefaultImageByCategory(listing.category);
  
  let formattedPrice = "Consultar";
  if (listing.price !== null && listing.price !== undefined) {
    try {
      formattedPrice = new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: listing.currency || "PEN",
        maximumFractionDigits: (listing.price % 1 === 0) ? 0 : 2,
      }).format(listing.price);
    } catch (e) {
      console.error("Error formatting price for listing:", listing.id, e);
      formattedPrice = `${listing.price} ${listing.currency || "PEN"}`;
    }
  }

  const adUrl = `/adiso/${listing.id}`;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="group relative w-full perspective preserve-3d h-full"
      whileHover={{ 
        y: -6,
        transition: { duration: 0.15, ease: "circOut" },
      }}
    >
      <Link href={adUrl} className="block h-full transform-style-3d focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 rounded-xl">
          <div className="flex flex-col overflow-hidden rounded-xl bg-white dark:bg-slate-800/80
            border border-slate-200/80 dark:border-slate-700/60
            shadow-md dark:shadow-xl dark:shadow-slate-900/70
            transition-all duration-300 ease-out
            group-hover:shadow-lg dark:group-hover:shadow-2xl group-hover:border-teal-400/50 dark:group-hover:border-teal-500/50
            h-full relative isolate">
            
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-teal-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20"></div>
            
            {listing.premium && (
              <div className="absolute top-2.5 left-2.5 z-10">
                <motion.span 
                  className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                    bg-gradient-to-br from-teal-600 via-cyan-600 to-teal-500 text-white 
                    shadow-lg border border-cyan-400/50 
                    flex items-center relative overflow-hidden"
                  whileHover={{ scale: 1.03, y: -1, transition: { duration: 0.1 } }}
                >
                  <SparklesIcon className="h-3 w-3 mr-1 text-cyan-200" />
                  <span className="relative z-10">Premium</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 animate-shimmer mix-blend-lighten opacity-75"></span>
                </motion.span>
              </div>
            )}

            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <Image
                src={imageSrc}
                alt={listing.title || "Imagen del adiso"}
                fill
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                priority={index < 3}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="flex flex-col flex-grow p-3.5 sm:p-4">
              <h3 className="line-clamp-2 text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors duration-200">
                {listing.title || "Título no disponible"}
              </h3>
              
              {listing.location && (
                <div className="flex items-center mb-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  <MapPinIcon className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 mr-1 flex-shrink-0" />
                  <p className="truncate" title={listing.location}>
                    {listing.location}
                  </p>
                </div>
              )}
              
              <div className="flex items-center text-xs text-slate-400 dark:text-slate-500 mt-auto mb-2 pt-1">
                <ClockIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                <span>{getRelativeDate(listing.createdAt)}</span>
              </div>
              
              <div className="flex items-end justify-between mt-1 border-t border-slate-200/70 dark:border-slate-700/50 pt-2.5">
                <span className="text-base sm:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400">
                  {formattedPrice}
                </span>
                {listing.category && (
                  <span className="text-[10px] sm:text-xs uppercase tracking-wider text-teal-700 dark:text-teal-300 px-1.5 sm:px-2 py-0.5 rounded bg-teal-100/70 dark:bg-teal-700/20 border border-teal-200/50 dark:border-teal-600/30">
                    {listing.category}
                  </span>
                )}
              </div>
            </div>
            
            {listing.premium && (
              <motion.div 
                className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-300"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: delay + 0.2, ease: "circOut" }}
                style={{ originX: 0 }}
              ></motion.div>
            )}
            
            <div className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                          bg-gradient-radial from-teal-500/5 via-transparent to-transparent pointer-events-none blur-[1px]"></div>
          </div>
      </Link>
    </motion.div>
  );
};

export default ListingCard; 