export default function Footer() {
  return (
    <footer className="bg-primary-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">BuscAdis</h3>
            <p className="text-primary-200">
              Conectamos a quienes buscan con quienes ofrecen oportunidades premium y de calidad.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Categorías</h4>
            <ul className="space-y-2">
              <li><a href="/categorias/empleos" className="text-primary-200 hover:text-white">Empleos</a></li>
              <li><a href="/categorias/inmuebles" className="text-primary-200 hover:text-white">Inmuebles</a></li>
              <li><a href="/categorias/vehiculos" className="text-primary-200 hover:text-white">Vehículos</a></li>
              <li><a href="/categorias/servicios" className="text-primary-200 hover:text-white">Servicios</a></li>
              <li><a href="/categorias/productos" className="text-primary-200 hover:text-white">Productos</a></li>
              <li><a href="/categorias/eventos" className="text-primary-200 hover:text-white">Eventos</a></li>
              <li><a href="/categorias/educacion" className="text-primary-200 hover:text-white">Educación</a></li>
              <li><a href="/categorias/turismo" className="text-primary-200 hover:text-white">Turismo</a></li>
              <li><a href="/categorias/mascotas" className="text-primary-200 hover:text-white">Mascotas</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Soporte</h4>
            <ul className="space-y-2">
              <li><a href="/ayuda" className="text-primary-200 hover:text-white">Centro de Ayuda</a></li>
              <li><a href="/contacto" className="text-primary-200 hover:text-white">Contacto</a></li>
              <li><a href="/faq" className="text-primary-200 hover:text-white">Preguntas Frecuentes</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="/terminos" className="text-primary-200 hover:text-white">Términos y Condiciones</a></li>
              <li><a href="/privacidad" className="text-primary-200 hover:text-white">Política de Privacidad</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary-800 mt-8 pt-8 text-center text-primary-200">
          <p>&copy; {new Date().getFullYear()} BuscAdis. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
} 