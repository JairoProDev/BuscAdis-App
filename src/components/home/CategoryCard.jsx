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
      className="group relative h-full perspective"
      whileHover={{ 
        y: -10, 
        transition: { duration: 0.2 },
        rotateX: 2,
        rotateY: 2,
        scale: 1.02
      }}
    >
      <Link href={`/buscar?category=${category.slug}`}>
        <div className="relative h-[320px] w-full overflow-hidden rounded-xl transition-all duration-300 
          shadow-[0_10px_40px_rgba(0,0,0,0.25)] 
          group-hover:shadow-[0_20px_50px_rgba(20,184,166,0.4)] 
          border border-teal-900/40 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          {/* Platinum holographic edge */}
          <div className="absolute inset-0 rounded-xl border border-teal-500/20 filter blur-[0.5px]
            group-hover:border-teal-400/30 transition-all duration-300"></div>
            
          {/* Reflejo premium en el borde superior */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-teal-400/50 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Badge con contador si existe - estilo premium */}
          {category.count && (
            <div className="absolute top-3 right-3 z-10">
              <motion.span 
                className="inline-flex items-center rounded-full bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.3)] border border-teal-500/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: delay + 0.3, duration: 0.4 }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <span className="relative">
                  {category.count}+ anuncios
                  {/* Subtle shine effect */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-400/40 to-transparent rounded-full animate-shimmer"></span>
                </span>
              </motion.span>
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
                className={`absolute inset-0 bg-gradient-to-br ${category.gradient || "from-teal-800 to-emerald-700"}`}
              />
            )}
            {/* Overlay con gradiente para mejor legibilidad - mejorado para look premium */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-800/50 to-slate-900/30`}
            />
            
            {/* Laser lines effect on hover */}
            <div className="absolute inset-0 bg-[url('/patterns/noise.png')] opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
            <div className="laser-line absolute h-full w-[1px] left-[30%] bg-gradient-to-b from-transparent via-teal-400/20 to-transparent opacity-0 group-hover:opacity-100 transform translate-x-full transition-all duration-1000 ease-in-out group-hover:translate-x-0"></div>
            <div className="laser-line-2 absolute h-full w-[1px] left-[60%] bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transform translate-x-full transition-all duration-1000 ease-in-out group-hover:translate-x-0 delay-100"></div>
          </div>

          {/* Icono (si está disponible) - estilo premium con efecto de brillo */}
          <div className="relative h-full flex flex-col justify-between p-6 text-white">
            <div>
              {category.icon && (
                <motion.div 
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full 
                    bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur-sm mb-3
                    border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.15)]
                    group-hover:shadow-[0_0_20px_rgba(20,184,166,0.3)]
                    transition-all duration-300"
                  whileHover={{ 
                    scale: 1.1,
                    rotateZ: [0, -5, 5, -5, 0],
                    transition: { duration: 0.5 }
                  }}
                >
                  <category.icon className="h-6 w-6 text-teal-400" aria-hidden="true" />
                </motion.div>
              )}
              <h3 className="text-xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-100 to-white">{category.name}</h3>
              <p className="text-sm text-teal-100/70 line-clamp-2 mb-3 group-hover:text-teal-100/90 transition-colors duration-300">{category.description}</p>
            </div>

            {/* Botón de "Ver anuncios" - estilo platinum */}
            <motion.div 
              className="mt-auto"
              whileHover={{ scale: 1.03 }}
            >
              <motion.span 
                className="inline-flex items-center text-sm font-medium 
                  text-teal-300 group-hover:text-teal-200
                  transition-all duration-300 relative"
                whileHover={{ x: 3 }}
              >
                <span className="relative z-10">Ver anuncios</span>
                <svg
                  className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
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
                {/* Bottom border animated on hover with glow */}
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-teal-400/80 to-cyan-400/80 transition-all duration-300 group-hover:w-full shadow-[0_0_5px_rgba(20,184,166,0.5)]"></span>
              </motion.span>
            </motion.div>
          </div>
          
          {/* Diamond reflections - premium effect */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/10 via-teal-300/5 to-transparent transform rotate-45 translate-x-5 -translate-y-5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 via-teal-300/5 to-transparent transform rotate-45 -translate-x-5 translate-y-5 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100"></div>
          
          {/* Animated card glow on hover */}
          <div className="card-glow absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 group-hover:animate-card-glow transition-all duration-500"></div>
        </div>
      </Link>
    </motion.div>
  );
};

// Add animations if in browser
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .perspective {
      perspective: 1000px;
    }
    
    @keyframes card-glow {
      0% { 
        box-shadow: 0 0 5px rgba(20,184,166,0.3);
      }
      50% {
        box-shadow: 0 0 20px rgba(20,184,166,0.6);
      }
      100% {
        box-shadow: 0 0 5px rgba(20,184,166,0.3);
      }
    }
    
    .animate-card-glow {
      animation: card-glow 2s infinite;
    }
    
    /* Laser line animation */
    .laser-line {
      transition-delay: 0.2s;
    }
    .laser-line-2 {
      transition-delay: 0.4s;
    }
  `;
  document.head.appendChild(style);
}

export default CategoryCard; 