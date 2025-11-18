'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Calendar, Clock, User, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { BookingActions } from './BookingActions'
import { useRouter } from 'next/navigation'
import { AnimatedTabs } from '@/components/AnimatedTabs'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface BookingsContentProps {
  userId: string
  providerBookings: any[]
  clientBookings: any[]
}

export function BookingsContent({ userId, providerBookings: initialProviderBookings, clientBookings: initialClientBookings }: BookingsContentProps) {
  const router = useRouter()
  const [, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState('received')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(new Set())
  const [isBulkConfirming, setIsBulkConfirming] = useState(false)
  const [isBulkRejecting, setIsBulkRejecting] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Filter out cancelled bookings
  const providerBookings = initialProviderBookings?.filter(b => b.status !== 'cancelled') || []
  const clientBookings = initialClientBookings?.filter(b => b.status !== 'cancelled') || []

  const handleUpdate = () => {
    setRefreshKey(prev => prev + 1)
    setSelectedBookings(new Set())
    router.refresh()
  }

  const toggleBookingSelection = (bookingId: string) => {
    const newSelected = new Set(selectedBookings)
    if (newSelected.has(bookingId)) {
      newSelected.delete(bookingId)
    } else {
      newSelected.add(bookingId)
    }
    setSelectedBookings(newSelected)
  }

  const handleBulkAction = async (action: 'confirmed' | 'cancelled') => {
    if (selectedBookings.size === 0) return

    if (action === 'confirmed') setIsBulkConfirming(true)
    else setIsBulkRejecting(true)

    try {
      const promises = Array.from(selectedBookings).map(bookingId =>
        fetch('/api/bookings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, status: action })
        })
      )

      await Promise.all(promises)

      const count = selectedBookings.size
      const message = action === 'confirmed'
        ? `Potwierdzono ${count} ${count === 1 ? 'rezerwację' : count < 5 ? 'rezerwacje' : 'rezerwacji'}`
        : `Odrzucono ${count} ${count === 1 ? 'rezerwację' : count < 5 ? 'rezerwacje' : 'rezerwacji'}`

      toast.success('Sukces', { description: message })
      handleUpdate()
    } catch (error) {
      console.error('Bulk action error:', error)
      toast.error('Wystąpił błąd', {
        description: 'Nie udało się przetworzyć wszystkich rezerwacji'
      })
    } finally {
      if (action === 'confirmed') setIsBulkConfirming(false)
      else setIsBulkRejecting(false)
    }
  }

  const tabs = [
    { id: 'received', label: 'Otrzymane rezerwacje', count: providerBookings.length },
    { id: 'sent', label: 'Wysłane rezerwacje', count: clientBookings.length },
  ]

  const currentBookings = activeTab === 'received' ? providerBookings : clientBookings
  const isProvider = activeTab === 'received'

  // Get pending bookings (only for provider - received tab)
  const pendingBookings = useMemo(() => {
    if (activeTab !== 'received') return []
    return providerBookings.filter(b => b.status === 'pending').sort((a, b) =>
      new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    )
  }, [activeTab, providerBookings])

  // Get bookings grouped by date
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, any[]>()
    currentBookings.forEach(booking => {
      const date = new Date(booking.scheduled_at)
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey)!.push(booking)
    })
    return map
  }, [currentBookings])

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1 // Monday = 0

    const days: (Date | null)[] = []

    // Days from previous month
    const prevMonthLastDay = new Date(year, month, 0)
    const prevMonthDays = prevMonthLastDay.getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i
      days.push(new Date(year, month - 1, day))
    }

    // Days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    // Fill remaining days from next month to complete the grid (42 days = 6 rows)
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      days.push(new Date(year, month + 1, day))
    }

    return days
  }, [currentMonth])

  const nextMonth = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
      setSelectedDate(null)
      setTimeout(() => setIsAnimating(false), 100)
    }, 150)
  }

  const prevMonth = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
      setSelectedDate(null)
      setTimeout(() => setIsAnimating(false), 100)
    }, 150)
  }

  const goToToday = () => {
    setIsAnimating(true)
    setTimeout(() => {
      const today = new Date()
      setCurrentMonth(today)
      setSelectedDate(today)
      setTimeout(() => setIsAnimating(false), 100)
    }, 150)
  }

  const getDayBookings = (date: Date) => {
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    return bookingsByDate.get(dateKey) || []
  }

  const getDayStatuses = (date: Date) => {
    const bookings = getDayBookings(date)
    if (bookings.length === 0) return []

    const statuses: string[] = []
    bookings.forEach(b => {
      statuses.push(b.status)
    })
    return statuses
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-brand/10 text-brand border border-brand/20',
      confirmed: 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20',
      cancelled: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
      completed: 'bg-muted text-muted-foreground border border-border'
    }

    const labels = {
      pending: 'Oczekuje',
      confirmed: 'Potwierdzona',
      cancelled: 'Anulowana',
      completed: 'Zakończona'
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles] || styles.pending}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  const groupByMonth = (bookings: any[]) => {
    const grouped: Record<string, any[]> = {}
    bookings?.forEach(booking => {
      const date = new Date(booking.scheduled_at)
      const key = date.toLocaleDateString('pl-PL', { year: 'numeric', month: 'long' })
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(booking)
    })
    return grouped
  }

  const selectedDayBookings = useMemo(() => {
    if (!selectedDate) return []
    return getDayBookings(selectedDate)
  }, [selectedDate, bookingsByDate])

  const weekDays = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie']

  return (
    <main className="container mx-auto px-3 md:px-6 pt-20 md:pt-24 pb-20 md:pb-8">
      {/* Header - Desktop only */}
      <div className="mb-8 hidden md:block">
        <h1 className="text-4xl font-bold text-foreground mb-3">Moje rezerwacje</h1>
        <p className="text-lg text-muted-foreground">
          Zarządzaj swoimi rezerwacjami
        </p>
      </div>

      <div className="mb-4 md:mb-6">
        <AnimatedTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Pending Bookings Section */}
      {pendingBookings.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg md:text-xl font-bold mb-4 text-foreground">
            Nowe rezerwacje ({pendingBookings.length})
          </h2>
          <div className="space-y-3">
            {pendingBookings.map((booking: any) => {
              const personName = booking.client?.full_name || 'Użytkownik'
              const bookingDate = new Date(booking.scheduled_at)
              const isSelected = selectedBookings.has(booking.id)

              return (
                <Card key={booking.id} className="overflow-hidden flex flex-col">
                  <div className="p-4 flex gap-4 items-start flex-1">
                    {/* Checkbox - hidden on mobile */}
                    <div className="hidden md:flex items-center pt-1">
                      <button
                        onClick={() => toggleBookingSelection(booking.id)}
                        className={`w-6 h-6 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${
                          isSelected
                            ? 'bg-brand border-brand'
                            : 'border-border hover:border-brand/50'
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                    <div className="mb-3">
                      <h4 className="font-semibold text-base mb-1">{booking.post?.title || 'Usługa'}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-3.5 h-3.5" />
                        <span>{personName}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-brand" />
                        <span className="font-medium">
                          {bookingDate.toLocaleDateString('pl-PL', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-brand" />
                        <span className="font-medium">{formatTime(booking.scheduled_at)}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{booking.duration_minutes} min</span>
                      </div>
                    </div>

                    {booking.client_notes && (
                      <div className="mb-3">
                        <div className="flex items-start gap-2 text-sm">
                          <FileText className="w-4 h-4 mt-0.5 text-brand flex-shrink-0" />
                          <p className="text-muted-foreground">{booking.client_notes}</p>
                        </div>
                      </div>
                    )}
                    </div>

                    {/* Actions on the right - desktop only */}
                    <div className="hidden md:flex items-center">
                      <BookingActions
                        bookingId={booking.id}
                        status={booking.status}
                        isProvider={isProvider}
                        onUpdate={handleUpdate}
                        reviewedId={booking.client?.id || ''}
                        postId={booking.post?.id || ''}
                        hasReview={booking.reviews && booking.reviews.length > 0}
                      />
                    </div>
                  </div>

                  {/* Mobile footer with checkbox and actions */}
                  <div className="md:hidden border-t border-border p-3 bg-muted/30 flex items-center gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleBookingSelection(booking.id)}
                      className={`w-6 h-6 rounded-md border-2 transition-all duration-200 flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-brand border-brand'
                          : 'border-border hover:border-brand/50'
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>

                    {/* Actions */}
                    <div className="flex-1">
                      <BookingActions
                        bookingId={booking.id}
                        status={booking.status}
                        isProvider={isProvider}
                        onUpdate={handleUpdate}
                        reviewedId={booking.client?.id || ''}
                        postId={booking.post?.id || ''}
                        hasReview={booking.reviews && booking.reviews.length > 0}
                      />
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Floating Action Buttons */}
          <AnimatePresence>
            {selectedBookings.size > 0 && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-40"
              >
                <motion.button
                  onClick={() => handleBulkAction('cancelled')}
                  disabled={isBulkConfirming || isBulkRejecting}
                  className="bg-card hover:bg-muted border-2 border-border text-foreground rounded-full px-6 py-3 font-semibold shadow-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="bg-destructive/10 text-destructive px-2 py-0.5 rounded-full text-sm font-bold min-w-[24px] text-center">
                    {selectedBookings.size}
                  </span>
                  {isBulkRejecting ? 'Odrzucanie...' : 'Odrzuć'}
                </motion.button>
                <motion.button
                  onClick={() => handleBulkAction('confirmed')}
                  disabled={isBulkConfirming || isBulkRejecting}
                  className="bg-brand hover:bg-brand/90 text-brand-foreground rounded-full px-6 py-3 font-semibold shadow-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm font-bold min-w-[24px] text-center">
                    {selectedBookings.size}
                  </span>
                  {isBulkConfirming ? 'Potwierdzanie...' : 'Potwierdź'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card className="p-3 md:p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-3 md:mb-6 gap-2">
              <h2 className="text-base md:text-xl font-bold">
                {currentMonth.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-1 md:gap-2">
                <Button variant="outline" size="sm" onClick={goToToday} className="text-xs md:text-sm px-2 md:px-3 h-8">
                  Dzisiaj
                </Button>
                <Button variant="outline" size="sm" onClick={prevMonth} className="px-2 md:px-3 h-8">
                  <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={nextMonth} className="px-2 md:px-3 h-8">
                  <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div
              key={`${currentMonth.getFullYear()}-${currentMonth.getMonth()}`}
              className={`transition-all duration-300 ${isAnimating ? 'blur-sm opacity-0 scale-95' : 'blur-0 opacity-100 scale-100'}`}
            >
              {/* Week days header */}
              <div className="grid grid-cols-7 gap-1 md:gap-2 mb-1 md:mb-2">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-[10px] md:text-xs font-semibold text-muted-foreground py-1 md:py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1 md:gap-3">
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square" />
                  }

                  const dayBookings = getDayBookings(date)
                  const dayStatuses = getDayStatuses(date)
                  const isSelected = selectedDate?.toDateString() === date.toDateString()
                  const isToday = new Date().toDateString() === date.toDateString()
                  const isCurrentMonth = date.getMonth() === currentMonth.getMonth()

                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'pending': return 'bg-brand'
                      case 'confirmed': return 'bg-green-500'
                      case 'completed': return 'bg-muted-foreground'
                      default: return 'bg-muted-foreground'
                    }
                  }

                  const dayOfWeek = weekDays[date.getDay() === 0 ? 6 : date.getDay() - 1]

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={`aspect-square rounded-lg md:rounded-xl border-2 transition-all relative p-1 md:p-2 ${
                        !isCurrentMonth
                          ? 'border-border/50 opacity-30 cursor-default'
                          : isSelected
                          ? 'border-brand bg-brand/10'
                          : isToday
                          ? 'border-brand/50 bg-brand/5'
                          : 'border-border hover:border-brand/30 hover:bg-muted/50'
                      }`}
                    >
                      {/* Date in top-left corner */}
                      <div className="absolute top-1 left-1 md:top-2 md:left-2 flex items-baseline gap-0.5 md:gap-1">
                        <span className={`text-xs md:text-sm font-semibold ${
                          !isCurrentMonth
                            ? 'text-muted-foreground'
                            : isSelected
                            ? 'text-brand'
                            : 'text-foreground'
                        }`}>
                          {date.getDate()}
                        </span>
                        <span className={`text-[8px] md:text-[10px] font-medium ${
                          !isCurrentMonth
                            ? 'text-muted-foreground'
                            : isSelected
                            ? 'text-brand/70'
                            : 'text-muted-foreground'
                        }`}>
                          {dayOfWeek.substring(0, 2)}
                        </span>
                      </div>

                      {/* Bookings indicators centered */}
                      {isCurrentMonth && dayBookings.length > 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 md:gap-1 pt-4 md:pt-0">
                          <div className="flex gap-0.5 md:gap-1 justify-center items-center">
                            {dayStatuses.slice(0, 3).map((status, idx) => (
                              <div
                                key={idx}
                                className={`w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full ${getStatusColor(status)}`}
                              />
                            ))}
                          </div>
                          {dayBookings.length > 3 && (
                            <span className="text-[9px] md:text-[10px] font-bold text-brand leading-none">+{dayBookings.length - 3}</span>
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex gap-2 md:gap-4 mt-3 md:mt-6 pt-3 md:pt-4 border-t">
              <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs">
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-brand" />
                <span className="text-muted-foreground">Oczekuje</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs">
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Potwierdzona</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs">
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-muted-foreground" />
                <span className="text-muted-foreground">Zakończona</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Selected Day Bookings */}
        <div className="lg:col-span-2">
          {selectedDate ? (
            <div>
              <h3 className="text-lg font-bold mb-4">
                {selectedDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>

              {selectedDayBookings.length === 0 ? (
                <Card className="p-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Brak rezerwacji tego dnia</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {selectedDayBookings.map((booking: any) => {
                    const personName = isProvider
                      ? booking.client?.full_name || 'Użytkownik'
                      : booking.provider?.full_name || 'Usługodawca'

                    return (
                      <Card key={booking.id} className="overflow-hidden">
                        <div className="p-4">
                          <div className="mb-3">
                            <h4 className="font-semibold text-base mb-1">{booking.post?.title || 'Usługa'}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="w-3.5 h-3.5" />
                              <span>{personName}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4 text-sm mb-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-brand" />
                                <span className="font-medium">{formatTime(booking.scheduled_at)}</span>
                              </div>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">{booking.duration_minutes} min</span>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>

                          {booking.client_notes && (
                            <div className="mb-3 pb-3 border-t pt-3">
                              <div className="flex items-start gap-2 text-sm">
                                <FileText className="w-4 h-4 mt-0.5 text-brand flex-shrink-0" />
                                <p className="text-muted-foreground">{booking.client_notes}</p>
                              </div>
                            </div>
                          )}

                          <BookingActions
                            bookingId={booking.id}
                            status={booking.status}
                            isProvider={isProvider}
                            onUpdate={handleUpdate}
                            reviewedId={isProvider ? (booking.client?.id || '') : (booking.provider?.id || '')}
                            postId={booking.post?.id || ''}
                            hasReview={booking.reviews && booking.reviews.length > 0}
                          />
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Wybierz dzień z kalendarza</p>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
