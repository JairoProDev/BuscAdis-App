'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '@/components/shared/Container';
import { SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { ArrowRightIcon, MagnifyingGlassIcon, ChatBubbleLeftRightIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

const steps = [
  {
    title: 'Busca',
    description: 'Encuentra exactamente lo que necesitas con nuestro buscador inteligente impulsado por IA.',
    icon: <MagnifyingGlassIcon className="w-12 h-12 text-teal-300" />,
    details: [
      'Búsqueda predictiva y sugerencias personalizadas',
      'Filtros avanzados y geolocalización',
      'Resultados ordenados por relevancia'
    ],
    color: 'from-teal-500 to-cyan-500'
  },
  {
    title: 'Conecta',
    description: 'Comunícate de forma segura y directa con vendedores verificados a través de nuestro sistema de mensajería integrado.',
    icon: <ChatBubbleLeftRightIcon className="w-12 h-12 text-cyan-300" />,
    details: [
      'Chat encriptado en tiempo real',
      'Sistema de reputación y verificación',
      'Notificaciones instantáneas'
    ],
    color: 'from-cyan-500 to-teal-400'
  },
  {
    title: 'Disfruta',
    description: 'Realiza transacciones seguras con nuestro sistema de pagos protegidos y ten de una experiencia sin preocupaciones.',
    icon: <RocketLaunchIcon className="w-12 h-12 text-teal-300" />,
    details: [
      'Pagos seguros con garantía',
      'Proceso de entrega rastreable',
      'Soporte 24/7 multicanal'
    ],
    color: 'from-emerald-500 to-teal-500'
  }
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-teal-900/40 to-slate-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" />
        
        {/* Animated orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-teal-400/10 via-teal-300/5 to-emerald-400/10 rounded-full filter blur-xl opacity-30 animate-blob" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-cyan-400/10 via-white/5 to-teal-500/10 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-2000" />
        
        {/* Laser light effects */}
        <div className="absolute h-full w-[1px] left-[10%] bg-gradient-to-b from-transparent via-teal-400/10 to-transparent opacity-50"></div>
        <div className="absolute h-full w-[1px] left-[90%] bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent opacity-50"></div>
        
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

      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          {/* Premium badge */}
          <motion.div
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-slate-800 to-slate-700 text-teal-300 text-sm font-medium mb-6 shadow-lg relative border border-teal-500/20 overflow-hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -3, boxShadow: "0 0 20px rgba(20,184,166,0.3)" }}
          >
            <SparklesIcon className="h-4 w-4 mr-1.5 text-cyan-300" />
            <span className="relative z-10">Proceso Optimizado</span>
            <span className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/20 to-teal-500/0 rounded-full animate-shimmer"></span>
          </motion.div>
          
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-100 to-white">
            ¿Cómo funciona BuscAdis?
          </h2>
          <p className="text-xl text-cyan-100/90 max-w-2xl mx-auto">
            Descubre lo fácil que es encontrar lo que buscas en solo tres simples pasos
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              onHoverStart={() => {
                setActiveStep(index);
                setIsHovering(true);
              }}
              onHoverEnd={() => {
                setActiveStep(null);
                setIsHovering(false);
              }}
              className="relative group"
            >
              {/* Step number indicator */}
              <div className="absolute -top-5 -left-1 md:-left-2 z-10">
                <div className="relative">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 text-slate-900 font-bold text-sm shadow-teal-500/20 shadow-lg">
                    {index + 1}
                  </div>
                  {/* Pulse effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-400/80 to-cyan-400/80 blur-sm animate-pulse-slow opacity-40"></div>
                </div>
              </div>
              
              {/* Card glow effect on hover */}
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/30 to-cyan-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <motion.div
                className={`p-6 rounded-2xl bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-sm border border-teal-500/20 group-hover:border-teal-400/40 shadow-xl relative overflow-hidden
                  ${activeStep === index ? 'shadow-lg scale-105' : 'group-hover:shadow-teal-500/20 group-hover:shadow-lg'} transition-all duration-300`}
                animate={{
                  scale: activeStep === index ? 1.05 : 1,
                  opacity: activeStep === null || activeStep === index ? 1 : 0.7
                }}
              >
                {/* Holographic effect */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
                
                {/* Premium corner for each step */}
                <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
                  <div className="absolute rotate-45 bg-gradient-to-r ${step.color} text-slate-900 font-bold text-[9px] py-1 right-[-35px] top-[8px] w-[100px] text-center shadow-md opacity-80">PREMIUM</div>
                </div>
                
                <motion.div
                  className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 
                    backdrop-blur-sm flex items-center justify-center shadow-lg border border-teal-500/20 group-hover:border-teal-400/40 relative p-3`}
                  whileHover={{ rotate: [0, -5, 5, -5, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Icon glow */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-20 blur-sm transition-opacity"></div>
                  {step.icon}
                </motion.div>

                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-teal-100 mb-4">{step.title}</h3>
                <p className="text-cyan-100/80 mb-6 leading-relaxed">{step.description}</p>

                <AnimatePresence>
                  {activeStep === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      {step.details.map((detail, i) => (
                        <motion.div
                          key={detail}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-2 text-sm text-cyan-100/90 group/item"
                        >
                          <CheckCircleIcon className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                          <span className="group-hover/item:text-white transition-colors">{detail}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/3 left-[calc(100%-1rem)] w-[calc(100%-3rem)] h-0.5 z-0">
                  <motion.div
                    className="w-full h-full bg-gradient-to-r from-teal-400/40 via-cyan-400/40 to-teal-400/40"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: index * 0.3 }}
                  >
                    <motion.div
                      className="absolute right-0 -top-2 w-4 h-4 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 flex items-center justify-center"
                      animate={{
                        x: [0, 10, 0],
                        boxShadow: [
                          '0 0 0 0 rgba(20,184,166,0)',
                          '0 0 0 3px rgba(20,184,166,0.3)',
                          '0 0 0 0 rgba(20,184,166,0)'
                        ]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <ArrowRightIcon className="w-2 h-2 text-slate-900" />
                    </motion.div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <motion.button
            className="inline-flex items-center px-6 py-3 text-base font-medium text-slate-900 bg-gradient-to-r from-teal-300 to-cyan-300 rounded-xl shadow-lg hover:shadow-teal-500/30 transition-all duration-300 group relative overflow-hidden"
            whileHover={{ y: -3 }}
          >
            <span className="relative z-10 flex items-center">
              Comenzar ahora <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/0 via-white/70 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></span>
          </motion.button>
        </motion.div>
      </Container>
    </section>
  );
}