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
        <div className="relative h-[320px] w-full overflow-hidden rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-xl bg-white">
          {/* Badge con contador si existe */}
          {category.count && (
            <div className="absolute top-3 right-3 z-10">
              <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-neutral-800 shadow-sm">
                {category.count}+ anuncios
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
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              />
            ) : (
              <div
                className={`absolute inset-0 bg-gradient-to-br ${category.gradient || "from-primary-500 to-primary-700"
                  }`}
              />
            )}
            {/* Overlay con gradiente para mejor legibilidad */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10`}
            />
          </div>

          {/* Icono (si está disponible) */}
          <div className="relative h-full flex flex-col justify-between p-6 text-white">
            <div>
              {category.icon && (
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm mb-3">
                  <category.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{category.name}</h3>
              <p className="text-sm text-white/80 line-clamp-2 mb-2">{category.description}</p>
            </div>

            {/* Botón de "Ver anuncios" */}
            <div className="mt-auto">
              <span className="inline-flex items-center text-sm font-medium text-white group-hover:text-primary-300 transition-colors duration-300">
                Ver anuncios
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
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard; 