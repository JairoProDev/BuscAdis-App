'use client'

import { motion } from 'framer-motion';
import Container from '@/components/shared/Container';

const features = [
  {
    title: 'Calidad Premium',
    description: 'Todos nuestros anuncios son verificados y de alta calidad',
    icon: '⭐'
  },
  {
    title: 'Conexiones Efectivas',
    description: 'Conectamos de manera inteligente a compradores y vendedores',
    icon: '🤝'
  },
  {
    title: 'Seguridad Garantizada',
    description: 'Transacciones seguras y protección para todos los usuarios',
    icon: '🔒'
  }
];

export default function Features() {
  return (
    <section className="py-16 bg-primary-900">
      <Container>
        <motion.h2 
          className="text-3xl font-bold text-white text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          ¿Por qué elegir BuscAdis?
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-primary-700 mb-4">{feature.title}</h3>
              <p className="text-primary-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
} 