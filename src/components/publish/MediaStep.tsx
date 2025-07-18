'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import Image from 'next/image';

export default function MediaStep({ onNext, onBack, formData, updateFormData }: {
  onNext: () => void;
  onBack: () => void;
  formData: { images?: (File | string)[] };
  updateFormData: (data: { images?: (File | string)[] }) => void;
}) {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFiles = (files: FileList) => {
    const newImages = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
    )

    if (newImages.length > 0) {
      const updatedImages = [...(formData.images || []), ...newImages]
      updateFormData({ ...formData, images: updatedImages })
    }
  }

  const removeImage = (index: number) => {
    const updatedImages = formData.images?.filter((_, i) => i !== index) || []
    updateFormData({ ...formData, images: updatedImages })
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Agrega imágenes a tu anuncio
        </h2>
        <p className="text-gray-600">
          Las imágenes ayudan a que tu anuncio se vea más atractivo
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Arrastra y suelta tus imágenes aquí
        </p>
        <p className="text-gray-500 mb-4">
          o haz clic para seleccionar archivos
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Button variant="outline" className="relative z-10">
          <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
          Seleccionar imágenes
        </Button>
      </div>

      {/* Image Preview */}
      {formData.images && formData.images.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Imágenes ({formData.images.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <Image
                  src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                  alt={`Preview ${index + 1}`}
                  width={128}
                  height={128}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Atrás
        </Button>
        <Button onClick={onNext} disabled={false}>
          {false ? 'Subiendo...' : 'Siguiente'}
        </Button>
      </div>
    </motion.div>
  )
} 