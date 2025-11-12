import { createClient } from '@/lib/supabase/server'

export interface AnalyticsData {
  date: string
  value: number
  dateRange?: string // Opcjonalny zakres dat dla tooltipa (np. "8 lis - 12 lis")
}

export interface AdminAnalytics {
  usersDaily: AnalyticsData[]
  usersMonthly: AnalyticsData[]
  postsDaily: AnalyticsData[]
  postsMonthly: AnalyticsData[]
  messagesDaily: AnalyticsData[]
  messagesMonthly: AnalyticsData[]
  totalUsersWeek: number
  totalUsersMonth: number
  totalPostsWeek: number
  totalPostsMonth: number
  totalMessagesWeek: number
  totalMessagesMonth: number
}

// Helper function to format data by day (last 7 days)
function formatDataByDay(data: { created_at: string }[]) {
  const result = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)

    const count = data.filter(item => {
      const itemDate = new Date(item.created_at)
      return itemDate >= date && itemDate < nextDay
    }).length

    result.push({
      date: date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' }),
      value: count
    })
  }

  return result
}

// Helper function to format data by month (last 30 days grouped into 7 sections)
function formatDataByMonth(data: { created_at: string }[]) {
  const result = []
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const daysPerSection = Math.floor(30 / 7) // ~4 days per section
  const totalSections = 7

  // Iteruj od najstarszych do najnowszych
  for (let i = totalSections - 1; i >= 0; i--) {
    // Oblicz zakres dla tej sekcji
    const daysAgo = i * daysPerSection
    const daysAgoEnd = (i + 1) * daysPerSection

    // Jeśli to ostatnia sekcja, uwzględnij pozostałe dni
    const actualDaysAgoEnd = (i === totalSections - 1) ? 30 : daysAgoEnd

    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() - daysAgo)
    endDate.setHours(23, 59, 59, 999)

    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - actualDaysAgoEnd)
    startDate.setHours(0, 0, 0, 0)

    const count = data.filter(item => {
      const itemDate = new Date(item.created_at)
      return itemDate >= startDate && itemDate <= endDate
    }).length

    // Dla ostatniej sekcji (najbliższej dzisiaj) użyj daty końcowej jako labela
    const label = i === 0
      ? `${endDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}`
      : `${startDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}`

    // Dodaj zakres dat dla tooltipa
    const startLabel = startDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
    const endLabel = endDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
    const dateRange = `${startLabel} - ${endLabel}`

    result.push({
      date: label,
      value: count,
      dateRange: dateRange
    })
  }

  return result
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const supabase = await createClient()

  // Fetch users data for last 30 days
  const { data: usersWeek } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const { data: usersMonth } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  // Fetch posts data for last 30 days
  const { data: postsWeek } = await supabase
    .from('posts')
    .select('created_at')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const { data: postsMonth } = await supabase
    .from('posts')
    .select('created_at')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  // Fetch messages data for last 30 days
  const { data: messagesWeek } = await supabase
    .from('messages')
    .select('created_at')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const { data: messagesMonth } = await supabase
    .from('messages')
    .select('created_at')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const usersWeekData = usersWeek || []
  const usersMonthData = usersMonth || []
  const postsWeekData = postsWeek || []
  const postsMonthData = postsMonth || []
  const messagesWeekData = messagesWeek || []
  const messagesMonthData = messagesMonth || []

  return {
    usersDaily: formatDataByDay(usersWeekData),
    usersMonthly: formatDataByMonth(usersMonthData),
    postsDaily: formatDataByDay(postsWeekData),
    postsMonthly: formatDataByMonth(postsMonthData),
    messagesDaily: formatDataByDay(messagesWeekData),
    messagesMonthly: formatDataByMonth(messagesMonthData),
    totalUsersWeek: usersWeekData.length,
    totalUsersMonth: usersMonthData.length,
    totalPostsWeek: postsWeekData.length,
    totalPostsMonth: postsMonthData.length,
    totalMessagesWeek: messagesWeekData.length,
    totalMessagesMonth: messagesMonthData.length,
  }
}
