'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Post } from '@/types/blog'
import { formatDate } from '@/utils/dates'
import PostCard from '@/components/blog/PostCard'
import NewsletterForm from '@/components/blog/NewsletterForm'
import { 
  ClockIcon, 
  EyeIcon, 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  ShareIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'

interface PostPageProps {
  params: {
    slug: string
  }
}

export default function PostPage({ params }: PostPageProps) {
  const [post, setPost] = useState<Post | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  useEffect(() => {
    // Aquí implementaremos la carga del post desde la API
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${params.slug}`)
        if (!response.ok) throw new Error('Post no encontrado')
        const data = await response.json()
        setPost(data)
      } catch (error) {
        console.error('Error al cargar el post:', error)
      }
    }

    fetchPost()
  }, [params.slug])

  if (!post) return null // O un componente de carga

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href
        })
      } catch (error) {
        setShowShareMenu(!showShareMenu)
      }
    } else {
      setShowShareMenu(!showShareMenu)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-primary-800">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
        
        <div className="relative container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-sm text-primary-200 mb-8">
              <Link href="/blog" className="hover:text-white transition-colors">
                Blog
              </Link>
              <span>/</span>
              <Link 
                href={`/blog/categories/${post.category.slug}`}
                className="hover:text-white transition-colors"
              >
                {post.category.name}
              </Link>
            </nav>

            {/* Post Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                {post.title}
              </h1>
              <p className="text-xl text-primary-200 mb-8">
                {post.excerpt}
              </p>

              {/* Meta info */}
              <div className="flex items-center justify-center space-x-6 text-primary-300">
                <span className="flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  {post.readingTime} min de lectura
                </span>
                <span className="flex items-center">
                  <EyeIcon className="w-5 h-5 mr-2" />
                  {post.views} vistas
                </span>
              </div>

              {/* Author */}
              <div className="flex items-center justify-center mt-8">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div className="ml-4 text-left">
                  <div className="font-medium text-white">
                    {post.author.name}
                  </div>
                  <div className="text-sm text-primary-300">
                    {formatDate(post.publishedAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="relative aspect-[21/9] rounded-2xl overflow-hidden mb-12">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl">
              {/* Article content */}
              <article className="prose prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </article>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-primary-100">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog/tags/${tag.slug}`}
                    className="text-sm bg-primary-100 text-primary-700 px-3 py-1 rounded-full hover:bg-primary-200 transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-8 pt-8 border-t border-primary-100">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
                    aria-label={isLiked ? 'Quitar me gusta' : 'Me gusta'}
                  >
                    {isLiked ? (
                      <HeartIconSolid className="w-6 h-6 text-red-500" />
                    ) : (
                      <HeartIcon className="w-6 h-6" />
                    )}
                    <span>{post.likes}</span>
                  </button>
                  <button
                    onClick={() => {}}
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
                    aria-label="Comentarios"
                  >
                    <ChatBubbleLeftIcon className="w-6 h-6" />
                    <span>{post.comments}</span>
                  </button>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`text-primary-600 hover:text-primary-700 transition-colors ${
                      isBookmarked ? 'text-primary-700' : ''
                    }`}
                    aria-label={isBookmarked ? 'Quitar de guardados' : 'Guardar artículo'}
                  >
                    <BookmarkIcon className="w-6 h-6" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={handleShare}
                      className="text-primary-600 hover:text-primary-700 transition-colors"
                      aria-label="Compartir artículo"
                    >
                      <ShareIcon className="w-6 h-6" />
                    </button>
                    {showShareMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10"
                      >
                        {/* Implementar menú de compartir */}
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Author Bio */}
            <div className="bg-white rounded-2xl p-8 mt-8 shadow-xl">
              <div className="flex items-start space-x-6">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
                <div>
                  <h3 className="text-xl font-semibold text-primary-900 mb-2">
                    {post.author.name}
                  </h3>
                  <p className="text-primary-600 mb-4">
                    {post.author.bio}
                  </p>
                  <div className="flex space-x-4">
                    {post.author.social.twitter && (
                      <a
                        href={post.author.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-500 hover:text-primary-600"
                      >
                        Twitter
                      </a>
                    )}
                    {post.author.social.linkedin && (
                      <a
                        href={post.author.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-500 hover:text-primary-600"
                      >
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {post.relatedPosts && post.relatedPosts.length > 0 && (
        <section className="py-16 bg-primary-900/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Artículos Relacionados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {post.relatedPosts.map((relatedPost, index) => (
                <PostCard
                  key={relatedPost.id}
                  post={relatedPost}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <NewsletterForm />
        </div>
      </section>
    </div>
  )
} 