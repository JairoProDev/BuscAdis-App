'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '@/components/shared/Container';

const testimonials = [
  {
    id: 1,
    name: 'Ana García',
    role: 'Vendedora Inmobiliaria',
    image: '/testimonials/ana.jpg',
    content: 'BuscAdis ha revolucionado la forma en que hago negocios. La plataforma es intuitiva y los resultados son increíbles.',
    rating: 5
  },
  {
    id: 2,
    name: 'Carlos Martínez', 
    role: 'Comprador',
    image: '/testimonials/carlos.jpg',
    content: 'Encontré exactamente lo que buscaba en cuestión de minutos. El proceso fue muy sencillo y seguro.',
    rating: 5
  },
  {
    id: 3,
    name: 'Laura Rodríguez',
    role: 'Empresaria',
    image: '/testimonials/laura.jpg',
    content: 'La mejor plataforma para publicar anuncios. El alcance es impresionante y el soporte es excelente.',
    rating: 5
  },
  {
    id: 4,
    name: 'Miguel Ángel',
    role: 'Vendedor Particular',
    image: '/testimonials/miguel.jpg',
    content: 'Vendí mi coche en menos de una semana. La exposición que te da BuscAdis es increíble.',
    rating: 4
  },
  {
    id: 5,
    name: 'Patricia Sanz',
    role: 'Compradora',
    image: '/testimonials/patricia.jpg',
    content: 'Me encanta la facilidad para filtrar y encontrar lo que busco. Los vendedores son muy profesionales.',
    rating: 5
  },
  {
    id: 6,
    name: 'Roberto Núñez',
    role: 'Agente Inmobiliario',
    image: '/testimonials/roberto.jpg',
    content: 'Como agente inmobiliario, BuscAdis se ha convertido en mi mejor herramienta de trabajo.',
    rating: 5
  },
  {
    id: 7,
    name: 'Elena Torres',
    role: 'Emprendedora',
    image: '/testimonials/elena.jpg',
    content: 'El soporte al cliente es excepcional. Siempre están dispuestos a ayudar.',
    rating: 4
  },
  {
    id: 8,
    name: 'David López',
    role: 'Comprador Frecuente',
    image: '/testimonials/david.jpg',
    content: 'He realizado múltiples compras y todas han sido exitosas. La comunidad es muy confiable.',
    rating: 5
  }
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const itemsPerView = 3;
  const maxIndex = testimonials.length - itemsPerView;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlay) {
      interval = setInterval(() => {
        setActiveIndex((current) => 
          current >= maxIndex ? 0 : current + 1
        );
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlay, maxIndex]);

  const handlePrev = () => {
    setIsAutoPlay(false);
    setActiveIndex((current) => Math.max(current - 1, 0));
  };

  const handleNext = () => {
    setIsAutoPlay(false);
    setActiveIndex((current) => Math.min(current + 1, maxIndex));
  };

  return (
    <section className="py-20 bg-primary-800">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="text-xl text-blue-100">
            Miles de personas confían en BuscAdis para sus necesidades
          </p>
        </motion.div>

        <div className="relative">
          <button 
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white p-2 rounded-full shadow-lg hover:bg-primary-50"
            disabled={activeIndex === 0}
          >
            <svg className="w-6 h-6 text-primary-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button 
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white p-2 rounded-full shadow-lg hover:bg-primary-50"
            disabled={activeIndex === maxIndex}
          >
            <svg className="w-6 h-6 text-primary-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="overflow-hidden mx-8">
            <motion.div
              className="flex gap-4"
              animate={{ x: `-${activeIndex * (100 / itemsPerView)}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {testimonials.map((testimonial) => (
                <motion.div
                  key={testimonial.id}
                  className="w-1/3 flex-shrink-0"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="bg-white rounded-xl p-6 shadow-lg h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-lg">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-primary-900">
                          {testimonial.name}
                        </h3>
                        <p className="text-sm text-primary-600">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-sm text-primary-700 mb-4">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div className="flex text-yellow-400 text-sm">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i}>⭐</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="flex justify-center items-center mt-8 space-x-4">
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isAutoPlay ? 'bg-white text-primary-900' : 'bg-primary-700 text-white'
              }`}
            >
              {isAutoPlay ? 'Pausar' : 'Reproducir'}
            </button>
            <div className="flex space-x-2">
              {[...Array(maxIndex + 1)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlay(false);
                    setActiveIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === activeIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                  aria-label={`Ver testimonio ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
