'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import PostCard from '@/components/blog/PostCard'
import MagazineForm from '@/components/blog/MagazineForm'
import { Post } from '@/types/blog'
import { AdjustmentsHorizontalIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'; // Import Link
import { categories as categoryData } from '@/lib/constants'; // Import categories
import { posts as mockPosts } from '@/lib/constants'; // Importa los posts desde constants.ts
import Container from '@/components/shared/Container';


export default function BlogPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [showFilters, setShowFilters] = useState(false)

    const featuredPosts = mockPosts.filter(post => post.featured)
    const regularPosts = mockPosts.filter(post => !post.featured)

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-teal-900/80 to-slate-900 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" />
                <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-teal-400/10 via-teal-300/5 to-emerald-400/10 rounded-full filter blur-xl opacity-30 animate-blob" />
                <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-cyan-400/10 via-white/5 to-teal-500/10 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-2000" />
                <motion.div
                    className="absolute top-10 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/40 to-transparent"
                    animate={{ background: ['linear-gradient(to right, rgba(0,0,0,0), rgba(20,184,166,0.4), rgba(0,0,0,0))', 'linear-gradient(to right, rgba(20,184,166,0.4), rgba(0,0,0,0), rgba(20,184,166,0.4))'], x: ['0%', '100%'] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                />
                <div className="absolute inset-0">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div key={i} className="absolute w-1 h-1 bg-teal-400/40 rounded-full" initial={{ x: `${Math.random() * 100}%`, y: `${Math.random() * 100}%`, opacity: Math.random() * 0.5 + 0.3 }} animate={{ y: ['0%', '100%'], opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: Math.random() * 10 + 15, ease: 'linear', delay: Math.random() * 5 }} />
                    ))}
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl mx-auto text-center"
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            Blog de BuscAdis
                        </h1>
                        <p className="text-xl text-cyan-100/80 mb-12">
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
                                    className="w-full px-6 py-4 bg-slate-800/80 backdrop-blur-sm rounded-full border-2 border-transparent focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-white placeholder-gray-400 transition-all duration-200 pl-12"
                                />
                                <div className="absolute inset-y-0 left-4 flex items-center">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-teal-300" />
                                </div>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="absolute inset-y-2 right-2 px-4 flex items-center bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors"
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
                                    className="absolute left-0 right-0 top-full mt-4 bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 z-10 border border-teal-500/10"
                                >
                                    {/* Implementar filtros aquí */}
                                    <p className="text-white">Filtros en construcción...</p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </Container>
            </section>

            {/* Featured Posts */}
            <section className="py-16">
                <Container>
                    <h2 className="text-3xl font-bold text-white text-center mb-8">Artículos Destacados</h2>
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
            <section className="py-16">
                <Container>
                    <h2 className="text-3xl font-bold text-white text-center mb-8">Artículos Recientes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {regularPosts.map((post, index) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                index={index}
                            />
                        ))}
                    </div>
                </Container>
            </section>

            {/* Magazine Section */}
            <section className="py-16">
                <Container>
                    <h2 className="text-3xl font-bold text-white text-center mb-8">Suscríbete a nuestra revista</h2>
                    <MagazineForm />
                </Container>
            </section>

            {/* Categories Section */}
            <section className="py-16 bg-slate-900/80 backdrop-blur-sm">
                <Container>
                    <h2 className="text-3xl font-bold text-white text-center mb-12">
                        Explora por Categorías
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {categoryData.map(category => (
                            <Link key={category.id} href={`/categorias/${category.slug}`} className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 text-center border border-teal-500/10 hover:border-teal-300 transition-colors duration-300">
                                <div className="text-2xl text-teal-300 mb-2"><category.icon className="h-6 w-6 inline-block" /></div>
                                <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                            </Link>
                        ))}
                    </div>
                </Container>
            </section>
        </div>
    )
}