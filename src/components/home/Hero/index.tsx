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
        <section className="relative min-h-[calc(100vh-4rem)] md:min-h-screen bg-gradient-to-r from-teal-900 via-slate-900 to-cyan-900 pt-6">
            <div className="absolute inset-0">
                {/* Premium platinum grid pattern */}
                <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-15" />

                {/* Premium platinum gradient orbs */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-teal-400/20 via-cyan-300/10 to-emerald-400/20 rounded-full filter blur-xl opacity-40 animate-blob" />
                <div className="absolute -bottom-8 right-20 w-72 h-72 bg-gradient-to-br from-cyan-400/20 via-white/5 to-teal-500/20 rounded-full filter blur-xl opacity-40 animate-blob animation-delay-2000" />

                {/* Additional animated orbs for more premium effect */}
                <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-gradient-to-tr from-teal-300/10 via-white/5 to-cyan-300/10 rounded-full filter blur-lg opacity-30 animate-blob animation-delay-3000" />
                <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-gradient-to-bl from-emerald-400/15 via-cyan-300/5 to-teal-400/15 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-4000" />

                {/* Premium platinum highlights */}
                <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-teal-200 rounded-full shadow-[0_0_15px_5px_rgba(20,184,166,0.4)] animate-pulse animation-delay-1000" />
                <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-cyan-100 rounded-full shadow-[0_0_10px_3px_rgba(6,182,212,0.5)] animate-pulse" />
                <div className="absolute top-2/3 left-2/3 w-4 h-4 bg-emerald-100 rounded-full shadow-[0_0_20px_6px_rgba(16,185,129,0.3)] animate-pulse animation-delay-2000" />

                {/* Laser light effects */}
                <div className="absolute h-full w-[1px] left-[20%] bg-gradient-to-b from-transparent via-teal-400/10 to-transparent opacity-70"></div>
                <div className="absolute h-full w-[1px] left-[80%] bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent opacity-70"></div>

                {/* Circuit board pattern overlay for high-tech look */}
                <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] bg-repeat opacity-5"></div>
            </div>

            <div className="relative h-full flex flex-col justify-center pt-16 md:pt-4 overflow-hidden">
                {/* Animated shimmer lines */}
                <motion.div
                    className="absolute top-10 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/40 to-transparent"
                    animate={{
                        background: [
                            'linear-gradient(to right, rgba(0,0,0,0), rgba(20,184,166,0.4), rgba(0,0,0,0))',
                            'linear-gradient(to right, rgba(20,184,166,0.4), rgba(0,0,0,0), rgba(20,184,166,0.4))'
                        ],
                        x: ['0%', '100%']
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: 'linear'
                    }}
                />

                <motion.div
                    className="absolute bottom-10 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
                    animate={{
                        background: [
                            'linear-gradient(to right, rgba(0,0,0,0), rgba(6,182,212,0.4), rgba(0,0,0,0))',
                            'linear-gradient(to right, rgba(6,182,212,0.4), rgba(0,0,0,0), rgba(6,182,212,0.4))'
                        ],
                        x: ['100%', '0%']
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
                                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-teal-500/20 relative overflow-hidden group"
                                    whileHover={{ y: -2, boxShadow: "0 0 20px rgba(20,184,166,0.3)" }}
                                >
                                    <SparklesIcon className="h-4 w-4 mr-1.5 text-teal-300" />
                                    <span className="text-xs sm:text-sm text-cyan-100 relative z-10">Plataforma #1 de clasificados en Perú</span>
                                    {/* Platinum shimmer effect */}
                                    <span className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/20 to-teal-500/0 rounded-full animate-shimmer"></span>
                                </motion.div>

                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight">
                                    <motion.span
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3, duration: 0.7 }}
                                        className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-white via-teal-100 to-white"
                                    >
                                        Busca mejores
                                    </motion.span>
                                    <br />
                                    <motion.span
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5, duration: 0.7 }}
                                        className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-300 relative"
                                    >
                                        oportunidades
                                        <span className="absolute -inset-1 bg-gradient-to-r from-teal-500/0 via-teal-500/10 to-teal-500/0 blur-sm animate-pulse"></span>
                                    </motion.span>
                                </h1>
                            </div>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7, duration: 0.7 }}
                                className="text-base sm:text-lg md:text-xl lg:text-2xl text-cyan-100"
                            >
                                Encuentra todo lo que necesitas en un solo lugar, con la confianza y seguridad que mereces
                            </motion.p>

                            <SearchBar onSearch={(query) => console.log('Búsqueda:', query)} />

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8 py-4">
                                <motion.div
                                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-2 sm:p-3 md:p-4 text-center border border-teal-500/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(20,184,166,0.2)] h-[80px] sm:h-[100px] flex flex-col justify-center items-center"
                                    whileHover={{
                                        boxShadow: "0 10px 25px rgba(20, 184, 166, 0.3)",
                                        borderColor: "rgba(20, 184, 166, 0.3)",
                                        y: -5
                                    }}
                                >
                                    <span className="block text-xl sm:text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-teal-200">10K+</span>
                                    <span className="text-xs sm:text-sm text-teal-200">Visitas</span>
                                </motion.div>

                                <motion.div
                                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-2 sm:p-3 md:p-4 text-center border border-cyan-500/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(6,182,212,0.2)] h-[80px] sm:h-[100px] flex flex-col justify-center items-center"
                                    whileHover={{
                                        boxShadow: "0 10px 25px rgba(6, 182, 212, 0.3)",
                                        borderColor: "rgba(6, 182, 212, 0.3)",
                                        y: -5
                                    }}
                                >
                                    <span className="block text-xl sm:text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-200">5K+</span>
                                    <span className="text-xs sm:text-sm text-cyan-200">Publicaciones</span>
                                </motion.div>

                                <motion.div
                                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-2 sm:p-3 md:p-4 text-center border border-teal-500/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(20,184,166,0.2)] h-[80px] sm:h-[100px] flex flex-col justify-center items-center"
                                    whileHover={{
                                        boxShadow: "0 10px 25px rgba(20, 184, 166, 0.3)",
                                        borderColor: "rgba(20, 184, 166, 0.3)",
                                        y: -5
                                    }}
                                >
                                    <span className="block text-xl sm:text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-teal-200">150+</span>
                                    <span className="text-xs sm:text-sm text-teal-200">Conexiones</span>
                                </motion.div>

                                <motion.div
                                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-2 sm:p-3 md:p-4 text-center border border-cyan-500/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(6,182,212,0.2)] h-[80px] sm:h-[100px] flex flex-col justify-center items-center"
                                    whileHover={{
                                        boxShadow: "0 10px 25px rgba(6, 182, 212, 0.3)",
                                        borderColor: "rgba(6, 182, 212, 0.3)",
                                        y: -5
                                    }}
                                >
                                    <span className="block text-xl sm:text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-200">98%</span>
                                    <span className="text-xs sm:text-sm text-cyan-200">Satisfacción</span>
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
                                    className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg md:text-xl font-bold text-gray-900 bg-gradient-to-r from-teal-300 to-cyan-300 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_30px_-10px_rgba(20,184,166,0.5)] transform hover:scale-105 transition-all duration-300 group relative overflow-hidden"
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
                                    
                                    {/* Button highlight glow */}
                                    <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-teal-400/0 via-teal-400/30 to-cyan-400/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 group-hover:animate-pulse"></div>
                                </Link>
                                <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-cyan-200 flex items-center justify-center sm:justify-start">
                                    <SparklesIcon className="h-4 w-4 mr-1.5 text-teal-300" />
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