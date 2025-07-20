"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    UserPlusIcon,
    PlusCircleIcon,
    ChatBubbleLeftRightIcon,
    CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

const steps = [
    {
        id: 1,
        title: "Regístrate",
        description:
            "Crea una cuenta gratuita en Buscadis en menos de 1 minuto. Solo necesitas un correo electrónico válido y una contraseña segura.",
        icon: UserPlusIcon,
    },
    {
        id: 2,
        title: "Publica tu anuncio",
        description:
            "Crea tu anuncio con fotos, descripción detallada y establece un precio. Puedes publicar en diferentes categorías según tus necesidades.",
        icon: PlusCircleIcon,
    },
    {
        id: 3,
        title: "Recibe mensajes",
        description:
            "Los interesados te contactarán directamente a través de nuestra plataforma. Responde rápido para aumentar tus posibilidades de éxito.",
        icon: ChatBubbleLeftRightIcon,
    },
    {
        id: 4,
        title: "Concreta la venta",
        description:
            "Coordina con el comprador el lugar y forma de pago. Una vez finalizada la transacción, puedes marcar tu anuncio como vendido.",
        icon: CurrencyDollarIcon,
    },
];

const faqItems = [
    {
        question: "¿Cuánto cuesta publicar un anuncio?",
        answer:
            "Publicar un anuncio básico en Buscadis es completamente gratuito. También ofrecemos opciones de promoción pagadas para dar mayor visibilidad a tus anuncios.",
    },
    {
        question: "¿Cómo destaco mi anuncio sobre los demás?",
        answer:
            "Puedes destacar tu anuncio utilizando nuestros paquetes premium que incluyen posicionamiento prioritario, etiquetas destacadas y mayor visibilidad en los resultados de búsqueda.",
    },
    {
        question: "¿Cuánto tiempo permanece activo mi anuncio?",
        answer:
            "Los anuncios gratuitos permanecen activos durante 30 días. Puedes renovarlos manualmente cuando estén por expirar o configurar la renovación automática en tu perfil.",
    },
    {
        question: "¿Cómo me protege Buscadis de posibles estafas?",
        answer:
            "Verificamos las cuentas de usuarios, implementamos un sistema de reputación y moderamos activamente el contenido. Además, ofrecemos consejos de seguridad y un canal para reportar comportamientos sospechosos.",
    },
];

export default function ComoFunciona() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="bg-slate-900 pt-24">
            {/* Hero section */}
            <div className="bg-gradient-to-b from-teal-900 to-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                            Cómo funciona Buscadis
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg text-cyan-100/80">
                            Descubre cómo nuestra plataforma te ayuda a comprar, vender y
                            encontrar lo que necesitas de manera rápida, segura y efectiva.
                        </p>
                    </div>
                </div>
            </div>

            {/* Process section */}
            <div className="py-16 bg-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white">
                            Proceso sencillo en 4 pasos
                        </h2>
                        <p className="mt-4 text-lg text-cyan-100/80">
                            Sigue estos simples pasos para aprovechar al máximo nuestra
                            plataforma
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step) => (
                            <motion.div
                                key={`step-${step.id}-${step.title.substring(0, 20).replace(/\s+/g, '-').toLowerCase()}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: step.id * 0.1 }}
                                className="bg-slate-900 rounded-lg p-6 shadow-md border border-teal-500/20"
                            >
                                <div className="bg-teal-900/30 rounded-full h-12 w-12 flex items-center justify-center mb-4">
                                    <step.icon className="h-6 w-6 text-teal-300" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    {step.id}. {step.title}
                                </h3>
                                <p className="text-cyan-100/80">{step.description}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <Link
                            href="/publicar"
                            className="inline-flex items-center justify-center rounded-md bg-teal-600 px-5 py-3 text-base font-medium text-slate-900 hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
                        >
                            Publicar anuncio
                        </Link>
                    </div>
                </div>
            </div>

            {/* Image section */}
            <div className="bg-slate-900 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-6">
                                Una plataforma diseñada para ti
                            </h2>
                            <p className="text-lg text-cyan-100/80 mb-8">
                                Buscadis ha sido creada pensando en la experiencia del usuario.
                                Nuestra interfaz intuitiva y herramientas potentes te permiten
                                encontrar o publicar exactamente lo que necesitas sin
                                complicaciones.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start">
                                    <svg
                                        className="h-5 w-5 text-teal-300 mt-1 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    <span className="text-cyan-100/80">
                                        Publicación rápida y sencilla de anuncios
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <svg
                                        className="h-5 w-5 text-teal-300 mt-1 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    <span className="text-cyan-100/80">
                                        Búsqueda avanzada con filtros personalizados
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <svg
                                        className="h-5 w-5 text-teal-300 mt-1 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    <span className="text-cyan-100/80">
                                        Sistema de mensajería integrado
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <svg
                                        className="h-5 w-5 text-teal-300 mt-1 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    <span className="text-cyan-100/80">
                                        Estadísticas detalladas de tus anuncios
                                    </span>
                                </li>
                            </ul>
                        </div>
                        <div className="mt-10 lg:mt-0">
                            <div className="relative h-[400px] rounded-lg overflow-hidden shadow-lg">
                                <Image
                                    src="https://images.unsplash.com/photo-1531973576160-7125cd663d86?q=80&w=2940&auto=format&fit=crop"
                                    alt="Personas utilizando Buscadis"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ section */}
            <div className="bg-slate-800 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white">
                            Preguntas frecuentes
                        </h2>
                        <p className="mt-4 text-lg text-cyan-100/80">
                            Respondemos las dudas más comunes sobre el uso de nuestra
                            plataforma
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto divide-y divide-slate-700">
                        {faqItems.map((item) => (
                            <div key={`faq-${item.question.substring(0, 20).replace(/\s+/g, '-').toLowerCase()}`} className="py-6">
                                <button
                                    className="flex w-full items-center justify-between text-left"
                                    onClick={() => setOpenFaq(openFaq === faqItems.indexOf(item) ? null : faqItems.indexOf(item))}
                                >
                                    <h3 className="text-lg font-medium text-white">
                                        {item.question}
                                    </h3>
                                    <span>
                                        {openFaq === faqItems.indexOf(item) ? (
                                            <svg
                                                className="h-6 w-6 text-teal-300"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 15l7-7 7 7"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                className="h-6 w-6 text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        )}
                                    </span>
                                </button>
                                {openFaq === faqItems.indexOf(item) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        transition={{ duration: 0.3 }}
                                        className="mt-2 text-cyan-100/80 pr-12"
                                    >
                                        <p>{item.answer}</p>
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA section */}
            <div className="bg-teal-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">
                        ¿Listo para comenzar?
                    </h2>
                    <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
                        Únete a miles de usuarios que ya disfrutan de nuestra plataforma y
                        comienza a publicar o encontrar lo que necesitas hoy mismo.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/registrarse"
                            className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-base font-medium text-teal-600 hover:bg-neutral-100"
                        >
                            Crear cuenta gratuita
                        </Link>
                        <Link
                            href="/buscar"
                            className="inline-flex items-center justify-center rounded-md border border-white px-5 py-3 text-base font-medium text-white hover:bg-teal-500"
                        >
                            Explorar anuncios
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}