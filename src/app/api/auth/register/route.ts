import { NextRequest, NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongodb.server';

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
    const db = client.db(process.env.MONGODB_DB || 'test');
    const users = db.collection('users');

    // Verifica si ya existe usuario con ese DNI o teléfono
    const existing = await users.findOne({ $or: [ { dni }, { phone } ] });
    if (existing) {
      console.log(`[REGISTER] Usuario ya existe: ${phone}, ${dni}`);
      return NextResponse.json({ success: false, message: 'Ya existe un usuario con ese DNI o teléfono.' }, { status: 409 });
    }

    const user = {
      firstName,
      lastName,
      phone,
      dni,
      createdAt: new Date(),
      // Campos para expansión futura
      profile: {},
      interests: [],
      extraPhones: [],
      email: '',
      password: '',
    };
    await users.insertOne(user);
    console.log(`[REGISTER] Usuario registrado: ${firstName} ${lastName} (${phone})`);
    return NextResponse.json({ success: true, user: { firstName, lastName, phone, dni } });
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor.' }, { status: 500 });
  }
} 