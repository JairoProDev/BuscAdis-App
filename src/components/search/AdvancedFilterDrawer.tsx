'use client'

import React, { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/Button'
import { AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Badge } from '@/components/ui/Badge'
import { filtersByCategory } from '@/data/filterConfig'
import { FilterValue } from '@/types/filters'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs-adapter'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import CategoryFilters from './CategoryFilters'

interface AdvancedFilterDrawerProps {
  selectedCategory?: string
  initialFilters?: Record<string, FilterValue>
  categories: Array<{id: string, name: string}>
  onCategoryChange: (category: {id: string, name: string} | null) => void
  onFilterChange: (filters: Record<string, FilterValue>) => void
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
  const [activeFilters, setActiveFilters] = useState<Record<string, FilterValue>>(initialFilters)

  useEffect(() => {
    // Update local state when external filters change
    setActiveFilters(initialFilters)
  }, [initialFilters])

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
              onSelectCategory={handleCategoryChange}
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
                          {/* TODO: Fix FilterSection interface mismatch */}
                          <div className="p-4 text-gray-500">
                            Filtros para {section.title} - En desarrollo
                          </div>
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