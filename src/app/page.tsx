'use client'

import { useState } from "react"
import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/components/search/SearchBar";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import Scene3D from "@/components/3d/Scene";

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const { ref: statsRef, inView: statsInView } = useInView()
  const { ref: featuresRef, inView: featuresInView } = useInView()
  const [currentSlide, setCurrentSlide] = useState(0)

  const heroSlides = [
    {
      title: "Busca mejores oportunidades",
      subtitle: "Encuentra todo lo que necesitas en un solo lugar, rápido, fácil y seguro.	",
      bgColor: "from-primary-900/80 via-primary-800/70 to-success-900/60",
    },
    {
      title: "Publica y destaca tu anuncio",
      subtitle: "Llega a miles de compradores calificados",
      bgColor: "from-success-900/80 via-success-800/70 to-primary-900/60",
    },
    {
      title: "Tecnología que impulsa resultados",
      subtitle: "Inteligencia artificial a tu servicio",
      bgColor: "from-accent-900/80 via-accent-800/70 to-primary-900/60",
    }
  ]

  const handleSearch = async (query: string) => {
    console.log('Búsqueda:', query)
    // Aquí implementaremos la lógica de búsqueda
  }

  return (
    <div className="space-y-12 md:space-y-24">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] md:min-h-screen bg-primary-900">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
        </div>

        <div className="relative h-full flex flex-col justify-center pt-16 md:pt-24">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Texto y CTA */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-white space-y-6 md:space-y-8"
              >
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight">
                  Busca mejores oportunidades
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl text-blue-100">
                  Encuentra todo lo que necesitas en un solo lugar
                </p>

                {/* Buscador */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="relative w-full max-w-2xl"
                >
                  <SearchBar onSearch={handleSearch} />
                </motion.div>

                {/* Estadísticas flotantes */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-8 md:mt-12">
                  {[
                    { number: '10K+', label: 'Usuarios' },
                    { number: '5K+', label: 'Anuncios' },
                    { number: '98%', label: 'Satisfacción' },
                    { number: '24/7', label: 'Soporte' }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                      className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 text-center hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <span className="block text-2xl md:text-3xl font-bold mb-1">{stat.number}</span>
                      <span className="text-xs md:text-sm text-primary-100">{stat.label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Escena 3D */}
              <div className="hidden lg:block">
                <Scene3D />
              </div>
            </div>
          </div>
        </div>

        {/* Navegación del slider */}
        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex space-x-4">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 md:w-3 h-2 md:h-3 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Ir a slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Categorías Populares */}
      <section id="categories" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-4xl font-bold text-primary-800 text-center mb-16"
            ref={featuresRef}
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            Explora nuestras categorías
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: 'Inmuebles',
                description: 'Encuentra tu próximo hogar, local, terreno u oficina',
                icon: '🏠',
                stats: ['10K+ propiedades', '500+ agentes', 'Cobertura nacional']
              },
              {
                name: 'Vehículos',
                description: 'Las mejores ofertas en vehículos',
                icon: '🚗',
                stats: ['5K+ vehículos', 'Todas las marcas', 'Financiación disponible']
              },
              {
                name: 'Empleos',
                description: 'Oportunidades laborales personalizadas',
                icon: '💼',
                stats: ['2K+ empleos', 'Empresas top', 'Salarios competitivos']
              },
              {
                name: 'Servicios',
                description: 'Servicios profesionales verificados',
                icon: '🛠️',
                stats: ['8K+ profesionales', 'Reseñas verificadas', 'Garantía de servicio']
              }
            ].map((categoria, index) => (
              <motion.div
                key={categoria.name}
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <Link 
                  href={`/categorias/${categoria.name.toLowerCase()}`}
                  className="block bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="text-5xl mb-6">{categoria.icon}</div>
                  <h3 className="text-2xl font-semibold text-primary-800 mb-4">
                    {categoria.name}
                  </h3>
                  <p className="text-primary-600 mb-6">{categoria.description}</p>
                  <ul className="space-y-2 text-sm text-primary-500">
                    {categoria.stats.map((stat, i) => (
                      <li key={i} className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {stat}
                      </li>
                    ))}
                  </ul>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Por qué BuscAdis */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary-800 text-center mb-12">
            ¿Por qué elegir BuscAdis?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Calidad Premium',
                description: 'Todos nuestros anuncios son verificados y de alta calidad',
                icon: '⭐'
              },
              {
                title: 'Conexiones Efectivas',
                description: 'Conectamos de manera inteligente a compradores y vendedores',
                icon: '🤝'
              },
              {
                title: 'Seguridad Garantizada',
                description: 'Transacciones seguras y protección para todos los usuarios',
                icon: '🔒'
              }
            ].map((feature) => (
              <div key={feature.title} className="text-center p-6 bg-white rounded-xl shadow-md">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-primary-700 mb-4">{feature.title}</h3>
                <p className="text-primary-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-4xl font-bold text-primary-800 text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            ¿Cómo funciona BuscAdis?
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: 1,
                title: 'Busca lo que necesitas',
                description: 'Utiliza nuestro buscador inteligente con filtros avanzados',
                icon: '🔍'
              },
              {
                step: 2,
                title: 'Conecta directamente',
                description: 'Contacta con vendedores verificados de forma segura',
                icon: '🤝'
              },
              {
                step: 3,
                title: 'Concreta el trato',
                description: 'Realiza transacciones seguras con garantía BuscAdis',
                icon: '✨'
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <div className="bg-primary-50 rounded-full w-20 h-20 flex items-center justify-center text-4xl mb-6 mx-auto">
                  {step.icon}
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-800 mb-4">
                    Paso {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-primary-700 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-primary-600">
                    {step.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/4 right-0 transform translate-x-1/2">
                    <svg className="w-12 h-12 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-4xl font-bold text-primary-800 text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Lo que dicen nuestros usuarios
          </motion.h2>

          <div className="relative">
            <div className="overflow-hidden">
              <motion.div
                className="flex"
                animate={{ x: `-${activeTestimonial * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {[
                  {
                    name: "María González",
                    role: "Vendedora Inmobiliaria",
                    text: "BuscAdis ha revolucionado la forma en que hago negocios. La calidad de los leads es excepcional.",
                    image: "/testimonials/maria.jpg"
                  },
                  {
                    name: "Carlos Rodríguez",
                    role: "Comprador",
                    text: "Encontré mi departamento ideal en tiempo récord. El proceso fue simple y seguro.",
                    image: "/testimonials/carlos.jpg"
                  },
                  {
                    name: "Ana Martínez",
                    role: "Reclutadora IT",
                    text: "La mejor plataforma para encontrar talento tecnológico. Los filtros avanzados son geniales.",
                    image: "/testimonials/ana.jpg"
                  }
                ].map((testimonial, index) => (
                  <div
                    key={index}
                    className="w-full flex-shrink-0 px-4"
                  >
                    <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
                      <div className="flex items-center mb-6">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          width={60}
                          height={60}
                          className="rounded-full"
                        />
                        <div className="ml-4">
                          <div className="font-semibold text-primary-800">
                            {testimonial.name}
                          </div>
                          <div className="text-primary-600 text-sm">
                            {testimonial.role}
                          </div>
                        </div>
                      </div>
                      <p className="text-primary-700 italic">"{testimonial.text}"</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="flex justify-center mt-8 gap-2">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    activeTestimonial === index ? 'bg-primary-600' : 'bg-primary-200'
                  }`}
                  aria-label={`Ver testimonio ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section ref={statsRef} className="py-24 bg-primary-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 10000, label: 'Usuarios activos', suffix: '+' },
              { value: 5000, label: 'Anuncios publicados', suffix: '+' },
              { value: 150, label: 'Conexiones diarias', suffix: '+' },
              { value: 98, label: 'Satisfacción', suffix: '%' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  {statsInView && (
                    <CountUp
                      end={stat.value}
                      duration={2.5}
                      separator=","
                      suffix={stat.suffix}
                    />
                  )}
                </div>
                <div className="text-primary-200">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 bg-primary-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              ¿Listo para empezar?
            </h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto">
              Únete a la comunidad líder en clasificados premium y descubre un mundo de oportunidades.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/publicar"
                className="px-8 py-4 bg-white text-primary-600 rounded-lg text-lg font-semibold hover:bg-primary-50 transition"
              >
                Publicar Anuncio
              </Link>
              <Link
                href="/buscar"
                className="px-8 py-4 bg-primary-700 text-white rounded-lg text-lg font-semibold hover:bg-primary-600 transition"
              >
                Explorar Anuncios
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
