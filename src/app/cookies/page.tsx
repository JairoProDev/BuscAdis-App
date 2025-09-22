'use client'

import Container from '@/components/shared/Container';

export default function CookiesPage() {
    return (
        <div className="min-h-screen bg-slate-900 text-white py-24">
            <Container>
                <h1 className="text-4xl font-bold mb-8 text-center">Política de Cookies</h1>
                <p className="text-lg text-cyan-100/80 text-center mb-12">
                    Esta política explica cómo utilizamos las cookies en Buscadis.
                </p>

                <div className="max-w-5xl mx-auto space-y-6">
                    <h2 className="text-2xl font-semibold">1. ¿Qué son las Cookies?</h2>
                    <p className="text-cyan-100/80">Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo al visitarlos.</p>

                    <h2 className="text-2xl font-semibold">2. ¿Cómo Utilizamos las Cookies?</h2>
                    <p className="text-cyan-100/80">Utilizamos cookies para mejorar la funcionalidad de Buscadis, personalizar tu experiencia y analizar el tráfico del sitio.</p>

                    <h2 className="text-2xl font-semibold">3. Tipos de Cookies que Utilizamos</h2>
                    <ul className="list-disc list-inside text-cyan-100/80">
                        <li><strong>Cookies Esenciales:</strong> Necesarias para el funcionamiento básico del sitio.</li>
                        <li><strong>Cookies de Rendimiento:</strong> Recopilan información sobre cómo utilizas el sitio.</li>
                        <li><strong>Cookies de Funcionalidad:</strong> Recuerdan tus preferencias para mejorar tu experiencia.</li>
                        <li><strong>Cookies de Publicidad:</strong> Se utilizan para mostrar adisos relevantes para ti.</li>
                    </ul>

                    <h2 className="text-2xl font-semibold">4. Gestión de Cookies</h2>
                    <p className="text-cyan-100/80">Puedes controlar y gestionar las cookies a través de la configuración de tu navegador. Puedes optar por aceptar, rechazar o eliminar las cookies.</p>

                    <h2 className="text-2xl font-semibold">5. Cookies de Terceros</h2>
                    <p className="text-cyan-100/80">Algunos de nuestros socios pueden utilizar cookies de terceros en Buscadis.</p>

                    <h2 className="text-2xl font-semibold">6. Cambios a la Política de Cookies</h2>
                    <p className="text-cyan-100/80">Podemos actualizar esta política de cookies en el futuro. Te notificaremos cualquier cambio.</p>

                    {/* Añade aquí el resto de la política de cookies */}
                </div>
            </Container>
        </div>
    );
}