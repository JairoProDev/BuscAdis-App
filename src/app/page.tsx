import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-primary-800 mb-6">
          Encuentra las mejores oportunidades
        </h1>
        <p className="text-xl text-primary-600 mb-8 max-w-2xl mx-auto">
          BuacAdis conecta a quienes buscan con quienes ofrecen oportunidades premium y de calidad.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/buscar"
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-lg font-semibold"
          >
            Buscar Adisos
          </Link>
          <Link 
            href="/publicar"
            className="px-8 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition text-lg font-semibold"
          >
            Publicar Adiso
          </Link>
        </div>
      </section>

      {/* Categorías Populares */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-primary-800 text-center mb-12">
          Categorías Populares
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {['Inmuebles', 'Vehículos', 'Empleos', 'Servicios'].map((categoria) => (
            <div key={categoria} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition">
              <h3 className="text-xl font-semibold text-primary-700 mb-2">{categoria}</h3>
              <p className="text-primary-600">Encuentra las mejores ofertas en {categoria.toLowerCase()}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Por qué BuacAdis */}
      <section className="py-16 bg-primary-50 rounded-3xl">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary-800 text-center mb-12">
            ¿Por qué elegir BuacAdis?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Calidad Premium',
                description: 'Todos nuestros anuncios son verificados y de alta calidad'
              },
              {
                title: 'Conexiones Efectivas',
                description: 'Conectamos de manera inteligente a compradores y vendedores'
              },
              {
                title: 'Seguridad Garantizada',
                description: 'Transacciones seguras y protección para todos los usuarios'
              }
            ].map((feature) => (
              <div key={feature.title} className="text-center p-6">
                <h3 className="text-xl font-semibold text-primary-700 mb-4">{feature.title}</h3>
                <p className="text-primary-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
