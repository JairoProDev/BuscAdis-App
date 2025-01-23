export default function Footer() {
  return (
    <footer className="bg-primary-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-lg font-bold mb-4">Newsletter</h4>
            <p className="text-primary-200 mb-4">
              Suscríbete para recibir contenido de valor, ofertas exclusivas y novedades.
            </p>
            <form className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  className="w-full px-4 py-2 rounded-lg bg-primary-800 text-white placeholder-primary-400 border border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              <input
                type="tel"
                placeholder="Tu número de teléfono"
                className="w-full mt-2 px-4 py-2 rounded-lg bg-primary-800 text-white placeholder-primary-400 border border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-primary-200">
                  <input
                    type="checkbox"
                    className="form-checkbox rounded text-primary-500 focus:ring-primary-500"
                  />
                  <span>Recibir por correo electrónico</span>
                </label>
                
                <label className="flex items-center space-x-2 text-primary-200">
                  <input
                    type="checkbox"
                    className="form-checkbox rounded text-primary-500 focus:ring-primary-500"
                  />
                  <span>Recibir por WhatsApp</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                Suscribirme
              </button>
            </form>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Categorías</h4>
            <div className="grid grid-cols-2 gap-x-4">
              <ul className="space-y-2">
                <li><a href="/categorias/empleos" className="text-primary-200 hover:text-white flex items-center">💼 Empleos</a></li>
                <li><a href="/categorias/inmuebles" className="text-primary-200 hover:text-white flex items-center">🏠 Inmuebles</a></li>
                <li><a href="/categorias/vehiculos" className="text-primary-200 hover:text-white flex items-center">🚗 Vehículos</a></li>
                <li><a href="/categorias/servicios" className="text-primary-200 hover:text-white flex items-center">🛠️ Servicios</a></li>
                <li><a href="/categorias/productos" className="text-primary-200 hover:text-white flex items-center">📦 Productos</a></li>
              </ul>
              <ul className="space-y-2">
                <li><a href="/categorias/eventos" className="text-primary-200 hover:text-white flex items-center">🎉 Eventos</a></li>
                <li><a href="/categorias/educacion" className="text-primary-200 hover:text-white flex items-center">📚 Educación</a></li>
                <li><a href="/categorias/turismo" className="text-primary-200 hover:text-white flex items-center">✈️ Turismo</a></li>
                <li><a href="/categorias/mascotas" className="text-primary-200 hover:text-white flex items-center">🐾 Mascotas</a></li>
                <li><a href="/categorias/negocios" className="text-primary-200 hover:text-white flex items-center">💰 Negocios</a></li>
              </ul>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Soporte</h4>
            <ul className="space-y-2">
              <li><a href="/ayuda" className="text-primary-200 hover:text-white">Centro de Ayuda</a></li>
              <li><a href="/contacto" className="text-primary-200 hover:text-white">Contacto</a></li>
              <li><a href="/faq" className="text-primary-200 hover:text-white">Preguntas Frecuentes</a></li>
              <li><a href="/blog" className="text-primary-200 hover:text-white">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="/terminos" className="text-primary-200 hover:text-white">Términos y Condiciones</a></li>
              <li><a href="/privacidad" className="text-primary-200 hover:text-white">Política de Privacidad</a></li>
              <li><a href="/cookies" className="text-primary-200 hover:text-white">Política de Cookies</a></li>
              <li><a href="/aviso-legal" className="text-primary-200 hover:text-white">Aviso Legal</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary-800 mt-8 pt-8 text-center text-primary-200">
          <p>&copy; {new Date().getFullYear()} BuscAdis. Todos los derechos reservados.</p>
          <p>Desarrollado por <a href="https://www.linkedin.com/in/JairoProDev/" className="text-primary-200 hover:text-white">Jairo Saul Salas Quiñones</a></p>
        </div>
      </div>
    </footer>
  )
} 