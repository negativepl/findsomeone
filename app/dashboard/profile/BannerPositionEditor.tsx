'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { MoveVertical, ZoomIn } from 'lucide-react'
import { Slider } from '@/components/ui/slider'

interface BannerPositionEditorProps {
  userId: string
  initialPosition: number
  initialScale: number
  onPositionChange: (position: number) => void
  onScaleChange: (scale: number) => void
}

export function BannerPositionEditor({ userId, initialPosition, initialScale, onPositionChange, onScaleChange }: BannerPositionEditorProps) {
  const [position, setPosition] = useState(initialPosition)
  const [scale, setScale] = useState(initialScale)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const supabase = createClient()

  const handlePositionChange = (newPosition: number) => {
    setPosition(newPosition)
    onPositionChange(newPosition)
  }

  const handleScaleChange = (newScale: number) => {
    setScale(newScale)
    onScaleChange(newScale)
  }

  const handleSave = async () => {
    if (position === initialPosition && scale === initialScale) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          banner_position: position,
          banner_scale: scale
        })
        .eq('id', userId)

      if (error) throw error
      toast.success('Ustawienia bannera zapisane')
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving banner settings:', error)
      toast.error('Nie udało się zapisać ustawień')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="absolute top-4 right-4 z-20 bg-card/90 backdrop-blur-sm hover:bg-card rounded-full p-3 shadow-lg transition-all hover:scale-110"
        title="Dostosuj banner"
      >
        <div className="flex items-center gap-1">
          <MoveVertical className="w-5 h-5 text-foreground" />
          <ZoomIn className="w-5 h-5 text-foreground" />
        </div>
      </button>
    )
  }

  return (
    <div className={`absolute inset-0 z-20 flex items-center justify-center transition-all duration-200 ${
      isDragging ? 'bg-black/20 backdrop-blur-none' : 'bg-black/50 backdrop-blur-sm'
    }`}>
      <div className={`bg-card border border-border rounded-2xl p-4 max-w-md w-full mx-4 shadow-xl transition-opacity duration-200 ${
        isDragging ? 'opacity-20' : 'opacity-100'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-foreground">Dostosuj banner</h3>
          {isSaving && (
            <span className="text-xs text-muted-foreground">Zapisywanie...</span>
          )}
        </div>

        <div className="space-y-4">
          {/* Two columns layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* Position section - LEFT */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <MoveVertical className="w-3.5 h-3.5" />
                <span>Pozycja</span>
              </div>

              {/* Slider */}
              <div className="relative">
                <Slider
                  min={0}
                  max={100}
                  value={[position]}
                  onValueChange={(values) => handlePositionChange(values[0])}
                  onPointerDown={() => setIsDragging(true)}
                  onPointerUp={() => setIsDragging(false)}
                />
              </div>

              {/* Visual indicator */}
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className={position <= 33 ? 'font-semibold text-foreground' : ''}>Góra</span>
                <span className={position > 33 && position < 67 ? 'font-semibold text-foreground' : ''}>Środek</span>
                <span className={position >= 67 ? 'font-semibold text-foreground' : ''}>Dół</span>
              </div>

              {/* Current position */}
              <div className="text-center">
                <div className="inline-flex items-center gap-1 bg-muted rounded-full px-3 py-1">
                  <span className="text-xs font-medium text-foreground">{position}%</span>
                </div>
              </div>
            </div>

            {/* Scale section - RIGHT */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Powiększenie</span>
              </div>

              {/* Slider */}
              <div className="relative">
                <Slider
                  min={100}
                  max={200}
                  value={[scale]}
                  onValueChange={(values) => handleScaleChange(values[0])}
                  onPointerDown={() => setIsDragging(true)}
                  onPointerUp={() => setIsDragging(false)}
                />
              </div>

              {/* Visual indicator */}
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className={scale <= 133 ? 'font-semibold text-foreground' : ''}>100%</span>
                <span className={scale > 133 && scale < 167 ? 'font-semibold text-foreground' : ''}>150%</span>
                <span className={scale >= 167 ? 'font-semibold text-foreground' : ''}>200%</span>
              </div>

              {/* Current scale */}
              <div className="text-center">
                <div className="inline-flex items-center gap-1 bg-muted rounded-full px-3 py-1">
                  <span className="text-xs font-medium text-foreground">{scale}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                setPosition(initialPosition)
                setScale(initialScale)
                onPositionChange(initialPosition)
                onScaleChange(initialScale)
                setIsEditing(false)
              }}
              className="flex-1 rounded-full border border-border bg-muted hover:bg-accent text-foreground text-sm font-semibold py-2 transition-colors"
              disabled={isSaving}
            >
              Anuluj
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 rounded-full bg-brand hover:bg-brand/90 text-brand-foreground text-sm font-semibold py-2 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Zapisywanie...' : 'Zapisz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
