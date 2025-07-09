import { NextRequest, NextResponse } from 'next/server';
import { getServerMongoClient } from '@/lib/mongodb-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const includeContent = searchParams.get('includeContent') === 'true';

    const client = await getServerMongoClient();
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection('blog_posts');

    // Build query
    const query: { slug: string; published?: boolean } = { slug };
    
    // Only include published posts unless explicitly requested
    if (!includeContent) {
      query.published = true;
    }

    const post = await collection.findOne(query);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await collection.updateOne(
      { _id: post._id },
      { $inc: { viewCount: 1 } }
    );

    return NextResponse.json({
      post: {
        id: post._id.toString(),
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: includeContent ? post.content : undefined,
        author: post.author,
        publishedAt: post.publishedAt,
        updatedAt: post.updatedAt,
        tags: post.tags || [],
        category: post.category,
        viewCount: (post.viewCount || 0) + 1,
        featuredImage: post.featuredImage
      }
    });

  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params
    const { slug } = params
    const body = await request.json()
    
    // TODO: Fix MongoDB client usage
    // const { client, db } = await getServerMongoClient()
    // const postsCollection = db.collection('posts')
    // const updatedPost = await postsCollection.findOneAndUpdate(
    //   { slug },
    //   { $set: { ...body, updatedAt: new Date() } },
    //   { returnDocument: 'after' }
    // )
    // await client.close()
    
    // For now, return mock response
    const updatedPost = { ...body, slug, updatedAt: new Date() }
    
    if (!updatedPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params
    const { slug } = params
    
    // TODO: Fix MongoDB client usage
    // const { client, db } = await getServerMongoClient()
    // const postsCollection = db.collection('posts')
    // const result = await postsCollection.deleteOne({ slug })
    // await client.close()
    
    // For now, return mock response
    const result = { deletedCount: 1 }
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 