import { NextResponse } from 'next/server'
import type { Newsletter } from '@/types/blog'

// Aquí implementaremos la conexión con la base de datos
const subscribers: Newsletter[] = []

export async function POST(request: Request) {
  try {
    const { email, name, preferences } = await request.json()

    // Validar email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Verificar si ya está suscrito
    const existingSubscriber = subscribers.find(s => s.email === email)
    if (existingSubscriber) {
      return NextResponse.json(
        { error: 'Este email ya está suscrito' },
        { status: 400 }
      )
    }

    // Crear nuevo suscriptor
    const newSubscriber: Newsletter = {
      id: Date.now().toString(),
      email,
      name,
      subscribedAt: new Date().toISOString(),
      preferences: preferences || {
        categories: [],
        frequency: 'weekly'
      },
      status: 'active'
    }

    // Aquí implementaremos el guardado en la base de datos
    subscribers.push(newSubscriber)

    // Aquí implementaremos el envío del email de confirmación
    
    return NextResponse.json({
      message: 'Suscripción exitosa',
      subscriber: newSubscriber
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al procesar la suscripción' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { email, preferences } = await request.json()
    const subscriber = subscribers.find(s => s.email === email)

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Suscriptor no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar preferencias
    subscriber.preferences = {
      ...subscriber.preferences,
      ...preferences
    }

    return NextResponse.json({
      message: 'Preferencias actualizadas',
      subscriber
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar preferencias' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { email } = await request.json()
    const subscriber = subscribers.find(s => s.email === email)

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Suscriptor no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar estado a unsubscribed
    subscriber.status = 'unsubscribed'

    return NextResponse.json({
      message: 'Suscripción cancelada exitosamente'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al cancelar suscripción' },
      { status: 500 }
    )
  }
} 