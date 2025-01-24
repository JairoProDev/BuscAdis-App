'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  const itemsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 3
  };
  const maxIndex = testimonials.length - itemsPerView.desktop;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => 
        current >= maxIndex ? 0 : current + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [maxIndex]);

  const handlePrev = () => {
    setActiveIndex((current) => Math.max(current - 1, 0));
  };

  const handleNext = () => {
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
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="text-lg md:text-xl text-blue-100">
            Miles de personas confían en BuscAdis para sus necesidades
          </p>
        </motion.div>

        <div className="relative">
          <button 
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white p-2 rounded-full shadow-lg hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={activeIndex === 0}
            aria-label="Anterior testimonio"
          >
            <svg className="w-6 h-6 text-primary-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button 
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white p-2 rounded-full shadow-lg hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={activeIndex === maxIndex}
            aria-label="Siguiente testimonio"
          >
            <svg className="w-6 h-6 text-primary-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="overflow-hidden mx-8">
            <motion.div
              className="flex gap-4"
              animate={{ x: `-${activeIndex * (100 / itemsPerView.desktop)}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {testimonials.map((testimonial) => (
                <motion.div
                  key={testimonial.id}
                  className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary-100 flex items-center justify-center text-base md:text-lg">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-base md:text-lg font-semibold text-primary-900">
                          {testimonial.name}
                        </h3>
                        <p className="text-xs md:text-sm text-primary-600">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-primary-700 mb-4">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div className="flex text-yellow-400 text-xs md:text-sm">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i}>⭐</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="flex justify-center mt-6 space-x-2">
            {[...Array(maxIndex + 1)].map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === activeIndex ? 'bg-white' : 'bg-white/30'
                }`}
                aria-label={`Ver testimonio ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
