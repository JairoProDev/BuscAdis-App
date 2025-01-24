'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { EnvelopeIcon } from '@heroicons/react/24/outline'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      // Aquí implementaremos la lógica de suscripción
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (!response.ok) throw new Error('Error al suscribirse')

      setStatus('success')
      setMessage('¡Gracias por suscribirte! Revisa tu correo para confirmar.')
      setEmail('')
    } catch (error) {
      setStatus('error')
      setMessage('Hubo un error. Por favor, intenta nuevamente.')
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 p-8 md:p-12">
      <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
      
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Mantente actualizado
          </h3>
          <p className="text-primary-200 mb-8">
            Suscríbete a nuestro newsletter y recibe las últimas noticias, artículos y recursos directamente en tu bandeja de entrada.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative max-w-md mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-primary-500" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu correo electrónico"
                required
                className="w-full pl-11 pr-32 py-3 bg-white rounded-full border-2 border-transparent focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
              />
              <div className="absolute right-2 top-2">
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-6 py-1.5 bg-primary-600 text-white rounded-full hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'Suscribiendo...' : 'Suscribirse'}
                </button>
              </div>
            </div>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-sm ${
                  status === 'success' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {message}
              </motion.div>
            )}
          </form>

          <p className="mt-4 text-xs text-primary-300">
            Al suscribirte, aceptas recibir correos de marketing. Puedes darte de baja en cualquier momento.
          </p>
        </motion.div>
      </div>
    </div>
  )
} 