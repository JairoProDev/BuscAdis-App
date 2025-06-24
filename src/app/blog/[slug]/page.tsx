'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Post } from '@/types/blog'
import { formatDate, timeAgo } from '@/utils/dates'
import PostCard from '@/components/blog/PostCard'
import MagazineForm from '@/components/blog/MagazineForm'
import { 
  ClockIcon, 
  EyeIcon, 
  HeartIcon, 
  ChatBubbleLeftIcon, 
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

interface PostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
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
                  <span>{isLiked ? post.likes + 1 : post.likes}</span>
                </button>

                <button 
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 transition-colors"
                  aria-label="Compartir"
                >
                  <ShareIcon className="w-5 h-5" />
                  <span>Compartir</span>
                </button>

                <button 
                  onClick={handleSave}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                    isSaved 
                      ? 'bg-teal-500/20 text-teal-400' 
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                  }`}
                  aria-label={isSaved ? "Quitar de guardados" : "Guardar"}
                >
                  <BookmarkIcon className="w-5 h-5" />
                  <span>{isSaved ? "Guardado" : "Guardar"}</span>
                </button>
              </div>
            </div>

            {/* Featured Image */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative aspect-[21/9] rounded-2xl overflow-hidden mb-12 shadow-2xl shadow-teal-900/20"
            >
              <Image
                src={imageError ? '/images/placeholder/blog-placeholder.svg' : post.featuredImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
                onError={handleImageError}
              />
              {post.premium && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>Premium</span>
                </div>
              )}
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Content Section */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-5" />
        
        <Container>
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl border border-slate-700/50"
            >
              {/* Article content */}
              <article className="prose prose-lg prose-invert max-w-none prose-headings:text-teal-300 prose-a:text-teal-400 prose-a:no-underline hover:prose-a:text-teal-300 prose-blockquote:border-teal-500 prose-strong:text-teal-200">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </article>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-slate-700/50">
                <TagIcon className="h-5 w-5 text-teal-400 mr-2" />
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog/tags/${tag.slug}`}
                    className="text-sm bg-slate-700/50 text-teal-300 px-3 py-1 rounded-full hover:bg-slate-600/50 transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Author Bio */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 mt-8 shadow-xl border border-slate-700/50"
            >
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-6">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={90}
                  height={90}
                  className="rounded-full border-4 border-teal-500/20"
                />
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {post.author.name}
                  </h3>
                  <div className="text-teal-200/70 text-sm mb-2">{post.author.role}</div>
                  <p className="text-slate-300 mb-4">
                    {post.author.bio}
                  </p>
                  <div className="flex justify-center md:justify-start space-x-4">
                    {post.author.social.twitter && (
                      <a
                        href={post.author.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-400 hover:text-teal-300 transition-colors"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </a>
                    )}
                    {post.author.social.linkedin && (
                      <a
                        href={post.author.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-400 hover:text-teal-300 transition-colors"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Related Posts */}
      <section className="py-16 bg-slate-900/40 relative">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-5" />
        
        <Container>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-10">
              <span className="inline-block border-b-2 border-teal-400 pb-1">Artículos Relacionados</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost, index) => (
                <PostCard
                  key={relatedPost.id}
                  post={relatedPost}
                  index={index}
                />
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link 
                href="/blog" 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-colors shadow-lg"
              >
                Ver todos los artículos
                <ChevronRightIcon className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/0 via-teal-900/10 to-slate-900/40 pointer-events-none"></div>
        
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
                ¿Te gustó este artículo?
              </span>
            </h2>
            <p className="text-center text-cyan-100/70 mb-10 max-w-2xl mx-auto">
              Suscríbete a nuestra revista digital y recibe las últimas noticias y artículos 
              directamente en tu correo electrónico.
            </p>
            <MagazineForm />
          </div>
        </Container>
      </section>
    </div>
  )
} 