'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { X, Upload, Image as ImageIcon, RotateCw } from 'lucide-react'
import Image from 'next/image'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  userId: string
  postId?: string
  maxImages?: number
  imageRotations?: Record<string, number>
  onRotationsChange?: (rotations: Record<string, number>) => void
}

// Sortable thumbnail component
function SortableThumbnail({
  imageUrl,
  index,
  imageRotations,
  onRotate,
  onRemove,
}: {
  imageUrl: string
  index: number
  imageRotations: Record<string, number>
  onRotate: (url: string) => void
  onRemove: (url: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: imageUrl })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group rounded-2xl bg-black/5 h-32 w-32 cursor-grab active:cursor-grabbing"
    >
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <Image
          src={imageUrl}
          alt={`Zdjęcie ${index + 1}`}
          fill
          className="object-cover transition-transform duration-300"
          style={{ transform: `rotate(${imageRotations[imageUrl] || 0}deg)` }}
        />
        {index === 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm text-white text-[11px] font-bold py-1 px-1 text-center">
            MINIATURKA
          </div>
        )}
      </div>
      {/* Rotate button - hide when dragging */}
      {!isDragging && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRotate(imageUrl)
          }}
          className="absolute top-1 left-1 p-1 bg-white text-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 z-20 shadow-md"
        >
          <RotateCw className="w-3 h-3" />
        </button>
      )}
      {/* Delete button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onRemove(imageUrl)
        }}
        className="absolute top-1 right-0 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 z-20 shadow-md"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}

export function ImageUpload({
  images,
  onImagesChange,
  userId,
  postId,
  maxImages = 6,
  imageRotations = {},
  onRotationsChange
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Wymaga przesunięcia o 8px przed rozpoczęciem drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const uploadImage = async (file: File) => {
    try {
      setError(null)
      setUploading(true)

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Plik musi być obrazem')
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Plik nie może być większy niż 5MB')
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = postId
        ? `${userId}/${postId}/${fileName}`
        : `${userId}/temp/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath)

      // Add to images array using callback to get current state
      return publicUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd podczas przesyłania')
      throw err
    } finally {
      setUploading(false)
    }
  }

  const removeImage = async (imageUrl: string) => {
    try {
      // Extract file path from URL
      const url = new URL(imageUrl)
      const pathParts = url.pathname.split('/post-images/')
      if (pathParts.length > 1) {
        const filePath = pathParts[1]

        // Delete from storage
        await supabase.storage
          .from('post-images')
          .remove([filePath])
      }

      // Remove from array
      onImagesChange(images.filter(img => img !== imageUrl))
    } catch (err) {
      console.error('Error removing image:', err)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = images.indexOf(active.id as string)
      const newIndex = images.indexOf(over.id as string)

      const newImages = arrayMove(images, oldIndex, newIndex)
      onImagesChange(newImages)
    }
  }

  const rotateImage = (imageUrl: string) => {
    // Only visual rotation - actual processing happens on form submit
    const currentRotation = imageRotations[imageUrl] || 0
    const newRotation = (currentRotation + 90) % 360

    if (onRotationsChange) {
      onRotationsChange({ ...imageRotations, [imageUrl]: newRotation })
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const filesToUpload = Array.from(files)
    const uploadedUrls: string[] = []

    for (let i = 0; i < filesToUpload.length; i++) {
      if (images.length + uploadedUrls.length >= maxImages) {
        setError(`Maksymalna liczba zdjęć to ${maxImages}`)
        break
      }
      try {
        const url = await uploadImage(filesToUpload[i])
        uploadedUrls.push(url)
      } catch (err) {
        // Error already handled in uploadImage
        break
      }
    }

    // Add all uploaded images at once
    if (uploadedUrls.length > 0) {
      onImagesChange([...images, ...uploadedUrls])
    }

    // Reset input
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-black">Zdjęcia *</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-black/40 hover:text-black/60 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="font-semibold mb-1">Jakie zdjęcia dodawać?</p>
                <ul className="space-y-0.5 text-xs">
                  <li>• Dodaj wyraźne, dobrze oświetlone zdjęcia</li>
                  <li>• Unikaj zdjęć nieostrych lub zbyt ciemnych</li>
                  <li>• Nie dodawaj zdjęć z danymi osobowymi</li>
                  <li>• Pierwsze zdjęcie będzie miniaturą</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-black/60">
            Dodaj do {maxImages} zdjęć (max 5MB każde)
          </p>
        </div>
        <span className="text-sm text-black/60">
          {images.length}/{maxImages}
        </span>
      </div>

      {/* Image Grid with Upload Slots */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-wrap gap-3">
          {/* Hidden file input */}
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />

          {/* Existing images - sortable */}
          <SortableContext items={images} strategy={rectSortingStrategy}>
            {images.map((imageUrl, index) => (
              <SortableThumbnail
                key={imageUrl}
                imageUrl={imageUrl}
                index={index}
                imageRotations={imageRotations}
                onRotate={rotateImage}
                onRemove={removeImage}
              />
            ))}
          </SortableContext>

          {/* Empty slots for remaining images */}
          {Array.from({ length: Math.min(maxImages - images.length, maxImages) }).map((_, index) => (
            <label
              key={`empty-${index}`}
              htmlFor="image-upload"
              className="rounded-2xl border-2 border-dashed border-black/20 hover:border-black/40 hover:bg-black/5 cursor-pointer transition-colors flex items-center justify-center h-32 w-32"
            >
              {uploading && index === 0 ? (
                <div className="w-8 h-8 border-2 border-black/20 border-t-black/60 rounded-full animate-spin" />
              ) : (
                <ImageIcon className="w-8 h-8 text-black/30" />
              )}
            </label>
          ))}
        </div>
      </DndContext>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-600 p-3 rounded-2xl text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
