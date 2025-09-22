import { NextResponse } from 'next/server';

// Definición de categorías con metadatos
const MAGAZINE_CATEGORIES = [
  {
    id: 'inmuebles',
    name: 'Inmuebles',
    description: 'Casas, apartamentos, terrenos y más propiedades',
    icon: 'home',
    collectionName: 'publications_inmuebles',
    color: '#2196f3'
  },
  {
    id: 'vehiculos',
    name: 'Vehículos',
    description: 'Autos, motos, camiones y transporte',
    icon: 'car',
    collectionName: 'publications_vehiculos',
    color: '#f44336'
  },
  {
    id: 'empleos',
    name: 'Empleos',
    description: 'Ofertas de trabajo y oportunidades laborales',
    icon: 'briefcase',
    collectionName: 'publications_empleos',
    color: '#4caf50'
  },
  {
    id: 'servicios',
    name: 'Servicios',
    description: 'Servicios profesionales para todas tus necesidades',
    icon: 'tool',
    collectionName: 'publications_servicios',
    color: '#ff9800'
  },
  {
    id: 'productos',
    name: 'Productos',
    description: 'Artículos y productos de todo tipo',
    icon: 'shopping-bag',
    collectionName: 'publications_productos',
    color: '#9c27b0'
  },
  {
    id: 'eventos',
    name: 'Eventos',
    description: 'Conciertos, ferias, actividades y más',
    icon: 'calendar',
    collectionName: 'publications_eventos',
    color: '#e91e63'
  },
  {
    id: 'negocios',
    name: 'Negocios',
    description: 'Oportunidades comerciales y empresariales',
    icon: 'trending-up',
    collectionName: 'publications_negocios',
    color: '#009688'
  },
  {
    id: 'comunidad',
    name: 'Comunidad',
    description: 'Adisos comunitarios y servicios locales',
    icon: 'users',
    collectionName: 'publications_comunidad',
    color: '#795548'
  }
];

export function GET() {
  try {
    return NextResponse.json({ 
      categories: MAGAZINE_CATEGORIES
    });
  } catch (error) {
    console.error('[Magazine API] Error fetching categories:', error);
    return NextResponse.json(
      { message: 'Error fetching categories', error: (error as Error).message },
      { status: 500 }
    );
  }
} 