'use client'

import { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import Container from '@/components/shared/Container';
import { ArrowRightIcon, ArrowPathIcon, BookmarkIcon, MapIcon, BellIcon, UserIcon } from '@heroicons/react/24/outline';
// import { Orb } from '@/components/ui/animations/Orb'; // Component not found, commented out

const steps = [
  {
    id: 1,
    title: 'Crea una cuenta',
    description: 'Regístrate en menos de 1 minuto para comenzar a disfrutar de todos los beneficios.',
    icon: UserIcon,
    color: 'from-teal-500 to-emerald-400'
  },
  {
    id: 2,
    title: 'Navega entre categorías',
    description: 'Explora todas las categorías disponibles para encontrar exactamente lo que buscas.',
    icon: MapIcon,
    color: 'from-cyan-500 to-teal-400'
  },
  {
    id: 3,
    title: 'Guarda tus favoritos',
    description: 'Marca tus anuncios favoritos para revisarlos más tarde o compararlos con otras opciones.',
    icon: BookmarkIcon,
    color: 'from-blue-500 to-cyan-400'
  },
  {
    id: 4,
    title: 'Crea alertas personalizadas',
    description: 'Configura notificaciones para recibir avisos cuando aparezcan nuevos anuncios que te interesen.',
    icon: BellIcon, 
    color: 'from-emerald-500 to-green-400'
  },
  {
    id: 5,
    title: 'Mantente actualizado',
    description: 'Recibe actualizaciones automáticas sobre el estado de tus búsquedas y nuevas ofertas.',
    icon: ArrowPathIcon,
    color: 'from-teal-500 to-cyan-400'
  }
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.3 });
  
  // Auto-advance steps
  useEffect(() => {
    if (isInView) {
      intervalRef.current = setInterval(() => {
        setActiveStep(prev => prev >= steps.length ? 1 : prev + 1);
      }, 4000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isInView]);

  // Manual step selection
  const handleStepClick = (step: number) => {
    setActiveStep(step);
    
    // Reset interval timer on manual click
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setActiveStep(prev => prev >= steps.length ? 1 : prev + 1);
      }, 4000);
    }
  };

  // Get the current step's data
  const currentStep = steps.find(step => step.id === activeStep);
  
  // Variants for animations
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section ref={containerRef} className="relative bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900/90 py-16 md:py-24 overflow-hidden">
      {/* Elementos decorativos tecnológicos */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-0 right-0 top-10 bg-gradient-to-r from-teal-500/5 via-cyan-500/10 to-green-500/5 h-px"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full filter blur-3xl opacity-30"></div>
        
        {/* Technological circuit patterns */}
        <svg width="100%" height="100%" className="absolute inset-0 opacity-10">
          <pattern id="circuit-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M0 50 H100 M50 0 V100 M25 25 L75 75 M75 25 L25 75" stroke="url(#tech-gradient)" strokeWidth="0.5" fill="none" />
            <circle cx="50" cy="50" r="3" fill="url(#tech-gradient)" />
            <circle cx="25" cy="25" r="2" fill="url(#tech-gradient)" />
            <circle cx="75" cy="75" r="2" fill="url(#tech-gradient)" />
            <circle cx="75" cy="25" r="2" fill="url(#tech-gradient)" />
            <circle cx="25" cy="75" r="2" fill="url(#tech-gradient)" />
          </pattern>
          <defs>
            <linearGradient id="tech-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#circuit-pattern)" />
        </svg>
        
        {/* Floating orbs - replaced with simple divs */}
        <div className="absolute opacity-80 pointer-events-none">
          <div className="absolute w-40 h-40 bg-teal-500/20 rounded-full blur-xl" style={{ top: '10%', left: '5%' }}></div>
          <div className="absolute w-25 h-25 bg-cyan-500/20 rounded-full blur-xl" style={{ top: '30%', left: '15%' }}></div>
          <div className="absolute w-30 h-30 bg-emerald-500/20 rounded-full blur-xl" style={{ top: '70%', left: '8%' }}></div>
          <div className="absolute w-35 h-35 bg-teal-500/20 rounded-full blur-xl" style={{ top: '15%', right: '5%' }}></div>
          <div className="absolute w-22 h-22 bg-cyan-500/20 rounded-full blur-xl" style={{ top: '50%', right: '10%' }}></div>
          <div className="absolute w-28 h-28 bg-emerald-500/20 rounded-full blur-xl" style={{ top: '80%', right: '15%' }}></div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent mb-4">
            Cómo funciona <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">BuscAdis</span>
          </h2>
          <p className="text-slate-300 text-lg md:text-xl">
            Descubre lo fácil que es usar nuestra plataforma y aprovecha todas sus funcionalidades
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          {/* Visualizador del paso actual */}
          <motion.div 
            className="order-2 lg:order-1"
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl p-8 relative overflow-hidden group">
              {/* Efectos de iluminación premium */}
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/10 via-transparent to-cyan-500/10 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-gradient-to-r from-teal-500/10 to-cyan-500/20 blur-2xl rounded-full transform translate-x-1/2 translate-y-1/2 opacity-70"></div>
              
              <div className="relative">
                {currentStep && (
                  <motion.div
                    key={currentStep.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center p-4"
                  >
                    <div className={`flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${currentStep.color} shadow-lg mb-6`}>
                      <currentStep.icon className="h-10 w-10 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3">{currentStep.title}</h3>
                    <p className="text-slate-300 text-center">{currentStep.description}</p>
                    
                    <div className="mt-8 flex items-center justify-center">
                      <span className="text-teal-400 mr-2">Siguiente paso</span>
                      <ArrowRightIcon className="h-5 w-5 text-teal-400 animate-pulse" />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Navegación de pasos */}
          <motion.div 
            className="order-1 lg:order-2"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Sigue estos pasos para comenzar:</h3>
              
              <div className="space-y-6">
                {steps.map((step) => (
                  <motion.div 
                    key={step.id}
                    variants={itemVariants}
                    className={`relative flex items-center cursor-pointer transition-all duration-300 ${
                      activeStep === step.id 
                        ? 'scale-105 transform' 
                        : 'opacity-70 hover:opacity-90'
                    }`}
                    onClick={() => handleStepClick(step.id)}
                  >
                    {/* Línea de conexión entre pasos */}
                    {step.id !== steps.length && (
                      <div className="absolute left-6 top-10 w-0.5 h-full bg-gradient-to-b from-teal-500/50 to-transparent z-0"></div>
                    )}
                    
                    {/* Paso numerado */}
                    <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full shadow-lg mr-4 ${
                      activeStep === step.id 
                        ? `bg-gradient-to-br ${step.color} ring-2 ring-white/20` 
                        : 'bg-slate-700'
                    }`}>
                      <span className="text-white font-bold">{step.id}</span>
                      
                      {/* Pulse effect for active step */}
                      {activeStep === step.id && (
                        <span className="absolute inset-0 rounded-full bg-teal-400 opacity-30 animate-ping-slow"></span>
                      )}
                    </div>
                    
                    <div className={`transition-colors duration-300 ${
                      activeStep === step.id 
                        ? 'bg-slate-700/50 shadow-lg' 
                        : 'bg-slate-800/30 hover:bg-slate-700/40'
                    } flex-1 p-3 rounded-xl border ${
                      activeStep === step.id 
                        ? 'border-teal-500/30' 
                        : 'border-slate-700/50'
                    }`}>
                      <h4 className={`font-medium ${
                        activeStep === step.id 
                          ? 'text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300' 
                          : 'text-white'
                      }`}>
                        {step.title}
                      </h4>
                      
                      {activeStep === step.id && (
                        <div className="mt-1 text-xs text-slate-400">
                          <span>Haz click para más detalles</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Indicador de avance */}
            <div className="mt-6 flex justify-center">
              <div className="flex space-x-2">
                {steps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(step.id)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      activeStep === step.id
                        ? 'bg-gradient-to-r from-teal-400 to-cyan-400 w-8'
                        : 'bg-slate-600 hover:bg-slate-500'
                    }`}
                    aria-label={`Go to step ${step.id}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}