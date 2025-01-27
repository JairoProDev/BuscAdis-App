'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { MediaFile } from '@/types/publish'

interface MediaUploaderProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  maxFiles?: number
}

export default function MediaUploader({ files = [], onFilesChange, maxFiles = 10 }: MediaUploaderProps) {
  const [previews, setPreviews] = useState<string[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...files]
    const newPreviews = [...previews]

    acceptedFiles.forEach((file) => {
      if (newFiles.length >= maxFiles) return

      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      newPreviews.push(previewUrl)
      newFiles.push(file)
    })

    setPreviews(newPreviews)
    onFilesChange(newFiles)
  }, [files, previews, maxFiles, onFilesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: maxFiles - files.length,
  })

  const removeFile = (index: number) => {
    const newFiles = [...files]
    const newPreviews = [...previews]
    
    // Revoke preview URL to prevent memory leaks
    URL.revokeObjectURL(previews[index])
    
    newFiles.splice(index, 1)
    newPreviews.splice(index, 1)
    
    setPreviews(newPreviews)
    onFilesChange(newFiles)
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-primary-200 hover:border-primary-300'
          }`}
      >
        <input {...getInputProps()} />
        <PhotoIcon className="w-12 h-12 mx-auto text-primary-400 mb-4" />
        <p className="text-primary-600">
          {isDragActive ? (
            'Suelta las imágenes aquí...'
          ) : (
            <>
              Arrastra y suelta imágenes aquí, o haz clic para seleccionar
              <br />
              <span className="text-sm text-primary-500">
                Máximo {maxFiles} imágenes
              </span>
            </>
          )}
        </p>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <AnimatePresence>
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square rounded-lg overflow-hidden group"
              >
                <Image
                  src={previews[index]}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(index)
                    }}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full text-primary-600 hover:text-primary-800"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
} 