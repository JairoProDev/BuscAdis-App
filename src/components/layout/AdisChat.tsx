'use client'

import { useState, useRef, useEffect, RefObject, ChangeEventHandler, FormEventHandler } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SparklesIcon,
  PaperAirplaneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface AdisChatProps {
  isOpen: boolean
  onClose: () => void
}

interface Message {
  id: string
  text: string
  sender: 'user' | 'adis'
  timestamp: Date
}

const WelcomeScreen = ({
  onQuickSuggestion
}: {
  onQuickSuggestion: (suggestion: string) => void
}) => (
  <div className='text-center py-8 flex flex-col justify-center h-full'>
    <div className='w-16 h-16 bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/40 dark:to-cyan-900/40 rounded-full flex items-center justify-center mx-auto mb-4'>
      <SparklesIcon className='w-8 h-8 text-teal-600 dark:text-teal-400' />
    </div>
    <h4 className='text-lg font-bold text-slate-900 dark:text-white mb-2'>
      ¡Hola! Soy ADIS ✨
    </h4>
    <p className='text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-xs mx-auto'>
      Tu asistente personal de BuscAdis. Te ayudo a encontrar exactamente lo que
      necesitas.
    </p>
    <div className='space-y-2 flex-grow-0'>
      <p className='text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3'>
        Prueba preguntándome:
      </p>
      {[
        { text: 'Buscar empleos remotos', emoji: '💼' },
        { text: 'Departamentos en Miraflores', emoji: '🏠' },
        { text: 'Autos usados baratos', emoji: '🚗' },
        { text: 'Cursos de programación', emoji: '💻' }
      ].map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onQuickSuggestion(suggestion.text)}
          className='w-full p-3 text-left bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 text-sm group border border-transparent hover:border-teal-200 dark:hover:border-teal-800'
        >
          <span className='mr-2'>{suggestion.emoji}</span>
          <span className='group-hover:text-teal-600 dark:group-hover:text-teal-400'>
            {suggestion.text}
          </span>
        </button>
      ))}
    </div>
  </div>
)

const ChatMessages = ({
  messages,
  isTyping,
  messagesEndRef
}: {
  messages: Message[]
  isTyping: boolean
  messagesEndRef: RefObject<HTMLDivElement>
}) => (
  <>
    {messages.map((message: Message) => (
      <div
        key={message.id}
        className={`flex ${
          message.sender === 'user' ? 'justify-end' : 'justify-start'
        }`}
      >
        <div
          className={`
            max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl shadow-sm
            ${
              message.sender === 'user'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
            }
          `}
        >
          <p className='text-sm'>{message.text}</p>
          <p
            className={`text-xs mt-1 ${
              message.sender === 'user'
                ? 'text-teal-100'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    ))}
    {isTyping && (
      <div className='flex justify-start'>
        <div className='bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl shadow-sm'>
          <div className='flex space-x-1'>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className='w-2 h-2 bg-slate-400 rounded-full'
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </div>
      </div>
    )}
    <div ref={messagesEndRef} />
  </>
)

const ChatInput = ({
  value,
  onChange,
  onSubmit,
  isTyping,
  inputRef
}: {
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  onSubmit: FormEventHandler<HTMLFormElement>
  isTyping: boolean
  inputRef: RefObject<HTMLInputElement>
}) => (
  <div className='flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-700'>
    <form onSubmit={onSubmit} className='flex gap-2'>
      <input
        ref={inputRef}
        type='text'
        value={value}
        onChange={onChange}
        placeholder='Escribe tu pregunta aquí...'
        className='w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200'
      />
      <button
        type='submit'
        disabled={!value.trim() || isTyping}
        className='w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed'
      >
        <PaperAirplaneIcon className='w-5 h-5' />
      </button>
    </form>
  </div>
)

const ChatHeader = ({
  isTyping,
  onClose
}: {
  isTyping: boolean
  onClose: () => void
}) => (
  <div className='flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20'>
    <div className='flex items-center gap-3'>
      <div className='w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg'>
        <SparklesIcon className='w-6 h-6 text-white' />
      </div>
      <div>
        <h3 className='font-bold text-slate-900 dark:text-white'>ADIS</h3>
        <p className='text-xs text-slate-600 dark:text-slate-400'>
          {isTyping ? 'Escribiendo...' : 'Asistente inteligente'}
        </p>
      </div>
    </div>
    <button
      onClick={onClose}
      className='w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all duration-200 group'
    >
      <XMarkIcon className='w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300' />
    </button>
  </div>
)

export default function AdisChat ({ isOpen, onClose }: AdisChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current && !isMobile) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen, isMobile])

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
    const responses: { [key: string]: string } = {
      empleo:
        '¡Perfecto! Te ayudo a encontrar empleos. ¿En qué área te interesa trabajar? Tenemos oportunidades en tecnología, marketing, ventas, y muchas más.',
      inmueble:
        'Te ayudo a encontrar el hogar perfecto. ¿Qué tipo de propiedad buscas y en qué zona? Puedo mostrarte las mejores opciones disponibles.',
      vehículo:
        '¡Genial! Te ayudo con vehículos. ¿Buscas algo específico? Puedo ayudarte a encontrar autos, motos, o cualquier tipo de vehículo que necesites.',
      hola: '¡Hola! 👋 Soy ADIS, tu asistente inteligente de BuscAdis. Estoy aquí para ayudarte a encontrar exactamente lo que necesitas. ¿Qué estás buscando hoy?'
    }
    for (const key in responses) {
      if (text.includes(key)) return responses[key]
    }
    return 'Entiendo que estás buscando algo específico. ¿Podrías darme más detalles? Puedo ayudarte a encontrar empleos, inmuebles, vehículos, servicios y mucho más en BuscAdis.'
  }

  const handleQuickSuggestion = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(inputValue)
  }

  const containerClasses = isMobile
    ? 'fixed bottom-0 left-0 right-0 h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl z-50 flex flex-col'
    : 'fixed top-20 right-4 w-[400px] h-[calc(100vh-6rem)] max-h-[700px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 flex flex-col'

  const motionProps = isMobile
    ? { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } }
    : { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 bg-transparent z-40'
          />

          <motion.div
            {...motionProps}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={containerClasses}
            onPointerDown={e => e.stopPropagation()}
          >
            <ChatHeader isTyping={isTyping} onClose={onClose} />

            <div className='flex-1 h-0 overflow-y-auto p-4 space-y-4'>
              {messages.length === 0 ? (
                <WelcomeScreen onQuickSuggestion={handleQuickSuggestion} />
              ) : (
                <ChatMessages
                  messages={messages}
                  isTyping={isTyping}
                  messagesEndRef={messagesEndRef}
                />
              )}
            </div>

            <ChatInput
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onSubmit={handleSubmit}
              isTyping={isTyping}
              inputRef={inputRef}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 