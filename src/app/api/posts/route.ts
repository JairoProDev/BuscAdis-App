import { NextResponse } from 'next/server'
import { supabase } from '@/supabaseClient'

export async function GET(request: Request) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (error) throw error
    
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
    
    const { data, error } = await supabase
      .from('posts')
      .insert([post])
      .select()
      
    if (error) throw error
    
    return NextResponse.json(data?.[0] || {})
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Error al crear el post' },
      { status: 500 }
    )
  }
} 