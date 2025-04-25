'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdvancedSearchBar from './AdvancedSearchBar'
import CategorySelector from './CategorySelector'
import { getCategories } from './CategorySelector/utils'

export default function SearchPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | undefined>()
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState<string | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Simular búsqueda cuando cambian los parámetros
  useEffect(() => {
    if (searchQuery || selectedCategory) {
      setIsLoading(true)
      
      // Simular tiempo de carga
      const timer = setTimeout(() => {
        // Generar resultados de búsqueda simulados
        const mockResults = []
        const count = Math.floor(Math.random() * 20) + 5
        
        for (let i = 0; i < count; i++) {
          mockResults.push({
            id: `result-${i}`,
            title: `Resultado ${i + 1} para "${searchQuery || 'todos'}" ${selectedCategory ? `en ${selectedCategory}` : ''}`,
            description: 'Descripción del resultado de búsqueda con información relevante.',
            category: selectedCategory || 'general',
            subcategory: selectedSubcategory,
            date: new Date().toLocaleDateString()
          })
        }
        
        setSearchResults(mockResults)
        setIsLoading(false)
      }, 800)
      
      return () => clearTimeout(timer)
    } else {
      setSearchResults([])
    }
  }, [searchQuery, selectedCategory, selectedSubcategory, selectedSubSubcategory])

  // Manejar la búsqueda
  const handleSearch = (query: string, options?: any) => {
    console.log('Búsqueda:', query, options)
    setSearchQuery(query)
    
    if (options?.category) {
      setSelectedCategory(options.category)
    }
    
    if (options?.subcategory) {
      setSelectedSubcategory(options.subcategory)
    }
    
    if (options?.subsubcategory) {
      setSelectedSubSubcategory(options.subsubcategory)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2 text-white">BuscAdis</h1>
        <p className="text-slate-300 mb-8">Encuentra todo lo que necesitas en un solo lugar</p>
        
        {/* Barra de búsqueda avanzada */}
        <div className="mb-10">
          <AdvancedSearchBar 
            onSearch={handleSearch}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            selectedSubSubcategory={selectedSubSubcategory}
            onSelectCategory={setSelectedCategory}
            onSelectSubcategory={setSelectedSubcategory}
            onSelectSubSubcategory={setSelectedSubSubcategory}
          />
        </div>
        
        {/* Contenido principal */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Selector de categorías en sidebar */}
          <div className="md:col-span-3">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-md p-4 shadow-lg border border-slate-700/50">
              <h2 className="font-semibold text-xl mb-4">Categorías</h2>
              <CategorySelector
                activeCategory={selectedCategory}
                activeSubcategory={selectedSubcategory}
                activeSubSubcategory={selectedSubSubcategory}
                onCategoryChange={setSelectedCategory}
                onSubcategoryChange={setSelectedSubcategory}
                onSubSubcategoryChange={setSelectedSubSubcategory}
                variant="vertical"
                className="mt-2"
              />
            </div>
          </div>
          
          {/* Resultados de búsqueda */}
          <div className="md:col-span-9">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-md p-6 shadow-lg border border-slate-700/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-xl">
                  {searchQuery ? (
                    <>Resultados para "{searchQuery}"</>
                  ) : selectedCategory ? (
                    <>Navegando {selectedCategory}</>
                  ) : (
                    <>Explora publicaciones</>
                  )}
                </h2>
                {searchResults.length > 0 && (
                  <span className="text-slate-300">
                    {searchResults.length} resultados
                  </span>
                )}
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="w-12 h-12 border-4 border-slate-600 border-t-teal-500 rounded-full animate-spin"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((result) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700/80 border border-slate-600/50 transition-colors cursor-pointer"
                    >
                      <h3 className="font-medium text-lg mb-1">{result.title}</h3>
                      <p className="text-slate-300 text-sm mb-2">{result.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {result.category && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-teal-900/50 text-teal-300 border border-teal-700/50">
                              {result.category}
                            </span>
                          )}
                          {result.subcategory && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-700/50">
                              {result.subcategory}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">{result.date}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div className="inline-flex items-center justify-center p-4 bg-slate-700/50 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-slate-300 mb-2">
                    {searchQuery ? 'No se encontraron resultados' : 'Comienza una búsqueda'}
                  </h3>
                  <p className="text-slate-400 max-w-md mx-auto">
                    {searchQuery 
                      ? 'Intenta con otros términos o categorías diferentes' 
                      : 'Selecciona una categoría o ingresa palabras clave para comenzar a buscar'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 