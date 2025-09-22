'use client'

import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import Container from '@/components/shared/Container';
import CountUp from 'react-countup';
import { UserGroupIcon, ShoppingBagIcon, ChatBubbleBottomCenterTextIcon, SparklesIcon } from '@heroicons/react/24/outline';

const stats = [
    {
        value: 10000,
        label: 'Usuarios activos',
        suffix: '+',
        duration: 2.5,
        icon: <UserGroupIcon className="w-6 h-6 text-teal-300" />,
        gradient: 'from-teal-500 to-emerald-400'
    },
    {
        value: 5000,
        label: 'Adisos publicados',
        suffix: '+',
        duration: 2.5,
        icon: <ShoppingBagIcon className="w-6 h-6 text-cyan-300" />,
        gradient: 'from-cyan-500 to-teal-400'
    },
    {
        value: 150,
        label: 'Conexiones diarias',
        suffix: '+',
        duration: 2,
        icon: <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-teal-300" />,
        gradient: 'from-teal-500 to-cyan-400'
    },
    {
        value: 98,
        label: 'Satisfacción',
        suffix: '%',
        duration: 2,
        icon: <SparklesIcon className="w-6 h-6 text-cyan-300" />,
        gradient: 'from-cyan-500 to-emerald-400'
    }
];

export default function Stats() {
    const { ref: statsRef, inView } = useInView({
        threshold: 0.3,
        triggerOnce: true
    });

    return (
        <section ref={statsRef} className="py-20 relative overflow-hidden bg-gradient-to-b from-slate-900 via-teal-900/90 to-slate-900">
            {/* Decorative elements */}
            <div className="absolute inset-0">
                {/* Tech pattern background - Puedes mantenerlo o removerlo */}
                {/* <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div> */}

                {/* Animated orbs */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-teal-400/10 via-teal-300/5 to-emerald-400/10 rounded-full filter blur-xl opacity-30 animate-blob" />
                <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-cyan-400/10 via-white/5 to-teal-500/10 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-2000" />

                {/* Tech grid on floor */}
                <div className="absolute bottom-0 left-0 right-0 h-24 perspective-1000">
                    <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-teal-500/5 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/30 to-transparent"></div>
                </div>

                {/* Holographic lines */}
                <motion.div
                    className="absolute top-10 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/40 to-transparent"
                    animate={{
                        opacity: [0.3, 0.6],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 3
                    }}
                />
                <motion.div
                    className="absolute bottom-10 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
                    animate={{
                        opacity: [0.3, 0.6],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 3,
                        delay: 1.5
                    }}
                />

                <motion.div 
                    className="absolute h-full w-[1px] left-1/4 bg-gradient-to-b from-transparent via-teal-400/10 to-transparent opacity-50"
                    animate={{ 
                        opacity: [0.3, 0.6],
                        height: ['70%', '90%']
                    }}
                    transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
                />
                <motion.div 
                    className="absolute h-full w-[1px] left-3/4 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent opacity-50"
                    animate={{ 
                        opacity: [0.3, 0.6],
                        height: ['80%', '100%']
                    }}
                    transition={{ duration: 8, repeat: Infinity, repeatType: "reverse", delay: 2 }}
                />
            </div>

            <Container className="relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16 relative"
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

                        <motion.div
                            className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-slate-800 to-slate-700 text-teal-300 text-sm font-medium mb-6 shadow-lg relative border border-teal-500/20 overflow-hidden"
                            initial={{ opacity: 0, y: -10 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.2 }}
                            whileHover={{ y: -3, boxShadow: "0 0 20px rgba(20,184,166,0.3)" }}
                        >
                            <SparklesIcon className="h-4 w-4 mr-1.5 text-cyan-300" />
                            <span className="relative z-10">Resultados Destacados</span>
                            <span className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/20 to-teal-500/0 rounded-full animate-shimmer"></span>
                        </motion.div>

                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-100 to-white">
                            Números que Hablan
                        </h2>

                        <p className="text-xl text-cyan-100/90 max-w-3xl mx-auto">
                            El impacto real de BuscAdis en números
                        </p>

                        <motion.div
                            className="w-24 h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 rounded-full mx-auto mt-6 shadow-[0_0_10px_rgba(20,184,166,0.3)]"
                            initial={{ width: 0, opacity: 0 }}
                            animate={inView ? { width: 96, opacity: 1 } : {}}
                            transition={{ delay: 0.6, duration: 0.8 }}
                        />
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                className="relative group perspective-1000"
                                whileHover={{
                                    y: -5,
                                    transition: { duration: 0.2 }
                                }}
                            >
                                {/* Glow effect */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/30 to-cyan-500/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                <div className="relative p-8 bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-sm rounded-xl border border-teal-500/20 group-hover:border-teal-400/40 shadow-xl transition-all duration-300 overflow-hidden flex flex-col items-center justify-center">
                                    {/* Holographic lines */}
                                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>

                                    {/* Icon with glow effect */}
                                    <div className="mb-6 relative">
                                        <div className="absolute inset-0 blur-xl rounded-full bg-gradient-to-r from-teal-400/30 to-cyan-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className={`relative p-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full border border-teal-500/20 group-hover:border-teal-400/40 shadow-inner transition-all duration-300`}>
                                            {stat.icon}
                                        </div>
                                    </div>

                                    {/* Counter value with animation */}
                                    <div className="text-4xl md:text-5xl font-bold mb-2 relative">
                                        <div className={`absolute -inset-1 bg-gradient-to-r ${stat.gradient} blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full`}></div>
                                        <div className="relative text-transparent bg-clip-text bg-gradient-to-r from-white to-teal-200">
                                            {inView && (
                                                <CountUp
                                                    end={stat.value}
                                                    duration={stat.duration}
                                                    separator=","
                                                    suffix={stat.suffix}
                                                    delay={index * 0.1}
                                                    useEasing={true}
                                                />
                                            )}
                                        </div>

                                        {/* Animated progress ring */}
                                        <svg className="absolute -inset-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" width="100%" height="100%" viewBox="0 0 100 100">
                                            <motion.circle
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="none"
                                                stroke={`url(#gradient-${index})`}
                                                strokeWidth="0.5"
                                                strokeDasharray="251"
                                                initial={{ strokeDashoffset: 251 }}
                                                animate={inView ? { strokeDashoffset: 0 } : { strokeDashoffset: 251 }}
                                                transition={{ duration: stat.duration, delay: index * 0.1, ease: "easeOut" }}
                                            />
                                            <defs>
                                                <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#14b8a6" />
                                                    <stop offset="100%" stopColor="#06b6d4" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>

                                    <div className="text-cyan-100/90 text-lg font-medium">{stat.label}</div>

                                    {/* Side decoration */}
                                    <div className="absolute top-0 left-0 h-1/3 w-1 bg-gradient-to-b from-teal-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
}