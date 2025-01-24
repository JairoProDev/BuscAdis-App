export interface Author {
  id: string
  name: string
  avatar: string
  bio: string
  role: string
  social: {
    twitter?: string
    linkedin?: string
    github?: string
  }
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  featuredImage?: string
}

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage: string
  author: Author
  category: Category
  tags: Tag[]
  readingTime: number
  views: number
  likes: number
  shares: number
  comments: number
  publishedAt: string
  updatedAt?: string
  seo: {
    title: string
    description: string
    keywords: string[]
    ogImage: string
  }
  relatedPosts?: Post[]
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  premium: boolean
}

export interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  post: Post
  parent?: Comment
  replies?: Comment[]
  likes: number
  publishedAt: string
  updatedAt?: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface BlogStats {
  totalPosts: number
  totalViews: number
  totalComments: number
  popularCategories: {
    category: Category
    count: number
  }[]
  popularTags: {
    tag: Tag
    count: number
  }[]
  topAuthors: {
    author: Author
    posts: number
    views: number
  }[]
}

export interface Newsletter {
  id: string
  email: string
  name?: string
  subscribedAt: string
  preferences: {
    categories: string[]
    frequency: 'daily' | 'weekly' | 'monthly'
  }
  status: 'active' | 'unsubscribed'
} 