'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '@/components/shared/Container';

const features = [
  {
    category: 'Alcance',
    icon: '🌍',
    items: [
      {
        title: 'Visibilidad',
        buscadis: 'Alcance nacional con posicionamiento SEO optimizado',
        others: 'Alcance limitado a la plataforma',
        icon: '🎯'
      },
      {
        title: 'Promoción',
        buscadis: 'Sistema inteligente de promoción multiplataforma',
        others: 'Opciones básicas de promoción',
        icon: '📢'
      },
      {
        title: 'Exposición',
        buscadis: 'Integración con redes sociales y portales inmobiliarios',
        others: 'Sin integraciones externas',
        icon: '🔄'
      }
    ]
  },
  {
    category: 'Seguridad',
    icon: '🔒',
    items: [
      {
        title: 'Verificación',
        buscadis: 'Verificación de identidad y sistema anti-fraude',
        others: 'Verificación básica por email',
        icon: '✅'
      },
      {
        title: 'Protección',
        buscadis: 'Chat seguro y sistema de pagos protegidos',
        others: 'Sin protección de transacciones',
        icon: '🛡️'
      },
      {
        title: 'Privacidad',
        buscadis: 'Cifrado de extremo a extremo y control de datos',
        others: 'Protección de datos básica',
        icon: '🔐'
      }
    ]
  },
  {
    category: 'Herramientas',
    icon: '🛠️',
    items: [
      {
        title: 'Analytics',
        buscadis: 'Analytics en tiempo real y reportes detallados',
        others: 'Estadísticas básicas',
        icon: '📊'
      },
      {
        title: 'IA',
        buscadis: 'Asistente AI para optimización de anuncios',
        others: 'Sin asistencia inteligente',
        icon: '🤖'
      },
      {
        title: 'Gestión',
        buscadis: 'Panel de control avanzado con múltiples herramientas',
        others: 'Panel de control básico',
        icon: '⚙️'
      }
    ]
  },
  {
    category: 'Soporte',
    icon: '💬',
    items: [
      {
        title: 'Atención',
        buscadis: 'Soporte 24/7 multicanal con tiempo de respuesta garantizado',
        others: 'Soporte por email en horario limitado',
        icon: '📞'
      },
      {
        title: 'Recursos',
        buscadis: 'Guías detalladas, tutoriales y webinars formativos',
        others: 'Documentación básica',
        icon: '📚'
      },
      {
        title: 'Comunidad',
        buscadis: 'Foro activo y comunidad de usuarios colaborativa',
        others: 'Sin comunidad de soporte',
        icon: '👥'
      }
    ]
  }
  ,
  {
    category: 'Precios',
    icon: '💰',
    items: [
      {
        title: 'Comisiones',
        buscadis: 'Comisiones transparentes y competitivas sin costes ocultos',
        others: 'Comisiones variables y cargos adicionales',
        icon: '💎'
      },
      {
        title: 'Planes',
        buscadis: 'Planes flexibles adaptados a cada necesidad',
        others: 'Opciones limitadas de planes',
        icon: '📋'
      },
      {
        title: 'Beneficios',
        buscadis: 'Programa de recompensas y descuentos por fidelidad',
        others: 'Sin programa de beneficios',
        icon: '🎁'
      }
    ]
  }
];

export default function Comparison() {
  const [activeCategory, setActiveCategory] = useState(features[0].category);

  return (
    <section className="py-24 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-0 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            ¿Por qué elegir BuscAdis?
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Descubre por qué somos la opción líder en el mercado de clasificados
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {features.map((feature) => (
            <motion.button
              key={feature.category}
              className={`px-8 py-4 rounded-xl text-lg font-bold transition-all flex items-center gap-2 ${
                activeCategory === feature.category
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
              }`}
              onClick={() => setActiveCategory(feature.category)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-2xl">{feature.icon}</span>
              {feature.category}
            </motion.button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={`buscadis-${activeCategory}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center p-8"
            >
              <div className="text-4xl font-bold text-white mb-6 flex items-center justify-center gap-3">
                <img src="/logo.png" alt="BuscAdis" className="h-10" />
                BuscAdis
              </div>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  {features
                    .find((f) => f.category === activeCategory)
                    ?.items.map((item, index) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className="mb-8 last:mb-0 transform hover:scale-105 transition-transform duration-300"
                      >
                        <div className="flex items-center justify-center mb-3">
                          <span className="text-3xl">{item.icon}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">
                          {item.title}
                        </h3>
                        <p className="text-blue-100 leading-relaxed">{item.buscadis}</p>
                      </motion.div>
                    ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              key={`others-${activeCategory}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center p-8"
            >
              <div className="text-4xl font-bold text-white/60 mb-6">
                Otros
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/5">
                {features
                  .find((f) => f.category === activeCategory)
                  ?.items.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="mb-8 last:mb-0"
                    >
                      <div className="flex items-center justify-center mb-3">
                        <span className="text-3xl opacity-50">{item.icon}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white/60 mb-3">
                        {item.title}
                      </h3>
                      <p className="text-blue-200/60 leading-relaxed">{item.others}</p>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}