'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Badge } from '@/components/ui/badge'
import { filtersByCategory } from '@/data/filterConfig'
import { Filter, FilterValue } from '@/types/filters'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import CategoryFilters from './CategoryFilters'
import FilterSection from './FilterSection'
import { useSearchParams } from 'next/navigation'

interface AdvancedFilterDrawerProps {
  selectedCategory?: string
  initialFilters?: Record<string, any>
  categories: Array<{id: string, name: string}>
  onCategoryChange: (category: {id: string, name: string} | null) => void
  onFilterChange: (filters: Record<string, any>) => void
  filterCount: number
}

export default function AdvancedFilterDrawer({
  selectedCategory,
  initialFilters = {},
  categories,
  onCategoryChange,
  onFilterChange,
  filterCount
}: AdvancedFilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('categories')
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [activeFilters, setActiveFilters] = useState<FilterValue>(initialFilters)

  const searchParams = useSearchParams()

  useEffect(() => {
    // Update local state when external filters change
    setActiveFilters(initialFilters)
  }, [initialFilters])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const handleFilterChange = (filterId: string, value: any) => {
    const newFilters = { ...activeFilters }
    
    if (value === '' || value === null || value === undefined || 
        (Array.isArray(value) && value.length === 0)) {
      delete newFilters[filterId]
    } else {
      newFilters[filterId] = value
    }
    
    setActiveFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    setActiveFilters({})
    onFilterChange({})
  }

  const handleApplyFilters = () => {
    onFilterChange(activeFilters)
    setIsOpen(false)
  }

  const handleCategoryChange = (category: {id: string, name: string} | null) => {
    if (category) {
      onCategoryChange(category)
      setActiveTab('filters')
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => setIsOpen(true)}
        >
          <AdjustmentsHorizontalIcon className="h-4 w-4" />
          <span>Filtros</span>
          {filterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {filterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] sm:w-[450px] p-0">
        <SheetHeader className="px-4 py-3 border-b">
          <div className="flex justify-between items-center">
            <SheetTitle>Filtros avanzados</SheetTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => setIsOpen(false)}
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        
        <Tabs defaultValue="categories" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="filters" disabled={!selectedCategory}>Filtros</TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories" className="p-4 max-h-[calc(100vh-7rem)] overflow-y-auto">
            <CategoryFilters
              selectedCategory={selectedCategory ? { id: selectedCategory, name: categories.find(c => c.id === selectedCategory)?.name || '' } : null}
              selectedType={null}
              onSelectCategory={handleCategoryChange}
              onSelectType={() => {}}
              onFilterChange={() => {}}
            />
          </TabsContent>
          
          <TabsContent value="filters" className="p-0 overflow-hidden flex flex-col h-[calc(100vh-7rem)]">
            {selectedCategory && filtersByCategory[selectedCategory] && (
              <>
                <div className="overflow-y-auto flex-grow p-4">
                  <Accordion type="multiple" value={expandedSections} onValueChange={setExpandedSections}>
                    {filtersByCategory[selectedCategory].sections.map((section) => (
                      <AccordionItem key={section.title} value={section.title}>
                        <AccordionTrigger className="py-3">
                          {section.title}
                        </AccordionTrigger>
                        <AccordionContent>
                          <FilterSection 
                            filters={section.filters} 
                            activeFilters={activeFilters} 
                            onFilterChange={handleFilterChange}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
                
                <div className="p-4 border-t flex gap-2 mt-auto">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={clearFilters}
                    disabled={Object.keys(activeFilters).length === 0}
                  >
                    Limpiar
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleApplyFilters}
                  >
                    Aplicar
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
} 