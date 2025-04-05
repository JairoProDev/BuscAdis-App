"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { benefits } from "@/lib/homeMockData";
import BenefitItem from "./BenefitItem"; // Importa el item individual
import { SparklesIcon, RocketLaunchIcon, ShieldCheckIcon, ChatBubbleBottomCenterTextIcon, BoltIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";

// Iconos para cada beneficio
const benefitIcons = {
    eficiencia: <RocketLaunchIcon className="w-6 h-6 text-teal-400" />,
    seguridad: <ShieldCheckIcon className="w-6 h-6 text-cyan-400" />,
    comunicacion: <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-teal-400" />,
    velocidad: <BoltIcon className="w-6 h-6 text-cyan-400" />,
    soporte: <WrenchScrewdriverIcon className="w-6 h-6 text-teal-400" />,
};

const BenefitsSection = () => {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 }); // Umbral un poco mayor

    // Animaciones
    const textVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.6, ease: "easeOut" },
        },
    };
    const imageVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.6, delay: 0.1, ease: "easeOut" },
        },
    };
    const benefitsContainerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.15 } }, // Stagger para los items de beneficio
    };

    return (
        <section
            ref={ref}
            className="py-16 sm:py-24 overflow-hidden relative bg-gradient-to-b from-slate-900 via-teal-900/90 to-slate-900"
        >
            {/* Decorative elements */}
            <div className="absolute inset-0 z-0">
                {/* Patrones de circuito tecnológico - Puedes mantenerlo o removerlo */}
                {/* <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" /> */}

                {/* Animated orbs */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-teal-400/10 via-teal-300/5 to-emerald-400/10 rounded-full filter blur-xl opacity-30 animate-blob" />
                <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-cyan-400/10 via-white/5 to-teal-500/10 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-2000" />

                {/* Laser light effects */}
                <div className="absolute h-full w-[1px] left-[20%] bg-gradient-to-b from-transparent via-teal-400/10 to-transparent opacity-50"></div>
                <div className="absolute h-full w-[1px] left-[80%] bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent opacity-50"></div>

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

                {/* Tech grid on floor */}
                <div className="absolute bottom-0 left-0 right-0 h-40 perspective-1000">
                    <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-teal-500/5 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/30 to-transparent"></div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="lg:grid lg:grid-cols-2 lg:gap-16 xl:gap-24 items-center">
                    {/* Columna de Texto y Beneficios */}
                    <motion.div
                        variants={textVariants}
                        initial="hidden"
                        animate={inView ? "visible" : "hidden"}
                        className="relative"
                    >
                        {/* Premium badge */}
                        <motion.div
                            className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-slate-800 to-slate-700 text-teal-300 text-sm font-medium mb-5 shadow-lg relative border border-teal-500/20 overflow-hidden"
                            initial={{ opacity: 0, y: -10 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.2 }}
                            whileHover={{ y: -3, boxShadow: "0 0 20px rgba(20,184,166,0.3)" }}
                        >
                            <SparklesIcon className="h-4 w-4 mr-1.5 text-cyan-300" />
                            <span className="relative z-10">Diseñado para ti</span>
                            <span className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/20 to-teal-500/0 rounded-full animate-shimmer"></span>
                        </motion.div>

                        <h2 className="text-3xl sm:text-4xl font-bold mb-5 text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-100 to-white">
                            Plataforma para <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-300">tu Éxito</span>{" "}
                            en Cusco
                        </h2>

                        <motion.div
                            className="w-24 h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 rounded-full mb-6 shadow-[0_0_10px_rgba(20,184,166,0.3)]"
                            initial={{ width: 0, opacity: 0 }}
                            animate={inView ? { width: 96, opacity: 1 } : {}}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        ></motion.div>

                        <p className="text-lg text-cyan-100/90 mb-10 leading-relaxed">
                            Buscadis no es solo un portal de anuncios; es tu aliado
                            estratégico para encontrar oportunidades y conectar con la
                            comunidad local de forma rápida, segura y efectiva.
                        </p>

                        {/* Lista de Beneficios mejorada con iconos */}
                        <motion.div
                            className="space-y-6"
                            variants={benefitsContainerVariants}
                            initial="hidden"
                            animate={inView ? "visible" : "hidden"}
                        >
                            {benefits.map((benefit, index) => (
                                <motion.div
                                    key={benefit.id}
                                    className="relative group"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={inView ? { opacity: 1, x: 0 } : {}}
                                    transition={{ delay: index * 0.1 + 0.5 }}
                                    whileHover={{ x: 5 }}
                                >
                                    {/* Glow effect on hover */}
                                    <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-teal-500/20 to-cyan-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                    <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm relative rounded-lg border border-teal-500/10 group-hover:border-teal-400/30 transition-all duration-300 shadow-md group-hover:shadow-teal-500/10 relative overflow-hidden">
                                        {/* Icon container with tech effect */}
                                        <div className="flex-shrink-0 relative">
                                            <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-cyan-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="relative p-2 w-12 h-12 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 rounded-full border border-teal-500/20 group-hover:border-teal-400/40 shadow-inner transition-all duration-300">
                                                {benefitIcons[benefit.id] || <SparklesIcon className="w-6 h-6 text-teal-400" />}
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-white to-teal-100">
                                                {benefit.title}
                                            </h3>
                                            <p className="text-cyan-100/80 text-sm">{benefit.description}</p>
                                        </div>

                                        {/* Holographic effect */}
                                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent"></div>
                                        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* CTA con estilo tech premium */}
                        <motion.div
                            className="mt-12 relative group perspective-1000"
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 1.2, duration: 0.5 }}
                            whileHover={{ scale: 1.03, z: 10 }}
                        >
                            {/* Premium glow effect */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition-all duration-300"></div>

                            <Link
                                href="/publicar"
                                className="inline-flex items-center justify-center px-7 py-3 text-base font-medium text-slate-900 bg-gradient-to-r from-teal-300 to-cyan-300 rounded-lg shadow-lg hover:shadow-teal-500/30 transition-all duration-300 relative overflow-hidden group/btn z-10"
                            >
                                {/* Button shimmer */}
                                <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/0 via-white/70 to-white/0 transform -skew-x-30 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out"></span>

                                <span className="relative z-10 flex items-center">
                                    <RocketLaunchIcon className="w-5 h-5 mr-2" />
                                    Publica tu Anuncio Ahora
                                </span>
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Columna de Imagen */}
                    <motion.div
                        className="mt-12 lg:mt-0 relative perspective"
                        variants={imageVariants}
                        initial="hidden"
                        animate={inView ? "visible" : "hidden"}
                    >
                        {/* Glow effect around image */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/30 to-cyan-500/30 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-all duration-300"></div>

                        {/* Imagen con mejor relación de aspecto y sombra */}
                        <div className="relative aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3] xl:aspect-[1/1] max-h-[600px] mx-auto lg:mx-0 overflow-hidden rounded-xl shadow-[0_20px_40px_-15px_rgba(20,184,166,0.4)] border border-teal-500/20 z-10">
                            <Image
                                src="/images/benefits-collaboration.jpg"
                                alt="Personas conectando y colaborando gracias a Buscadis"
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover"
                                quality={90}
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/30 via-transparent to-cyan-500/30 mix-blend-overlay"></div>

                            {/* Holographic effect */}
                            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-slate-900/40"></div>
                            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
                        </div>

                        {/* Badges flotantes con estilo tech */}
                        <motion.div
                            className="absolute -top-4 -left-4 z-20 bg-gradient-to-r from-slate-800 to-slate-900 text-teal-300 px-5 py-2.5 rounded-lg shadow-[0_10px_30px_-5px_rgba(20,184,166,0.3)] text-sm font-medium flex items-center space-x-2 border border-teal-500/30"
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            whileHover={{ y: -5, boxShadow: "0 15px 30px -5px rgba(20,184,166,0.4)" }}
                        >
                            <SparklesIcon className="h-4 w-4 text-cyan-300 mr-2" />
                            <span>+50,000 Anuncios activos</span>
                        </motion.div>

                        <motion.div
                            className="absolute -bottom-4 -right-4 z-20 bg-gradient-to-r from-slate-800 to-slate-900 text-teal-300 px-5 py-2.5 rounded-lg shadow-[0_10px_30px_-5px_rgba(20,184,166,0.3)] text-sm font-medium flex items-center space-x-2 border border-teal-500/30"
                            initial={{ opacity: 0, y: -20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 1, duration: 0.5 }}
                            whileHover={{ y: 5, boxShadow: "0 15px 30px -5px rgba(20,184,166,0.4)" }}
                        >
                            <SparklesIcon className="h-4 w-4 text-cyan-300 mr-2" />
                            <span>95% de satisfacción</span>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default BenefitsSection;