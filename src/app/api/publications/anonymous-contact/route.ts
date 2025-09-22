import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB = process.env.MONGODB_DB || 'buscadis';

interface AnonymousContactRequest {
  publicationId: string;
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
    message?: string;
  };
  type: 'expired_publication_interest';
}

interface AnonymousContact {
  _id?: ObjectId;
  publicationId: string;
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
    message?: string;
  };
  type: string;
  status: 'pending' | 'notified' | 'contacted';
  createdAt: Date;
  updatedAt: Date;
  notificationSentAt?: Date;
  contactEstablishedAt?: Date;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnonymousContactRequest = await request.json();
    
    // Validar datos requeridos
    if (!body.publicationId || !body.contactInfo?.name || !body.contactInfo?.email) {
      return NextResponse.json(
        { error: 'Datos requeridos faltantes' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.contactInfo.email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Conectar a MongoDB
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(MONGODB_DB);

    // Verificar que la publicación existe y está caducada
    const publication = await db.collection('publications').findOne({
      _id: new ObjectId(body.publicationId)
    });

    if (!publication) {
      await client.close();
      return NextResponse.json(
        { error: 'Publicación no encontrada' },
        { status: 404 }
      );
    }

    // Verificar si la publicación está caducada
    const now = new Date();
    const isExpired = publication.expirationDate && new Date(publication.expirationDate) < now;

    if (!isExpired) {
      await client.close();
      return NextResponse.json(
        { error: 'La publicación no está caducada' },
        { status: 400 }
      );
    }

    // Crear el registro de contacto anónimo
    const anonymousContact: AnonymousContact = {
      publicationId: body.publicationId,
      contactInfo: body.contactInfo,
      type: body.type,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insertar en la colección de contactos anónimos
    const result = await db.collection('anonymous_contacts').insertOne(anonymousContact);

    // Enviar notificación al anunciante (simulado por ahora)
    // En producción, aquí enviarías un email/SMS al anunciante
    await sendNotificationToAdvertiser(publication, body.contactInfo);

    // Actualizar el estado del contacto anónimo
    await db.collection('anonymous_contacts').updateOne(
      { _id: result.insertedId },
      { 
        $set: { 
          status: 'notified',
          notificationSentAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    await client.close();

    return NextResponse.json({
      success: true,
      message: 'Notificación enviada al anunciante',
      contactId: result.insertedId
    });

  } catch (error) {
    console.error('Error en anonymous-contact:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * Envía notificación al anunciante sobre el interés en su publicación caducada
 */
async function sendNotificationToAdvertiser(publication: any, contactInfo: any) {
  try {
    // Aquí implementarías el envío real de notificaciones
    // Por ejemplo, usando servicios como SendGrid, Twilio, etc.
    
    console.log('📧 Notificación enviada al anunciante:', {
      publicationId: publication._id,
      publicationTitle: publication.title,
      advertiserContact: publication.contact,
      interestedPerson: {
        name: contactInfo.name,
        email: contactInfo.email,
        phone: contactInfo.phone,
        message: contactInfo.message
      }
    });

    // Simular envío de email
    // await sendEmail({
    //   to: publication.contact.email,
    //   subject: 'Interés en tu adiso caducado',
    //   template: 'expired-publication-interest',
    //   data: {
    //     publicationTitle: publication.title,
    //     interestedPerson: contactInfo,
    //     renewalLink: `${process.env.NEXT_PUBLIC_APP_URL}/renew-publication/${publication._id}`
    //   }
    // });

  } catch (error) {
    console.error('Error enviando notificación al anunciante:', error);
    throw error;
  }
}

/**
 * Obtiene estadísticas de contactos anónimos
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicationId = searchParams.get('publicationId');

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(MONGODB_DB);

    let query = {};
    if (publicationId) {
      query = { publicationId };
    }

    const contacts = await db.collection('anonymous_contacts')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    await client.close();

    return NextResponse.json({
      success: true,
      contacts,
      total: contacts.length
    });

  } catch (error) {
    console.error('Error obteniendo contactos anónimos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 