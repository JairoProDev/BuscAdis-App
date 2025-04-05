// frontend\src\components\home\Hero\index.tsx
'use client'

import { motion } from 'framer-motion';
import Link from 'next/link';
import Container from '@/components/shared/Container';
import SearchBar from '@/components/search/SearchBar';
import FeaturedAd from '../FeaturedAd';
import { SparklesIcon } from '@heroicons/react/24/solid';

export default function Hero() {
    return (
        <section className="relative min-h-[calc(100vh-4rem)] md:min-h-screen bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900">
            <div className="absolute inset-0">
                {/* Premium platinum grid pattern */}
                <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-15" />
                
                {/* Premium platinum gradient orbs */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-400/20 via-indigo-300/10 to-purple-400/20 rounded-full filter blur-xl opacity-30 animate-blob" />
                <div className="absolute -bottom-8 right-20 w-72 h-72 bg-gradient-to-br from-gray-400/20 via-white/5 to-gray-500/20 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-2000" />
                
                {/* Premium platinum highlights */}
                <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-white rounded-full shadow-[0_0_15px_5px_rgba(255,255,255,0.3)] animate-pulse animation-delay-1000" />
                <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_3px_rgba(255,255,255,0.4)] animate-pulse" />
            </div>

            <div className="relative h-full flex flex-col justify-center pt-16 md:pt-4 overflow-hidden">
                {/* Animated shimmer line */}
                <motion.div 
                    className="absolute top-10 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{
                        background: [
                            'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.4), rgba(255,255,255,0))',
                            'linear-gradient(to right, rgba(255,255,255,0.4), rgba(255,255,255,0), rgba(255,255,255,0.4))'
                        ],
                        x: ['0%', '100%']
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: 'linear'
                    }}
                />
                
                <Container>
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-white space-y-4 sm:space-y-6 md:space-y-8"
                        >
                            <div className="space-y-3">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 relative overflow-hidden group"
                                >
                                    <SparklesIcon className="h-4 w-4 mr-1.5 text-blue-300" />
                                    <span className="text-xs sm:text-sm text-blue-100 relative z-10">Plataforma #1 de clasificados en Perú</span>
                                    {/* Platinum shimmer effect */}
                                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-full animate-shimmer"></span>
                                </motion.div>
                                
                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight">
                                    <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
                                        Busca mejores
                                    </span>
                                    <br />
                                    <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
                                        oportunidades
                                    </span>
                                </h1>
                            </div>

                            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100">
                                Encuentra todo lo que necesitas en un solo lugar, con la confianza y seguridad que mereces
                            </p>

                            <SearchBar onSearch={(query) => console.log('Búsqueda:', query)} />

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8 py-4">
                                <motion.div 
                                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-2 sm:p-3 md:p-4 text-center border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(59,130,246,0.2)]"
                                    whileHover={{
                                        boxShadow: "0 10px 25px rgba(59, 130, 246, 0.2)",
                                        borderColor: "rgba(255, 255, 255, 0.2)"
                                    }}
                                >
                                    <span className="block text-xl sm:text-2xl md:text-3xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">10K+</span>
                                    <span className="text-xs sm:text-sm text-blue-200">Visitas</span>
                                </motion.div>
                                
                                <motion.div 
                                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-2 sm:p-3 md:p-4 text-center border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(59,130,246,0.2)]"
                                    whileHover={{
                                        boxShadow: "0 10px 25px rgba(59, 130, 246, 0.2)",
                                        borderColor: "rgba(255, 255, 255, 0.2)"
                                    }}
                                >
                                    <span className="block text-xl sm:text-2xl md:text-3xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">5K+</span>
                                    <span className="text-xs sm:text-sm text-blue-200">Publicaciones</span>
                                </motion.div>
                                
                                <motion.div 
                                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-2 sm:p-3 md:p-4 text-center border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(59,130,246,0.2)]"
                                    whileHover={{
                                        boxShadow: "0 10px 25px rgba(59, 130, 246, 0.2)",
                                        borderColor: "rgba(255, 255, 255, 0.2)"
                                    }}
                                >
                                    <span className="block text-xl sm:text-2xl md:text-3xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">150+</span>
                                    <span className="text-xs sm:text-sm text-blue-200">Conexiones</span>
                                </motion.div>
                                
                                <motion.div 
                                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-2 sm:p-3 md:p-4 text-center border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(59,130,246,0.2)]"
                                    whileHover={{
                                        boxShadow: "0 10px 25px rgba(59, 130, 246, 0.2)",
                                        borderColor: "rgba(255, 255, 255, 0.2)"
                                    }}
                                >
                                    <span className="block text-xl sm:text-2xl md:text-3xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">98%</span>
                                    <span className="text-xs sm:text-sm text-blue-200">Satisfacción</span>
                                </motion.div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.8 }}
                                className="mt-6 sm:mt-8 md:mt-12 space-y-4"
                            >
                                <Link
                                    href="/publicar"
                                    className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg md:text-xl font-bold text-gray-900 bg-gradient-to-r from-white to-blue-50 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_30px_-10px_rgba(59,130,246,0.3)] transform hover:scale-105 transition-all duration-300 group relative overflow-hidden"
                                >
                                    {/* Platinum shimmer effect */}
                                    <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/0 via-white/80 to-white/0 transform -skew-x-30 -translate-x-full transition-transform duration-1000 ease-out group-hover:translate-x-full"></span>
                                    
                                    <span className="relative z-10">Publicar mi Adiso ahora</span>
                                    <svg
                                        className="w-5 h-5 sm:w-6 sm:h-6 ml-2 relative z-10 group-hover:translate-x-1 transition-transform"
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
                                <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-blue-200 flex items-center justify-center sm:justify-start">
                                    <SparklesIcon className="h-4 w-4 mr-1.5 text-yellow-300" />
                                    ¡10% de descuento si lo publicas por tu cuenta! 🚀
                                </p>
                            </motion.div>
                        </motion.div>

                        <div className="hidden lg:block">
                            <FeaturedAd />
                        </div>
                    </div>
                </Container>
            </div>
        </section>
    );
}