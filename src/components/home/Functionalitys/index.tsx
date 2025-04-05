'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import Container from '@/components/shared/Container';
import { RocketLaunchIcon, ShieldCheckIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { ArrowTopRightOnSquareIcon, BoltIcon, ChartBarIcon, ClockIcon, LockClosedIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const functionalitys = [
    {
        id: 'alcance',
        title: 'Mayor Alcance',
        description: 'Llega a millones de usuarios activos en todo Perú',
        stats: [
            { value: '5M+', label: 'Visitas mensuales' },
            { value: '200k+', label: 'Búsquedas diarias' }
        ],
        icon: <RocketLaunchIcon className="w-8 h-8 text-teal-400" />,
        features: [
            'Posicionamiento SEO optimizado',
            'Compartir en redes sociales',
            'Promoción destacada'
        ],
        featureIcons: [
            <ChartBarIcon key="seo" className="w-5 h-5" />,
            <ArrowTopRightOnSquareIcon key="social" className="w-5 h-5" />,
            <SparklesIcon key="promo" className="w-5 h-5" />
        ],
        gradient: 'from-teal-900 to-emerald-900'
    },
    {
        id: 'seguridad',
        title: 'Máxima Seguridad',
        description: 'Sistema avanzado de verificación y protección',
        stats: [
            { value: '100%', label: 'Transacciones seguras' },
            { value: '0%', label: 'Fraudes reportados' }
        ],
        icon: <ShieldCheckIcon className="w-8 h-8 text-cyan-400" />,
        features: [
            'Verificación de identidad',
            'Chat seguro integrado',
            'Sistema anti-fraude'
        ],
        featureIcons: [
            <UserGroupIcon key="verify" className="w-5 h-5" />,
            <LockClosedIcon key="chat" className="w-5 h-5" />,
            <ShieldCheckIcon key="antifraud" className="w-5 h-5" />
        ],
        gradient: 'from-cyan-900 to-teal-900'
    },
    {
        id: 'facilidad',
        title: 'Súper Fácil',
        description: 'Publica tu anuncio en menos de 2 minutos',
        stats: [
            { value: '2min', label: 'Tiempo promedio' },
            { value: '96%', label: 'Tasa de éxito' }
        ],
        icon: <BoltIcon className="w-8 h-8 text-teal-400" />,
        features: [
            'Asistente inteligente',
            'Templates optimizados',
            'Auto-completado'
        ],
        featureIcons: [
            <SparklesIcon key="ai" className="w-5 h-5" />,
            <ClockIcon key="template" className="w-5 h-5" />,
            <BoltIcon key="autocomplete" className="w-5 h-5" />
        ],
        gradient: 'from-teal-900 to-cyan-900'
    }
];

export default function Functionalitys() {
    const [activeId, setActiveId] = useState(functionalitys[0].id);

    return (
        <section className="py-24 bg-gradient-to-b from-slate-900 via-teal-900/90 to-slate-900 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0">
                {/* Patrones de circuito tecnológico - Puedes mantenerlo o removerlo */}
                {/* <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" /> */}

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
                            key={i}
                            className="absolute w-1 h-1 bg-teal-400/40 rounded-full"
                            initial={{
                                x: `${Math.random() * 100}%`,
                                y: `${Math.random() * 100}%`,
                                opacity: Math.random() * 0.5 + 0.3
                            }}
                            animate={{
                                y: ['0%', '100%'],
                                opacity: [0.3, 0.8, 0.3]
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
                    className="text-center mb-16 relative"
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

                    <motion.div
                        className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-slate-800 to-slate-700 text-teal-300 text-sm font-medium mb-6 shadow-lg relative border border-teal-500/20 overflow-hidden"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ y: -3, boxShadow: "0 0 20px rgba(20,184,166,0.3)" }}
                    >
                        <SparklesIcon className="h-4 w-4 mr-1.5 text-cyan-300" />
                        <span className="relative z-10">Tecnología de vanguardia</span>
                        <span className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/20 to-teal-500/0 rounded-full animate-shimmer"></span>
                    </motion.div>

                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-100 to-white">
                        La plataforma más completa
                    </h2>

                    <p className="text-xl text-cyan-100/90 max-w-3xl mx-auto">
                        Descubre por qué miles de usuarios eligen BuscAdis para sus anuncios clasificados
                    </p>

                    <motion.div
                        className="w-24 h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 rounded-full mx-auto mt-6 shadow-[0_0_10px_rgba(20,184,166,0.3)]"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 96, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                    />
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {functionalitys.map((functionality, idx) => (
                        <motion.div
                            key={functionality.id}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: idx * 0.2 }}
                            className={`relative group perspective-1000 ${activeId === functionality.id ? 'z-10' : 'z-0'}`}
                            onClick={() => setActiveId(functionality.id)}
                        >
                            {/* Glow effect on hover/active */}
                            <div className={`absolute -inset-1 bg-gradient-to-r from-teal-500/30 to-cyan-500/30 rounded-xl blur opacity-0 ${
                                activeId === functionality.id ? 'opacity-70' : 'group-hover:opacity-40'
                            } transition-opacity duration-300`}></div>

                            <motion.div
                                className={`relative overflow-hidden rounded-xl ${
                                    activeId === functionality.id
                                        ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-teal-400/40'
                                        : 'bg-gradient-to-br from-slate-800/40 to-slate-900/60 border-teal-500/20 group-hover:border-teal-500/30'
                                } cursor-pointer backdrop-blur-sm border shadow-xl transition-all duration-300 p-8 h-full`}
                                layout
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            >
                                {/* Holographic lines */}
                                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>

                                {/* Premium corner for each functionality */}
                                <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
                                    <div className={`absolute rotate-45 bg-gradient-to-r ${functionality.gradient} text-white font-bold text-[9px] py-1 right-[-35px] top-[8px] w-[100px] text-center shadow-md opacity-80`}>PREMIUM</div>
                                </div>

                                {/* Icon with glow */}
                                <div className="mb-6 relative inline-block">
                                    <div className="absolute inset-0 bg-gradient-to-r from-teal-400/30 to-cyan-400/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className={`relative p-4 bg-gradient-to-br ${
                                        activeId === functionality.id ? functionality.gradient : 'from-slate-800 to-slate-900'
                                    } rounded-2xl shadow-inner border ${
                                        activeId === functionality.id ? 'border-teal-400/40' : 'border-teal-500/20 group-hover:border-teal-500/30'
                                    } transition-all duration-300`}>
                                        {functionality.icon}
                                    </div>
                                </div>

                                <h3 className={`text-2xl font-bold mb-4 ${
                                    activeId === functionality.id
                                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-teal-100'
                                        : 'text-white group-hover:text-teal-100'
                                } transition-colors duration-300`}>
                                    {functionality.title}
                                </h3>

                                <p className={`mb-6 ${
                                    activeId === functionality.id ? 'text-cyan-100/90' : 'text-cyan-100/70'
                                } leading-relaxed transition-colors duration-300`}>
                                    {functionality.description}
                                </p>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    {functionality.stats.map((stat, index) => (
                                        <motion.div
                                            key={index}
                                            className={`text-center p-3 ${
                                                activeId === functionality.id
                                                    ? 'bg-gradient-to-br from-slate-800 to-slate-900/90'
                                                    : 'bg-slate-900/30'
                                            } rounded-lg border ${
                                                activeId === functionality.id ? 'border-teal-500/30' : 'border-teal-500/10'
                                            } transition-all duration-300 group-hover:border-teal-500/20`}
                                            whileHover={{ y: -3 }}
                                        >
                                            <div className={`text-2xl font-bold mb-1 ${
                                                activeId === functionality.id
                                                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300'
                                                    : 'text-white'
                                            } transition-colors duration-300`}>
                                                {stat.value}
                                            </div>
                                            <div className="text-sm text-cyan-100/70">
                                                {stat.label}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <ul className={`space-y-4`}>
                                    {functionality.features.map((feature, index) => (
                                        <motion.li
                                            key={index}
                                            initial={false}
                                            animate={{
                                                opacity: activeId === functionality.id ? 1 : 0.7,
                                                x: activeId === functionality.id ? 0 : -10
                                            }}
                                            className={`flex items-center ${
                                                activeId === functionality.id ? 'text-cyan-100' : 'text-cyan-100/70'
                                            } transition-colors duration-300 group/item`}
                                        >
                                            <div className={`flex-shrink-0 mr-3 p-1.5 rounded-full ${
                                                activeId === functionality.id
                                                    ? 'bg-gradient-to-br from-teal-500/20 to-cyan-500/20'
                                                    : 'bg-teal-500/10'
                                            } transition-colors duration-300`}>
                                                {functionality.featureIcons[index] ||
                                                    <SparklesIcon className="w-4 h-4 text-teal-400" />}
                                            </div>
                                            <span className="group-hover/item:text-white transition-colors duration-300">{feature}</span>
                                        </motion.li>
                                    ))}
                                </ul>

                                {/* Bottom sheen effect */}
                                <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-teal-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    );
}