'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '@/components/shared/Container';
import { SparklesIcon, BoltIcon, CommandLineIcon } from '@heroicons/react/24/solid';
import {
    ChartBarIcon,
    ChatBubbleLeftRightIcon,
    CalendarDaysIcon,
    Cog6ToothIcon,
    ArrowPathIcon,
    CursorArrowRaysIcon,
    DocumentTextIcon,
    PresentationChartLineIcon,
    ClockIcon,
    BellAlertIcon
} from '@heroicons/react/24/outline';

// Nuevas interfaces para reemplazar 'any'
export interface ChartDemoData {
    type: 'chart';
    data: number[];
    colors: string[];
}

export interface ChatDemoData {
    type: 'chat';
    messages: string[];
}

export interface CalendarDemoData {
    type: 'calendar';
    events: string[];
}

export type DemoData = ChartDemoData | ChatDemoData | CalendarDemoData;

export interface Tool {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    features: string[];
    featureIcons: React.ReactNode[];
    demo: DemoData;
    gradient: string;
}

const tools: Tool[] = [
    {
        id: 'analytics',
        title: 'Analytics en Tiempo Real',
        description: 'Monitorea el rendimiento de tus anuncios al instante',
        icon: <ChartBarIcon className="w-7 h-7 text-teal-400" />,
        features: [
            'Visualización de vistas y clics',
            'Análisis de audiencia',
            'Reportes detallados',
            'Métricas de conversión'
        ],
        featureIcons: [
            <CursorArrowRaysIcon className="w-4 h-4" />,
            <PresentationChartLineIcon className="w-4 h-4" />,
            <DocumentTextIcon className="w-4 h-4" />,
            <ChartBarIcon className="w-4 h-4" />
        ],
        demo: {
            type: 'chart',
            data: [30, 40, 45, 50, 55, 80, 100],
            colors: ['from-teal-500 to-cyan-400', 'from-cyan-500 to-teal-400', 'from-emerald-500 to-teal-400']
        },
        gradient: 'from-teal-900 to-emerald-900'
    },
    {
        id: 'ai',
        title: 'Asistente AI',
        description: 'Optimiza tus anuncios con inteligencia artificial',
        icon: <CommandLineIcon className="w-7 h-7 text-cyan-400" />,
        features: [
            'Sugerencias de títulos',
            'Mejora de descripciones',
            'Palabras clave óptimas',
            'Precios recomendados'
        ],
        featureIcons: [
            <SparklesIcon className="w-4 h-4" />,
            <DocumentTextIcon className="w-4 h-4" />,
            <CommandLineIcon className="w-4 h-4" />,
            <ChartBarIcon className="w-4 h-4" />
        ],
        demo: {
            type: 'chat',
            messages: [
                'Analizando tu anuncio...',
                'Título optimizado ✨',
                'Descripción mejorada 📝',
                '¡Listo para publicar! 🚀'
            ]
        },
        gradient: 'from-cyan-900 to-teal-900'
    },
    {
        id: 'automation',
        title: 'Automatización',
        description: 'Programa y gestiona tus anuncios automáticamente',
        icon: <Cog6ToothIcon className="w-7 h-7 text-teal-400" />,
        features: [
            'Publicación programada',
            'Renovación automática',
            'Respuestas predefinidas',
            'Notificaciones inteligentes'
        ],
        featureIcons: [
            <CalendarDaysIcon className="w-4 h-4" />,
            <ArrowPathIcon className="w-4 h-4" />,
            <ChatBubbleLeftRightIcon className="w-4 h-4" />,
            <BellAlertIcon className="w-4 h-4" />
        ],
        demo: {
            type: 'calendar',
            events: ['Publicar', 'Renovar', 'Destacar', 'Actualizar']
        },
        gradient: 'from-teal-900 to-cyan-900'
    }
];

export default function Tools() {
    const [activeTool, setActiveTool] = useState<Tool>(tools[0]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hoverState, setHoverState] = useState<string | null>(null);
    const [animationComplete, setAnimationComplete] = useState(false);

    useEffect(() => {
        setIsPlaying(true);
        const timer = setTimeout(() => setAnimationComplete(true), 2000);
        return () => clearTimeout(timer);
    }, [activeTool]);

    const renderDemo = (tool: Tool) => {
        switch (tool.demo.type) {
            case 'chart':
                return (
                    <div className="h-40 flex items-end justify-between gap-2 p-2">
                        {tool.demo.data.map((value: number, index: number) => (
                            <div key={index} className="relative flex flex-col items-center">
                                <motion.div
                                    className={`w-10 sm:w-12 rounded-t-md bg-gradient-to-b ${tool.demo.colors[index % tool.demo.colors.length]}`}
                                    initial={{ height: 0 }}
                                    animate={{ height: isPlaying ? `${value}%` : 0 }}
                                    transition={{
                                        delay: index * 0.1,
                                        duration: 0.8,
                                        type: 'spring',
                                        stiffness: 200,
                                        damping: 15
                                    }}
                                >
                                    {/* Glow effect */}
                                    <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-t-md"></div>
                                </motion.div>
                                {animationComplete && (
                                    <motion.div
                                        className="bg-teal-400/20 backdrop-blur-sm text-teal-300 text-xs font-medium px-2 py-0.5 rounded-md mt-2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                    >
                                        {value}%
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </div>
                );
            case 'chat':
                return (
                    <div className="space-y-3 p-1">
                        {tool.demo.messages.map((message: string, index: number) => (
                            <motion.div
                                key={index}
                                className="bg-gradient-to-r from-slate-800/95 to-slate-900/95 p-3 rounded-lg border border-teal-500/30 backdrop-blur-sm text-cyan-100 shadow-lg relative overflow-hidden"
                                initial={{ opacity: 0, x: -20, y: 10 }}
                                animate={{
                                    opacity: isPlaying ? 1 : 0,
                                    x: isPlaying ? 0 : -20,
                                    y: isPlaying ? 0 : 10
                                }}
                                transition={{ delay: index * 0.6, duration: 0.4 }}
                            >
                                {/* Typing indicator for first message */}
                                {index === 0 && !animationComplete && (
                                    <motion.div
                                        className="flex space-x-1 absolute right-3 top-3"
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        <div className="w-1.5 h-1.5 bg-teal-400 rounded-full"></div>
                                        <div className="w-1.5 h-1.5 bg-teal-400 rounded-full"></div>
                                        <div className="w-1.5 h-1.5 bg-teal-400 rounded-full"></div>
                                    </motion.div>
                                )}

                                {message}

                                {/* Edge highlight */}
                                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
                            </motion.div>
                        ))}
                    </div>
                );
            case 'calendar':
                return (
                    <div className="grid grid-cols-2 gap-3">
                        {tool.demo.events.map((event: string, index: number) => (
                            <motion.div
                                key={index}
                                className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 text-cyan-100 p-3 rounded-lg border border-teal-500/30 relative overflow-hidden group"
                                initial={{ scale: 0 }}
                                animate={{ scale: isPlaying ? 1 : 0 }}
                                transition={{
                                    delay: index * 0.3,
                                    duration: 0.5,
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 15
                                }}
                                whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(20,184,166,0.3)" }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 bg-teal-400 rounded-full mr-2"></div>
                                        <span>{event}</span>
                                    </div>
                                    {animationComplete && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 1 + index * 0.1 }}
                                        >
                                            <ClockIcon className="w-4 h-4 text-teal-500" />
                                        </motion.div>
                                    )}
                                </div>

                                {/* Background highlight on hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/5 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                {/* Edge highlight */}
                                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
                            </motion.div>
                        ))}
                    </div>
                );
        }
    };

    return (
        <section className="py-24 bg-gradient-to-b from-slate-900 via-teal-900/90 to-slate-900 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0">
                {/* Tech pattern background - Puedes mantenerlo o removerlo */}
                {/* <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div> */}

                {/* Animated orbs */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-teal-400/10 via-teal-300/5 to-emerald-400/10 rounded-full filter blur-xl opacity-30 animate-blob" />
                <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-cyan-400/10 via-white/5 to-teal-500/10 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-2000" />

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
                    {Array.from({ length: 12 }).map((_, i) => (
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
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ y: -3, boxShadow: "0 0 20px rgba(20,184,166,0.3)" }}
                    >
                        <SparklesIcon className="h-4 w-4 mr-1.5 text-cyan-300" />
                        <span className="relative z-10">Ultra Tecnológico</span>
                        <span className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/20 to-teal-500/0 rounded-full animate-shimmer"></span>
                    </motion.div>

                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-100 to-white">
                        Herramientas Poderosas
                    </h2>

                    <p className="text-xl text-cyan-100/90 max-w-3xl mx-auto">
                        Optimiza tus anuncios con nuestras herramientas exclusivas impulsadas por IA
                    </p>

                    <motion.div
                        className="w-24 h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 rounded-full mx-auto mt-6 shadow-[0_0_10px_rgba(20,184,166,0.3)]"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 96, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                    />
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        {tools.map((tool, idx) => (
                            <motion.div
                                key={tool.id}
                                className={`relative group cursor-pointer perspective-1000`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.2, duration: 0.6 }}
                                onClick={() => {
                                    setActiveTool(tool);
                                    setIsPlaying(false);
                                    setAnimationComplete(false);
                                    setTimeout(() => setIsPlaying(true), 100);
                                }}
                                onMouseEnter={() => setHoverState(tool.id)}
                                onMouseLeave={() => setHoverState(null)}
                            >
                                {/* Glow effect */}
                                <div className={`absolute -inset-1 bg-gradient-to-r from-teal-500/30 to-cyan-500/30 rounded-xl blur opacity-0
                                    ${activeTool.id === tool.id ? 'opacity-70' : 'group-hover:opacity-40'} transition-opacity duration-300`}></div>

                                <div className={`p-6 rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden
                                    ${activeTool.id === tool.id
                                        ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-teal-400/40'
                                        : 'bg-gradient-to-br from-slate-800/40 to-slate-900/60 border-teal-500/20 group-hover:border-teal-500/30'
                                    } border backdrop-blur-sm shadow-xl`}>

                                    {/* Holographic lines */}
                                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>

                                    {/* Premium corner */}
                                    <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
                                        <div className={`absolute rotate-45 bg-gradient-to-r ${tool.gradient} text-white font-bold text-[9px] py-1 right-[-35px] top-[8px] w-[100px] text-center shadow-md opacity-80`}>PREMIUM</div>
                                    </div>

                                    <div className="flex items-start">
                                        {/* Icon container */}
                                        <div className="relative mr-4 flex-shrink-0">
                                            <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-cyan-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className={`relative p-3 rounded-lg ${activeTool.id === tool.id
                                                ? `bg-gradient-to-br ${tool.gradient}`
                                                : 'bg-gradient-to-br from-slate-800 to-slate-900'
                                            } shadow-inner border ${
                                                activeTool.id === tool.id ? 'border-teal-400/40' : 'border-teal-500/20 group-hover:border-teal-500/30'
                                            } transition-all duration-300`}>
                                                {tool.icon}
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <h3 className={`text-xl font-bold mb-2 ${
                                                activeTool.id === tool.id
                                                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-teal-100'
                                                    : 'text-white group-hover:text-teal-100'
                                            } transition-colors duration-300`}>
                                                {tool.title}
                                            </h3>

                                            <p className={`mb-4 text-sm ${
                                                activeTool.id === tool.id ? 'text-cyan-100' : 'text-cyan-100/70'
                                            } group-hover:text-cyan-100 transition-colors duration-300`}>
                                                {tool.description}
                                            </p>

                                            <ul className="grid grid-cols-2 gap-2">
                                                {tool.features.map((feature, index) => (
                                                    <li
                                                        key={index}
                                                        className={`flex items-center text-sm ${
                                                            activeTool.id === tool.id ? 'text-teal-300' : 'text-cyan-100/70'
                                                        } group-hover:text-teal-300 transition-colors duration-300`}
                                                    >
                                                        <div className={`mr-2 p-1 rounded-full ${
                                                            activeTool.id === tool.id ? 'bg-teal-500/20' : 'bg-teal-500/10'
                                                        } flex-shrink-0`}>
                                                            {tool.featureIcons?.[index] || <SparklesIcon className="w-3.5 h-3.5 text-teal-400" />}
                                                        </div>
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                  
                  {/* Interactive activation button */}
                  {activeTool.id !== tool.id && (
                    <motion.div 
                      className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: hoverState === tool.id ? [0.9, 1.1, 0.9] : 0.9 }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        repeatType: "loop"
                      }}
                    >
                      <div className="p-2 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 shadow-lg">
                        <BoltIcon className="w-4 h-4 text-slate-900" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

                    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/60 rounded-2xl p-8 border border-teal-500/20 backdrop-blur-sm shadow-xl relative overflow-hidden h-96">
                        {/* Demo container holographic effect */}
                        <div className="absolute inset-0">
                            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
                            <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-teal-500/40 to-transparent"></div>
                            <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent"></div>

                            {/* Grid pattern */}
                            <div className="absolute inset-0 bg-[radial-gradient(#0d9488_1px,transparent_1px)] opacity-10" style={{ backgroundSize: '20px 20px' }}></div>

                            {/* Tech corner details */}
                            <div className="absolute top-0 left-0 border-t border-l border-teal-500/30 w-8 h-8"></div>
                            <div className="absolute top-0 right-0 border-t border-r border-teal-500/30 w-8 h-8"></div>
                            <div className="absolute bottom-0 left-0 border-b border-l border-teal-500/30 w-8 h-8"></div>
                            <div className="absolute bottom-0 right-0 border-b border-r border-teal-500/30 w-8 h-8"></div>
                        </div>

                        {/* Title */}
                        <div className="mb-8 pb-4 border-b border-teal-500/20 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-teal-100">
                                {activeTool.title}
                            </h3>
                            <div className="flex space-x-1">
                                <div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-cyan-500/70"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-500/70"></div>
                            </div>
                        </div>

                        {/* Demo content */}
                        <div className="relative h-[calc(100%-4rem)] flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTool.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full h-full flex items-center justify-center"
                                >
                                    {renderDemo(activeTool)}
                                </motion.div>
                            </AnimatePresence>

                            {/* Progress indicator */}
                            <motion.div
                                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400"
                                initial={{ width: '0%' }}
                                animate={{ width: isPlaying ? '100%' : '0%' }}
                                transition={{ duration: 2 }}
                            />
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}