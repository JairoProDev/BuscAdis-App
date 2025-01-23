import { 
  JobIcon, 
  RealEstateIcon, 
  VehicleIcon, 
  ServiceIcon 
} from '@/components/icons'
import { AdisoType, Category, Adiso } from '@/types/marketplace'

interface SectionData {
  title: string
  categories: Category[]
  adisos: Adiso[]
}

type MockDataType = {
  [key in AdisoType]?: SectionData
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
        category: {
          id: '1',
          name: 'Apartamentos',
          icon: RealEstateIcon,
          count: 567,
          color: 'bg-green-600',
          type: 'Inmuebles'
        },
        isPremium: true,
        isVerified: true,
        rating: 4.5,
        type: 'Inmuebles'
      },
      // Más anuncios destacados...
    ]
  },
  Empleos: {
    title: "Empleos",
    categories: [
      {
        id: '1',
        name: 'Tecnología',
        icon: JobIcon,
        count: 1234,
        color: 'bg-blue-600',
        type: 'Empleos'
      },
      // Más categorías...
    ],
    adisos: [
      {
        id: '2',
        title: 'Desarrollador Frontend Senior',
        price: 5000,
        image: '/images/jobs/tech-1.jpg',
        location: 'Remoto',
        category: {
          id: '1',
          name: 'Tecnología',
          icon: JobIcon,
          count: 1234,
          color: 'bg-blue-600',
          type: 'Empleos'
        },
        isPremium: true,
        isVerified: true,
        rating: 4.8,
        type: 'Empleos'
      },
      // Más empleos...
    ]
  },
  Inmuebles: {
    title: "Inmuebles",
    categories: [
      {
        id: '1',
        name: 'Apartamentos',
        icon: RealEstateIcon,
        count: 567,
        color: 'bg-green-600',
        type: 'Inmuebles'
      },
      // Más categorías...
    ],
    adisos: [
      // Anuncios de inmuebles...
    ]
  },
  Servicios: {
    title: "Servicios",
    categories: [
      {
        id: '1',
        name: 'Profesionales',
        icon: ServiceIcon,
        count: 789,
        color: 'bg-purple-600',
        type: 'Servicios'
      },
      // Más categorías...
    ],
    adisos: [
      // Anuncios de servicios...
    ]
  }
  // Continuar con el resto de tipos...
} 