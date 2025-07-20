'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Container from '@/components/shared/Container';
import { SparklesIcon, StarIcon } from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

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
    <section className="py-20 bg-gradient-to-b from-slate-900 via-teal-900/30 to-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 z-0">
        {/* Tech grid pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('/patterns/grid.svg')]"></div>
        
        {/* Animated orbs */}
        <div className="absolute top-40 -left-20 w-80 h-80 bg-gradient-to-br from-teal-400/10 via-teal-300/5 to-emerald-400/10 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-1000" />
        <div className="absolute bottom-40 -right-20 w-80 h-80 bg-gradient-to-br from-cyan-400/10 via-cyan-300/5 to-teal-400/10 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-4000" />
        
        {/* Laser light effects */}
        <motion.div 
          className="absolute h-full w-[1px] left-1/4 bg-gradient-to-b from-transparent via-teal-400/10 to-transparent opacity-50"
          animate={{ 
            opacity: [0.2, 0.5],
            height: ['70%', '90%']
          }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div 
          className="absolute h-full w-[1px] left-3/4 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent opacity-50"
          animate={{ 
            opacity: [0.2, 0.5],
            height: ['80%', '100%']
          }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "reverse", delay: 2 }}
        />
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map(() => (
            <motion.div
              key={`particle-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`}
              className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
              initial={{ 
                x: `${Math.random() * 100}%`, 
                y: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.3
              }}
              animate={{ 
                y: ['0%', '100%'],
                opacity: [0.3, 0.7]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: Math.random() * 10 + 15,
                ease: 'linear',
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>
      </div>

      <Container className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Premium badge */}
          <motion.div
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-slate-800 to-slate-700 text-teal-300 text-sm font-medium mb-6 shadow-lg border border-teal-500/20 overflow-hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -3, boxShadow: "0 0 20px rgba(20,184,166,0.3)" }}
          >
            <SparklesIcon className="h-4 w-4 mr-1.5 text-cyan-300" />
            <span className="relative z-10">Experiencias Verificadas</span>
            <span className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/20 to-teal-500/0 rounded-full animate-shimmer"></span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-100 to-white">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="text-lg md:text-xl text-cyan-100/90 max-w-2xl mx-auto">
            Miles de personas confían en BuscAdis para impulsar sus negocios y encontrar oportunidades
          </p>
        </motion.div>

        <div className="relative">
          <button 
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-3 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group bg-gradient-to-br from-slate-800 to-slate-900 border border-teal-500/20 hover:border-teal-500/40 transition-all duration-300"
            disabled={activeIndex === 0}
            aria-label="Anterior testimonio"
          >
            <ChevronLeftIcon className="w-5 h-5 text-teal-400 group-hover:text-cyan-300 transition-colors" />
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/10 to-teal-500/0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>

          <button 
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-3 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group bg-gradient-to-br from-slate-800 to-slate-900 border border-teal-500/20 hover:border-teal-500/40 transition-all duration-300"
            disabled={activeIndex === maxIndex}
            aria-label="Siguiente testimonio"
          >
            <ChevronRightIcon className="w-5 h-5 text-teal-400 group-hover:text-cyan-300 transition-colors" />
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/10 to-teal-500/0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>

          <div className="overflow-hidden mx-8">
            <motion.div
              className="flex gap-6"
              animate={{ x: `-${activeIndex * (100 / itemsPerView.desktop)}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {testimonials.map((testimonial) => (
                <motion.div
                  key={`testimonial-${testimonial.id || testimonial.name.substring(0, 20).replace(/\s+/g, '-').toLowerCase()}`}
                  className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <div className="relative group">
                    {/* Card glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/30 to-cyan-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Testimonial card */}
                    <div className="relative h-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-xl p-6 border border-teal-500/20 group-hover:border-teal-400/40 shadow-xl transition-all duration-300 overflow-hidden">
                      {/* Premium corner */}
                      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                        <div className="absolute rotate-45 bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-900 font-bold text-xs py-1 right-[-40px] top-[12px] w-[110px] text-center shadow-md">PREMIUM</div>
                      </div>
                      
                      {/* Holographic lines */}
                      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
                      
                      {/* Content */}
                      <div className="flex items-center mb-4">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-teal-400 to-cyan-500 p-[2px]">
                          <div className="absolute inset-0 rounded-full overflow-hidden">
                            {testimonial.image ? (
                              <Image 
                                src={testimonial.image} 
                                alt={testimonial.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center">
                                <UserCircleIcon className="w-6 h-6 text-teal-300" />
                              </div>
                            )}
                          </div>
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400/0 via-teal-400/80 to-teal-400/0 opacity-0 group-hover:opacity-60 animate-shimmer"></div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-teal-100">
                            {testimonial.name}
                          </h3>
                          <p className="text-sm text-teal-300/80">{testimonial.role}</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-cyan-100/80 mb-5 leading-relaxed">
                        &ldquo;{testimonial.content}&rdquo;
                      </p>
                      
                      <div className="flex text-cyan-300">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon 
                            key={`star-${testimonial.id}-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`} 
                            className={`w-4 h-4 ${i < testimonial.rating ? 'text-teal-400' : 'text-slate-700'}`}
                          />
                        ))}
                        <span className="ml-2 text-xs text-teal-300/70">Verificado</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="flex justify-center mt-10 space-x-3">
            {[...Array(maxIndex + 1)].map((_, index) => (
              <button
                key={`indicator-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`}
                onClick={() => setActiveIndex(index)}
                className="group"
                aria-label={`Ver testimonio ${index + 1}`}
              >
                <div className={`w-3 h-3 rounded-full transition-all duration-300 border ${
                  index === activeIndex 
                    ? 'bg-gradient-to-r from-teal-400 to-cyan-400 border-transparent transform scale-125' 
                    : 'bg-transparent border-teal-500/40 group-hover:border-teal-400'
                }`}>
                  <div className={`absolute inset-0 rounded-full blur-sm bg-teal-400/50 opacity-0 ${
                    index === activeIndex ? 'opacity-60' : ''
                  }`}></div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
