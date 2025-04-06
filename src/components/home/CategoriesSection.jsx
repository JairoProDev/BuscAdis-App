"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { categories } from "@/lib/constants"; // Asume que las categorías están aquí
import CategoryCard from "./CategoryCard"; // Importa el componente Card
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { useState, useRef, useEffect } from "react";

const CategoriesSection = () => {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
    const containerRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    // Update scroll buttons visibility based on scroll position
    const handleScroll = () => {
        if (!containerRef.current) return;

        const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    };

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
            // Initial check
            handleScroll();
            return () => container.removeEventListener("scroll", handleScroll);
        }
    }, []);

    // Scroll the container horizontally
    const scrollToLeft = () => {
        if (containerRef.current) {
            containerRef.current.scrollBy({ left: -300, behavior: "smooth" });
        }
    };

    const scrollToRight = () => {
        if (containerRef.current) {
            containerRef.current.scrollBy({ left: 300, behavior: "smooth" });
        }
    };

    // Animaciones
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 },
        },
    };

    return (
        <section
            ref={ref}
            className="py-16 sm:py-24 relative overflow-hidden bg-gradient-to-b from-slate-900 via-teal-900/90 to-slate-900"
        >
            {/* Background elements */}
            <div className="absolute inset-0 z-0">
                {/* Tech pattern background - You can keep this or remove it */}
                {/* <div className="absolute inset-0 opacity-5 bg-[url('/patterns/circuit.svg')]"></div> */}

                {/* Animated orbs */}
                <div className="absolute top-40 left-20 w-80 h-80 bg-gradient-to-br from-teal-400/10 via-teal-300/5 to-emerald-400/10 rounded-full filter blur-xl opacity-30 animate-blob" />
                <div className="absolute -bottom-20 right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/10 via-white/5 to-teal-500/10 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-2000" />

                {/* Laser light effects */}
                <div className="absolute h-full w-[1px] left-[15%] bg-gradient-to-b from-transparent via-teal-400/10 to-transparent opacity-50"></div>
                <div className="absolute h-full w-[1px] left-[85%] bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent opacity-50"></div>

                {/* Animated shimmer line */}
                <motion.div
                    className="absolute top-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/40 to-transparent"
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

                {/* Animated data points */}
                <div className="absolute inset-0">
                    {Array.from({ length: 50 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-teal-400/30 rounded-full"
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
                                duration: Math.random() * 10 + 20,
                                ease: 'linear',
                                delay: Math.random() * 5
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Premium border effect */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Encabezado */}
                <motion.div
                    className="text-center mb-12 sm:mb-16 relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    {/* Subtle light effect behind badge for premium look */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-10 bg-gradient-to-r from-cyan-400/30 via-teal-300/30 to-cyan-400/30 blur-xl rounded-full"></div>

                    <motion.span
                        className="px-4 py-1.5 rounded-full bg-gradient-to-r from-slate-800 to-slate-700 text-cyan-300 text-sm font-medium mb-3 inline-block shadow-lg relative border border-teal-500/20"
                        initial={{ opacity: 0, y: -10 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    >
                        <span className="relative z-10">Explora nuestras categorías</span>
                        {/* Subtle platinum shimmer effect */}
                        <span className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-cyan-300/20 to-teal-500/0 rounded-full animate-shimmer"></span>
                    </motion.span>

                    <motion.h2
                        className="text-3xl sm:text-5xl font-bold text-white mb-4"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={inView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        Encuentra lo que <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-teal-200">Necesitas</span>
                    </motion.h2>

                    <motion.p
                        className="text-lg text-cyan-50 max-w-3xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : {}}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        Explora las mejores oportunidades clasificadas por categorías y encuentra
                        rápidamente lo que estás buscando.
                    </motion.p>

                    <motion.div
                        className="w-24 h-1 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 rounded-full mx-auto mt-8 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                        initial={{ width: 0, opacity: 0 }}
                        animate={inView ? { width: 96, opacity: 1 } : {}}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    ></motion.div>
                </motion.div>

                {/* Navigation controls for mobile scrolling - styled with platinum effects */}
                <div className="flex justify-end gap-2 mb-4 lg:hidden">
                    <motion.button
                        onClick={scrollToLeft}
                        className={`p-2 rounded-full ${
                            canScrollLeft
                                ? "bg-gradient-to-br from-slate-700 to-slate-800 text-cyan-300 shadow-lg border border-cyan-500/20"
                                : "bg-slate-700 text-slate-500"
                        } transition-all duration-200`}
                        disabled={!canScrollLeft}
                        aria-label="Desplazar a la izquierda"
                        whileTap={{ scale: 0.95 }}
                        whileHover={canScrollLeft ? { scale: 1.05, boxShadow: "0 0 10px rgba(34, 211, 238, 0.3)" } : {}}
                    >
                        <ArrowRightIcon className="h-5 w-5 transform rotate-180" />
                    </motion.button>

                    <motion.button
                        onClick={scrollToRight}
                        className={`p-2 rounded-full ${
                            canScrollRight
                                ? "bg-gradient-to-br from-slate-700 to-slate-800 text-cyan-300 shadow-lg border border-cyan-500/20"
                                : "bg-slate-700 text-slate-500"
                        } transition-all duration-200`}
                        disabled={!canScrollRight}
                        aria-label="Desplazar a la derecha"
                        whileTap={{ scale: 0.95 }}
                        whileHover={canScrollRight ? { scale: 1.05, boxShadow: "0 0 10px rgba(34, 211, 238, 0.3)" } : {}}
                    >
                        <ArrowRightIcon className="h-5 w-5" />
                    </motion.button>
                </div>

                {/* Grid/Scrollable Categories Container */}
                <motion.div
                    ref={containerRef}
                    className="flex lg:grid lg:grid-cols-4 gap-6 lg:gap-8 overflow-x-auto pb-6 lg:overflow-visible snap-x snap-mandatory lg:snap-none"
                    variants={containerVariants}
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                    onScroll={handleScroll}
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            className="snap-center flex-shrink-0 w-[85%] sm:w-[45%] lg:w-auto"
                        >
                            <CategoryCard category={category} index={index} />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Scroll indicators for mobile - more subtle platinum styling */}
                <motion.div
                    className="mt-2 flex justify-center gap-1.5 lg:hidden"
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.8 }}
                >
                    {categories.slice(0, Math.min(5, categories.length)).map((_, i) => (
                        <div
                            key={i}
                            className={`w-8 h-1.5 rounded-full transition-all duration-300 ${
                                i === 0
                                    ? "bg-gradient-to-r from-cyan-400 to-teal-400 shadow-[0_0_5px_rgba(34,211,238,0.5)]"
                                    : "bg-slate-600"
                            }`}
                        ></div>
                    ))}
                </motion.div>

                {/* View All Button - with premium styling */}
                <motion.div
                    className="mt-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    <motion.a
                        href="/buscar"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-slate-900 bg-gradient-to-r from-cyan-300 to-teal-300 transition-all duration-200 transform hover:scale-105 shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] relative overflow-hidden group"
                        whileHover={{
                            boxShadow: "0 0 30px rgba(34, 211, 238, 0.6)",
                        }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {/* Platinum shimmer effect */}
                        <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/0 via-white/40 to-white/0 transform -skew-x-30 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>

                        <span className="relative z-10">Ver todas las categorías</span>
                        <span className="relative z-10 ml-2 inline-block">
                            <ArrowRightIcon className="h-5 w-5 inline-block group-hover:translate-x-1 transition-transform duration-200" />
                        </span>
                    </motion.a>
                </motion.div>
            </div>
        </section>
    );
};

// Add the shimmer animation and particle animations to tailwind styles
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shimmer {
            0% {
                transform: translateX(-100%);
            }
            100% {
                transform: translateX(100%);
            }
        }
        .animate-shimmer {
            animation: shimmer 2.5s infinite;
        }

        /* Animated floating particles */
        .particle {
            top: 20%;
            left: 60%;
            animation: float 8s ease-in-out infinite;
        }
        .particle-2 {
            top: 70%;
            left: 30%;
            animation: float 12s ease-in-out infinite;
        }
        .particle-3 {
            top: 40%;
            left: 80%;
            animation: float 10s ease-in-out infinite;
        }

        @keyframes float {
            0% {
                transform: translateY(0) translateX(0);
            }
            25% {
                transform: translateY(-15px) translateX(15px);
            }
            50% {
                transform: translateY(15px) translateX(-15px);
            }
            75% {
                transform: translateY(5px) translateX(5px);
            }
            100% {
                transform: translateY(0) translateX(0);
            }
        }
    `;
    document.head.appendChild(style);
}

export default CategoriesSection;