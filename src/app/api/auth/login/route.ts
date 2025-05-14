import { NextRequest, NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongodb.server';

export async function POST(request: NextRequest) {
  try {
    const { phone, dni } = await request.json();

    if (!phone || !dni) {
      return NextResponse.json(
        { success: false, message: 'Teléfono y DNI son requeridos' },
        { status: 400 }
      );
    }

    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB || 'buscadis');
    const users = db.collection('users');

    const user = await users.findOne({ phone, dni });

    if (!user) {
      console.log(`[LOGIN] Fallo de login para teléfono: ${phone}, dni: ${dni}`);
      return NextResponse.json(
        { success: false, message: 'Teléfono o DNI incorrectos' },
        { status: 401 }
      );
    }

    console.log(`[LOGIN] Usuario autenticado: ${user.firstName || ''} ${user.lastName || ''} (${user.phone})`);
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user._id,
        phone: user.phone,
        dni: user.dni,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
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