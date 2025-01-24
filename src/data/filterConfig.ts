import { FiltersByCategory } from '@/types/filters'

export const filtersByCategory: FiltersByCategory = {
  inmuebles: {
    title: 'Filtros de Inmuebles',
    sections: [
      {
        title: 'Características básicas',
        filters: [
          {
            id: 'price',
            type: 'range',
            label: 'Precio',
            min: 0,
            max: 1000000,
            step: 1000,
            format: (value: number) => `$${value.toLocaleString()}`
          },
          {
            id: 'propertyType',
            type: 'select',
            label: 'Tipo de propiedad',
            options: [
              { value: 'house', label: 'Casa' },
              { value: 'apartment', label: 'Apartamento' },
              { value: 'land', label: 'Terreno' },
              { value: 'commercial', label: 'Local comercial' },
              { value: 'office', label: 'Oficina' }
            ]
          },
          {
            id: 'operation',
            type: 'select',
            label: 'Operación',
            options: [
              { value: 'sale', label: 'Venta' },
              { value: 'rent', label: 'Alquiler' },
              { value: 'temporary', label: 'Temporal' }
            ]
          }
        ]
      },
      {
        title: 'Detalles',
        filters: [
          {
            id: 'bedrooms',
            type: 'select',
            label: 'Habitaciones',
            options: [
              { value: '1', label: '1' },
              { value: '2', label: '2' },
              { value: '3', label: '3' },
              { value: '4+', label: '4 o más' }
            ]
          },
          {
            id: 'bathrooms',
            type: 'select',
            label: 'Baños',
            options: [
              { value: '1', label: '1' },
              { value: '2', label: '2' },
              { value: '3+', label: '3 o más' }
            ]
          },
          {
            id: 'area',
            type: 'range',
            label: 'Superficie (m²)',
            min: 0,
            max: 500,
            step: 10,
            format: (value: number) => `${value}m²`
          }
        ]
      },
      {
        title: 'Amenidades',
        filters: [
          {
            id: 'features',
            type: 'multiselect',
            label: 'Características',
            options: [
              { value: 'parking', label: 'Estacionamiento' },
              { value: 'pool', label: 'Piscina' },
              { value: 'garden', label: 'Jardín' },
              { value: 'security', label: 'Seguridad 24/7' },
              { value: 'gym', label: 'Gimnasio' },
              { value: 'furnished', label: 'Amueblado' }
            ]
          }
        ]
      }
    ]
  },
  vehiculos: {
    title: 'Filtros de Vehículos',
    sections: [
      {
        title: 'Detalles básicos',
        filters: [
          {
            id: 'price',
            type: 'range',
            label: 'Precio',
            min: 0,
            max: 100000,
            step: 500,
            format: (value: number) => `$${value.toLocaleString()}`
          },
          {
            id: 'brand',
            type: 'select',
            label: 'Marca',
            options: [
              { value: 'toyota', label: 'Toyota' },
              { value: 'honda', label: 'Honda' },
              { value: 'ford', label: 'Ford' },
              { value: 'chevrolet', label: 'Chevrolet' },
              { value: 'nissan', label: 'Nissan' }
            ]
          },
          {
            id: 'year',
            type: 'range',
            label: 'Año',
            min: 1990,
            max: new Date().getFullYear(),
            step: 1,
            format: (value: number) => value.toString()
          }
        ]
      },
      {
        title: 'Características',
        filters: [
          {
            id: 'transmission',
            type: 'select',
            label: 'Transmisión',
            options: [
              { value: 'automatic', label: 'Automática' },
              { value: 'manual', label: 'Manual' }
            ]
          },
          {
            id: 'fuel',
            type: 'select',
            label: 'Combustible',
            options: [
              { value: 'gasoline', label: 'Gasolina' },
              { value: 'diesel', label: 'Diesel' },
              { value: 'electric', label: 'Eléctrico' },
              { value: 'hybrid', label: 'Híbrido' }
            ]
          },
          {
            id: 'features',
            type: 'multiselect',
            label: 'Características',
            options: [
              { value: 'ac', label: 'Aire acondicionado' },
              { value: 'airbags', label: 'Airbags' },
              { value: 'abs', label: 'ABS' },
              { value: 'bluetooth', label: 'Bluetooth' },
              { value: 'camera', label: 'Cámara de retroceso' }
            ]
          }
        ]
      }
    ]
  },
  empleos: {
    title: 'Filtros de Empleos',
    sections: [
      {
        title: 'Detalles del empleo',
        filters: [
          {
            id: 'salary',
            type: 'range',
            label: 'Salario mensual',
            min: 0,
            max: 10000,
            step: 100,
            format: (value: number) => `$${value.toLocaleString()}`
          },
          {
            id: 'jobType',
            type: 'select',
            label: 'Tipo de empleo',
            options: [
              { value: 'fullTime', label: 'Tiempo completo' },
              { value: 'partTime', label: 'Medio tiempo' },
              { value: 'temporary', label: 'Temporal' },
              { value: 'contract', label: 'Contrato' },
              { value: 'internship', label: 'Pasantía' }
            ]
          },
          {
            id: 'modality',
            type: 'select',
            label: 'Modalidad',
            options: [
              { value: 'onSite', label: 'Presencial' },
              { value: 'remote', label: 'Remoto' },
              { value: 'hybrid', label: 'Híbrido' }
            ]
          }
        ]
      },
      {
        title: 'Requisitos',
        filters: [
          {
            id: 'experience',
            type: 'select',
            label: 'Experiencia',
            options: [
              { value: 'noExp', label: 'Sin experiencia' },
              { value: '1-2', label: '1-2 años' },
              { value: '3-5', label: '3-5 años' },
              { value: '5+', label: 'Más de 5 años' }
            ]
          },
          {
            id: 'education',
            type: 'select',
            label: 'Educación',
            options: [
              { value: 'highSchool', label: 'Secundaria' },
              { value: 'technical', label: 'Técnico' },
              { value: 'bachelor', label: 'Universidad' },
              { value: 'master', label: 'Maestría' },
              { value: 'phd', label: 'Doctorado' }
            ]
          },
          {
            id: 'skills',
            type: 'multiselect',
            label: 'Habilidades',
            options: [
              { value: 'programming', label: 'Programación' },
              { value: 'design', label: 'Diseño' },
              { value: 'marketing', label: 'Marketing' },
              { value: 'sales', label: 'Ventas' },
              { value: 'management', label: 'Gestión' },
              { value: 'languages', label: 'Idiomas' }
            ]
          }
        ]
      }
    ]
  }
} 