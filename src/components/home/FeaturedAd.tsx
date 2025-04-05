// components/home/FeaturedAd.tsx

'use client';

import { useState, useEffect } from 'react';
import { featuredAds } from '@/data/featuredAds';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { SparklesIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

const FeaturedAd = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    // Establecemos la dirección siempre a 'right'
    const [direction, setDirection] = useState<'left' | 'right'>('right');

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % featuredAds.length;
                // Mantenemos la dirección siempre a 'right'
                setDirection('right');
                return nextIndex;
            });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const currentAd = featuredAds[currentIndex];

    const variants = {
        initial: {
            opacity: 0,
            x: 100, // Siempre inicia desde la derecha
        },
        animate: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.4,
                ease: "easeInOut",
            },
        },
        exit: {
            opacity: 0,
            x: -100, // Siempre sale hacia la izquierda
            transition: {
                duration: 0.3,
                ease: "easeInOut",
            },
        },
    };

    return (
        <div className="perspective relative z-10">
            <div className="relative">
                {/* Outer glow effect */}
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-teal-500/20 blur-xl opacity-70 animate-pulse"></div>

                {/* Animated border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent from-teal-500/50 via-cyan-500/50 to-teal-500/50 blur-[1px] transition-all duration-500"></div>

                {/* Diamond reflections */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/10 via-teal-300/5 to-transparent transform rotate-45 translate-x-5 -translate-y-5 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 via-cyan-300/5 to-transparent transform rotate-45 -translate-x-5 translate-y-5 opacity-50"></div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border border-teal-500/20 group hover:shadow-[0_30px_60px_rgba(20,184,166,0.3)] transition-all duration-500 hover:-translate-y-2 bg-slate-800"
                    >
                        {/* Badge Premium */}
                        <div className="absolute top-4 right-4 z-20">
                            <motion.div
                                className="flex items-center space-x-1 bg-gradient-to-r from-teal-900 to-slate-900 px-3 py-1 rounded-full border border-teal-500/30 shadow-[0_4px_10px_rgba(20,184,166,0.3)]"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                            >
                                <SparklesIcon className="w-3 h-3 text-teal-300" />
                                <span className="text-xs font-medium text-white">Premium</span>
                            </motion.div>
                        </div>

                        {/* Shimmer effect on top edge */}
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-400/50 to-transparent"></div>

                        {/* Image section with overlay */}
                        <div className="relative h-72 w-full">
                            <Image
                                src={currentAd.imageUrl}
                                alt={currentAd.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                            />
                            {/* Image overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-800/40 to-transparent"></div>

                            {/* Image reflective effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 via-teal-500/0 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            {/* Price tag */}
                            <div className="absolute bottom-4 left-4 bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm">
                                <span className="text-xl font-bold text-white">{currentAd.price}</span>
                            </div>
                        </div>

                        <div className="p-6 space-y-4 bg-slate-800">
                            <div className="flex items-center space-x-2">
                                <span className="px-3 py-1 text-xs font-medium bg-teal-900/50 text-teal-300 rounded-full border border-teal-700/30">
                                    {currentAd.category}
                                </span>
                                <div className="h-1 w-1 rounded-full bg-cyan-400/50"></div>
                                <div className="flex items-center text-cyan-300 text-sm">
                                    <ClockIcon className="w-4 h-4 mr-1" />
                                    <span>Hace 2 días</span>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-100 to-white group-hover:text-teal-100 transition-colors duration-300">
                                {currentAd.title}
                            </h2>

                            <p className="text-cyan-100/80 line-clamp-2 group-hover:text-cyan-100 transition-colors duration-300">
                                {currentAd.description}
                            </p>

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center text-teal-300">
                                    <MapPinIcon className="w-4 h-4 mr-1.5" />
                                    <span className="text-sm">{currentAd.location}</span>
                                </div>

                                <Link href={`/anuncio/${currentAd.id}`}>
                                    <motion.button
                                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-medium text-sm relative overflow-hidden group/btn"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span className="relative z-10">Ver detalles</span>
                                        {/* Button shimmer */}
                                        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></span>
                                    </motion.button>
                                </Link>
                            </div>
                        </div>

                        <div className="h-1 w-full bg-gradient-to-r from-teal-600/0 via-teal-500 to-cyan-500/0"></div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation indicators */}
                <div className="absolute -bottom-8 left-0 right-0 flex justify-center space-x-2">
                    {featuredAds.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-8 h-1.5 rounded-full transition-all duration-300 ${
                                idx === currentIndex
                                    ? "bg-gradient-to-r from-teal-500 to-cyan-500 shadow-[0_0_5px_rgba(20,184,166,0.5)]"
                                    : "bg-slate-600"
                            }`}
                            aria-label={`Ver anuncio ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeaturedAd;