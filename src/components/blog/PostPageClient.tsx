'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Post } from '@/types/blog'
import { formatDate } from '@/utils/dates'
import PostCard from '@/components/blog/PostCard'
import MagazineForm from '@/components/blog/MagazineForm'
import { 
  ClockIcon, 
  EyeIcon, 
  HeartIcon, 
  ShareIcon,
  BookmarkIcon,
  ArrowLeftIcon,
  TagIcon,
  ChevronRightIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { posts as mockPosts } from '@/data/mockPosts'
import Container from '@/components/shared/Container'

interface PostPageClientProps {
  slug: string
}

export default function PostPageClient({ slug }: PostPageClientProps) {
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Simular carga de datos
    const fetchPost = async () => {
      setIsLoading(true)
      try {
        // Simulamos un retardo para ver el efecto de carga
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // En una aplicación real, aquí haríamos un fetch a la API
        const foundPost = mockPosts.find(p => p.slug === slug)
        
        if (!foundPost) {
          throw new Error('Post no encontrado')
        }
        
        setPost(foundPost)
        setIsLoading(false)
      } catch (err) {
        console.error('Error al cargar el post:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
        setIsLoading(false)
      }
    }
    
    fetchPost()
  }, [slug])

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
  }

  const handleShare = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href
      }).catch(console.error)
    } else if (post) {
      // Fallback copy to clipboard
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          alert('Enlace copiado al portapapeles')
        })
        .catch(console.error)
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  // Si no está montado aún, no renderizamos nada para evitar errores de hidratación
  if (!mounted) {
    return null
  }

  // Mostrar estados de carga y error
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-white">Cargando artículo...</h2>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-red-400 text-6xl mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-24 h-24 mx-auto">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3">No pudimos encontrar este artículo</h2>
          <p className="text-slate-400 mb-6">{error || 'El artículo que buscas no existe o ha sido eliminado.'}</p>
          <Link 
            href="/blog" 
            className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Volver al blog
          </Link>
        </div>
      </div>
    )
  }

  // Calculamos los posts relacionados
  const relatedPosts = post.relatedPosts || mockPosts
    .filter(p => p.id !== post.id && p.category.id === post.category.id)
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/30 via-slate-900/20 to-transparent pointer-events-none" />
        
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-sm text-teal-200/70 mb-8">
              <Link href="/blog" className="hover:text-teal-200 transition-colors">
                Blog
              </Link>
              <ChevronRightIcon className="w-4 h-4" />
              <Link 
                href={`/blog/categorias/${post.category.slug}`}
                className="hover:text-teal-200 transition-colors"
              >
                {post.category.name}
              </Link>
            </nav>

            {/* Post Header */}
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-r from-teal-500/10 to-cyan-500/10 text-teal-300 rounded-full px-4 py-1 text-sm mb-6">
                {post.category.name}
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {post.title}
              </h1>
              
              <p className="text-xl text-teal-100/80 mb-8 max-w-3xl mx-auto">
                {post.excerpt}
              </p>

              {/* Meta info */}
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-slate-300 mb-8">
                <span className="flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2 text-teal-400" />
                  {post.readingTime} min de lectura
                </span>
                <span className="flex items-center">
                  <EyeIcon className="w-5 h-5 mr-2 text-teal-400" />
                  {post.views.toLocaleString()} vistas
                </span>
                <span className="flex items-center">
                  <UserIcon className="w-5 h-5 mr-2 text-teal-400" />
                  Por {post.author.name}
                </span>
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(post.publishedAt)}
                </span>
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-center space-x-4">
                <button 
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                    isLiked 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                  }`}
                  aria-label={isLiked ? "Quitar me gusta" : "Me gusta"}
                >
                  {isLiked ? (
                    <HeartIconSolid className="w-5 h-5" />
                  ) : (
                    <HeartIcon className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">
                    {isLiked ? 'Me gusta' : 'Me gusta'}
                  </span>
                </button>

                <button 
                  onClick={handleSave}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                    isSaved 
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                  }`}
                  aria-label={isSaved ? "Quitar de guardados" : "Guardar"}
                >
                  <BookmarkIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {isSaved ? 'Guardado' : 'Guardar'}
                  </span>
                </button>

                <button 
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 rounded-full transition-colors"
                  aria-label="Compartir"
                >
                  <ShareIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Compartir</span>
                </button>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Post Content */}
      <section className="py-16">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Featured Image */}
                {post.featuredImage && (
                  <div className="mb-8">
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-800">
                      {!imageError ? (
                        <Image
                          src={post.featuredImage}
                          alt={post.title}
                          fill
                          className="object-cover"
                          onError={handleImageError}
                          priority
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-slate-800 text-slate-400">
                          <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Post Content */}
                <div className="prose prose-lg prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                      <TagIcon className="w-5 h-5 text-teal-400" />
                      <h3 className="text-lg font-semibold text-white">Etiquetas</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Link
                          key={tag.id}
                          href={`/blog/tags/${tag.slug}`}
                          className="inline-flex items-center px-3 py-1 bg-teal-500/10 text-teal-300 rounded-full text-sm hover:bg-teal-500/20 transition-colors"
                        >
                          {tag.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Author Info */}
                <div className="mt-12 p-6 bg-slate-800/50 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {post.author.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {post.author.name}
                      </h3>
                      <p className="text-slate-400 mb-3">
                        {post.author.bio || 'Autor del blog de BuscAdis'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{post.author.postsCount || 0} artículos</span>
                        <span>•</span>
                        <span>Miembro desde {formatDate(post.author.joinedAt || new Date().toISOString())}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Artículos Relacionados
                    </h3>
                    <div className="space-y-4">
                      {relatedPosts.map((relatedPost) => (
                        <PostCard
                          key={relatedPost.id}
                          post={relatedPost}
                          featured={false}
                          compact={true}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Newsletter Signup */}
                <div className="p-6 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-2xl border border-teal-500/20">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    ¡No te pierdas nada!
                  </h3>
                  <p className="text-slate-300 text-sm mb-4">
                    Suscríbete para recibir las últimas noticias y oportunidades directamente en tu email.
                  </p>
                  <MagazineForm />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
} 