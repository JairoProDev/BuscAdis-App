'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import PostCard from '@/components/blog/PostCard'
import NewsletterForm from '@/components/blog/NewsletterForm'
import { Post } from '@/types/blog'
import { 
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline'

// Datos de ejemplo - Reemplazar con datos reales de la API
const mockPosts: Post[] = [
  // Aquí irán los posts reales
]

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const featuredPosts = mockPosts.filter(post => post.featured)
  const regularPosts = mockPosts.filter(post => !post.featured)

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-primary-800">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
        
        <div className="relative container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Blog de BuscAdis
            </h1>
            <p className="text-xl text-primary-200 mb-12">
              Descubre las últimas tendencias, consejos y noticias sobre un mundo lleno de oportunidades: Empleos, Inmuebles, VehÍculos, Servicios, Productos, Turimo, Educación y mucho más.
            </p>

            {/* Buscador */}
            <div className="relative max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar artículos..."
                  className="w-full px-6 py-4 bg-white rounded-full border-2 border-transparent focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 pl-12"
                />
                <div className="absolute inset-y-0 left-4 flex items-center">
                  <MagnifyingGlassIcon className="h-5 w-5 text-primary-500" />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="absolute inset-y-2 right-2 px-4 flex items-center bg-primary-100 text-primary-700 rounded-full hover:bg-primary-200 transition-colors"
                >
                  <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                  Filtros
                </button>
              </div>

              {/* Filtros */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-0 right-0 top-full mt-4 bg-white rounded-2xl shadow-xl p-6 z-10"
                >
                  {/* Implementar filtros aquí */}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredPosts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                featured={true}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Regular Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <NewsletterForm />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-primary-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Explora por Categorías
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Implementar categorías aquí */}
          </div>
        </div>
      </section>
    </div>
  )
} 