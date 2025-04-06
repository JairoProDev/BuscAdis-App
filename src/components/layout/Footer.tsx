export default function Footer() {
  // Define tus colores personalizados basados en tu diseño
  const backgroundColor = 'bg-slate-900'; // Un tono oscuro similar al de tu app
  const textColor = 'text-gray-300'; // Texto general en un tono claro
  const primaryColor = 'text-teal-400'; // Tu color primario (turquesa/cian) para acentos
  const primaryButtonBg = 'bg-teal-400';
  const primaryButtonHoverBg = 'bg-teal-500';
  const primaryButtonTextColor = 'text-white'; // ¡Variable añadida!
  const inputBg = 'bg-slate-800';
  const inputBorder = 'border-slate-700';
  const inputPlaceholder = 'placeholder-gray-500';
  const focusRing = 'focus:ring-teal-500';
  const dividerColor = 'border-slate-800';
  const copyrightTextColor = 'text-gray-400';

  return (
      <footer className={`${backgroundColor} ${textColor} py-12`}>
          <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                      <h4 className="text-lg font-bold mb-4">{primaryColor === 'text-teal-400' ? <span className={primaryColor}>Revista Digital</span> : 'Magazine'}</h4>
                      <p className={`${textColor}/80 mb-4`}>
                          Suscríbete para recibir contenido de valor, ofertas exclusivas y novedades.
                      </p>
                      <form className="space-y-4">
                          <div>
                              <input
                                  type="email"
                                  placeholder="Tu correo electrónico"
                                  className={`w-full px-4 py-2 rounded-lg ${inputBg} ${textColor} ${inputPlaceholder} border ${inputBorder} focus:outline-none focus:ring-2 ${focusRing}`}
                              />
                              <input
                                  type="tel"
                                  placeholder="Tu número de teléfono"
                                  className={`w-full mt-2 px-4 py-2 rounded-lg ${inputBg} ${textColor} ${inputPlaceholder} border ${inputBorder} focus:outline-none focus:ring-2 ${focusRing}`}
                              />
                          </div>

                          <div className="space-y-2">
                              <label className="flex items-center space-x-2 text-gray-400">
                                  <input
                                      type="checkbox"
                                      className={`form-checkbox rounded text-teal-500 focus:ring-teal-500 bg-slate-700 border-slate-600`}
                                  />
                                  <span>Recibir por correo electrónico</span>
                              </label>

                              <label className="flex items-center space-x-2 text-gray-400">
                                  <input
                                      type="checkbox"
                                      className={`form-checkbox rounded text-teal-500 focus:ring-teal-500 bg-slate-700 border-slate-600`}
                                  />
                                  <span>Recibir por WhatsApp</span>
                              </label>
                          </div>

                          <button
                              type="submit"
                              className={`w-full px-4 py-2 ${primaryButtonBg} ${primaryButtonTextColor} rounded-lg hover:${primaryButtonHoverBg} transition-colors duration-200`}
                          >
                              Suscribirme
                          </button>
                      </form>
                  </div>
                  <div>
                      <h4 className="text-lg font-bold mb-4">{primaryColor === 'text-teal-400' ? <span className={primaryColor}>Categorías</span> : 'Categorías'}</h4>
                      <div className="grid grid-cols-2 gap-x-4">
                          <ul className="space-y-2">
                              <li><a href="/empleos" className={`${textColor}/80 hover:${primaryColor} flex items-center`}>💼 Empleos</a></li>
                              <li><a href="/inmuebles" className={`${textColor}/80 hover:${primaryColor} flex items-center`}>🏠 Inmuebles</a></li>
                              <li><a href="/vehiculos" className={`${textColor}/80 hover:${primaryColor} flex items-center`}>🚗 Vehículos</a></li>
                              <li><a href="/servicios" className={`${textColor}/80 hover:${primaryColor} flex items-center`}>🛠️ Servicios</a></li>
                              <li><a href="/productos" className={`${textColor}/80 hover:${primaryColor} flex items-center`}>📦 Productos</a></li>
                          </ul>
                          <ul className="space-y-2">
                              <li><a href="/eventos" className={`${textColor}/80 hover:${primaryColor} flex items-center`}>🎉 Eventos</a></li>
                              <li><a href="/educacion" className={`${textColor}/80 hover:${primaryColor} flex items-center`}>📚 Educación</a></li>
                              <li><a href="/turismo" className={`${textColor}/80 hover:${primaryColor} flex items-center`}>✈️ Turismo</a></li>
                              <li><a href="/mascotas" className={`${textColor}/80 hover:${primaryColor} flex items-center`}>🐾 Mascotas</a></li>
                              <li><a href="/negocios" className={`${textColor}/80 hover:${primaryColor} flex items-center`}>💰 Negocios</a></li>
                          </ul>
                      </div>
                  </div>

                  <div>
                      <h4 className="text-lg font-bold mb-4">{primaryColor === 'text-teal-400' ? <span className={primaryColor}>Soporte</span> : 'Soporte'}</h4>
                      <ul className="space-y-2">
                          <li><a href="/ayuda" className={`${textColor}/80 hover:${primaryColor}`}>Centro de Ayuda</a></li>
                          <li><a href="/contacto" className={`${textColor}/80 hover:${primaryColor}`}>Contacto</a></li>
                          <li><a href="/funcionamiento" className={`${textColor}/80 hover:${primaryColor}`}>Preguntas Frecuentes</a></li>
                          <li><a href="/blog" className={`${textColor}/80 hover:${primaryColor}`}>Blog</a></li>
                      </ul>
                  </div>

                  <div>
                      <h4 className="text-lg font-bold mb-4">{primaryColor === 'text-teal-400' ? <span className={primaryColor}>Legal</span> : 'Legal'}</h4>
                      <ul className="space-y-2">
                          <li><a href="/terminos" className={`${textColor}/80 hover:${primaryColor}`}>Términos y Condiciones</a></li>
                          <li><a href="/privacidad" className={`${textColor}/80 hover:${primaryColor}`}>Política de Privacidad</a></li>
                          <li><a href="/cookies" className={`${textColor}/80 hover:${primaryColor}`}>Política de Cookies</a></li>
                          <li><a href="/aviso-legal" className={`${textColor}/80 hover:${primaryColor}`}>Aviso Legal</a></li>
                      </ul>
                  </div>
              </div>

              <div className={`${dividerColor} mt-8 pt-8 text-center ${copyrightTextColor}`}>
                  <p>&copy; {new Date().getFullYear()} BuscAdis. Todos los derechos reservados.</p>
                  <p>Desarrollado por <a href="https://www.linkedin.com/in/JairoProDev/" className={`${copyrightTextColor} hover:${primaryColor}`}>Jairo Saul Salas Quiñones</a></p>
              </div>
          </div>
      </footer>
  )
}