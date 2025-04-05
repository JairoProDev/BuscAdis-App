'use client'

import { motion } from 'framer-motion';
import Container from '@/components/shared/Container';
import Image from 'next/image';
import { SparklesIcon, ShieldCheckIcon, UserGroupIcon, ChartBarIcon } from '@heroicons/react/24/outline';

// Aumentamos el número de características para mostrar más información
const features = [
  {
    title: 'Inteligencia Artificial',
    description: 'Utilizamos algoritmos avanzados de IA para optimizar tus anuncios y conectarte con compradores ideales',
    icon: <SparklesIcon className="w-10 h-10 text-teal-400 group-hover:text-teal-300 transition-colors duration-300" />,
    color: 'from-teal-900 to-emerald-900'
  },
  {
    title: 'Verificación Premium',
    description: 'Todos nuestros anuncios pasan por un riguroso proceso de verificación para garantizar la máxima calidad',
    icon: <ShieldCheckIcon className="w-10 h-10 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300" />,
    color: 'from-cyan-900 to-teal-900'
  },
  {
    title: 'Conexiones Efectivas',
    description: 'Nuestro sistema de matching conecta de manera inteligente a compradores y vendedores para maximizar resultados',
    icon: <UserGroupIcon className="w-10 h-10 text-teal-400 group-hover:text-teal-300 transition-colors duration-300" />,
    color: 'from-teal-900 to-cyan-900'
  },
  {
    title: 'Analytics Avanzados',
    description: 'Obtén métricas detalladas y análisis en tiempo real del rendimiento de tus anuncios',
    icon: <ChartBarIcon className="w-10 h-10 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300" />,
    color: 'from-cyan-900 to-teal-900'
  }
];

export default function Features() {
  return (
    <section className="py-16 bg-gradient-to-br from-slate-900 via-teal-900/80 to-slate-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 z-0">
        {/* Tech pattern background */}
        <div className="absolute inset-0 opacity-5 bg-[url('/patterns/circuit.svg')]"></div>
        
        {/* Background image with overlay */}
        <div className="absolute inset-0 opacity-20">
          <Image 
            src="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069" 
            alt="Technology background"
            fill
            className="object-cover"
            quality={80}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/70 via-slate-900/80 to-cyan-900/70"></div>
        </div>
        
        {/* Animated orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-teal-400/10 via-teal-300/5 to-emerald-400/10 rounded-full filter blur-xl opacity-30 animate-blob" />
        <div className="absolute -bottom-8 right-20 w-72 h-72 bg-gradient-to-br from-cyan-400/10 via-white/5 to-teal-500/10 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-2000" />
        
        {/* Laser light effects */}
        <div className="absolute h-full w-[1px] left-[20%] bg-gradient-to-b from-transparent via-teal-400/10 to-transparent opacity-50"></div>
        <div className="absolute h-full w-[1px] left-[80%] bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent opacity-50"></div>
      </div>

      <Container className="relative z-10">
        <motion.div
          className="text-center mb-16 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Premium badge effect */}
          <motion.div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-12 bg-gradient-to-r from-teal-400/30 via-cyan-400/30 to-teal-400/30 blur-xl rounded-full"
            animate={{
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              repeat: Infinity,
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
            <SparklesIcon className="h-4 w-4 mr-1.5 text-cyan-300" />
            <span className="relative z-10">Tecnología de vanguardia</span>
            <span className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/20 to-teal-500/0 rounded-full animate-shimmer"></span>
          </motion.span>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-300">
            Plataforma para tu Éxito en Cusco
          </h2>
          
          <p className="text-lg text-cyan-100 max-w-3xl mx-auto">
            Aprovecha el potencial de nuestra tecnología avanzada para maximizar tus oportunidades de negocio
          </p>
          
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 rounded-full mx-auto mt-6 shadow-[0_0_10px_rgba(20,184,166,0.3)]"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 96, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          />
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group relative perspective"
              whileHover={{ 
                z: 10,
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
            >
              {/* Premium outer glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500/50 to-cyan-500/50 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              
              {/* Card with premium styling */}
              <div className={`h-full p-8 bg-gradient-to-br ${feature.color} backdrop-blur-sm rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] border border-teal-500/20 hover:border-teal-400/30 transition-all duration-300 hover:shadow-[0_15px_40px_rgba(20,184,166,0.3)] overflow-hidden`}>
                {/* Icon container with premium effect */}
                <div className="mb-6 relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-cyan-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
                  <div className="relative p-3 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-teal-500/20 shadow-inner group-hover:border-teal-400/30 transition-all duration-300">
                    {feature.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-100 to-white mb-4 group-hover:from-teal-100 group-hover:to-cyan-100 transition-all duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-teal-100/80 text-sm leading-relaxed group-hover:text-teal-100 transition-colors duration-300">
                  {feature.description}
                </p>
                
                {/* Diamond reflections */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/10 via-teal-300/5 to-transparent transform rotate-45 translate-x-5 -translate-y-5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                
                {/* Bottom glow */}
                <div className="absolute bottom-0 left-0 right-0 h-1 w-full bg-gradient-to-r from-transparent via-teal-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Tech illustration */}
        <motion.div 
          className="mt-16 max-w-4xl mx-auto relative perspective"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {/* Premium border effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/50 to-cyan-500/50 rounded-2xl blur opacity-30"></div>
          
          <div className="relative rounded-2xl border border-teal-500/20 overflow-hidden">
            <Image 
              src="https://images.unsplash.com/photo-1581090700227-1e37b190418e?q=80&w=2070" 
              alt="Dashboard de BuscAdis"
              width={1200}
              height={600}
              className="w-full h-auto object-cover rounded-2xl transform hover:scale-105 transition-transform duration-700"
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-tl from-slate-900/70 via-transparent to-slate-900/30"></div>
            
            {/* Premium badge */}
            <div className="absolute top-4 right-4">
              <div className="px-4 py-2 bg-gradient-to-r from-teal-900/80 to-slate-900/80 backdrop-blur-md rounded-full border border-teal-500/30 shadow-lg">
                <span className="text-sm font-medium text-teal-300 flex items-center">
                  <SparklesIcon className="h-4 w-4 mr-1.5" />
                  Potenciado por IA
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
} 