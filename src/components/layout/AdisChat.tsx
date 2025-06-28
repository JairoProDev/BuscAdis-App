'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SparklesIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface AdisChatProps {
  isOpen: boolean
  onClose: () => void
  variant?: 'mobile' | 'desktop'
}

interface Message {
  id: string
  text: string
  sender: 'user' | 'adis'
  timestamp: Date
}

export default function AdisChat({ isOpen, onClose, variant = 'mobile' }: AdisChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Pequeño delay para que la animación termine antes de hacer focus
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simular respuesta de ADIS
    setTimeout(() => {
      const adisResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAdisResponse(text),
        sender: 'adis',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, adisResponse])
      setIsTyping(false)
    }, 1500)
  }

  const getAdisResponse = (userText: string): string => {
    const text = userText.toLowerCase()
    
    if (text.includes('empleo') || text.includes('trabajo') || text.includes('job')) {
      return '¡Perfecto! Te ayudo a encontrar empleos. ¿En qué área te interesa trabajar? Tenemos oportunidades en tecnología, marketing, ventas, y muchas más.'
    }
    
    if (text.includes('casa') || text.includes('departamento') || text.includes('alquiler') || text.includes('inmueble')) {
      return 'Te ayudo a encontrar el hogar perfecto. ¿Qué tipo de propiedad buscas y en qué zona? Puedo mostrarte las mejores opciones disponibles.'
    }
    
    if (text.includes('auto') || text.includes('carro') || text.includes('vehículo') || text.includes('moto')) {
      return '¡Genial! Te ayudo con vehículos. ¿Buscas algo específico? Puedo ayudarte a encontrar autos, motos, o cualquier tipo de vehículo que necesites.'
    }
    
    if (text.includes('hola') || text.includes('hi') || text.includes('hello')) {
      return '¡Hola! 👋 Soy ADIS, tu asistente inteligente de BuscAdis. Estoy aquí para ayudarte a encontrar exactamente lo que necesitas. ¿Qué estás buscando hoy?'
    }
    
    return 'Entiendo que estás buscando algo específico. ¿Podrías darme más detalles? Puedo ayudarte a encontrar empleos, inmuebles, vehículos, servicios y mucho más en BuscAdis.'
  }

  const quickSuggestions = [
    { text: 'Buscar empleos remotos', emoji: '💼' },
    { text: 'Departamentos en Miraflores', emoji: '🏠' },
    { text: 'Autos usados baratos', emoji: '🚗' },
    { text: 'Cursos de programación', emoji: '💻' }
  ]

  const handleQuickSuggestion = (suggestion: string) => {
    setInputValue(suggestion)
    inputRef.current?.focus()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(inputValue)
  }

  // Configuración responsive
  const isMobile = variant === 'mobile'
  
  const containerClasses = isMobile
    ? "fixed bottom-0 left-0 right-0 h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl z-50 md:hidden"
    : "fixed top-0 right-0 w-full md:w-[400px] h-full md:h-[calc(100vh-4rem)] md:top-16 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-xl z-50"

  const motionProps = isMobile
    ? {
        initial: { y: '100%' },
        animate: { y: 0 },
        exit: { y: '100%' }
      }
    : {
        initial: { x: '100%' },
        animate: { x: 0 },
        exit: { x: '100%' }
      }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          
          {/* Chat Container */}
          <motion.div
            {...motionProps}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={containerClasses}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">ADIS</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {isTyping ? 'Escribiendo...' : 'Asistente inteligente'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all duration-200 group"
              >
                <XMarkIcon className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                /* Welcome Screen */
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/40 dark:to-cyan-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SparklesIcon className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    ¡Hola! Soy ADIS ✨
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-xs mx-auto">
                    Tu asistente personal de BuscAdis. Te ayudo a encontrar exactamente lo que necesitas.
                  </p>
                  
                  {/* Quick Suggestions */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
                      Prueba preguntándome:
                    </p>
                    {quickSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickSuggestion(suggestion.text)}
                        className="w-full p-3 text-left bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 text-sm group border border-transparent hover:border-teal-200 dark:hover:border-teal-800"
                      >
                        <span className="mr-2">{suggestion.emoji}</span>
                        <span className="group-hover:text-teal-600 dark:group-hover:text-teal-400">
                          {suggestion.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Messages */
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`
                          max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl shadow-sm
                          ${message.sender === 'user'
                            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                          }
                        `}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-teal-100' : 'text-slate-500 dark:text-slate-400'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl shadow-sm">
                        <div className="flex space-x-1">
                          <motion.div
                            className="w-2 h-2 bg-slate-400 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-slate-400 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-slate-400 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Escribe tu pregunta aquí..."
                  className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[48px]"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 