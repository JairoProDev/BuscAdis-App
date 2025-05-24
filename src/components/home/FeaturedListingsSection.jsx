"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { featuredListings } from "@/lib/homeMockData";
import ListingCard from "./ListingCard"; // Importa el nuevo componente de tarjeta

const FeaturedListingsSection = () => {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 },
        },
    };

    const scrollToLeft = () => {
        const container = document.getElementById("featured-listings-container");
        if (container) {
            container.scrollBy({ left: -container.offsetWidth, behavior: "smooth" });
        }
    };

    const scrollToRight = () => {
        const container = document.getElementById("featured-listings-container");
        if (container) {
            container.scrollBy({ left: container.offsetWidth, behavior: "smooth" });
        }
    };

    return (
        <section
            ref={ref}
            className="py-16 sm:py-20 relative overflow-hidden bg-gradient-to-b from-slate-900 via-teal-900/90 to-slate-900"
        >
            {/* Background elements - tecnológicos con tema teal/cyan */}
            <div className="absolute inset-0 z-0">
                {/* Patrones de circuito tecnológico - Puedes mantenerlo o removerlo */}
                {/* <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" /> */}

                {/* Animated orbs */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-teal-400/10 via-teal-300/5 to-emerald-400/10 rounded-full filter blur-xl opacity-30 animate-blob" />
                <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-cyan-400/10 via-white/5 to-teal-500/10 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-2000" />

                {/* Laser light effects */}
                <div className="absolute h-full w-[1px] left-[20%] bg-gradient-to-b from-transparent via-teal-400/10 to-transparent opacity-50"></div>
                <div className="absolute h-full w-[1px] left-[80%] bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent opacity-50"></div>

                {/* Floating data points */}
                <div className="absolute inset-0">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-teal-400/40 rounded-full"
                            initial={{
                                x: `${Math.random() * 100}%`,
                                y: `${Math.random() * 100}%`,
                                opacity: Math.random() * 0.5 + 0.3
                            }}
                            animate={{
                                y: ['0%', '100%'],
                                opacity: [0.3, 0.8, 0.3]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: Math.random() * 10 + 15,
                                ease: 'linear',
                                delay: Math.random() * 5
                            }}
                        />
                    ))}
                </div>

                {/* Tech grid on floor */}
                <div className="absolute bottom-0 left-0 right-0 h-40 perspective-1000">
                    <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-teal-500/5 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/30 to-transparent"></div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Encabezado */}
                <motion.div
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 sm:mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <div className="mb-4 sm:mb-0 relative">
                        {/* Premium badge */}
                        <motion.div
                            className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-slate-800 to-slate-700 text-teal-300 text-sm font-medium mb-3 shadow-lg relative border border-teal-500/20 overflow-hidden"
                            initial={{ opacity: 0, y: -10 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.2 }}
                            whileHover={{ y: -3, boxShadow: "0 0 20px rgba(20,184,166,0.3)" }}
                        >
                            <SparklesIcon className="h-4 w-4 mr-1.5 text-cyan-300" />
                            <span className="relative z-10">Selección Premium</span>
                            <span className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/20 to-teal-500/0 rounded-full animate-shimmer"></span>
                        </motion.div>

                        <motion.h2
                            className="text-3xl sm:text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-100 to-white"
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            Anuncios <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-300">Destacados</span>
                        </motion.h2>

                        <motion.div
                            className="h-1 w-24 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 rounded-full mb-4 shadow-[0_0_10px_rgba(20,184,166,0.3)]"
                            initial={{ width: 0, opacity: 0 }}
                            animate={inView ? { width: 96, opacity: 1 } : {}}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        ></motion.div>

                        <motion.p
                            className="text-lg text-cyan-100/90 max-w-xl"
                            initial={{ opacity: 0 }}
                            animate={inView ? { opacity: 1 } : {}}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            Oportunidades seleccionadas en Cusco y alrededores que podrían
                            interesarte.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={inView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="relative group"
                        whileHover={{ scale: 1.03, y: -2 }}
                    >
                        {/* Premium glow effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition-all duration-300"></div>

                        <Link
                            href="/buscar?destacado=true"
                            className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-900 font-medium transition-all duration-200 shadow-md hover:shadow-[0_8px_25px_-5px_rgba(20,184,166,0.5)] relative overflow-hidden group/btn z-10"
                        >
                            {/* Platinum shimmer effect */}
                            <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/0 via-white/70 to-white/0 transform -skew-x-30 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out"></span>

                            <span className="relative z-10">Ver Todos los Destacados</span>
                            <ArrowRightIcon className="ml-1.5 h-5 w-5 relative z-10 group-hover/btn:translate-x-1 transition-transform duration-200" />
                        </Link>

                        {/* Additional CTA for Publishing */}
                        <Link
                            href="/publicar"
                            className="inline-flex items-center px-6 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-teal-400/30 text-white font-medium transition-all duration-200 hover:bg-white/20 hover:border-teal-400/50 relative overflow-hidden group/btn"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/15 to-teal-500/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                            <SparklesIcon className="h-4 w-4 mr-2 text-teal-300 relative z-10" />
                            <span className="relative z-10">Destacar mi Anuncio</span>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Navigation controls for mobile scrolling - tech styled */}
                <div className="flex justify-end gap-2 mb-4 lg:hidden">
                    <motion.button
                        onClick={scrollToLeft}
                        className="p-2 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-teal-400 shadow-sm hover:shadow-md transition-all duration-200 border border-teal-500/20 hover:border-teal-300/50"
                        aria-label="Desplazar a la izquierda"
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ y: -2 }}
                    >
                        <ChevronLeftIcon className="h-5 w-5" />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500/0 via-teal-500/10 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </motion.button>

                    <motion.button
                        onClick={scrollToRight}
                        className="p-2 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-teal-400 shadow-sm hover:shadow-md transition-all duration-200 border border-teal-500/20 hover:border-teal-300/50"
                        aria-label="Desplazar a la derecha"
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ y: -2 }}
                    >
                        <ChevronRightIcon className="h-5 w-5" />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500/0 via-teal-500/10 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </motion.button>
                </div>

                {/* Grid de Anuncios - Con scroll horizontal en móvil */}
                <motion.div
                    id="featured-listings-container"
                    className="flex lg:grid lg:grid-cols-4 gap-6 lg:gap-8 overflow-x-auto pb-6 lg:overflow-visible snap-x snap-mandatory lg:snap-none"
                    variants={containerVariants}
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {featuredListings.slice(0, 8).map((listing, index) => (
                        <div
                            key={listing.id}
                            className="snap-center flex-shrink-0 w-[85%] sm:w-[45%] lg:w-auto"
                        >
                            <ListingCard listing={listing} index={index} />
                        </div>
                    ))}
                </motion.div>

                {/* Scroll indicators - tech styled */}
                <motion.div
                    className="mt-6 flex justify-center gap-1.5 lg:hidden"
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.8 }}
                >
                    {[
                        ...Array(
                            Math.min(4, Math.ceil(featuredListings.slice(0, 8).length / 2))
                        ),
                    ].map((_, i) => (
                        <div
                            key={i}
                            className={`w-8 h-1.5 rounded-full transition-all duration-300 ${
                                i === 0
                                    ? "bg-gradient-to-r from-teal-400 to-cyan-400 shadow-[0_0_5px_rgba(20,184,166,0.5)]"
                                    : "bg-slate-700"
                            }`}
                        ></div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default FeaturedListingsSection;