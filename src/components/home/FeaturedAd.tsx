// components/home/FeaturedAd.tsx

'use client';

import { useState, useEffect } from 'react';
import { featuredAds } from '@/data/featuredAds';
import { motion, AnimatePresence } from 'framer-motion';

const FeaturedAd = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredAds.length);
        }, 2500); // Cambia cada 2.5 segundos

        return () => clearInterval(interval);
    }, []);

    const currentAd = featuredAds[currentIndex];

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
                <img src={currentAd.imageUrl} alt={currentAd.title} className="w-full h-64 object-cover" />
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-primary-600 mb-2">{currentAd.category}</h3>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{currentAd.title}</h2>
                    <p className="text-gray-700 mb-4">{currentAd.description}</p>
                    <div className="flex justify-between items-center">
                        <span className="text-xl font-semibold text-gray-800">{currentAd.price}</span>
                        <span className="text-sm text-gray-600">{currentAd.location}</span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default FeaturedAd;