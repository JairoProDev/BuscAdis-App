'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import Container from '@/components/shared/Container';

const features = [
  {
    category: 'Alcance',
    items: [
      {
        title: 'Visibilidad',
        buscadis: 'Alcance nacional con posicionamiento SEO optimizado',
        others: 'Alcance limitado a la plataforma'
      },
      {
        title: 'Promoción',
        buscadis: 'Sistema inteligente de promoción multiplataforma',
        others: 'Opciones básicas de promoción'
      }
    ]
  },
  {
    category: 'Seguridad',
    items: [
      {
        title: 'Verificación',
        buscadis: 'Verificación de identidad y sistema anti-fraude',
        others: 'Verificación básica por email'
      },
      {
        title: 'Protección',
        buscadis: 'Chat seguro y sistema de pagos protegidos',
        others: 'Sin protección de transacciones'
      }
    ]
  },
  {
    category: 'Herramientas',
    items: [
      {
        title: 'Analytics',
        buscadis: 'Analytics en tiempo real y reportes detallados',
        others: 'Estadísticas básicas'
      },
      {
        title: 'IA',
        buscadis: 'Asistente AI para optimización de anuncios',
        others: 'Sin asistencia inteligente'
      }
    ]
  }
];

export default function Comparison() {
  const [activeCategory, setActiveCategory] = useState(features[0].category);

  return (
    <section className="py-24 bg-gradient-to-b from-primary-800 to-primary-900">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Por qué elegir BuscAdis?
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Descubre cómo nos destacamos frente a otras plataformas de clasificados
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {features.map((feature) => (
            <motion.button
              key={feature.category}
              className={`px-6 py-3 rounded-full text-lg font-semibold transition-all ${
                activeCategory === feature.category
                  ? 'bg-white text-primary-900'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              onClick={() => setActiveCategory(feature.category)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {feature.category}
            </motion.button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-3xl font-bold text-white mb-4"
            >
              BuscAdis
            </motion.div>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-25" />
              <div className="relative bg-white/10 backdrop-blur-sm rounded-lg p-6">
                {features
                  .find((f) => f.category === activeCategory)
                  ?.items.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="mb-6 last:mb-0"
                    >
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-blue-100">{item.buscadis}</p>
                    </motion.div>
                  ))}
              </div>
            </div>
          </div>

          <div className="text-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-3xl font-bold text-white/60 mb-4"
            >
              Otros
            </motion.div>
            <div className="bg-white/5 rounded-lg p-6">
              {features
                .find((f) => f.category === activeCategory)
                ?.items.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="mb-6 last:mb-0"
                  >
                    <h3 className="text-lg font-semibold text-white/60 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-blue-200/60">{item.others}</p>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
} 