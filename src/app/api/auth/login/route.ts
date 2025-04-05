import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { phone, dni } = await request.json();

    if (!phone || !dni) {
      return NextResponse.json(
        { success: false, message: 'Teléfono y DNI son requeridos' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('test');
    const users = db.collection('users');

    const user = await users.findOne({ phone, dni });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Teléfono o DNI incorrectos' },
        { status: 401 }
      );
    }

    // Don't include sensitive data in the response
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        phone: user.phone,
        dni: user.dni,
        createdAt: user.createdAt,
        // Include any other fields needed by the client
      } 
    });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 