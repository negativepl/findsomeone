'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  userId: string
  postId?: string
  maxImages?: number
}

export function ImageUpload({
  images,
  onImagesChange,
  userId,
  postId,
  maxImages = 6
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

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

      // Add to images array
      onImagesChange([...images, publicUrl])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd podczas przesyłania')
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    for (let i = 0; i < files.length; i++) {
      if (images.length >= maxImages) {
        setError(`Maksymalna liczba zdjęć to ${maxImages}`)
        break
      }
      await uploadImage(files[i])
    }

    // Reset input
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-black">Zdjęcia</h3>
          <p className="text-sm text-black/60">
            Dodaj do {maxImages} zdjęć (max 5MB każde)
          </p>
        </div>
        <span className="text-sm text-black/60">
          {images.length}/{maxImages}
        </span>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((imageUrl, index) => (
            <div key={imageUrl} className="relative group aspect-square rounded-2xl overflow-hidden bg-black/5">
              <Image
                src={imageUrl}
                alt={`Zdjęcie ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(imageUrl)}
                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {images.length < maxImages && (
        <div>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          <label htmlFor="image-upload">
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-2xl border-2 border-dashed border-black/20 hover:border-black/40 hover:bg-black/5 h-32 cursor-pointer"
              disabled={uploading}
              asChild
            >
              <div className="flex flex-col items-center gap-2">
                {uploading ? (
                  <>
                    <div className="w-8 h-8 border-2 border-black/20 border-t-black/60 rounded-full animate-spin" />
                    <span className="text-sm text-black/60">Przesyłanie...</span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-black/60" />
                    </div>
                    <span className="text-sm font-medium text-black">Dodaj zdjęcia</span>
                    <span className="text-xs text-black/60">PNG, JPG, WEBP (max 5MB)</span>
                  </>
                )}
              </div>
            </Button>
          </label>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-600 p-3 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !uploading && (
        <div className="text-center py-8 px-4 bg-black/5 rounded-2xl">
          <ImageIcon className="w-12 h-12 text-black/30 mx-auto mb-3" />
          <p className="text-sm text-black/60">Nie dodano jeszcze żadnych zdjęć</p>
        </div>
      )}
    </div>
  )
}
