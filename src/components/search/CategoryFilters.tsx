'use client'

interface CategoryFiltersProps {
  category: string;
}

export function CategoryFilters({ category }: CategoryFiltersProps) {
  switch (category.toLowerCase()) {
    case 'inmuebles':
      return (
        <div className="space-y-4">
          <h3 className="font-medium">Características del inmueble</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="rooms" className="block text-sm text-gray-600 mb-1">
                Habitaciones
              </label>
              <select
                id="rooms"
                className="w-full p-2 border rounded"
              >
                <option value="">Cualquiera</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>
            <div>
              <label htmlFor="bathrooms" className="block text-sm text-gray-600 mb-1">
                Baños
              </label>
              <select
                id="bathrooms"
                className="w-full p-2 border rounded"
              >
                <option value="">Cualquiera</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
              </select>
            </div>
          </div>
        </div>
      );

    case 'vehiculos':
      return (
        <div className="space-y-4">
          <h3 className="font-medium">Características del vehículo</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="year" className="block text-sm text-gray-600 mb-1">
                Año
              </label>
              <select
                id="year"
                className="w-full p-2 border rounded"
              >
                <option value="">Cualquiera</option>
                {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="transmission" className="block text-sm text-gray-600 mb-1">
                Transmisión
              </label>
              <select
                id="transmission"
                className="w-full p-2 border rounded"
              >
                <option value="">Cualquiera</option>
                <option value="manual">Manual</option>
                <option value="automatica">Automática</option>
              </select>
            </div>
          </div>
        </div>
      );

    case 'empleos':
      return (
        <div className="space-y-4">
          <h3 className="font-medium">Detalles del empleo</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm text-gray-600 mb-1">
                Tipo de empleo
              </label>
              <select
                id="type"
                className="w-full p-2 border rounded"
              >
                <option value="">Cualquiera</option>
                <option value="full-time">Tiempo completo</option>
                <option value="part-time">Medio tiempo</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
            <div>
              <label htmlFor="experience" className="block text-sm text-gray-600 mb-1">
                Experiencia
              </label>
              <select
                id="experience"
                className="w-full p-2 border rounded"
              >
                <option value="">Cualquiera</option>
                <option value="junior">Junior</option>
                <option value="mid">Semi-senior</option>
                <option value="senior">Senior</option>
              </select>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
} 