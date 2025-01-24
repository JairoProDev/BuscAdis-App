'use client'

import { motion } from 'framer-motion';
import Link from 'next/link';
import Container from '@/components/shared/Container';
import Scene3D from '@/components/3d/Scene';
import SearchBar from '@/components/search/SearchBar';

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] md:min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute -bottom-8 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      <div className="relative h-full flex flex-col justify-center pt-16 md:pt-24">
        <Container>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white space-y-4 sm:space-y-6 md:space-y-8"
            >
              <div className="space-y-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
                >
                  <span className="text-xs sm:text-sm text-blue-100">🏆 Plataforma #1 de clasificados en Perú</span>
                </motion.div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                  Busca mejores oportunidades
                </h1>
              </div>
              
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100">
                Encuentra todo lo que necesitas en un solo lugar, con la confianza y seguridad que mereces
              </p>

              <SearchBar onSearch={(query) => console.log('Búsqueda:', query)} />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8 py-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 md:p-4 text-center hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
                  <span className="block text-xl sm:text-2xl md:text-3xl font-bold mb-1">10K+</span>
                  <span className="text-xs sm:text-sm text-blue-200">Visitas</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 md:p-4 text-center hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
                  <span className="block text-xl sm:text-2xl md:text-3xl font-bold mb-1">5K+</span>
                  <span className="text-xs sm:text-sm text-blue-200">Publicaciones</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 md:p-4 text-center hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
                  <span className="block text-xl sm:text-2xl md:text-3xl font-bold mb-1">150+</span>
                  <span className="text-xs sm:text-sm text-blue-200">Conexiones</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 md:p-4 text-center hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
                  <span className="block text-xl sm:text-2xl md:text-3xl font-bold mb-1">98%</span>
                  <span className="text-xs sm:text-sm text-blue-200">Satisfacción</span>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mt-6 sm:mt-8 md:mt-12 space-y-4"
              >
                <Link
                  href="/publicar"
                  className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg md:text-xl font-bold text-primary-900 bg-white rounded-xl shadow-lg hover:bg-primary-50 transform hover:scale-105 transition-all duration-300 group"
                >
                  <span>Publicar mi Adiso ahora</span>
                  <svg 
                    className="w-5 h-5 sm:w-6 sm:h-6 ml-2 group-hover:translate-x-1 transition-transform" 
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
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-blue-100">
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