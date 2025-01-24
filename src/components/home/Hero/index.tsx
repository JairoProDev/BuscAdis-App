'use client'

import { motion } from 'framer-motion';
import Link from 'next/link';
import Container from '@/components/shared/Container';
import Scene3D from '@/components/3d/Scene';
import SearchBar from '@/components/search/SearchBar';

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] md:min-h-screen bg-primary-900">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
      </div>

      <div className="relative h-full flex flex-col justify-center pt-16 md:pt-24">
        <Container>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white space-y-6 md:space-y-8"
            >
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight">
                Busca mejores oportunidades
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-blue-100">
                Encuentra todo lo que necesitas en un solo lugar
              </p>

              <SearchBar onSearch={(query) => console.log('Búsqueda:', query)} />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mt-8 md:mt-12"
              >
                <Link
                  href="/publicar"
                  className="inline-flex items-center px-8 py-4 text-lg md:text-xl font-bold text-primary-900 bg-white rounded-xl shadow-lg hover:bg-primary-50 transform hover:scale-105 transition-all duration-300 group"
                >
                  <span>Publicar mi Adiso ahora</span>
                  <svg 
                    className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M13 7l5 5m0 0l-5 5m5-5H6" 
                    />
                  </svg>
                </Link>
                <p className="mt-3 text-sm text-blue-100">
                  ¡10% de descuento si lo publicas por tu cuenta! 🚀
                </p>
              </motion.div>
            </motion.div>

            <div className="hidden lg:block">
              <Scene3D />
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
} 