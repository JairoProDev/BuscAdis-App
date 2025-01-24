'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '@/components/shared/Container';

const tools = [
  {
    id: 'analytics',
    title: 'Analytics en Tiempo Real',
    description: 'Monitorea el rendimiento de tus anuncios al instante',
    features: [
      'Visualización de vistas y clics',
      'Análisis de audiencia',
      'Reportes detallados',
      'Métricas de conversión'
    ],
    demo: {
      type: 'chart',
      data: [30, 40, 45, 50, 55, 80, 100]
    }
  },
  {
    id: 'ai',
    title: 'Asistente AI',
    description: 'Optimiza tus anuncios con inteligencia artificial',
    features: [
      'Sugerencias de títulos',
      'Mejora de descripciones',
      'Palabras clave óptimas',
      'Precios recomendados'
    ],
    demo: {
      type: 'chat',
      messages: [
        'Analizando tu anuncio...',
        'Título optimizado ✨',
        'Descripción mejorada 📝',
        '¡Listo para publicar! 🚀'
      ]
    }
  },
  {
    id: 'automation',
    title: 'Automatización',
    description: 'Programa y gestiona tus anuncios automáticamente',
    features: [
      'Publicación programada',
      'Renovación automática',
      'Respuestas predefinidas',
      'Notificaciones inteligentes'
    ],
    demo: {
      type: 'calendar',
      events: ['Publicar', 'Renovar', 'Destacar', 'Actualizar']
    }
  }
];

export default function Tools() {
  const [activeTool, setActiveTool] = useState(tools[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  const renderDemo = (tool) => {
    switch (tool.demo.type) {
      case 'chart':
        return (
          <div className="h-32 flex items-end justify-between gap-2">
            {tool.demo.data.map((value, index) => (
              <motion.div
                key={index}
                className="w-8 bg-primary-500 rounded-t"
                initial={{ height: 0 }}
                animate={{ height: isPlaying ? `${value}%` : 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              />
            ))}
          </div>
        );
      case 'chat':
        return (
          <div className="space-y-3">
            {tool.demo.messages.map((message, index) => (
              <motion.div
                key={index}
                className="bg-primary-100 text-primary-900 p-3 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isPlaying ? 1 : 0, x: isPlaying ? 0 : -20 }}
                transition={{ delay: index * 0.5, duration: 0.3 }}
              >
                {message}
              </motion.div>
            ))}
          </div>
        );
      case 'calendar':
        return (
          <div className="grid grid-cols-2 gap-3">
            {tool.demo.events.map((event, index) => (
              <motion.div
                key={index}
                className="bg-primary-100 text-primary-900 p-3 rounded-lg text-center"
                initial={{ scale: 0 }}
                animate={{ scale: isPlaying ? 1 : 0 }}
                transition={{ delay: index * 0.2, duration: 0.3 }}
              >
                {event}
              </motion.div>
            ))}
          </div>
        );
    }
  };

  return (
    <section className="py-24 bg-primary-900">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Herramientas Poderosas
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Optimiza tus anuncios con nuestras herramientas exclusivas impulsadas por IA
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {tools.map((tool) => (
              <motion.div
                key={tool.id}
                className={`p-6 rounded-xl cursor-pointer transition-all ${
                  activeTool.id === tool.id
                    ? 'bg-white shadow-xl'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
                onClick={() => {
                  setActiveTool(tool);
                  setIsPlaying(false);
                  setTimeout(() => setIsPlaying(true), 100);
                }}
              >
                <h3 className={`text-xl font-bold mb-2 ${
                  activeTool.id === tool.id ? 'text-primary-900' : 'text-white'
                }`}>
                  {tool.title}
                </h3>
                <p className={`mb-4 ${
                  activeTool.id === tool.id ? 'text-primary-700' : 'text-blue-100'
                }`}>
                  {tool.description}
                </p>
                <ul className="grid grid-cols-2 gap-2">
                  {tool.features.map((feature, index) => (
                    <li
                      key={index}
                      className={`flex items-center text-sm ${
                        activeTool.id === tool.id ? 'text-primary-600' : 'text-blue-200'
                      }`}
                    >
                      <svg
                        className="w-4 h-4 mr-2 flex-shrink-0"
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
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="bg-white/5 rounded-2xl p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderDemo(activeTool)}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  );
} 