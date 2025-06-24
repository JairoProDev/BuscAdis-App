import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import { getPublicationModel } from '@/lib/models/Publication'

export const dynamic = 'force-dynamic' // Disable caching to ensure data is always fresh

// Get subcategories for a specific category
export async function GET(
  request: Request,
  context: { params: Promise<{ category: string }> }
) {
  try {
    const params = await context.params
    const categorySlug = params.category.toLowerCase()
    
    if (!categorySlug) {
      return NextResponse.json(
        { error: 'Category parameter is required' },
        { status: 400 }
      )
    }

    // Connect to database
    await dbConnect()
    
    // Get the publication model for the category
    const PublicationModel = getPublicationModel(categorySlug)
    
    // Get all unique subcategory data
    const subcategoriesData = await PublicationModel.aggregate([
      {
        $match: {
          categorySlug: categorySlug,
          subcategory: { $exists: true, $nin: [null, ""] }
        }
      },
      {
        $group: {
          _id: {
            subcategory: "$subcategory",
            subcategorySlug: "$subcategorySlug"
          },
          count: { $sum: 1 },
          // Get sample images from publications in this subcategory
          sampleImages: { $push: { $arrayElemAt: ["$images", 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id.subcategory",
          slug: "$_id.subcategorySlug",
          count: 1,
          image: { $arrayElemAt: ["$sampleImages", 0] }
        }
      },
      {
        $sort: { name: 1 }
      }
    ])

    // Filter out any results without a slug (data consistency)
    const subcategories = subcategoriesData.filter(sub => sub.slug)
    
    return NextResponse.json({ subcategories })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`Error getting subcategories for category:`, error)
    return NextResponse.json(
      { error: `Error retrieving subcategories: ${errorMessage}` },
      { status: 500 }
    )
  }
} 