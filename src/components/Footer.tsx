export default function Footer() {
  return (
    <footer className="bg-primary-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">BuacAdis</h3>
            <p className="text-primary-100">
              Conectamos a quienes buscan con quienes ofrecen oportunidades de calidad.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li><a href="/buscar" className="hover:text-primary-200">Buscar Adisos</a></li>
              <li><a href="/publicar" className="hover:text-primary-200">Publicar Adiso</a></li>
              <li><a href="/categorias" className="hover:text-primary-200">Categorías</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Soporte</h4>
            <ul className="space-y-2">
              <li><a href="/ayuda" className="hover:text-primary-200">Centro de Ayuda</a></li>
              <li><a href="/contacto" className="hover:text-primary-200">Contacto</a></li>
              <li><a href="/faq" className="hover:text-primary-200">Preguntas Frecuentes</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="/terminos" className="hover:text-primary-200">Términos y Condiciones</a></li>
              <li><a href="/privacidad" className="hover:text-primary-200">Política de Privacidad</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-primary-700 text-center text-primary-200">
          <p>&copy; {new Date().getFullYear()} BuacAdis. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
} 