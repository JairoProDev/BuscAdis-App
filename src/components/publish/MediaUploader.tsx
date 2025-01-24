'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import { MediaFile, MediaType, CategoryConfig } from '@/types/publish'
import { 
  ArrowUpTrayIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
  VideoCameraIcon,
  CubeIcon,
  DocumentIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'

interface MediaUploaderProps {
  files: MediaFile[]
  onFilesChange: (files: MediaFile[]) => void
  categoryConfig: CategoryConfig
  className?: string
}

export default function MediaUploader({
  files,
  onFilesChange,
  categoryConfig,
  className = ''
}: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [previewUrls, setPreviewUrls] = useState<{ [key: string]: string }>({})

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles: MediaFile[] = await Promise.all(
        acceptedFiles.map(async (file) => {
          // Simular carga con progreso
          const id = Math.random().toString(36).substring(7)
          setUploadProgress(prev => ({ ...prev, [id]: 0 }))
          
          const interval = setInterval(() => {
            setUploadProgress(prev => {
              const current = prev[id] || 0
              if (current >= 100) {
                clearInterval(interval)
                return prev
              }
              return { ...prev, [id]: current + 10 }
            })
          }, 200)

          // Crear URL de previsualización
          const previewUrl = URL.createObjectURL(file)
          setPreviewUrls(prev => ({ ...prev, [id]: previewUrl }))

          // Determinar tipo de archivo
          let type: MediaType = 'image'
          if (file.type.startsWith('video/')) type = 'video'
          else if (file.type.startsWith('model/')) type = '3d'
          else if (!file.type.startsWith('image/')) type = 'document'

          return {
            id,
            type,
            url: previewUrl, // Esto sería reemplazado por la URL real después de subir
            title: file.name,
            size: file.size,
            order: files.length,
            isPrimary: files.length === 0
          }
        })
      )

      onFilesChange([...files, ...newFiles])
    },
    [files, onFilesChange]
  )

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': categoryConfig.mediaRequirements.maxImages > 0 ? [] : undefined,
      'video/*': categoryConfig.mediaRequirements.allowVideo ? [] : undefined,
      'model/*': categoryConfig.mediaRequirements.allow3D ? [] : undefined,
      'application/*': categoryConfig.mediaRequirements.allowDocuments ? [] : undefined
    },
    maxSize: categoryConfig.mediaRequirements.maxFileSize,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false)
  })

  const handleRemove = (id: string) => {
    URL.revokeObjectURL(previewUrls[id])
    setPreviewUrls(prev => {
      const { [id]: removed, ...rest } = prev
      return rest
    })
    onFilesChange(files.filter(f => f.id !== id))
  }

  const handleReorder = (reorderedFiles: MediaFile[]) => {
    onFilesChange(
      reorderedFiles.map((file, index) => ({
        ...file,
        order: index,
        isPrimary: index === 0
      }))
    )
  }

  const getFileIcon = (type: MediaType) => {
    switch (type) {
      case 'video':
        return <VideoCameraIcon className="w-8 h-8" />
      case '3d':
        return <CubeIcon className="w-8 h-8" />
      case 'document':
        return <DocumentIcon className="w-8 h-8" />
      default:
        return <PhotoIcon className="w-8 h-8" />
    }
  }

  return (
    <div className={className}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`relative p-8 border-2 border-dashed rounded-2xl transition-all ${
          isDragging
            ? 'border-primary-500 bg-primary-500/10'
            : 'border-primary-200 hover:border-primary-500 hover:bg-primary-500/5'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          <ArrowUpTrayIcon className="w-12 h-12 text-primary-500 mb-4" />
          <h3 className="text-xl font-semibold text-primary-900 mb-2">
            Arrastra tus archivos aquí
          </h3>
          <p className="text-primary-600 mb-4">
            o haz clic para seleccionarlos
          </p>
          <ul className="text-sm text-primary-500 space-y-1">
            <li>Hasta {categoryConfig.mediaRequirements.maxImages} imágenes</li>
            {categoryConfig.mediaRequirements.allowVideo && (
              <li>Videos permitidos</li>
            )}
            {categoryConfig.mediaRequirements.allow3D && (
              <li>Modelos 3D permitidos</li>
            )}
            <li>Máximo {(categoryConfig.mediaRequirements.maxFileSize / 1048576).toFixed(0)}MB por archivo</li>
          </ul>
        </div>
      </div>

      {/* Preview Grid */}
      {files.length > 0 && (
        <div className="mt-8">
          <Reorder.Group
            axis="y"
            values={files}
            onReorder={handleReorder}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            <AnimatePresence>
              {files.map((file) => (
                <Reorder.Item
                  key={file.id}
                  value={file}
                  className="relative aspect-square rounded-xl overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  whileDrag={{ scale: 1.05 }}
                >
                  {file.type === 'image' ? (
                    <Image
                      src={previewUrls[file.id] || file.url}
                      alt={file.title || ''}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-100">
                      {getFileIcon(file.type)}
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemove(file.id)
                        }}
                        className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5 text-white" />
                      </button>
                      <button
                        className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors cursor-move"
                      >
                        <ArrowsPointingOutIcon className="w-5 h-5 text-white" />
                      </button>
                    </div>

                    {file.isPrimary && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-primary-500 text-white text-xs">
                        Principal
                      </div>
                    )}

                    {uploadProgress[file.id] !== undefined && uploadProgress[file.id] < 100 && (
                      <div className="absolute inset-x-4 bottom-4">
                        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress[file.id]}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </div>
      )}
    </div>
  )
} 