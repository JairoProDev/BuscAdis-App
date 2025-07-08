import PostPageClient from '@/components/blog/PostPageClient'

interface PostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  
  return <PostPageClient slug={slug} />
} 