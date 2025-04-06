'use client'

import Container from '@/components/shared/Container';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const faqItems = [
    { question: "¿Cómo publico un anuncio?", answer: "Para publicar un anuncio, primero debes registrarte o iniciar sesión en Buscadis. Luego, haz clic en el botón 'Publicar' y sigue los pasos del formulario." },
    { question: "¿Es gratuito publicar anuncios?", answer: "Sí, la publicación de anuncios básicos es gratuita. Ofrecemos opciones premium para mayor visibilidad." },
    { question: "¿Cómo busco anuncios?", answer: "Puedes buscar anuncios utilizando la barra de búsqueda en la página principal o explorando por categorías." },
    { question: "¿Cómo contacto al vendedor?", answer: "En la página del anuncio, encontrarás la información de contacto del vendedor (si la ha proporcionado) o un formulario para enviarle un mensaje." },
    { question: "¿Qué tipo de anuncios puedo publicar?", answer: "Puedes publicar anuncios de empleos, inmuebles, vehículos, servicios, productos, eventos, educación, turismo, mascotas y negocios." },
    // Añade más preguntas frecuentes aquí
];

export default function AyudaPage() {
    return (
        <div className="min-h-screen bg-slate-900 text-white py-24">
            <Container>
                <h1 className="text-4xl font-bold mb-8 text-center">Centro de Ayuda</h1>
                <p className="text-lg text-cyan-100/80 text-center mb-12">
                    Encuentra respuestas a las preguntas más frecuentes sobre Buscadis.
                </p>

                <div className="max-w-3xl mx-auto space-y-8">
                    {faqItems.map((item, index) => (
                        <div key={index} className="bg-slate-800 rounded-lg p-6 shadow-md border border-teal-500/20">
                            <div className="flex items-center space-x-4">
                                <QuestionMarkCircleIcon className="h-6 w-6 text-teal-300" />
                                <h3 className="text-xl font-semibold">{item.question}</h3>
                            </div>
                            <p className="mt-2 text-cyan-100/80">{item.answer}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    ¿Aún tienes dudas? <Link href="/contacto" className="text-teal-300 hover:underline">Contáctanos</Link>.
                </div>
            </Container>
        </div>
    );
}