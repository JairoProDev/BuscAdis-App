'use client'

import Container from '@/components/shared/Container';

export default function PrivacidadPage() {
    return (
        <div className="min-h-screen bg-slate-900 text-white py-24">
            <Container>
                <h1 className="text-4xl font-bold mb-8 text-center">Política de Privacidad</h1>
                <p className="text-lg text-cyan-100/80 text-center mb-12">
                    Tu privacidad es importante para nosotros. Lee nuestra política para entender cómo manejamos tus datos.
                </p>

                <div className="max-w-5xl mx-auto space-y-6">
                    <h2 className="text-2xl font-semibold">1. Información que Recopilamos</h2>
                    <p className="text-cyan-100/80">Recopilamos información personal como tu nombre, correo electrónico y número de teléfono al registrarte y publicar anuncios.</p>

                    <h2 className="text-2xl font-semibold">2. Uso de la Información</h2>
                    <p className="text-cyan-100/80">Utilizamos tu información para gestionar tu cuenta, mostrar tus anuncios y facilitar la comunicación con otros usuarios.</p>

                    <h2 className="text-2xl font-semibold">3. Compartir Información</h2>
                    <p className="text-cyan-100/80">Compartimos tu información con otros usuarios cuando publicas un anuncio para que puedan contactarte. No compartimos tu información con terceros con fines publicitarios sin tu consentimiento.</p>

                    <h2 className="text-2xl font-semibold">4. Seguridad de la Información</h2>
                    <p className="text-cyan-100/80">Implementamos medidas de seguridad para proteger tu información personal contra accesos no autorizados.</p>

                    <h2 className="text-2xl font-semibold">5. Tus Derechos</h2>
                    <p className="text-cyan-100/80">Tienes derecho a acceder, rectificar, cancelar u oponerte al tratamiento de tus datos personales. Puedes ejercer estos derechos contactándonos.</p>

                    <h2 className="text-2xl font-semibold">6. Cookies</h2>
                    <p className="text-cyan-100/80">Utilizamos cookies para mejorar tu experiencia en Buscadis. Puedes configurar tu navegador para rechazar las cookies si lo deseas.</p>

                    <h2 className="text-2xl font-semibold">7. Cambios a la Política de Privacidad</h2>
                    <p className="text-cyan-100/80">Podemos actualizar esta política de privacidad en el futuro. Te notificaremos cualquier cambio importante.</p>

                    {/* Añade aquí el resto de la política de privacidad */}
                </div>
            </Container>
        </div>
    );
}