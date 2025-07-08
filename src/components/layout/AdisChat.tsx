'use client'

import {
  useState,
  useRef,
  useEffect,
  RefObject,
  ChangeEventHandler,
  FormEventHandler,
  useReducer,
  useMemo,
  FC,
  Dispatch
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SparklesIcon,
  PaperAirplaneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { categoriesList } from '@/data/categories-data'
import { PublicationsService, Publication } from '@/services/publications.service'
import Image from 'next/image'

// ============================================================================
// 1. TYPES & INTERFACES (Centralized & Clear)
// ============================================================================

interface AdisChatProps {
  isOpen: boolean
  onClose: () => void
}

type ConversationStage =
  | 'welcome'
  | 'category_selected'
  | 'subcategory_selected'
  | 'subsubcategory_selected'
  | 'show_results'

interface ConversationState {
  stage: ConversationStage
  selectedCategory?: string
  selectedSubcategory?: string
  selectedSubSubcategory?: string
}

type ConversationAction =
  | { type: 'SELECT_CATEGORY'; payload: string }
  | { type: 'SELECT_SUBCATEGORY'; payload: string }
  | { type: 'SELECT_SUB_SUBCATEGORY'; payload: string }
  | { type: 'SHOW_RESULTS' }
  | { type: 'GO_BACK' }
  | { type: 'RESTART' }

interface Category {
  id: string
  name: string
  subcategories: Subcategory[]
}

interface Subcategory {
  id: string
  name: string
  subSubcategories?: SubSubcategory[]
}

interface SubSubcategory {
  id: string
  name: string
}

// ============================================================================
// 2. STATE MANAGEMENT (The useReducer Logic)
// ============================================================================

const initialState: ConversationState = {
  stage: 'welcome'
}

function conversationReducer(
  state: ConversationState,
  action: ConversationAction
): ConversationState {
  switch (action.type) {
    case 'SELECT_CATEGORY':
      const category = categoriesList.find(c => c.id === action.payload)
      const hasSubcategories = category && category.subcategories.length > 0
      return {
        ...initialState,
        stage: hasSubcategories ? 'category_selected' : 'show_results',
        selectedCategory: action.payload
      }
    case 'SELECT_SUBCATEGORY':
      const currentCategory = categoriesList.find(c => c.id === state.selectedCategory)
      const subcategory = currentCategory?.subcategories.find(s => s.id === action.payload)
      const hasSubSubcategories = subcategory?.subSubcategories && subcategory.subSubcategories.length > 0
      return {
        ...state,
        stage: hasSubSubcategories ? 'subcategory_selected' : 'show_results',
        selectedSubcategory: action.payload
      }
    case 'SELECT_SUB_SUBCATEGORY':
      return {
        ...state,
        stage: 'show_results',
        selectedSubSubcategory: action.payload
      }
    case 'SHOW_RESULTS':
      return { ...state, stage: 'show_results' }
    case 'GO_BACK':
      if (state.stage === 'subcategory_selected' || state.stage === 'show_results' && state.selectedSubcategory) {
        return {
          ...state,
          stage: 'category_selected',
          selectedSubcategory: undefined,
          selectedSubSubcategory: undefined
        }
      }
      return { ...initialState } // Default back action is to restart
    case 'RESTART':
      return initialState
    default:
      return state
  }
}

// ============================================================================
// 3. CUSTOM HOOKS (For Reusability & Separation of Concerns)
// ============================================================================

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  return isMobile
}

// ============================================================================
// 4. UI COMPONENTS (Modular & Focused)
// ============================================================================

// --- Screen Components ---

const WelcomeScreen: FC<{ dispatch: Dispatch<ConversationAction> }> = ({ dispatch }) => (
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
          onClick={() => dispatch({ type: 'SELECT_CATEGORY', payload: category.id })}
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

const SubcategoryScreen: FC<{ category: Category; dispatch: Dispatch<ConversationAction> }> = ({ category, dispatch }) => (
  <div className='py-8 flex flex-col h-full'>
    <button onClick={() => dispatch({ type: 'GO_BACK' })} className='mb-4 text-teal-600 dark:text-teal-400 text-sm'>
      &larr; Volver a categorías
    </button>
    <h4 className='text-lg font-bold text-slate-900 dark:text-white mb-4'>
      {category.name}
    </h4>
    <div className='space-y-2 flex-grow-0'>
      {category.subcategories.map(subcat => (
        <button
          key={subcat.id}
          onClick={() => dispatch({ type: 'SELECT_SUBCATEGORY', payload: subcat.id })}
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

const SubSubcategoryScreen: FC<{ subcategory: Subcategory; dispatch: Dispatch<ConversationAction> }> = ({ subcategory, dispatch }) => (
  <div className='py-8 flex flex-col h-full'>
    <button onClick={() => dispatch({ type: 'GO_BACK' })} className='mb-4 text-teal-600 dark:text-teal-400 text-sm'>
      &larr; Volver a subcategorías
    </button>
    <h4 className='text-lg font-bold text-slate-900 dark:text-white mb-4'>
      {subcategory.name}
    </h4>
    <div className='space-y-2 flex-grow-0'>
      {subcategory.subSubcategories?.map(subsub => (
        <button
          key={subsub.id}
          onClick={() => dispatch({ type: 'SELECT_SUB_SUBCATEGORY', payload: subsub.id })}
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

const ResultsScreen: FC<{
  state: ConversationState
  dispatch: Dispatch<ConversationAction>
}> = ({ state, dispatch }) => {
  const { selectedCategory, selectedSubcategory, selectedSubSubcategory } = state
  const [ads, setAds] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { category, subcategory, subSubcategory } = useMemo(() => {
    const cat = categoriesList.find(c => c.id === selectedCategory)
    const sub = cat?.subcategories.find(s => s.id === selectedSubcategory)
    const subSub = sub?.subSubcategories?.find(ss => ss.id === selectedSubSubcategory)
    return { category: cat, subcategory: sub, subSubcategory: subSub }
  }, [selectedCategory, selectedSubcategory, selectedSubSubcategory])

  useEffect(() => {
    setLoading(true)
    setError('')
    PublicationsService.getPublications({
      category: selectedCategory,
      subcategory: selectedSubcategory,
      // subSubcategory: selectedSubSubcategory, // Prepare for backend implementation
      status: 'activo',
      limit: 12
    })
      .then(res => {
        setAds(res.publications)
        setLoading(false)
      })
      .catch(() => {
        setError('No se pudieron cargar los anuncios. Intenta de nuevo.')
        setLoading(false)
      })
  }, [selectedCategory, selectedSubcategory, selectedSubSubcategory])

  return (
    <div className='py-8 flex flex-col h-full'>
      <button onClick={() => dispatch({ type: 'RESTART' })} className='mb-4 text-teal-600 dark:text-teal-400 text-sm'>
        &larr; Nueva búsqueda
      </button>
      <h4 className='text-lg font-bold text-slate-900 dark:text-white mb-4'>
        Resultados para {category?.name}
        {subcategory ? ` / ${subcategory.name}` : ''}
        {subSubcategory ? ` / ${subSubcategory.name}` : ''}
      </h4>
      {loading ? (
        <div className='text-slate-500 dark:text-slate-400'>Cargando anuncios...</div>
      ) : error ? (
        <div className='text-red-500 dark:text-red-400'>{error}</div>
      ) : ads.length === 0 ? (
        <div className='text-slate-500 dark:text-slate-400'>No se encontraron anuncios para esta búsqueda.</div>
      ) : (
        <div className='space-y-4'>
          {ads.map((ad) => (
            <div key={ad._id} className='bg-slate-50 dark:bg-slate-800 rounded-xl p-4 flex gap-4 items-center'>
              <Image src={ad.images?.[0] || '/images/no-image.png'} alt={ad.title} width={64} height={64} className='w-16 h-16 object-cover rounded-lg' />
              <div className='flex-1'>
                <h5 className='font-semibold text-slate-900 dark:text-white'>{ad.title}</h5>
                <p className='text-sm text-slate-600 dark:text-slate-400 line-clamp-2'>{ad.description}</p>
                <div className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
                  {ad.location?.city || ad.location?.province || ad.location?.country || 'Sin ubicación'}
                  {ad.value ? ` • S/ ${ad.value}` : ''}
                </div>
              </div>
              <a href={`/anuncio/${ad._id}`} target='_blank' rel="noopener noreferrer" className='ml-2 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full text-xs'>Ver</a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Wrapper & Layout Components ---

const ChatInput: FC<{
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  onSubmit: FormEventHandler<HTMLFormElement>
  isTyping: boolean
  inputRef: RefObject<HTMLInputElement>
}> = ({ value, onChange, onSubmit, isTyping, inputRef }) => (
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

const ChatHeader: FC<{ isTyping: boolean; onClose: () => void }> = ({ isTyping, onClose }) => (
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

// This is the Presentational Component
const AdisChatView: FC<{
  state: ConversationState
  dispatch: Dispatch<ConversationAction>
  onClose: () => void
}> = ({ state, dispatch, onClose }) => {
  const isMobile = useIsMobile()
  const inputRef = useRef<HTMLInputElement>(null)
  
  // The free-text input state is managed here as it's purely UI state
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const { category, subcategory } = useMemo(() => {
    const cat = categoriesList.find(c => c.id === state.selectedCategory)
    const sub = cat?.subcategories.find(s => s.id === state.selectedSubcategory)
    return { category: cat, subcategory: sub }
  }, [state.selectedCategory, state.selectedSubcategory])
  
  // This logic is simplified with a declarative map
  const renderContent = () => {
    switch (state.stage) {
      case 'welcome':
        return <WelcomeScreen dispatch={dispatch} />
      case 'category_selected':
        if (!category) return null // Or a fallback UI
        return <SubcategoryScreen category={category} dispatch={dispatch} />
      case 'subcategory_selected':
        if (!subcategory) return null // Or a fallback UI
        return <SubSubcategoryScreen subcategory={subcategory} dispatch={dispatch} />
      case 'show_results':
        return <ResultsScreen state={state} dispatch={dispatch} />
      default:
        return <WelcomeScreen dispatch={dispatch} />
    }
  }

  const handleFreeTextMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    // TODO: Implement advanced NLP or keyword-based routing
    // For now, it just clears the input
    console.log("User message:", inputValue)
    setIsTyping(true)
    setTimeout(() => {
        setIsTyping(false)
        // You could dispatch an action here based on text analysis
    }, 1000)
    setInputValue('')
  }
  
  const containerClasses = isMobile
    ? 'fixed bottom-0 left-0 right-0 h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl z-50 flex flex-col'
    : 'fixed top-20 right-4 w-[400px] h-[calc(100vh-6rem)] max-h-[700px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 flex flex-col'

  const motionProps = isMobile
    ? { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } }
    : { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } }
    
  return (
    <motion.div
      {...motionProps}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className={containerClasses}
      onPointerDown={e => e.stopPropagation()}
    >
      <ChatHeader isTyping={isTyping} onClose={onClose} />
      <div className='flex-1 h-0 overflow-y-auto p-4 space-y-4'>
        {renderContent()}
      </div>
      <ChatInput
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onSubmit={handleFreeTextMessage}
        isTyping={isTyping}
        inputRef={inputRef}
      />
    </motion.div>
  )
}

// ============================================================================
// 5. FINAL EXPORTED COMPONENT (Container)
// ============================================================================

export default function AdisChat({ isOpen, onClose }: AdisChatProps) {
  const [state, dispatch] = useReducer(conversationReducer, initialState)
  const isMobile = useIsMobile()

  // Reset state when the chat is closed
  useEffect(() => {
    if (!isOpen) {
      // Delay reset to allow exit animation to complete
      setTimeout(() => {
        dispatch({ type: 'RESTART' })
      }, 300)
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isMobile ? undefined : onClose}
            className='fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40'
          />
          {/* The chat window itself */}
          <AdisChatView state={state} dispatch={dispatch} onClose={onClose} />
        </>
      )}
    </AnimatePresence>
  )
}