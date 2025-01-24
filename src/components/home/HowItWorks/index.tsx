'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '@/components/shared/Container';

const steps = [
  {
    title: 'Busca',
    description: 'Encuentra exactamente lo que necesitas con nuestro buscador inteligente impulsado por IA.',
    icon: '🔍',
    details: [
      'Búsqueda predictiva y sugerencias personalizadas',
      'Filtros avanzados y geolocalización',
      'Resultados ordenados por relevancia'
    ],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Conecta',
    description: 'Comunícate de forma segura y directa con vendedores verificados a través de nuestro sistema de mensajería integrado.',
    icon: '🤝',
    details: [
      'Chat encriptado en tiempo real',
      'Sistema de reputación y verificación',
      'Notificaciones instantáneas'
    ],
    color: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Disfruta',
    description: 'Realiza transacciones seguras con nuestro sistema de pagos protegidos y ten de una experiencia sin preocupaciones.',
    icon: '🎉',
    details: [
      'Pagos seguros con garantía',
      'Proceso de entrega rastreable',
      'Soporte 24/7 multicanal'
    ],
    color: 'from-green-500 to-emerald-500'
  }
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  return (
    <section className="py-24 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            ¿Cómo funciona BuscAdis?
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
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
              className="relative"
            >
              <motion.div
                className={`p-6 rounded-2xl bg-gradient-to-br ${step.color} bg-opacity-10 backdrop-blur-sm border border-white/10 
                  ${activeStep === index ? 'shadow-lg scale-105' : 'hover:shadow-md'} transition-all duration-300`}
                animate={{
                  scale: activeStep === index ? 1.05 : 1,
                  opacity: activeStep === null || activeStep === index ? 1 : 0.7
                }}
              >
                <motion.div
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 
                    backdrop-blur-sm flex items-center justify-center text-4xl shadow-lg border border-white/20"
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  {step.icon}
                </motion.div>

                <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-blue-100 mb-6">{step.description}</p>

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
                          className="flex items-center gap-2 text-sm text-blue-100"
                        >
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {detail}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/3 left-[calc(100%-2rem)] w-16 h-0.5">
                  <motion.div
                    className="w-full h-full bg-gradient-to-r from-white/20 to-white/20"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: index * 0.3 }}
                  >
                    <motion.div
                      className="absolute right-0 -top-1.5 w-3 h-3 border-t-2 border-r-2 border-white/20 transform rotate-45"
                      animate={{
                        x: [0, 10, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}