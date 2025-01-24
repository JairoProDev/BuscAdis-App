'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import Container from '@/components/shared/Container';

const benefits = [
  {
    id: 'alcance',
    title: 'Mayor Alcance',
    description: 'Llega a millones de usuarios activos en toda Colombia',
    stats: [
      { value: '5M+', label: 'Visitas mensuales' },
      { value: '200k+', label: 'Búsquedas diarias' }
    ],
    icon: '📈',
    features: [
      'Posicionamiento SEO optimizado',
      'Compartir en redes sociales',
      'Promoción destacada'
    ]
  },
  {
    id: 'seguridad',
    title: 'Máxima Seguridad',
    description: 'Sistema avanzado de verificación y protección',
    stats: [
      { value: '100%', label: 'Transacciones seguras' },
      { value: '0%', label: 'Fraudes reportados' }
    ],
    icon: '🔒',
    features: [
      'Verificación de identidad',
      'Chat seguro integrado',
      'Sistema anti-fraude'
    ]
  },
  {
    id: 'facilidad',
    title: 'Súper Fácil',
    description: 'Publica tu anuncio en menos de 2 minutos',
    stats: [
      { value: '2min', label: 'Tiempo promedio' },
      { value: '96%', label: 'Tasa de éxito' }
    ],
    icon: '🚀',
    features: [
      'Asistente inteligente',
      'Templates optimizados',
      'Auto-completado'
    ]
  }
];

export default function Benefits() {
  const [activeId, setActiveId] = useState(benefits[0].id);

  return (
    <section className="py-24 bg-gradient-to-b from-primary-900 to-primary-800">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            La plataforma más completa
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Descubre por qué miles de usuarios eligen BuscAdis para sus anuncios clasificados
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {benefits.map((benefit) => (
            <motion.div
              key={benefit.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className={`relative p-8 rounded-2xl cursor-pointer transition-colors duration-300 ${
                activeId === benefit.id
                  ? 'bg-white shadow-xl'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
              onClick={() => setActiveId(benefit.id)}
            >
              <div className="text-4xl mb-6">{benefit.icon}</div>
              <h3 className={`text-2xl font-bold mb-4 ${
                activeId === benefit.id ? 'text-primary-900' : 'text-white'
              }`}>
                {benefit.title}
              </h3>
              <p className={`mb-6 ${
                activeId === benefit.id ? 'text-primary-700' : 'text-blue-100'
              }`}>
                {benefit.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {benefit.stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className={`text-2xl font-bold mb-1 ${
                      activeId === benefit.id ? 'text-primary-600' : 'text-white'
                    }`}>
                      {stat.value}
                    </div>
                    <div className={`text-sm ${
                      activeId === benefit.id ? 'text-primary-500' : 'text-blue-200'
                    }`}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <ul className={`space-y-3 ${
                activeId === benefit.id ? 'text-primary-700' : 'text-blue-100'
              }`}>
                {benefit.features.map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={false}
                    animate={{
                      opacity: activeId === benefit.id ? 1 : 0.7,
                      x: activeId === benefit.id ? 0 : -10
                    }}
                    className="flex items-center"
                  >
                    <svg
                      className={`w-5 h-5 mr-3 ${
                        activeId === benefit.id ? 'text-primary-500' : 'text-blue-300'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </motion.li>
                ))}
              </ul>

              {activeId === benefit.id && (
                <motion.div
                  layoutId="activeBackground"
                  className="absolute inset-0 bg-white rounded-2xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
} 