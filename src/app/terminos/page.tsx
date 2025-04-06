'use client'

import Container from '@/components/shared/Container';

export default function TerminosPage() {
    return (
        <div className="min-h-screen bg-slate-900 text-white py-24">
            <Container>
                <h1 className="text-4xl font-bold mb-8 text-center">Términos y Condiciones</h1>
                <p className="text-lg text-cyan-100/80 text-center mb-12">
                    Por favor, lee atentamente los siguientes términos y condiciones antes de utilizar Buscadis.
                </p>

                <div className="max-w-5xl mx-auto space-y-6">
                    <h2 className="text-2xl font-semibold">1. Aceptación de los Términos</h2>
                    <p className="text-cyan-100/80">Al acceder y utilizar Buscadis, aceptas estar legalmente obligado por estos Términos y Condiciones.</p>

                    <h2 className="text-2xl font-semibold">2. Descripción del Servicio</h2>
                    <p className="text-cyan-100/80">Buscadis es una plataforma de anuncios clasificados que permite a los usuarios publicar y buscar oportunidades en diversas categorías.</p>

                    <h2 className="text-2xl font-semibold">3. Uso Aceptable</h2>
                    <p className="text-cyan-100/80">El uso de Buscadis debe ser conforme a la ley y a las buenas costumbres. Queda prohibido publicar contenido ilegal, ofensivo, discriminatorio o que infrinja derechos de terceros.</p>

                    <h2 className="text-2xl font-semibold">4. Propiedad Intelectual</h2>
                    <p className="text-cyan-100/80">El contenido de Buscadis, incluyendo textos, imágenes, logos y marcas, está protegido por derechos de propiedad intelectual.</p>

                    <h2 className="text-2xl font-semibold">5. Limitación de Responsabilidad</h2>
                    <p className="text-cyan-100/80">Buscadis no se hace responsable por la veracidad, exactitud o legalidad de los anuncios publicados por los usuarios. El uso de la plataforma es bajo tu propio riesgo.</p>

                    <h2 className="text-2xl font-semibold">6. Modificaciones a los Términos</h2>
                    <p className="text-cyan-100/80">Buscadis se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones serán publicadas en esta página.</p>

                    <h2 className="text-2xl font-semibold">7. Ley Aplicable y Jurisdicción</h2>
                    <p className="text-cyan-100/80">Estos Términos y Condiciones se rigen por las leyes de Perú. Cualquier disputa será sometida a la jurisdicción de los tribunales de Cusco, Perú.</p>

                    {/* Añade aquí el resto de los términos y condiciones */}
                </div>
            </Container>
        </div>
    );
}