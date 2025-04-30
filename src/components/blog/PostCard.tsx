'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Post } from '@/types/blog'
import { formatDate } from '@/utils/dates'
import { 
  ClockIcon, 
  EyeIcon, 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  ShareIcon, 
  BookmarkIcon 
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { useState } from 'react'

interface PostCardProps {
  post: Post
  featured?: boolean
  index?: number
}

export default function PostCard({ post, featured = false, index = 0 }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLiked(!isLiked)
  }
  
  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsSaved(!isSaved)
  }
  
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: `/blog/${post.slug}`
      }).catch(console.error)
    } else {
      // Fallback copy to clipboard
      navigator.clipboard.writeText(window.location.origin + `/blog/${post.slug}`)
        .then(() => {
          alert('Enlace copiado al portapapeles')
        })
        .catch(console.error)
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`group relative overflow-hidden rounded-xl bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 hover:border-teal-500/30 transition-all duration-300 hover:-translate-y-1 shadow-lg ${
        featured 
          ? 'md:col-span-2 md:row-span-2'
          : 'col-span-1'
      }`}
    >
      <Link href={`/blog/${post.slug}`} className="block h-full">
        <div className="relative aspect-[16/9] overflow-hidden rounded-t-xl">
          <Image
            src={imageError ? '/images/placeholder/blog-placeholder.svg' : post.featuredImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
          
          {/* Category pill */}
          <div className="absolute top-4 left-4 bg-teal-500/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
            {post.category.name}
          </div>
          
          {post.premium && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Premium</span>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
            <span className="inline-flex items-center">
              <ClockIcon className="w-3.5 h-3.5 mr-1" />
              {post.readingTime} min
            </span>
            <span className="inline-flex items-center">
              <EyeIcon className="w-3.5 h-3.5 mr-1" />
              {post.views}
            </span>
            <span className="text-teal-400">{formatDate(post.publishedAt)}</span>
          </div>

          <h2 className={`font-bold text-white group-hover:text-teal-400 transition-colors line-clamp-2 ${
            featured ? 'text-2xl mb-3' : 'text-xl mb-2'
          }`}>
            {post.title}
          </h2>

          <p className="text-slate-300/80 line-clamp-2 mb-4 text-sm">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={32}
                height={32}
                className="rounded-full border border-slate-600"
                onError={handleImageError}
              />
              <span className="text-sm font-medium text-white">
                {post.author.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleLike}
                className={`p-1.5 rounded-full transition-colors ${isLiked ? 'text-red-500 bg-red-500/10' : 'text-slate-400 hover:text-white'}`}
                aria-label={isLiked ? "Quitar me gusta" : "Me gusta"}
              >
                {isLiked ? <HeartIconSolid className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
              </button>
              <button 
                onClick={handleSave} 
                className={`p-1.5 rounded-full transition-colors ${isSaved ? 'text-teal-500 bg-teal-500/10' : 'text-slate-400 hover:text-white'}`}
                aria-label={isSaved ? "Quitar de guardados" : "Guardar"}
              >
                <BookmarkIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={handleShare} 
                className="p-1.5 text-slate-400 hover:text-white rounded-full transition-colors"
                aria-label="Compartir"
              >
                <ShareIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {featured && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs bg-slate-700/50 text-teal-300 px-2.5 py-1 rounded-full"
                >
                  {tag.name}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="text-xs bg-slate-700/50 text-teal-300 px-2.5 py-1 rounded-full">
                  +{post.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Visual indicator for hover state */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
      </Link>
    </motion.article>
  )
} 