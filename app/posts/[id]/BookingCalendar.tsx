'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface BookingCalendarProps {
  providerId: string
  providerName: string
  postId: string
  postTitle: string
  onClose?: () => void
  isMobilePage?: boolean
}

export function BookingCalendar({ providerId, providerName, postId, postTitle, onClose, isMobilePage = false }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate)

  // Navigate months
  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
    setSelectedDate(null)
    setSelectedTime(null)
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
    setSelectedDate(null)
    setSelectedTime(null)
  }

  // Check if date is in the past
  const isPastDate = (day: number) => {
    const date = new Date(year, month, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  // Check if date is today
  const isToday = (day: number) => {
    const date = new Date(year, month, day)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Select date
  const handleDateSelect = (day: number) => {
    if (isPastDate(day)) return
    const date = new Date(year, month, day)
    setSelectedDate(date)
    setSelectedTime(null)
  }

  // Mock available time slots (9:00 - 17:00, every hour)
  const availableTimeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ]

  // Handle booking submission
  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return

    setIsSubmitting(true)
    try {
      // Combine date and time
      const [hours, minutes] = selectedTime.split(':')
      const scheduledAt = new Date(selectedDate)
      scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0)

      // Make API call to create booking
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          postId,
          scheduledAt: scheduledAt.toISOString(),
          durationMinutes: 60,
          clientNotes: notes
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Błąd podczas tworzenia rezerwacji')
      }

      toast.success('Rezerwacja wysłana!', {
        description: `${providerName} otrzyma powiadomienie o Twojej rezerwacji.`
      })

      // On mobile page, redirect back to post
      if (isMobilePage) {
        setTimeout(() => {
          window.location.href = `/posts/${postId}`
        }, 1000)
      } else if (onClose) {
        onClose()
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      toast.error('Wystąpił błąd', {
        description: error instanceof Error ? error.message : 'Nie udało się utworzyć rezerwacji'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ]

  const dayNames = ['Nd', 'Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb']

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Column: Calendar */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Wybierz datę</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={previousMonth}
              className="h-8 w-8 rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {monthNames[month]} {year}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
              className="h-8 w-8 rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="border border-border rounded-2xl overflow-hidden">
          {/* Day names */}
          <div className="grid grid-cols-7 bg-muted">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square border-t border-r border-border" />
            ))}

            {/* Days in month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const isPast = isPastDate(day)
              const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === month
              const isTodayDate = isToday(day)

              return (
                <button
                  key={day}
                  onClick={() => handleDateSelect(day)}
                  disabled={isPast}
                  className={`
                    aspect-square border-t border-r border-border p-2 text-sm transition-colors
                    ${isPast
                      ? 'text-muted-foreground/40 cursor-not-allowed bg-muted/30'
                      : isSelected
                        ? 'bg-brand text-brand-foreground font-semibold'
                        : isTodayDate
                          ? 'bg-brand/10 font-medium text-foreground hover:bg-brand/20 cursor-pointer'
                          : 'text-foreground hover:bg-brand/5 cursor-pointer'
                    }
                  `}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Time Slots & Form */}
      <div className="flex-1 space-y-6">
        {/* Time Slots */}
        {selectedDate ? (
          <div>
          <h3 className="text-lg font-semibold mb-3">
            Dostępne godziny
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {availableTimeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`
                  py-2 px-3 rounded-lg border transition-all text-sm font-medium
                  ${selectedTime === time
                    ? 'bg-brand text-brand-foreground border-brand scale-105'
                    : 'text-foreground border-border hover:bg-brand/5 hover:border-brand/30 hover:scale-105'
                  }
                `}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[400px] text-muted-foreground border border-dashed border-border rounded-2xl">
            <p className="text-sm">Najpierw wybierz datę z kalendarza</p>
          </div>
        )}

        {/* Notes */}
        {selectedDate && selectedTime && (
          <div>
          <Label htmlFor="notes" className="text-base font-semibold mb-2 block">
            Dodatkowe informacje (opcjonalne)
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Opisz czego potrzebujesz, podaj dodatkowe szczegóły..."
            className="rounded-2xl border-border min-h-[100px]"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {notes.length}/500 znaków
          </p>
        </div>
        )}

        {/* Summary & Submit */}
        {selectedDate && selectedTime && (
          <div className="border-t border-border pt-6">
          <div className="bg-muted rounded-2xl p-4 mb-4">
            <h4 className="font-semibold mb-2">Podsumowanie rezerwacji</h4>
            <div className="space-y-1 text-sm">
              <p><span className="text-muted-foreground">Usługa:</span> <span className="font-medium">{postTitle}</span></p>
              <p><span className="text-muted-foreground">Usługodawca:</span> <span className="font-medium">{providerName}</span></p>
              <p><span className="text-muted-foreground">Data:</span> <span className="font-medium">
                {selectedDate.toLocaleDateString('pl-PL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span></p>
              <p><span className="text-muted-foreground">Godzina:</span> <span className="font-medium">{selectedTime}</span></p>
            </div>
          </div>

          <div className="flex gap-3">
            {!isMobilePage && (
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-full"
                disabled={isSubmitting}
              >
                Anuluj
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              className={`${isMobilePage ? 'w-full' : 'flex-1'} rounded-full bg-brand hover:bg-brand/90 text-brand-foreground`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Wysyłanie...' : 'Potwierdź rezerwację'}
            </Button>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
