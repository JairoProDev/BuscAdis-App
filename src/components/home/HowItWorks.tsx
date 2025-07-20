'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Container from '@/components/shared/Container';

const steps = [
    {
        icon: '✏️',
        title: 'Crea tu anuncio',
        description: 'Publica tu anuncio de forma rápida y sencilla. Agrega fotos, descripción y todos los detalles necesarios.'
    },
    {
        icon: '👀',
        title: 'Haz que te vean',
        description: 'Llega a miles de personas interesadas en lo que ofreces. ¡La visibilidad adecuada hace la diferencia!'
    },
    {
        icon: '💬',
        title: 'Recibe contactos',
        description: 'Recibe mensajes de WhatsApp o correos de personas interesadas directamente a tu información de contacto.'
    },
    {
        icon: '🤝',
        title: 'Concreta negocios',
        description: 'Cierra tratos exitosos y aprovecha todas las oportunidades que Buscadis te ofrece.'
    }
];

export default function HowItWorks() {
    return (
        <section className="py-16 relative overflow-hidden bg-gradient-to-b from-slate-900 via-teal-900/90 to-slate-900">
            {/* Decorative elements */}
            <div className="absolute inset-0 z-0">
                {/* Tech pattern background - Puedes mantenerlo o removerlo */}
                {/* <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" /> */}

                {/* Animated orbs */}
                <div className="absolute top-40 left-20 w-72 h-72 bg-gradient-to-br from-teal-400/10 via-teal-300/5 to-emerald-400/10 rounded-full filter blur-xl opacity-30 animate-blob" />
                <div className="absolute -bottom-20 right-40 w-72 h-72 bg-gradient-to-br from-cyan-400/10 via-white/5 to-teal-500/10 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-2000" />

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

                {/* Floating data points */}
                <div className="absolute inset-0">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                            key={`data-point-${i}-${Date.now()}`}
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

            <Container>
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-white mb-4">¿Cómo funciona?</h2>
                    <p className="text-lg text-cyan-100/90 max-w-2xl mx-auto">
                        Publica un anuncio en minutos y conecta con personas interesadas en lo que ofreces
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={`step-${index}-${step.title.substring(0, 10).replace(/\s+/g, '-')}`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-slate-800/70 backdrop-blur-sm rounded-xl shadow-md p-6 text-center border border-teal-500/10"
                        >
                            <div className="text-4xl mb-4 text-teal-300">{step.icon}</div>
                            <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                            <p className="text-cyan-100/80">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    );
}