'use client'

import Container from '@/components/shared/Container';
import { MapPinIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import Link from 'next/link'; // Import Link

export default function ContactoPage() {
    return (
        <div className="min-h-screen bg-slate-900 text-white py-24">
            <Container>
                <h1 className="text-4xl font-bold mb-8 text-center">Contacto</h1>
                <p className="text-lg text-cyan-100/80 text-center mb-12">
                    ¿Tienes alguna pregunta, comentario o necesitas ayuda? ¡Estamos aquí para ayudarte!
                </p>

                <div className="grid lg:grid-cols-2 gap-16">
                    {/* Información de Contacto */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-6">Información de Contacto</h2>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <MapPinIcon className="h-6 w-6 text-teal-300" />
                                <span>Urb. Tupac Amaru, San Sebastián, Cusco-Perú</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <EnvelopeIcon className="h-6 w-6 text-teal-300" />
                                <Link href="mailto:Buscadiss@gmail.com" className="hover:text-teal-300">Buscadiss@gmail.com</Link>
                            </div>
                            <div className="flex items-center space-x-4">
                                <PhoneIcon className="h-6 w-6 text-teal-300" />
                                <Link href="tel:+51 937 054 328" className="hover:text-teal-300">+51 937 054 328</Link>
                            </div>
                            {/* Puedes añadir más información de contacto como horarios de atención, etc. */}
                        </div>
                    </div>

                    {/* Formulario de Contacto */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-6">Envíanos un Mensaje</h2>
                        <form className="space-y-4">
                            <div>
                                <label htmlFor="nombre" className="block text-sm font-medium text-gray-300">Nombre</label>
                                <input type="text" id="nombre" className="mt-1 block w-full rounded-md bg-slate-800 border-slate-700 text-white shadow-sm focus:border-teal-500 focus:ring-teal-500" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300">Correo Electrónico</label>
                                <input type="email" id="email" className="mt-1 block w-full rounded-md bg-slate-800 border-slate-700 text-white shadow-sm focus:border-teal-500 focus:ring-teal-500" />
                            </div>
                            <div>
                                <label htmlFor="mensaje" className="block text-sm font-medium text-gray-300">Mensaje</label>
                                <textarea id="mensaje" rows={4} className="mt-1 block w-full rounded-md bg-slate-800 border-slate-700 text-white shadow-sm focus:border-teal-500 focus:ring-teal-500"></textarea>
                            </div>
                            <button type="submit" className="inline-flex items-center rounded-md bg-teal-600 px-5 py-3 text-base font-medium text-slate-900 hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2">
                                Enviar Mensaje
                            </button>
                        </form>
                    </div>
                </div>
            </Container>
        </div>
    );
}