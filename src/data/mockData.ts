import { CategoryId } from '@/types/marketplace'

interface SectionData {
  title: string
  categories: any[] // Temporalmente any hasta que definamos la estructura completa
  adisos: any[] // Temporalmente any hasta que definamos la estructura completa
}

type MockDataType = {
  [key in CategoryId]?: SectionData
} & {
  featured: SectionData
}

export const mockData: MockDataType = {
  featured: {
    title: "Anuncios Destacados",
    categories: [],
    adisos: [
      {
        id: '1',
        title: 'Apartamento de lujo en zona exclusiva',
        price: 250000,
        image: '/images/real-estate/apartment-1.jpg',
        location: 'Miraflores',
        category: 'inmuebles',
        subType: 'apartamentos',
        isPremium: true,
        isVerified: true,
        rating: 4.5
      }
    ]
  },
  empleos: {
    title: "Empleos",
    categories: [],
    adisos: [
      {
        id: '2',
        title: 'Desarrollador Frontend Senior',
        price: 5000,
        image: '/images/jobs/tech-1.jpg',
        location: 'Remoto',
        category: 'empleos',
        subType: 'tecnologia',
        isPremium: true,
        isVerified: true,
        rating: 4.8
      }
    ]
  },
  inmuebles: {
    title: "Inmuebles",
    categories: [],
    adisos: [
      {
        id: '3',
        title: 'Casa moderna en zona residencial',
        price: 350000,
        image: '/images/real-estate/house-1.jpg',
        location: 'San Isidro',
        category: 'inmuebles',
        subType: 'casas',
        isPremium: true,
        isVerified: true,
        rating: 4.7
      }
    ]
  },
  vehiculos: {
    title: "Vehículos",
    categories: [],
    adisos: [
      {
        id: '4',
        title: 'Toyota Corolla 2023',
        price: 25000,
        image: '/images/vehicles/car-1.jpg',
        location: 'Lima',
        category: 'vehiculos',
        subType: 'autos',
        isPremium: true,
        isVerified: true,
        rating: 4.9
      }
    ]
  },
  servicios: {
    title: "Servicios",
    categories: [],
    adisos: [
      {
        id: '5',
        title: 'Servicio de Limpieza Profesional',
        price: 50,
        image: '/images/services/cleaning-1.jpg',
        location: 'Lima',
        category: 'servicios',
        subType: 'limpieza',
        isPremium: false,
        isVerified: true,
        rating: 4.6
      }
    ]
  },
  productos: {
    title: "Productos",
    categories: [],
    adisos: [
      {
        id: '6',
        title: 'iPhone 15 Pro Max',
        price: 1200,
        image: '/images/products/phone-1.jpg',
        location: 'Lima',
        category: 'productos',
        subType: 'electronica',
        isPremium: true,
        isVerified: true,
        rating: 4.9
      }
    ]
  },
  eventos: {
    title: "Eventos",
    categories: [],
    adisos: [
      {
        id: '7',
        title: 'Festival de Música en Vivo',
        price: 50,
        image: '/images/events/festival-1.jpg',
        location: 'Lima',
        category: 'eventos',
        subType: 'conciertos',
        isPremium: true,
        isVerified: true,
        rating: 4.7
      }
    ]
  },
  educacion: {
    title: "Educación",
    categories: [],
    adisos: [
      {
        id: '8',
        title: 'Curso de Programación Web',
        price: 299,
        image: '/images/education/programming-1.jpg',
        location: 'Online',
        category: 'educacion',
        subType: 'cursos',
        isPremium: true,
        isVerified: true,
        rating: 4.8
      }
    ]
  },
  turismo: {
    title: "Turismo",
    categories: [],
    adisos: [
      {
        id: '9',
        title: 'Tour Machu Picchu Premium',
        price: 599,
        image: '/images/tourism/machupicchu-1.jpg',
        location: 'Cusco',
        category: 'turismo',
        subType: 'tours',
        isPremium: true,
        isVerified: true,
        rating: 4.9
      }
    ]
  },
  mascotas: {
    title: "Mascotas",
    categories: [],
    adisos: [
      {
        id: '10',
        title: 'Servicio de Peluquería Canina',
        price: 45,
        image: '/images/pets/grooming-1.jpg',
        location: 'Miraflores',
        category: 'mascotas',
        subType: 'servicios',
        isPremium: false,
        isVerified: true,
        rating: 4.6
      }
    ]
  }
} 