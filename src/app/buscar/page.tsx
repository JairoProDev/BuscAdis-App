'use client'

import { useState } from 'react'
import SearchBar from '@/components/search/SearchBar'

export default function BuscarPage() {
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (query: string) => {
    setLoading(true)
    try {
      // Aquí implementaremos la búsqueda real
      console.log('Buscando:', query)
      // Simular resultados por ahora
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSearchResults([])
    } catch (error) {
      console.error('Error en la búsqueda:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary-800 mb-8">
        Buscar Adisos
      </h1>

      <div className="mb-8">
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-primary-600">Buscando resultados...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div>
            {/* Aquí mostraremos los resultados */}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Comienza a buscar para ver resultados
          </div>
        )}
      </div>
    </div>
  )
} 