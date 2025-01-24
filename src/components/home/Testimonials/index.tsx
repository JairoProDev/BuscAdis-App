'use client'

import { useState } from 'react';
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
  }
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

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
          <div className="overflow-hidden">
            <motion.div
              className="flex"
              animate={{ x: `-${activeIndex * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="w-full flex-shrink-0 px-4"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-2xl p-8 shadow-xl"
                  >
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-2xl">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-semibold text-primary-900">
                          {testimonial.name}
                        </h3>
                        <p className="text-primary-600">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-lg text-primary-700 mb-6">
                      "{testimonial.content}"
                    </p>
                    <div className="flex text-yellow-400 text-xl">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i}>⭐</span>
                      ))}
                    </div>
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
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
