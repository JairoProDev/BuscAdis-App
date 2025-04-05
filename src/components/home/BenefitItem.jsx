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

  // Colores premium para los iconos - platinum style
  const iconGradients = [
    'from-blue-500 to-purple-500',
    'from-blue-600 to-blue-400',
    'from-purple-500 to-blue-500',
    'from-gray-700 to-gray-500',
  ];

  return (
    <motion.div
      className="flex gap-4 items-start group"
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ x: 5 }}
    >
      <div className={`relative flex-shrink-0 mt-1`}>
        {/* Circulo de fondo con efecto de desenfoque - platinum style */}
        <div className={`absolute -inset-1.5 rounded-full opacity-20 filter blur-sm bg-gradient-to-r ${iconGradients[index % iconGradients.length]} group-hover:opacity-30 transition-opacity duration-300`}></div>
        
        {/* Icono con estilo premium */}
        <div className={`relative flex items-center justify-center w-10 h-10 rounded-full 
          bg-gradient-to-br from-gray-50 to-gray-100 
          shadow-[0_5px_15px_-3px_rgba(0,0,0,0.1)] 
          border border-gray-200/80 
          group-hover:border-gray-300/80 
          group-hover:shadow-[0_8px_20px_-4px_rgba(59,130,246,0.15)] 
          transition-all duration-300`}
        >
          <Icon 
            className={`h-5 w-5 bg-clip-text text-transparent bg-gradient-to-br ${iconGradients[index % iconGradients.length]}`} 
            aria-hidden="true" 
          />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-1.5 group-hover:text-blue-600 transition-colors duration-300">{benefit.title}</h3>
        <p className="text-gray-600">{benefit.description}</p>
      </div>

      {/* Subtle line connector for platinum effect */}
      <div className="absolute left-5 top-12 w-px h-14 bg-gradient-to-b from-gray-300/80 to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300 -z-10"></div>
    </motion.div>
  );
};

export default BenefitItem; 