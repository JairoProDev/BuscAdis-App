'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EnvelopeIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'

export default function MagazineForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setStatus('loading')

    try {
      // Simulamos un pequeño retraso para mostrar el estado loading
      await new Promise(resolve => setTimeout(resolve, 1000))
      
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
      
      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 5000)
    } catch {
      setStatus('error')
      setMessage('Hubo un error. Por favor, intenta nuevamente.')
      
      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 5000)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-slate-800/90 backdrop-blur-md p-8 md:p-10 shadow-xl border border-teal-500/20">
      <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-[0.03]" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/10 rounded-full filter blur-3xl opacity-20" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/10 rounded-full filter blur-3xl opacity-20" />
      
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative max-w-md mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-teal-400" />
              </div>
              
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu correo electrónico"
                required
                disabled={status === 'loading' || status === 'success'}
                className="w-full pl-11 pr-28 py-3.5 bg-slate-800/70 border-2 border-teal-500/20 focus:border-teal-400/60 text-white rounded-xl focus:ring-2 focus:ring-teal-400/20 transition-all duration-200 shadow-inner outline-none disabled:opacity-70 disabled:cursor-not-allowed"
              />
              
              <div className="absolute right-2 top-2">
                <button
                  type="submit"
                  disabled={status === 'loading' || status === 'success' || !email}
                  className="px-5 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  {status === 'loading' ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <span>Suscribirse</span>
                      <PaperAirplaneIcon className="h-4 w-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: 10, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-center space-x-2 text-sm ${
                    status === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {status === 'success' ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-400" />
                  )}
                  <span>{message}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <p className="mt-6 text-xs text-slate-400 text-center">
            Al suscribirte, aceptas recibir correos de marketing. Puedes darte de baja en cualquier momento.
          </p>
        </motion.div>
      </div>
    </div>
  )
} 