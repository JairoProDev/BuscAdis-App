"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Download, RefreshCw, Search, Calendar, MapPin, 
  DollarSign, Info, ChevronLeft, ChevronRight, 
  Grid3X3, List, ClockIcon
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs-adapter';

// Nuevas interfaces para reemplazar 'any'
export interface LocationData {
  district?: string;
  city?: string;
  state?: string;
  country?: string;
  province?: string;
  coordinates?: [number, number];
}

export interface Publication {
  id: string;
  title: string;
  description: string;
  price?: number;
  currency?: string;
  images: string[];
  location?: LocationData;
  createdAt: string;
  attributes?: Record<string, unknown>;
}

export interface Magazine {
  _id: string;
  categoryId: string;
  pdfUrl: string;
  fileId: string;
  publicationCount: number;
  createdAt: string;
  lastUpdated: string;
}

export interface PaginationProps {
  currentPage: number;
  maxPages: number;
  onPageChange: (page: number) => void;
}

export interface CategoryViewerProps {
  categoryId: string;
}

export interface MagazineHeaderProps {
  magazine: Magazine | null;
  isGenerating: boolean;
  onGenerate: () => void;
}

export interface PublicationsGridProps {
  publications: Publication[];
  onSelect: (publication: Publication) => void;
}

export interface PublicationsListProps {
  publications: Publication[];
  onSelect: (publication: Publication) => void;
}

export interface PublicationDetailProps {
  publication: Publication;
  onBack: () => void;
}

export interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export default function MagazineCategoryViewer({ categoryId }: CategoryViewerProps) {
  // Estados
  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  
  // Constantes
  const itemsPerPage = 12;
  const maxPages = Math.ceil(filteredPublications.length / itemsPerPage);
  
  // Cargar datos iniciales
  useEffect(() => {
    loadMagazineData();
  }, [loadMagazineData]);
  
  // Filtrar publicaciones cuando cambia la búsqueda
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPublications(publications);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = publications.filter(pub => 
        pub.title.toLowerCase().includes(query) || 
        pub.description.toLowerCase().includes(query) ||
        (pub.location?.district && pub.location.district.toLowerCase().includes(query)) ||
        (pub.attributes && Object.values(pub.attributes).some(
          val => val && val.toString().toLowerCase().includes(query)
        ))
      );
      setFilteredPublications(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, publications]);
  
  // Funciones principales
  const loadMagazineData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/magazine/by-category/${categoryId}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar la revista');
      }
      
      const data = await response.json();
      
      setMagazine(data.magazine);
      setPublications(data.publications || []);
      setFilteredPublications(data.publications || []);
    } catch (err) {
      console.error('Error loading magazine data:', err);
      setError('No se pudo cargar la revista. Intenta más tarde.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateMagazine = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await fetch(`/api/magazine/generate-category/${categoryId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al generar la revista');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setMagazine({
          _id: data.magazineId,
          categoryId: data.categoryId,
          pdfUrl: data.pdfUrl,
          fileId: data.fileId,
          publicationCount: data.publicationCount,
          createdAt: data.createdAt,
          lastUpdated: data.createdAt
        });
        
        // Recargar los datos también
        loadMagazineData();
      } else {
        setError('No se pudo generar la revista. Por favor, inténtalo más tarde.');
      }
    } catch (err) {
      console.error('Error generating magazine:', err);
      setError('No se pudo generar la revista. Por favor, inténtalo más tarde.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Funciones auxiliares
  // const formatDate = (dateString: string) => {
  //   if (!dateString) return '';
  //   try {
  //     return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
  //   } catch (e) {
  //     return dateString;
  //   }
  // };
  
  const getPagination = () => {
    const paginatedPublications = filteredPublications.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    return paginatedPublications;
  };
  
  // const formatPrice = (price?: number, currency?: string) => {
  //   if (!price) return 'Consultar precio';
  //   const formatter = new Intl.NumberFormat('es-PE', {
  //     style: 'currency',
  //     currency: currency || 'PEN',
  //     maximumFractionDigits: 0
  //   });
  //   return formatter.format(price);
  // };
  
  // Renderizado de componentes
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (error) {
    return <ErrorState error={error} onRetry={loadMagazineData} />;
  }
  
  return (
    <div className="rounded-xl overflow-hidden bg-white shadow-md">
      {/* Cabecera con info de la revista */}
      <MagazineHeader 
        magazine={magazine} 
        isGenerating={isGenerating} 
        onGenerate={handleGenerateMagazine} 
      />
      
      {/* Visor y buscador de publicaciones */}
      <div className="p-6">
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="browse">Ver Anuncios</TabsTrigger>
            <TabsTrigger value="details">Detalles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="space-y-6">
            {/* Barra de búsqueda y filtros */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Buscar anuncios..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  className={viewMode === 'grid' ? 'bg-blue-50' : ''}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 size={18} />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className={viewMode === 'list' ? 'bg-blue-50' : ''}
                  onClick={() => setViewMode('list')}
                >
                  <List size={18} />
                </Button>
              </div>
            </div>
            
            {/* Conteo de resultados */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">
                {filteredPublications.length} anuncios encontrados
              </p>
              
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSearchQuery('')}
                  className="text-xs h-8"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
            
            {/* Lista de publicaciones en grid o lista */}
            {filteredPublications.length === 0 ? (
              <NoResultsState query={searchQuery} />
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <PublicationsGrid 
                    publications={getPagination()} 
                    onSelect={setSelectedPublication}
                  />
                ) : (
                  <PublicationsList 
                    publications={getPagination()} 
                    onSelect={setSelectedPublication}
                  />
                )}
                
                {/* Paginación */}
                {maxPages > 1 && (
                  <Pagination 
                    currentPage={currentPage} 
                    maxPages={maxPages} 
                    onPageChange={setCurrentPage} 
                  />
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="details">
            {selectedPublication ? (
              <PublicationDetail 
                publication={selectedPublication} 
                onBack={() => setSelectedPublication(null)} 
              />
            ) : (
              <div className="text-center py-16">
                <Info size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Selecciona un anuncio para ver más detalles
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Haz clic en cualquier anuncio de la lista para ver toda su información
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Componentes auxiliares
function MagazineHeader({ magazine, isGenerating, onGenerate }: MagazineHeaderProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No disponible';
    try {
      return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
    } catch {
      return dateString;
    }
  };
  
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Revista Digital</h2>
          {magazine ? (
            <div className="space-y-1">
              <p className="flex items-center text-blue-100">
                <Calendar size={16} className="mr-2" />
                Actualizada: {formatDate(magazine.lastUpdated || magazine.createdAt)}
              </p>
              <p className="text-blue-100">
                {magazine.publicationCount} anuncios disponibles
              </p>
            </div>
          ) : (
            <p className="text-blue-100">
              No hay revista generada para esta categoría
            </p>
          )}
        </div>
        
        <div className="flex space-x-3">
          {magazine && (
            <Button
              variant="secondary"
              onClick={() => window.open(magazine.pdfUrl, '_blank')}
              className="bg-white text-blue-700 hover:bg-blue-50"
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
          )}
          
          <Button
            variant={magazine ? "outline" : "secondary"}
            onClick={onGenerate}
            disabled={isGenerating}
            className={magazine ? "border-white text-white hover:bg-blue-700" : "bg-white text-blue-700 hover:bg-blue-50"}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generando...' : magazine ? 'Regenerar' : 'Generar PDF'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PublicationsGrid({ publications, onSelect }: PublicationsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {publications.map((pub: Publication) => (
        <div 
          key={pub.id} 
          className="bg-white overflow-hidden rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelect(pub)}
        >
          {pub.images && pub.images.length > 0 && (
            <div className="aspect-video relative bg-gray-100">
              <Image
                src={pub.images[0]}
                alt={pub.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          )}
          
          <div className="p-4">
            <h3 className="font-medium line-clamp-2 mb-2 min-h-[3rem]">{pub.title}</h3>
            
            {pub.price && (
              <p className="text-green-600 font-bold mb-2">
                {pub.currency === 'USD' ? '$' : 'S/.'} {pub.price.toLocaleString('es-PE')}
              </p>
            )}
            
            {pub.location && pub.location.district && (
              <div className="flex items-center text-gray-500 text-sm mb-2">
                <MapPin size={14} className="mr-1" />
                <span className="truncate">{pub.location.district}</span>
              </div>
            )}
            
            <p className="text-gray-500 text-sm line-clamp-3">{pub.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PublicationsList({ publications, onSelect }: PublicationsListProps) {
  return (
    <div className="divide-y divide-gray-200">
      {publications.map((pub: Publication) => (
        <div 
          key={pub.id}
          className="py-4 flex gap-4 hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => onSelect(pub)}
        >
          {pub.images && pub.images.length > 0 && (
            <div className="h-24 w-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden relative">
              <Image
                src={pub.images[0]}
                alt={pub.title}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
          )}
          
          <div className="flex-grow">
            <h3 className="font-medium mb-1">{pub.title}</h3>
            
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
              {pub.price && (
                <span className="text-green-600 font-medium text-sm flex items-center">
                  <DollarSign size={14} className="mr-1" />
                  {pub.currency === 'USD' ? '$' : 'S/.'} {pub.price.toLocaleString('es-PE')}
                </span>
              )}
              
              {pub.location && pub.location.district && (
                <span className="text-gray-500 text-sm flex items-center">
                  <MapPin size={14} className="mr-1" />
                  {pub.location.district}
                </span>
              )}
              
              {pub.createdAt && (
                <span className="text-gray-500 text-sm flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {format(new Date(pub.createdAt), 'dd/MM/yyyy')}
                </span>
              )}
            </div>
            
            <p className="text-gray-500 text-sm line-clamp-2">{pub.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PublicationDetail({ publication, onBack }: PublicationDetailProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
    } catch {
      return dateString;
    }
  };
  
  return (
    <div>
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="mb-4 text-gray-600"
      >
        <ChevronLeft size={16} className="mr-1" /> Volver a la lista
      </Button>
      
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Galería de imágenes */}
        {publication.images && publication.images.length > 0 && (
          <div className="aspect-video relative bg-gray-100">
            <Image
              src={publication.images[0]}
              alt={publication.title}
              fill
              className="object-contain"
            />
          </div>
        )}
        
        {/* Información principal */}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">{publication.title}</h2>
          
          <div className="flex flex-wrap gap-4 mb-6">
            {publication.price && (
              <Badge className="px-3 py-1 bg-green-50 text-green-700 border-green-200">
                <DollarSign size={14} className="mr-1" />
                {publication.currency === 'USD' ? '$' : 'S/.'} {publication.price.toLocaleString('es-PE')}
              </Badge>
            )}
            
            {publication.location && publication.location.district && (
              <Badge variant="outline" className="px-3 py-1">
                <MapPin size={14} className="mr-1" />
                {publication.location.district}
                {publication.location?.province && `, ${publication.location.province}`}
              </Badge>
            )}
            
            {publication.createdAt && (
              <Badge variant="outline" className="px-3 py-1">
                <Calendar size={14} className="mr-1" />
                Publicado: {formatDate(publication.createdAt)}
              </Badge>
            )}
          </div>
          
          {/* Descripción */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Descripción</h3>
            <p className="text-gray-700 whitespace-pre-line">{publication.description}</p>
          </div>
          
          {/* Atributos/características */}
          {publication.attributes && Object.keys(publication.attributes).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Características</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(publication.attributes).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <div key={key} className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-blue-100 mr-2"></div>
                      <span className="font-medium text-gray-700">{key.replace(/_/g, ' ')}:</span>
                      <span className="ml-2 text-gray-600">{value.toString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Pagination({ currentPage, maxPages, onPageChange }: PaginationProps) {
  // Determinar qué páginas mostrar (lógica para mostrar páginas cercanas a la actual)
  const getPageNumbers = () => {
    const pages = [];
    
    if (maxPages <= 5) {
      for (let i = 1; i <= maxPages; i++) {
        pages.push(i);
      }
    } else {
      // Siempre mostrar la primera y última página
      pages.push(1);
      
      // Lógica para páginas intermedias
      if (currentPage <= 3) {
        pages.push(2, 3, 4, '...');
      } else if (currentPage >= maxPages - 2) {
        pages.push('...', maxPages - 3, maxPages - 2, maxPages - 1);
      } else {
        pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...');
      }
      
      pages.push(maxPages);
    }
    
    return pages;
  };
  
  return (
    <div className="flex justify-center items-center mt-8 space-x-1">
      <Button 
        variant="outline" 
        size="icon"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={16} />
      </Button>
      
      {getPageNumbers().map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-3 py-2">...</span>
          ) : (
            <Button
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(Number(page))}
              className={page === currentPage ? "bg-blue-600" : ""}
            >
              {page}
            </Button>
          )}
        </React.Fragment>
      ))}
      
      <Button 
        variant="outline" 
        size="icon"
        disabled={currentPage === maxPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-xl overflow-hidden bg-white shadow-md">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
        <Skeleton className="h-8 w-48 bg-blue-500/30 mb-4" />
        <Skeleton className="h-4 w-64 bg-blue-500/30 mb-2" />
        <Skeleton className="h-4 w-36 bg-blue-500/30" />
      </div>
      
      <div className="p-6">
        <div className="flex mb-6">
          <Skeleton className="h-10 flex-grow mr-4" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10 ml-2" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(null).map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-200 overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-5 w-1/4 mb-2" />
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-xl overflow-hidden bg-white shadow-md p-8 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Info size={24} className="text-red-500" />
        </div>
        
        <h3 className="text-xl font-bold mb-3">Error al cargar la revista</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        
        <Button onClick={onRetry}>
          <RefreshCw size={16} className="mr-2" />
          Intentar nuevamente
        </Button>
      </div>
    </div>
  );
}

function NoResultsState({ query }: { query: string }) {
  return (
    <div className="text-center py-16">
      <Search size={48} className="mx-auto text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold text-gray-600 mb-2">
        No se encontraron resultados
      </h3>
      {query && (
        <p className="text-gray-500 max-w-md mx-auto">
          No hay anuncios que coincidan con &ldquo;{query}&rdquo;.
          Intenta con otra búsqueda.
        </p>
      )}
    </div>
  );
} 