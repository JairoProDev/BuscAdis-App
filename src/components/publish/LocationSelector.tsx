'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { useCombobox } from 'downshift'

interface District {
  id: string
  name: string
}

interface Region {
  id: string
  name: string
  districts: District[]
}

interface Location {
  district: District
  region: Region
  coordinates?: {
    lat: number
    lon: number
  }
}

interface LocationSelectorProps {
  value?: Location
  onChange: (location: Location) => void
}

const regions: Region[] = [
  {
    id: 'cusco',
    name: 'Cusco',
    districts: [
      { id: 'cusco', name: 'Cusco' },
      { id: 'san-sebastian', name: 'San Sebastián' },
      { id: 'san-jeronimo', name: 'San Jerónimo' },
      { id: 'santiago', name: 'Santiago' },
      { id: 'wanchaq', name: 'Wanchaq' },
      { id: 'poroy', name: 'Poroy' },
      { id: 'saylla', name: 'Saylla' },
      { id: 'ccorca', name: 'Ccorca' },
      
    ],
  },
]

export default function LocationSelector({ value, onChange }: LocationSelectorProps) {
  const [selectedRegion] = useState<Region>(regions[0])
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (value?.district) {
      setInputValue(value.district.name)
    }
  }, [value])

  const filteredDistricts = selectedRegion.districts.filter(district =>
    district.name.toLowerCase().includes(inputValue.toLowerCase())
  )

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getToggleButtonProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    items: filteredDistricts,
    inputValue,
    onInputValueChange: ({ inputValue }) => {
      setInputValue(inputValue || '')
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        onChange({
          district: selectedItem,
          region: selectedRegion,
        })
      }
    },
    itemToString: (item) => item?.name || '',
  })

  const { ref: downshiftRef, ...inputProps } = getInputProps()

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label className="block text-sm font-medium text-primary-700">
          Ubicación *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-primary-400" />
          </div>
          <input
            ref={(node) => {
              inputRef.current = node
              if (typeof downshiftRef === 'function') {
                downshiftRef(node)
              }
            }}
            {...inputProps}
            {...getToggleButtonProps()}
            placeholder="Busca tu distrito..."
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>
      </div>

      <div {...getMenuProps()}>
        {isOpen && filteredDistricts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-10 mt-1 w-full bg-white rounded-xl shadow-lg border border-primary-100 max-h-60 overflow-auto"
          >
            {filteredDistricts.map((district, index) => (
              <div
                key={district.id}
                {...getItemProps({ item: district, index })}
                className={`px-4 py-2 cursor-pointer flex items-center gap-2 ${
                  highlightedIndex === index
                    ? 'bg-primary-50 text-primary-900'
                    : 'text-primary-600 hover:bg-primary-50'
                }`}
              >
                <MapPinIcon className="h-4 w-4" />
                <span>{district.name}</span>
                <span className="text-sm text-primary-400">
                  {selectedRegion.name}, Perú
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {value?.district && !isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-primary-600 bg-primary-50 px-4 py-2 rounded-lg"
        >
          <MapPinIcon className="h-5 w-5" />
          <div>
            <p className="font-medium">{value.district.name}</p>
            <p className="text-sm">{value.region.name}, Perú</p>
          </div>
        </motion.div>
      )}
    </div>
  )
} 