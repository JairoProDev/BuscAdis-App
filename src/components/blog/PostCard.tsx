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
  ShareIcon 
} from '@heroicons/react/24/outline'

interface PostCardProps {
  post: Post
  featured?: boolean
  index?: number
}

export default function PostCard({ post, featured = false, index = 0 }: PostCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`group relative overflow-hidden ${
        featured 
          ? 'col-span-2 row-span-2 md:col-span-2 md:row-span-2'
          : 'col-span-1'
      }`}
    >
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {post.premium && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Premium
            </div>
          )}
          {featured && (
            <div className="absolute top-4 left-4 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Destacado
            </div>
          )}
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3 text-sm text-primary-600">
            <span className="inline-flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              {post.readingTime} min
            </span>
            <span className="inline-flex items-center">
              <EyeIcon className="w-4 h-4 mr-1" />
              {post.views}
            </span>
          </div>

          <h2 className={`font-bold text-primary-900 group-hover:text-primary-600 transition-colors ${
            featured ? 'text-3xl' : 'text-xl'
          }`}>
            {post.title}
          </h2>

          <p className="text-primary-600 line-clamp-2">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <div className="font-medium text-primary-900">
                  {post.author.name}
                </div>
                <div className="text-sm text-primary-600">
                  {formatDate(post.publishedAt)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-primary-600">
              <button className="hover:text-primary-900 transition-colors">
                <HeartIcon className="w-5 h-5" />
              </button>
              <button className="hover:text-primary-900 transition-colors">
                <ChatBubbleLeftIcon className="w-5 h-5" />
              </button>
              <button className="hover:text-primary-900 transition-colors">
                <ShareIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-4">
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
        </div>
      </Link>
    </motion.article>
  )
} 