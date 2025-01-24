'use client'

import { motion } from 'framer-motion';
import Link from 'next/link';
import { categories } from '@/data/categories';

export default function CategorySlider() {
  return (
    <section id="categories" className="py-16 bg-white">
      <motion.h2 
        className="text-4xl font-bold text-primary-900 text-center mb-4 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Explora nuestras categorías
      </motion.h2>
      <motion.p
        className="text-lg text-primary-600 text-center mb-8 max-w-2xl mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Descubre oportunidades únicas en cada una de nuestras categorías especializadas
      </motion.p>

      <div className="space-y-4">
        {[
          {
            categories: ['Empleos', 'Inmuebles', 'Vehículos', 'Servicios', 'Productos'],
            direction: -1
          },
          {
            categories: ['Turismo', 'Eventos', 'Educación', 'Mascotas', 'Empleos'],
            direction: 1
          }
        ].map((row, rowIndex) => (
          <div key={rowIndex} className="relative w-full overflow-hidden">
            <motion.div
              className="flex gap-4 px-4"
              animate={{ 
                x: [
                  `${row.direction * 0}%`,
                  `${row.direction * -100}%`
                ]
              }}
              transition={{
                x: {
                  duration: 40,
                  repeat: Infinity,
                  ease: "linear",
                  repeatType: "loop"
                }
              }}
              style={{
                width: '200%',
              }}
            >
              {Array(2).fill(row.categories).flat().map((categoryName, index) => {
                const category = categories[categoryName];
                return (
                  <Link 
                    key={`${categoryName}-${index}`}
                    href={`/categorias/${categoryName.toLowerCase()}`}
                    className={`flex-none w-[320px] bg-gradient-to-br ${category.gradient} rounded-xl p-3 shadow hover:shadow-md transition-all duration-300 border border-gray-100 group`}
                  >
                    <div className="relative min-h-[120px]">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-primary-900 mb-0.5 truncate pr-16">
                          {categoryName}
                        </h3>
                        <p className="text-sm text-primary-700 mb-2 truncate pr-16">{category.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {category.stats.map((stat, i) => (
                            <span 
                              key={i} 
                              className="inline-flex items-center text-xs text-primary-600 bg-white/50 rounded-full px-2 py-0.5"
                            >
                              <svg className="w-3 h-3 mr-1 text-primary-700" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {stat}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="absolute bottom-0 right-0 text-5xl opacity-90 group-hover:scale-110 transition-transform">
                        {category.icon}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
} 