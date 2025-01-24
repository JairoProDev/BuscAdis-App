'use client'

import { motion } from 'framer-motion';
import Container from '@/components/shared/Container';

const steps = [
  {
    title: 'Busca',
    description: 'Encuentra lo que necesitas con nuestro buscador inteligente',
    icon: '🔍'
  },
  {
    title: 'Conecta',
    description: 'Contacta directamente con vendedores verificados',
    icon: '🤝'
  },
  {
    title: 'Disfruta',
    description: 'Realiza transacciones seguras y disfruta de tu compra',
    icon: '🎉'
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-primary-800">
      <Container>
        <motion.h2 
          className="text-4xl font-bold text-white text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          ¿Cómo funciona BuscAdis?
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-full flex items-center justify-center text-4xl shadow-lg">
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
              <p className="text-blue-100">{step.description}</p>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(100%-2rem)] w-[calc(100%-4rem)] h-0.5 bg-white/20">
                  <div className="absolute right-0 -top-1.5 w-3 h-3 border-t-2 border-r-2 border-white/20 transform rotate-45" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
} 