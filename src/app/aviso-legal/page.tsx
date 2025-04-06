'use client'

import Container from '@/components/shared/Container';

export default function AvisoLegalPage() {
    return (
        <div className="min-h-screen bg-slate-900 text-white py-24">
            <Container>
                <h1 className="text-4xl font-bold mb-8 text-center">Aviso Legal</h1>
                <p className="text-lg text-cyan-100/80 text-center mb-12">
                    Información legal importante sobre Buscadis.
                </p>

                <div className="max-w-5xl mx-auto space-y-6">
                    <h2 className="text-2xl font-semibold">1. Información del Titular</h2>
                    <p className="text-cyan-100/80">Jairo Saul Salas Quiñones - Buscadis S.A.C<br/>[Tu Domicilio Social]<br/>10755957408</p>

                    <h2 className="text-2xl font-semibold">2. Propiedad Intelectual</h2>
                    <p className="text-cyan-100/80">Todos los derechos de propiedad intelectual del sitio web Buscadis y sus contenidos pertenecen a BUSCADIS.</p>

                    <h2 className="text-2xl font-semibold">3. Condiciones de Uso</h2>
                    <p className="text-cyan-100/80">El acceso y uso de Buscadis están sujetos a los términos y condiciones establecidos en la página de Términos y Condiciones.</p>

                    <h2 className="text-2xl font-semibold">4. Exclusión de Responsabilidad</h2>
                    <p className="text-cyan-100/80">Buscadis no se responsabiliza por los daños y perjuicios que pudieran derivarse del uso de la información contenida en el sitio.</p>

                    <h2 className="text-2xl font-semibold">5. Contacto</h2>
                    <p className="text-cyan-100/80">Para cualquier consulta o reclamación, puedes contactarnos a través de la página de Contacto.</p>

                    {/* Añade aquí el resto del aviso legal */}
                </div>
            </Container>
        </div>
    );
}