import { NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({ region: process.env.AWS_REGION })
const docClient = DynamoDBDocumentClient.from(client)

export async function GET() {
  try {
    const command = new ScanCommand({
      TableName: 'Posts',
      ScanIndexForward: false
    })
    
    const { Items: data } = await docClient.send(command)
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Error al obtener los posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const post = await request.json()
    
    const command = new PutCommand({
      TableName: 'Posts',
      Item: {
        ...post,
        createdAt: new Date().toISOString()
      }
    })
    
    await docClient.send(command)
    return NextResponse.json(post)
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Error al crear el post' },
      { status: 500 }
    )
  }
} 