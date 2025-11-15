'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Calendar, Clock, User, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { BookingActions } from './BookingActions'
import { useRouter } from 'next/navigation'
import { AnimatedTabs } from '@/components/AnimatedTabs'
import { Button } from '@/components/ui/button'

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

  // Filter out cancelled bookings
  const providerBookings = initialProviderBookings?.filter(b => b.status !== 'cancelled') || []
  const clientBookings = initialClientBookings?.filter(b => b.status !== 'cancelled') || []

  const handleUpdate = () => {
    setRefreshKey(prev => prev + 1)
    router.refresh()
  }

  const tabs = [
    { id: 'received', label: 'Otrzymane rezerwacje', count: providerBookings.length },
    { id: 'sent', label: 'Wysłane rezerwacje', count: clientBookings.length },
  ]

  const currentBookings = activeTab === 'received' ? providerBookings : clientBookings
  const isProvider = activeTab === 'received'

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

    return days
  }, [currentMonth])

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    setSelectedDate(null)
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    setSelectedDate(null)
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
    <main className="container mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-8">
      {/* Header - Desktop only */}
      <div className="mb-8 hidden md:block">
        <h1 className="text-4xl font-bold text-foreground mb-3">Moje rezerwacje</h1>
        <p className="text-lg text-muted-foreground">
          Zarządzaj swoimi rezerwacjami
        </p>
      </div>

      <div className="mb-6">
        <AnimatedTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {currentMonth.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={prevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div>
              {/* Week days header */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-2">
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

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={`aspect-square rounded-lg border-2 transition-all relative flex flex-col items-center justify-center ${
                        !isCurrentMonth
                          ? 'border-border/50 opacity-30 cursor-default'
                          : isSelected
                          ? 'border-brand bg-brand/10'
                          : isToday
                          ? 'border-brand/50 bg-brand/5'
                          : 'border-border hover:border-brand/30 hover:bg-muted/50'
                      }`}
                    >
                      <span className={`text-sm font-semibold ${
                        !isCurrentMonth
                          ? 'text-muted-foreground'
                          : isSelected
                          ? 'text-brand'
                          : 'text-foreground'
                      }`}>
                        {date.getDate()}
                      </span>

                      {isCurrentMonth && dayBookings.length > 0 && (
                        <div className="flex flex-col items-center gap-0.5 mt-1">
                          <div className="flex gap-0.5 justify-center">
                            {dayStatuses.slice(0, 5).map((status, idx) => (
                              <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full ${getStatusColor(status)}`}
                              />
                            ))}
                          </div>
                          {dayBookings.length > 5 && (
                            <span className="text-[9px] font-bold text-brand leading-none">{dayBookings.length}+</span>
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-6 pt-4 border-t">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-brand" />
                <span className="text-muted-foreground">Oczekuje</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Potwierdzona</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-muted-foreground" />
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
