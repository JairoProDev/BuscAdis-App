'use client';

import { motion } from 'framer-motion';
import { iconMap } from '@/lib/homeMockData';

const BenefitItem = ({ benefit, index }) => {
  // Delay incrementales para animación de entrada
  const delay = 0.2 + index * 0.15;

  // Seleccionar el icono adecuado
  const Icon = iconMap[benefit.icon] || iconMap.CheckCircleIcon;

  // Animación para el item
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        delay: delay,
        ease: 'easeOut',
      },
    },
  };

  // Colores premium para los iconos
  const iconColors = [
    'text-accent-pink',
    'text-accent-orange',
    'text-primary-600',
    'text-emerald-500',
  ];

  return (
    <motion.div
      className="flex gap-4 items-start"
      variants={itemVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={`relative flex-shrink-0 mt-1`}>
        {/* Circulo de fondo con efecto de desenfoque */}
        <div className={`absolute -inset-1 rounded-full opacity-20 filter blur-sm bg-gradient-to-r from-primary-500 to-accent-pink animate-pulse-slow`}></div>
        
        {/* Icono */}
        <div className={`relative flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md ${iconColors[index % iconColors.length]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-neutral-900 mb-1">{benefit.title}</h3>
        <p className="text-neutral-600">{benefit.description}</p>
      </div>
    </motion.div>
  );
};

export default BenefitItem; 