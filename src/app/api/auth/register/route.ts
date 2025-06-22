import { NextRequest, NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongodb-server';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, phone, dni } = await request.json();

    // Validación básica de DNI (Perú: 8 dígitos + 1 verificador)
    if (!dni || !/^\d{8,9}$/.test(dni)) {
      return NextResponse.json({ success: false, message: 'DNI inválido. Debe tener 8 o 9 dígitos.' }, { status: 400 });
    }
    // Validación básica de teléfono (mínimo 9 dígitos)
    if (!phone || !/^\+?\d{9,15}$/.test(phone)) {
      return NextResponse.json({ success: false, message: 'Teléfono inválido.' }, { status: 400 });
    }
    if (!firstName || !lastName) {
      return NextResponse.json({ success: false, message: 'Nombre y apellidos requeridos.' }, { status: 400 });
    }

    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB || 'buscadis');
    const users = db.collection('users');

    // Verifica que no exista ya un usuario con ese DNI o teléfono
    const existing = await users.findOne({ $or: [ { dni }, { phone } ] });
    if (existing) {
      console.log(`[REGISTER] Usuario ya existe: ${phone}, ${dni}`);
      return NextResponse.json({ success: false, message: 'Ya existe un usuario con ese DNI o teléfono.' }, { status: 409 });
    }

    // Crea el nuevo usuario
    const newUser = {
      firstName,
      lastName,
      phone,
      dni,
      createdAt: new Date(),
      avatarUrl: '/default-avatar.png',
      profile: {},
      interests: [],
      extraPhones: [],
      email: '',
    };
    const insertResult = await users.insertOne(newUser);
    if (!insertResult.insertedId) {
      return NextResponse.json({ success: false, message: 'Error al registrar usuario.' }, { status: 500 });
    }
    // Devuelve el usuario con su id
    return NextResponse.json({
      success: true,
      user: {
        id: insertResult.insertedId.toString(),
        firstName,
        lastName,
        phone,
        dni,
        createdAt: newUser.createdAt,
        avatarUrl: newUser.avatarUrl,
      }
    });
  } catch (error) {
    console.error('[REGISTER] Error:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor.' }, { status: 500 });
  }
} 