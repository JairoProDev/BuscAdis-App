'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PostCard from '@/components/blog/PostCard'
import MagazineForm from '@/components/blog/MagazineForm'
import { Post } from '@/types/blog'
import { AdjustmentsHorizontalIcon, MagnifyingGlassIcon, XMarkIcon, ArrowLongRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { categories as categoryData, posts as mockPosts } from '@/data/mockPosts'
import Container from '@/components/shared/Container'
import Image from 'next/image'

export default function BlogPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [showFilters, setShowFilters] = useState(false)
    const [mounted, setMounted] = useState(false)

    // Make sure we're only rendering on the client to avoid hydration issues
    useEffect(() => {
        setMounted(true)
    }, [])

    const featuredPosts = mockPosts.filter(post => post.featured)
    const regularPosts = mockPosts.filter(post => !post.featured)

    // Extract all unique tags from posts
    const allTags = Array.from(new Set(mockPosts.flatMap(post => post.tags.map(tag => tag.name))))

    // Handle tag toggle
    const toggleTag = (tagName: string) => {
        setSelectedTags(prev => 
            prev.includes(tagName) 
                ? prev.filter(t => t !== tagName) 
                : [...prev, tagName]
        )
    }

    // Filter posts based on search, category and tags
    const filteredPosts = regularPosts.filter(post => {
        const matchesSearch = !searchQuery || 
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
        
        const matchesCategory = !selectedCategory || post.category.id === selectedCategory
        
        const matchesTags = selectedTags.length === 0 || 
            selectedTags.some(tag => post.tags.some(t => t.name === tag))
        
        return matchesSearch && matchesCategory && matchesTags
    })

    if (!mounted) {
        return null // Return nothing during SSR to avoid hydration mismatch
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-teal-900/40 to-slate-900 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-5" />
                <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-teal-400/10 via-teal-300/5 to-emerald-400/10 rounded-full filter blur-xl opacity-30 animate-pulse-slow" />
                <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-cyan-400/10 via-white/5 to-teal-500/10 rounded-full filter blur-xl opacity-30 animate-pulse-slow animation-delay-2000" />
                <motion.div
                    className="absolute top-10 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/40 to-transparent"
                    animate={{ 
                        background: [
                            'linear-gradient(to right, rgba(0,0,0,0), rgba(20,184,166,0.4), rgba(0,0,0,0))', 
                            'linear-gradient(to right, rgba(20,184,166,0.4), rgba(0,0,0,0), rgba(20,184,166,0.4))'
                        ], 
                        x: ['0%', '100%'] 
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                />
                <div className="absolute inset-0">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <motion.div 
                            key={i} 
                            className="absolute w-1 h-1 bg-teal-400/40 rounded-full" 
                            initial={{ 
                                x: `${Math.random() * 100}%`, 
                                y: `${Math.random() * 100}%`, 
                                opacity: Math.random() * 0.5 + 0.3 
                            }} 
                            animate={{ 
                                y: ['0%', '100%'], 
                                opacity: [0.3, 0.8, 0.3] 
                            }} 
                            transition={{ 
                                repeat: Infinity, 
                                duration: Math.random() * 10 + 15, 
                                ease: 'linear', 
                                delay: Math.random() * 5 
                            }} 
                        />
                    ))}
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative pt-24 pb-12 overflow-hidden">
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl mx-auto text-center"
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                            Blog de <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">BuscAdis</span>
                        </h1>
                        <p className="text-xl text-cyan-100/90 mb-12 leading-relaxed">
                            Descubre las últimas tendencias, consejos y noticias sobre un mundo lleno de 
                            oportunidades: Empleos, Inmuebles, Vehículos, Servicios, Productos, Turismo, 
                            Educación y mucho más.
                        </p>

                        {/* Search bar */}
                        <div className="relative max-w-2xl mx-auto mb-8">
                            <div className="relative flex items-center">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-teal-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Buscar artículos..."
                                    className="block w-full pl-12 pr-32 py-4 bg-slate-800/70 backdrop-blur-sm text-white border border-teal-500/20 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none placeholder:text-slate-400 shadow-xl"
                                />
                                {searchQuery && (
                                    <button 
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-20 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-700/70"
                                        aria-label="Limpiar búsqueda"
                                    >
                                        <XMarkIcon className="h-5 w-5 text-slate-400" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
                                        showFilters ? 'bg-teal-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                                    }`}
                                    aria-label={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
                                >
                                    <AdjustmentsHorizontalIcon className="h-5 w-5" />
                                </button>
                            </div>

                            <AnimatePresence>
                                {showFilters && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute left-0 right-0 top-full mt-4 bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-2xl p-6 z-10 border border-teal-500/10"
                                    >
                                        <div className="mb-4">
                                            <h3 className="text-white font-semibold mb-2">Categorías</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {categoryData.map(category => (
                                                    <button
                                                        key={category.id}
                                                        onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                                                        className={`px-3 py-1 rounded-full text-sm ${
                                                            selectedCategory === category.id 
                                                                ? 'bg-teal-500 text-white' 
                                                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                        }`}
                                                    >
                                                        {category.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <h3 className="text-white font-semibold mb-2">Etiquetas</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {allTags.map(tag => (
                                                    <button
                                                        key={tag}
                                                        onClick={() => toggleTag(tag)}
                                                        className={`px-3 py-1 rounded-full text-sm ${
                                                            selectedTags.includes(tag) 
                                                                ? 'bg-cyan-500 text-white' 
                                                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                        }`}
                                                    >
                                                        {tag}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </Container>
            </section>

            {/* Featured Posts */}
            <section className="py-12">
                <Container>
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-3xl font-bold text-white">
                            <span className="inline-block border-b-2 border-teal-400 pb-1">Artículos Destacados</span>
                        </h2>
                        <Link 
                            href="/blog/destacados" 
                            className="text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
                        >
                            Ver todos <ArrowLongRightIcon className="w-5 h-5" />
                        </Link>
                    </div>
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
                </Container>
            </section>

            {/* Regular Posts Grid */}
            <section className="py-12 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/0 via-teal-900/10 to-slate-900/0 pointer-events-none"></div>
                <Container>
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-3xl font-bold text-white">
                            <span className="inline-block border-b-2 border-teal-400 pb-1">
                                {searchQuery || selectedCategory || selectedTags.length > 0 
                                    ? 'Resultados de búsqueda' 
                                    : 'Artículos Recientes'}
                            </span>
                        </h2>
                        {(searchQuery || selectedCategory || selectedTags.length > 0) && (
                            <button 
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCategory(null);
                                    setSelectedTags([]);
                                    setShowFilters(false);
                                }}
                                className="text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
                            >
                                Limpiar filtros <XMarkIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    
                    {filteredPosts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredPosts.map((post, index) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    index={index}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                            <Image 
                                src="/images/placeholder/no-results.svg" 
                                alt="No se encontraron resultados" 
                                width={150} 
                                height={150} 
                                className="mx-auto mb-4 opacity-70"
                            />
                            <h3 className="text-2xl font-semibold text-white mb-2">No se encontraron resultados</h3>
                            <p className="text-slate-400 mb-6 max-w-md mx-auto">
                                No hay artículos que coincidan con tu búsqueda. Intenta con otros términos o filtros.
                            </p>
                            <button 
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCategory(null);
                                    setSelectedTags([]);
                                    setShowFilters(false);
                                }}
                                className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-full transition-colors"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </Container>
            </section>

            {/* Newsletter Section */}
            <section className="py-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-teal-900/20 to-slate-900/0 pointer-events-none"></div>
                <Container>
                    <h2 className="text-3xl font-bold text-white text-center mb-2">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
                            Mantente actualizado
                        </span>
                    </h2>
                    <p className="text-center text-cyan-100/70 mb-10 max-w-2xl mx-auto">
                        Suscríbete a nuestra revista digital y recibe las últimas noticias, artículos y recursos 
                        directamente en tu correo electrónico.
                    </p>
                    <MagazineForm />
                </Container>
            </section>

            {/* Categories Section */}
            <section className="py-16 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/0 via-teal-900/10 to-slate-900/20 pointer-events-none"></div>
                <Container>
                    <h2 className="text-3xl font-bold text-white text-center mb-12">
                        <span className="inline-block border-b-2 border-teal-400 pb-1">
                            Explora por Categorías
                        </span>
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {categoryData.map(category => (
                            <Link 
                                key={category.id} 
                                href={`/blog/categorias/${category.slug}`} 
                                className="group relative bg-slate-800/70 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-slate-700/50 hover:border-teal-500/30 transition-all duration-300 hover:-translate-y-1"
                            >
                                {category.featuredImage && (
                                    <div className="absolute inset-0 opacity-20 group-hover:opacity-25 transition-opacity">
                                        <Image 
                                            src={category.featuredImage} 
                                            alt={category.name} 
                                            fill 
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <div className="relative p-8 text-center z-10">
                                    <div className="text-teal-400 mb-4 group-hover:text-teal-300 transition-colors">
                                        <svg className="w-10 h-10 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white group-hover:text-teal-200 transition-colors">{category.name}</h3>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                            </Link>
                        ))}
                    </div>
                </Container>
            </section>
        </div>
    )
}