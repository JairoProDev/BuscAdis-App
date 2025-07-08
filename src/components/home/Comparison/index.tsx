'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '@/components/shared/Container';
import Image from 'next/image';

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
  },
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
    <section className="min-h-screen py-12 lg:py-16 bg-gradient-to-br from-teal-900 via-slate-900 to-cyan-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-0 right-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
        
        {/* Additional tech elements */}
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-5"></div>
        
        {/* Laser light effects */}
        <div className="absolute h-full w-[1px] left-[15%] bg-gradient-to-b from-transparent via-teal-400/10 to-transparent opacity-70"></div>
        <div className="absolute h-full w-[1px] left-[85%] bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent opacity-70"></div>
        
        {/* Motion grid for tech feel */}
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(teal 1px, transparent 0)",
            backgroundSize: "40px 40px"
          }}
          animate={{
            backgroundPosition: ["0px 0px", "40px 40px"]
          }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: 20,
            ease: "linear"
          }}
        />
      </div>

      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 lg:mb-12 relative"
        >
          {/* Premium badge effect */}
          <motion.div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-12 bg-gradient-to-r from-teal-400/30 via-cyan-400/30 to-teal-400/30 blur-xl rounded-full"
            animate={{
              opacity: [0.4, 0.6],
            }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 3
            }}
          />
          
          <motion.span
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-slate-800 to-slate-700 text-teal-300 text-sm font-medium mb-4 shadow-lg relative border border-teal-500/20 overflow-hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -3 }}
          >
            <span className="relative z-10">Comparativa de funcionalidades</span>
            <span className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/20 to-teal-500/0 rounded-full animate-shimmer"></span>
          </motion.span>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">
            ¿Por qué elegir BuscAdis?
          </h2>
          <p className="text-lg text-teal-100 max-w-3xl mx-auto">
            Descubre por qué somos la opción líder en el mercado de clasificados con tecnología de vanguardia
          </p>
          
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-500 rounded-full mx-auto mt-6 shadow-[0_0_10px_rgba(20,184,166,0.3)]"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 96, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          />
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 lg:gap-4 mb-8 lg:mb-12">
          {features.map((feature, idx) => (
            <motion.button
              key={feature.category}
              className={`px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-base lg:text-lg font-bold transition-all flex items-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.1)] ${
                activeCategory === feature.category
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-cyan-500/30 border border-teal-400/30'
                  : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/10 hover:border-teal-500/20'
              }`}
              onClick={() => setActiveCategory(feature.category)}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 8px 20px rgba(20,184,166,0.2)",
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
            >
              <motion.span 
                className="text-xl"
                animate={activeCategory === feature.category ? {
                  scale: [1, 1.2],
                  rotate: [0, 10, 0, -10, 0],
                } : {}}
                transition={{
                  duration: 0.5,
                  ease: "easeInOut",
                }}
              >
                {feature.icon}
              </motion.span>
              {feature.category}
              
              {/* Laser lines on active button */}
              {activeCategory === feature.category && (
                <motion.div 
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-4/5 bg-gradient-to-r from-teal-400/0 via-cyan-400 to-teal-400/0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={`buscadis-${activeCategory}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              <div className="text-2xl lg:text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                <Image src="/logo.png" alt="BuscAdis" width={32} height={32} className="h-8" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">BuscAdis</span>
              </div>
              <div className="relative group h-full perspective">
                {/* Premium outer glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
                
                {/* Card border animation */}
                <motion.div 
                  className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-teal-500/50 via-cyan-500/50 to-teal-500/50 opacity-30"
                  animate={{
                    background: [
                      'linear-gradient(to right, rgba(20,184,166,0.5), rgba(6,182,212,0.5), rgba(20,184,166,0.5))',
                      'linear-gradient(to right, rgba(6,182,212,0.5), rgba(20,184,166,0.5), rgba(6,182,212,0.5))'
                    ],
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
                
                <div className="relative h-full bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-lg rounded-2xl p-6 border border-teal-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.3)] group-hover:shadow-[0_20px_50px_rgba(20,184,166,0.2)] transition-all duration-500">
                  {/* Diamond reflections */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/10 via-teal-300/5 to-transparent transform rotate-45 translate-x-5 -translate-y-5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  
                  {features
                    .find((f) => f.category === activeCategory)
                    ?.items.map((item, index) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="mb-6 last:mb-0 transform hover:translate-x-1 hover:scale-[1.02] transition-all duration-300 bg-gradient-to-r from-transparent to-teal-900/30 hover:to-teal-900/50 p-3 rounded-lg border-l-2 border-teal-500/30"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <motion.span 
                            className="text-2xl p-2 bg-gradient-to-br from-teal-900/60 to-slate-900/60 rounded-full shadow-inner border border-teal-500/20"
                            whileHover={{ 
                              rotate: [0, -10, 10, -10, 0],
                              scale: 1.1
                            }}
                            transition={{ duration: 0.5 }}
                          >
                            {item.icon}
                          </motion.span>
                          <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-teal-200">{item.title}</h3>
                        </div>
                        <p className="text-teal-100 text-sm lg:text-base leading-relaxed pl-11">{item.buscadis}</p>
                      </motion.div>
                    ))}
                  
                  {/* Bottom glow */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent"></div>
                </div>
              </div>
            </motion.div>

            <motion.div
              key={`others-${activeCategory}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              <div className="text-2xl lg:text-3xl font-bold text-white/60 mb-4 flex justify-center">
                <span className="opacity-60">Otros</span>
              </div>
              <div className="h-full bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/5 shadow-[0_5px_15px_rgba(0,0,0,0.2)]">
                {features
                  .find((f) => f.category === activeCategory)
                  ?.items.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="mb-6 last:mb-0 p-3 border-l border-white/10"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl opacity-50 p-2">{item.icon}</span>
                        <h3 className="text-lg font-bold text-white/60">{item.title}</h3>
                      </div>
                      <p className="text-cyan-200/60 text-sm lg:text-base leading-relaxed pl-11">{item.others}</p>
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