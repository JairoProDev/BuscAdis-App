'use client'

import { useState, useRef, useEffect, RefObject, ChangeEventHandler, FormEventHandler } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SparklesIcon,
  PaperAirplaneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { categories } from '@/data/categories'
import { categoriesList } from '@/data/categories-data'
import { featuredAds } from '@/data/featuredAds'

interface AdisChatProps {
  isOpen: boolean
  onClose: () => void
}

interface Message {
  id: string
  text: string
  sender: 'user' | 'adis'
  timestamp: Date
  options?: string[]
  onOptionClick?: (option: string) => void
}

type ConversationStage =
  | 'welcome'
  | 'category_selected'
  | 'subcategory_selected'
  | 'subsubcategory_selected'
  | 'show_results'

interface ConversationContext {
  stage: ConversationStage
  selectedCategory?: string
  selectedSubcategory?: string
  selectedSubSubcategory?: string
}

const WelcomeScreen = ({
  onCategorySelect
}: {
  onCategorySelect: (categoryId: string) => void
}) => (
  <div className='text-center py-8 flex flex-col justify-center h-full'>
    <div className='w-16 h-16 bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/40 dark:to-cyan-900/40 rounded-full flex items-center justify-center mx-auto mb-4'>
      <SparklesIcon className='w-8 h-8 text-teal-600 dark:text-teal-400' />
    </div>
    <h4 className='text-lg font-bold text-slate-900 dark:text-white mb-2'>
      ¡Hola! Soy ADIS ✨
    </h4>
    <p className='text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-xs mx-auto'>
      Estoy aquí para ayudarte. ¿Qué estás buscando hoy? Elige una categoría para empezar.
    </p>
    <div className='space-y-2 flex-grow-0'>
      {categoriesList.map(category => (
        <button
          key={category.id}
          onClick={() => onCategorySelect(category.id)}
          className='w-full p-3 text-left bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 text-sm group border border-transparent hover:border-teal-200 dark:hover:border-teal-800'
        >
          <span className='group-hover:text-teal-600 dark:group-hover:text-teal-400'>
            {category.name}
          </span>
        </button>
      ))}
    </div>
  </div>
)

const SubcategoryScreen = ({
  categoryId,
  onSubcategorySelect,
  onBack
}: {
  categoryId: string
  onSubcategorySelect: (subcategoryId: string) => void
  onBack: () => void
}) => {
  const category = categoriesList.find(c => c.id === categoryId)
  if (!category) return null
  return (
    <div className='py-8 flex flex-col h-full'>
      <button onClick={onBack} className='mb-4 text-teal-600 dark:text-teal-400 text-sm'>&larr; Volver a categorías</button>
      <h4 className='text-lg font-bold text-slate-900 dark:text-white mb-4'>
        {category.name}
      </h4>
      <div className='space-y-2 flex-grow-0'>
        {category.subcategories.map(subcat => (
          <button
            key={subcat.id}
            onClick={() => onSubcategorySelect(subcat.id)}
            className='w-full p-3 text-left bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 text-sm group border border-transparent hover:border-teal-200 dark:hover:border-teal-800'
          >
            <span className='group-hover:text-teal-600 dark:group-hover:text-teal-400'>
              {subcat.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

const SubSubcategoryScreen = ({
  categoryId,
  subcategoryId,
  onSubSubcategorySelect,
  onBack
}: {
  categoryId: string
  subcategoryId: string
  onSubSubcategorySelect: (subSubcategoryId: string) => void
  onBack: () => void
}) => {
  const category = categoriesList.find(c => c.id === categoryId)
  const subcategory = category?.subcategories.find(s => s.id === subcategoryId)
  if (!subcategory || !subcategory.subSubcategories || subcategory.subSubcategories.length === 0) return null
  return (
    <div className='py-8 flex flex-col h-full'>
      <button onClick={onBack} className='mb-4 text-teal-600 dark:text-teal-400 text-sm'>&larr; Volver a subcategorías</button>
      <h4 className='text-lg font-bold text-slate-900 dark:text-white mb-4'>
        {subcategory.name}
      </h4>
      <div className='space-y-2 flex-grow-0'>
        {subcategory.subSubcategories.map(subsub => (
          <button
            key={subsub.id}
            onClick={() => onSubSubcategorySelect(subsub.id)}
            className='w-full p-3 text-left bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 text-sm group border border-transparent hover:border-teal-200 dark:hover:border-teal-800'
          >
            <span className='group-hover:text-teal-600 dark:group-hover:text-teal-400'>
              {subsub.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

const ResultsScreen = ({
  categoryId,
  subcategoryId,
  subSubcategoryId,
  onRestart
}: {
  categoryId: string
  subcategoryId?: string
  subSubcategoryId?: string
  onRestart: () => void
}) => {
  const category = categoriesList.find(c => c.id === categoryId)
  const subcategory = category?.subcategories.find(s => s.id === subcategoryId)
  const subSubcategory = subcategory?.subSubcategories?.find(ss => ss.id === subSubcategoryId)
  const ads = featuredAds.filter(ad => {
    if (category && ad.category && ad.category.toLowerCase().includes(category.name.toLowerCase())) {
      return true
    }
    return false
  })
  return (
    <div className='py-8 flex flex-col h-full'>
      <button onClick={onRestart} className='mb-4 text-teal-600 dark:text-teal-400 text-sm'>
        &larr; Nueva búsqueda
      </button>
      <h4 className='text-lg font-bold text-slate-900 dark:text-white mb-4'>
        Resultados para {category?.name}{subcategory ? ` / ${subcategory.name}` : ''}{subSubcategory ? ` / ${subSubcategory.name}` : ''}
      </h4>
      {ads.length === 0 ? (
        <div className='text-slate-500 dark:text-slate-400'>No se encontraron anuncios destacados para esta categoría.</div>
      ) : (
        <div className='space-y-4'>
          {ads.map((ad, idx) => (
            <div key={idx} className='bg-slate-50 dark:bg-slate-800 rounded-xl p-4 flex gap-4 items-center'>
              <img src={ad.imageUrl} alt={ad.title} className='w-16 h-16 object-cover rounded-lg' />
              <div className='flex-1'>
                <h5 className='font-semibold text-slate-900 dark:text-white'>{ad.title}</h5>
                <p className='text-sm text-slate-600 dark:text-slate-400'>{ad.description}</p>
                <div className='text-xs text-slate-500 dark:text-slate-400 mt-1'>{ad.location} &bull; {ad.price}</div>
              </div>
              <button className='ml-2 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full text-xs'>Contactar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

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
        className={`flex flex-col ${
          message.sender === 'user' ? 'items-end' : 'items-start'
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
        {message.options && message.onOptionClick && (
          <div className='mt-2 flex flex-wrap gap-2'>
            {message.options.map(option => (
              <button
                key={option}
                onClick={() => message.onOptionClick?.(option)}
                className='px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-full text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all'
              >
                {option}
              </button>
            ))}
          </div>
        )}
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
  const [context, setContext] = useState<ConversationContext>({
    stage: 'welcome'
  })
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

  const addMessage = (
    text: string,
    sender: 'user' | 'adis',
    options?: {
      payload: string[]
      handler: (option: string) => void
    }
  ) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      ...(options && {
        options: options.payload,
        onOptionClick: options.handler
      })
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return

    addMessage(text, 'user')
    setInputValue('')
    setIsTyping(true)

    // TODO: Advanced response generation based on context
    setTimeout(() => {
      addMessage(getAdisResponse(text), 'adis')
      setIsTyping(false)
    }, 1500)
  }

  const getAdisResponse = (userText: string): string => {
    // This will be replaced with context-aware logic
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

  const handleCategorySelect = (categoryId: string) => {
    setContext({ stage: 'category_selected', selectedCategory: categoryId })
  }

  const handleSubcategorySelect = (subcategoryId: string) => {
    setContext(ctx => ({ ...ctx, stage: 'subcategory_selected', selectedSubcategory: subcategoryId }))
  }

  const handleSubSubcategorySelect = (subSubcategoryId: string) => {
    setContext(ctx => ({ ...ctx, stage: 'subsubcategory_selected', selectedSubSubcategory: subSubcategoryId }))
  }

  const handleShowResults = () => {
    setContext(ctx => ({ ...ctx, stage: 'show_results' }))
  }

  const handleRestart = () => {
    setContext({ stage: 'welcome' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(inputValue)
  }

  let content
  if (context.stage === 'welcome') {
    content = <WelcomeScreen onCategorySelect={handleCategorySelect} />
  } else if (context.stage === 'category_selected' && context.selectedCategory) {
    content = <SubcategoryScreen categoryId={context.selectedCategory} onSubcategorySelect={handleSubcategorySelect} onBack={handleRestart} />
  } else if (context.stage === 'subcategory_selected' && context.selectedCategory && context.selectedSubcategory) {
    const category = categoriesList.find(c => c.id === context.selectedCategory)
    const subcategory = category?.subcategories.find(s => s.id === context.selectedSubcategory)
    if (subcategory?.subSubcategories && subcategory.subSubcategories.length > 0) {
      content = <SubSubcategoryScreen categoryId={context.selectedCategory} subcategoryId={context.selectedSubcategory} onSubSubcategorySelect={subId => { handleSubSubcategorySelect(subId); handleShowResults(); }} onBack={() => setContext(ctx => ({ ...ctx, stage: 'category_selected', selectedSubcategory: undefined }))} />
    } else {
      content = <ResultsScreen categoryId={context.selectedCategory} subcategoryId={context.selectedSubcategory} onRestart={handleRestart} />
    }
  } else if (context.stage === 'subsubcategory_selected' && context.selectedCategory && context.selectedSubcategory && context.selectedSubSubcategory) {
    content = <ResultsScreen categoryId={context.selectedCategory} subcategoryId={context.selectedSubcategory} subSubcategoryId={context.selectedSubSubcategory} onRestart={handleRestart} />
  } else if (context.stage === 'show_results' && context.selectedCategory) {
    content = <ResultsScreen categoryId={context.selectedCategory} subcategoryId={context.selectedSubcategory} subSubcategoryId={context.selectedSubSubcategory} onRestart={handleRestart} />
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
            onClick={isMobile ? undefined : onClose}
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
              {content}
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