'use client'

import { motion } from 'framer-motion';
import Link from 'next/link';
import Container from '@/components/shared/Container';
import { SparklesIcon, RocketLaunchIcon, ArrowRightIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function CallToAction() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 via-teal-900/90 to-slate-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        {/* Tech pattern background */}
        <div className="absolute inset-0 opacity-5 bg-[url('/patterns/grid.svg')]"></div>
        
        {/* Background image with overlay */}
        <div className="absolute inset-0 opacity-15">
          <Image 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072" 
            alt="Technology background"
            fill
            className="object-cover"
            quality={80}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/80 via-slate-900/80 to-cyan-900/80"></div>
        </div>
        
        {/* Animated orbs */}
        <div className="absolute top-40 left-20 w-80 h-80 bg-gradient-to-br from-teal-400/10 via-teal-300/5 to-emerald-400/10 rounded-full filter blur-xl opacity-30 animate-blob" />
        <div className="absolute -bottom-20 right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/10 via-white/5 to-teal-500/10 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-2000" />
        
        {/* Laser light effects */}
        <div className="absolute h-full w-[1px] left-[15%] bg-gradient-to-b from-transparent via-teal-400/10 to-transparent opacity-50"></div>
        <div className="absolute h-full w-[1px] left-[85%] bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent opacity-50"></div>
        
        {/* Animated shimmer line */}
        <motion.div 
          className="absolute top-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/40 to-transparent"
          animate={{
            background: [
              'linear-gradient(to right, rgba(0,0,0,0), rgba(20,184,166,0.4), rgba(0,0,0,0))',
              'linear-gradient(to right, rgba(20,184,166,0.4), rgba(0,0,0,0), rgba(20,184,166,0.4))'
            ],
            x: ['0%', '100%']
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={`particle-${i}-${Math.random().toString(36).substr(2, 9)}`}
              className="absolute w-1 h-1 bg-teal-400/40 rounded-full"
              initial={{
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.3
              }}
              animate={{
                y: ['0%', '100%'],
                opacity: [0.3, 0.8]
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
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center relative"
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
            
            {/* Title badge */}
            <motion.div
              className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-slate-800 to-slate-700 text-teal-300 text-sm font-medium mb-4 shadow-lg relative border border-teal-500/20 overflow-hidden"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -3, boxShadow: "0 0 20px rgba(20,184,166,0.3)" }}
            >
              <SparklesIcon className="h-4 w-4 mr-1.5 text-cyan-300" />
              <span className="relative z-10">¡Comienza hoy mismo!</span>
              <span className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/20 to-teal-500/0 rounded-full animate-shimmer"></span>
            </motion.div>
            
            <motion.h2 
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 perspective"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-100 to-white">¿Listo para</span>
              <motion.span
                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300 mt-2"
                animate={{ 
                  textShadow: [
                    "0 0 5px rgba(20,184,166,0.3)", 
                    "0 0 20px rgba(20,184,166,0.5)", 
                    "0 0 5px rgba(20,184,166,0.3)"
                  ] 
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                transformar tu negocio?
              </motion.span>
            </motion.h2>
            
            <motion.p 
              className="text-xl md:text-2xl text-cyan-100/90 mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Únete a la plataforma revolucionaria impulsada por IA que está cambiando el mercado de clasificados en Cusco
            </motion.p>
            
            {/* Stats and highlights */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              {[
                { label: 'Usuarios activos', value: '15,000+', icon: <ArrowTrendingUpIcon className="h-5 w-5 text-teal-300" /> },
                { label: 'Transacciones', value: '24,500+', icon: <SparklesIcon className="h-5 w-5 text-cyan-300" /> },
                { label: 'Satisfacción', value: '98%', icon: <SparklesIcon className="h-5 w-5 text-teal-300" /> },
                { label: 'Tiempo promedio', value: '2 días', icon: <ArrowTrendingUpIcon className="h-5 w-5 text-cyan-300" /> },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  className="relative group"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  {/* Glow effect */}
                  <div className="absolute -inset-2 rounded-lg bg-gradient-to-r from-teal-500/20 to-cyan-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Stats card */}
                  <div className="relative rounded-lg bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-teal-500/20 p-4 shadow-xl group-hover:border-teal-500/40 transition-all duration-300 h-[90px] flex flex-col justify-center">
                    <div className="flex items-center mb-1 justify-center md:justify-start">
                      {stat.icon}
                      <span className="ml-1.5 text-xs text-teal-200/70">{stat.label}</span>
                    </div>
                    <div className="text-center md:text-left">
                      <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-200">{stat.value}</span>
                    </div>
                    
                    {/* Shine effect */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-lg">
                      <div className="absolute top-0 left-0 w-1/2 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="perspective relative group"
                whileHover={{ scale: 1.03, z: 10 }}
              >
                {/* Premium glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-all duration-300"></div>
                
                <Link
                  href="/publicar"
                  className="inline-flex items-center justify-center px-8 py-5 w-full text-lg font-bold text-slate-900 bg-gradient-to-r from-teal-300 to-cyan-300 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(20,184,166,0.5)] transform transition-all duration-300 relative overflow-hidden group-hover:from-teal-200 group-hover:to-cyan-200"
                >
                  {/* Button content */}
                  <div className="relative z-10 flex items-center">
                    <RocketLaunchIcon className="w-6 h-6 mr-2" />
                    <span>Publicar mi Anuncio</span>
                  </div>
                  
                  {/* Premium shimmer effect */}
                  <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/0 via-white/70 to-white/0 transform -skew-x-30 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></span>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                className="perspective relative group"
                whileHover={{ scale: 1.03, z: 10 }}
              >
                {/* Secondary button glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/40 to-teal-500/40 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all duration-300"></div>
                
                <Link
                  href="/buscar"
                  className="inline-flex items-center justify-center px-8 py-5 w-full text-lg font-bold text-white bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(20,184,166,0.3)] border border-teal-500/20 hover:border-teal-500/40 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Button content */}
                  <div className="relative z-10 flex items-center">
                    <span>Explorar Anuncios</span>
                    <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                  
                  {/* Subtle shimmer effect */}
                  <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-teal-500/0 via-teal-500/10 to-teal-500/0 transform -skew-x-30 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></span>
                </Link>
              </motion.div>
            </div>
            
            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.3 }}
              className="mt-12 relative"
            >
              {/* Trust badge */}
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-gradient-to-r from-slate-800 to-slate-900 rounded-full border border-teal-500/20 shadow-[0_0_10px_rgba(20,184,166,0.1)]">
                  <SparklesIcon className="h-5 w-5 text-teal-300" />
                </div>
                <div className="h-px w-12 bg-gradient-to-r from-transparent via-teal-500/40 to-transparent mx-2"></div>
                <div className="p-2 bg-gradient-to-r from-slate-800 to-slate-900 rounded-full border border-teal-500/20 shadow-[0_0_10px_rgba(20,184,166,0.1)]">
                  <SparklesIcon className="h-5 w-5 text-cyan-300" />
                </div>
                <div className="h-px w-12 bg-gradient-to-r from-transparent via-teal-500/40 to-transparent mx-2"></div>
                <div className="p-2 bg-gradient-to-r from-slate-800 to-slate-900 rounded-full border border-teal-500/20 shadow-[0_0_10px_rgba(20,184,166,0.1)]">
                  <SparklesIcon className="h-5 w-5 text-teal-300" />
                </div>
              </div>
              
              <p className="text-cyan-100/80 flex flex-col sm:flex-row items-center justify-center gap-1">
                <span>Tecnología de vanguardia</span>
                <span className="hidden sm:inline mx-2">•</span>
                <span>Seguridad garantizada</span>
                <span className="hidden sm:inline mx-2">•</span>
                <span>Soporte 24/7</span>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </Container>
      
      {/* Bottom lighting effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent"></div>
    </section>
  );
} 