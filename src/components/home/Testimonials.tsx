import { useState } from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "Encontré el departamento perfecto en solo dos días. La comunicación directa por WhatsApp hizo todo más fácil y rápido.",
    author: "María López",
    location: "Lima",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg"
  },
  {
    quote: "Vendí mi auto en menos de una semana y a un buen precio. Definitivamente volveré a usar Buscadis para mis anuncios.",
    author: "Carlos Mendoza",
    location: "Arequipa",
    avatar: "https://randomuser.me/api/portraits/men/46.jpg"
  },
  {
    quote: "Conseguí un trabajo de manera rápida gracias a la visibilidad que me dio publicar mi perfil en Buscadis.",
    author: "Ana Rodríguez",
    location: "Trujillo",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg"
  },
  {
    quote: "La plataforma es muy intuitiva y fácil de usar. Publiqué mi anuncio en minutos y recibí respuestas el mismo día.",
    author: "Roberto Santana",
    location: "Cusco",
    avatar: "https://randomuser.me/api/portraits/men/29.jpg"
  }
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-16 bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Lo que dicen nuestros usuarios</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Miles de personas confían en Buscadis para publicar y encontrar oportunidades
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden bg-primary-600 text-white rounded-2xl shadow-xl">
            <div 
              className="transition-transform duration-500 ease-in-out flex"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="min-w-full p-8 md:p-12">
                  <div className="text-2xl md:text-3xl font-light italic mb-8">
                    "{testimonial.quote}"
                  </div>
                  <div className="flex items-center">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.author} 
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-bold">{testimonial.author}</div>
                      <div className="text-primary-200">{testimonial.location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={prevTestimonial} 
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
              aria-label="Testimonio anterior"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button 
              onClick={nextTestimonial} 
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
              aria-label="Testimonio siguiente"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex justify-center mt-6 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === activeIndex ? 'bg-primary-600' : 'bg-gray-300'
                }`}
                aria-label={`Ir al testimonio ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


