'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Loader2, Search, Edit2, Trash2, ExternalLink, X, RefreshCw, ChevronRight, FolderTree, Archive, Eye, ArrowUpDown, ArrowUp, ArrowDown, Calendar, ChevronDown, CheckSquare, Square, CheckCheck, Check } from 'lucide-react'
import { RichTextEditor } from '@/components/RichTextEditor'
import { CategorySelector } from '@/components/CategorySelector'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface Post {
  id: string
  title: string
  description: string
  city: string
  district: string | null
  price: number | null
  price_type: 'hourly' | 'fixed' | 'free' | null
  status: string
  moderation_status: string
  is_ai_generated: boolean
  created_at: string
  updated_at: string
  user_id: string
  category_id: string
  categories: {
    id: string
    name: string
    slug: string
  } | null
  category_path?: string
  profiles: {
    full_name: string | null
    email: string | null
  } | null
}

type SortField = 'title' | 'created_at' | 'city' | 'status'
type SortDirection = 'asc' | 'desc'

export function PostsManagementClient() {
  const supabase = createClient()

  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [aiFilter, setAiFilter] = useState<string>('all')
  const [cityFilter, setCityFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

  // Sorting
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Selection
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set())

  // Get unique cities for filter
  const uniqueCities = useMemo(() => {
    const cities = new Set(posts.map(p => p.city))
    return Array.from(cities).sort()
  }, [posts])

  // City popover state
  const [openCityPopover, setOpenCityPopover] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [postsPerPage, setPostsPerPage] = useState(50)

  // Edit modal
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    city: '',
    district: '',
    price: '',
    price_type: 'fixed' as 'hourly' | 'fixed' | 'free',
    status: 'active',
  })
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [categoryPath, setCategoryPath] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [showCategorySelector, setShowCategorySelector] = useState(false)
  const [saving, setSaving] = useState(false)

  // Bulk actions
  const [showBulkCategorySelector, setShowBulkCategorySelector] = useState(false)
  const [bulkCategoryId, setBulkCategoryId] = useState<string>('')
  const [bulkCategoryPath, setBulkCategoryPath] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [bulkStatusValue, setBulkStatusValue] = useState<string>('')

  // Fetch posts
  const fetchPosts = async () => {
    setLoading(true)
    try {
      // Fetch only 200 most recent posts instead of 1000
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          categories!posts_category_id_fkey(id, name, slug, parent_id)
        `)
        .order('created_at', { ascending: false })
        .limit(200)

      if (postsError) {
        console.error('Supabase error:', postsError)
        throw postsError
      }

      // Get unique user IDs
      const userIds = [...new Set((postsData || []).map(post => post.user_id))]

      // Get unique category IDs to fetch all categories for path building
      const categoryIds = [...new Set((postsData || []).map(post => post.category_id).filter(Boolean))]

      // Fetch all profiles in one query
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds)

      if (profilesError) {
        console.error('Profiles error:', profilesError)
      }

      // Fetch all categories to build paths
      const { data: allCategories } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id')

      // Create a map for quick lookup
      const profilesMap = new Map(
        (profilesData || []).map(profile => [profile.id, profile])
      )

      const categoriesMap = new Map(
        (allCategories || []).map(cat => [cat.id, cat])
      )

      // Helper function to build category path
      const buildCategoryPath = (categoryId: string): string => {
        const path: string[] = []
        let currentCat = categoriesMap.get(categoryId)

        while (currentCat) {
          path.unshift(currentCat.name)
          currentCat = currentCat.parent_id ? categoriesMap.get(currentCat.parent_id) : undefined
        }

        return path.join(' > ')
      }

      // Combine posts with profiles and category paths
      const postsWithProfiles = (postsData || []).map(post => ({
        ...post,
        profiles: profilesMap.get(post.user_id) || null,
        category_path: post.category_id ? buildCategoryPath(post.category_id) : 'Brak kategorii',
      }))

      setPosts(postsWithProfiles)
      setFilteredPosts(postsWithProfiles)
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Błąd ładowania ogłoszeń')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  // Sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // New field, default to ascending
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Filter and sort posts
  useEffect(() => {
    let filtered = posts

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        post.city.toLowerCase().includes(query) ||
        post.profiles?.email?.toLowerCase().includes(query) ||
        post.profiles?.full_name?.toLowerCase().includes(query) ||
        post.categories?.name?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter)
    }

    // AI filter
    if (aiFilter === 'ai') {
      filtered = filtered.filter(post => post.is_ai_generated)
    } else if (aiFilter === 'human') {
      filtered = filtered.filter(post => !post.is_ai_generated)
    }

    // City filter
    if (cityFilter !== 'all') {
      filtered = filtered.filter(post => post.city === cityFilter)
    }

    // Date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      filtered = filtered.filter(post => new Date(post.created_at) >= fromDate)
    }
    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999) // End of day
      filtered = filtered.filter(post => new Date(post.created_at) <= toDate)
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let compareResult = 0

      switch (sortField) {
        case 'title':
          compareResult = a.title.localeCompare(b.title, 'pl')
          break
        case 'created_at':
          compareResult = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'city':
          compareResult = a.city.localeCompare(b.city, 'pl')
          break
        case 'status':
          compareResult = a.status.localeCompare(b.status)
          break
      }

      return sortDirection === 'asc' ? compareResult : -compareResult
    })

    setFilteredPosts(filtered)
    setCurrentPage(1)
  }, [searchQuery, statusFilter, aiFilter, cityFilter, dateFrom, dateTo, posts, sortField, sortDirection])

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage
  const indexOfFirstPost = indexOfLastPost - postsPerPage
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost)
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)

  // Selection handlers
  const selectAllOnPage = () => {
    setSelectedPosts(new Set(currentPosts.map(p => p.id)))
    toast.success(`Zaznaczono ${currentPosts.length} ogłoszeń na tej stronie`)
  }

  const selectAllFiltered = () => {
    setSelectedPosts(new Set(filteredPosts.map(p => p.id)))
    toast.success(`Zaznaczono wszystkie ${filteredPosts.length} ogłoszeń`)
  }

  const deselectAll = () => {
    setSelectedPosts(new Set())
    toast.success('Odznaczono wszystkie ogłoszenia')
  }

  const toggleSelectPost = (postId: string) => {
    const newSelection = new Set(selectedPosts)
    if (newSelection.has(postId)) {
      newSelection.delete(postId)
    } else {
      newSelection.add(postId)
    }
    setSelectedPosts(newSelection)
  }

  // Open edit modal
  const openEditModal = async (post: Post) => {
    setEditingPost(post)
    setEditFormData({
      title: post.title,
      description: post.description,
      city: post.city,
      district: post.district || '',
      price: post.price?.toString() || '',
      price_type: post.price_type || 'fixed',
      status: post.status,
    })
    setSelectedCategoryId(post.category_id)

    // Load category path
    if (post.category_id) {
      const { data: allCats } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id')

      if (allCats) {
        const path: Array<{ id: string; name: string; slug: string }> = []
        let currentCat = allCats.find(cat => cat.id === post.category_id)

        while (currentCat) {
          path.unshift({ id: currentCat.id, name: currentCat.name, slug: currentCat.slug })
          currentCat = currentCat.parent_id
            ? allCats.find(cat => cat.id === currentCat?.parent_id)
            : undefined
        }

        setCategoryPath(path)
      }
    }
  }

  // Save edit
  const handleSaveEdit = async () => {
    if (!editingPost) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title: editFormData.title,
          description: editFormData.description,
          city: editFormData.city,
          district: editFormData.district || null,
          price: editFormData.price ? parseFloat(editFormData.price) : null,
          price_type: editFormData.price_type,
          status: editFormData.status,
          category_id: selectedCategoryId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingPost.id)

      if (error) throw error

      toast.success('Ogłoszenie zaktualizowane')
      setEditingPost(null)
      fetchPosts()
    } catch (error) {
      console.error('Error updating post:', error)
      toast.error('Błąd aktualizacji ogłoszenia')
    } finally {
      setSaving(false)
    }
  }

  // Delete post
  const handleDelete = async (postId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć to ogłoszenie? Tej operacji nie można cofnąć!')) {
      return
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) throw error

      toast.success('Ogłoszenie usunięte')
      fetchPosts()
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Błąd usuwania ogłoszenia')
    }
  }

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedPosts.size === 0) {
      toast.error('Wybierz ogłoszenia do usunięcia')
      return
    }

    if (!confirm(`Czy na pewno chcesz usunąć ${selectedPosts.size} ogłoszeń? Tej operacji nie można cofnąć!`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .in('id', Array.from(selectedPosts))

      if (error) throw error

      toast.success(`Usunięto ${selectedPosts.size} ogłoszeń`)
      setSelectedPosts(new Set())
      fetchPosts()
    } catch (error) {
      console.error('Error deleting posts:', error)
      toast.error('Błąd usuwania ogłoszeń')
    }
  }

  // Bulk change status - confirm
  const confirmBulkStatusChange = async () => {
    if (selectedPosts.size === 0) {
      toast.error('Wybierz ogłoszenia do zmiany statusu')
      return
    }

    if (!bulkStatusValue) {
      toast.error('Wybierz nowy status')
      return
    }

    try {
      const { error } = await supabase
        .from('posts')
        .update({ status: bulkStatusValue })
        .in('id', Array.from(selectedPosts))

      if (error) throw error

      toast.success(`Zaktualizowano status ${selectedPosts.size} ogłoszeń`)
      setSelectedPosts(new Set())
      setBulkStatusValue('')
      fetchPosts()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Błąd zmiany statusu')
    }
  }

  // Bulk change category
  const handleBulkCategoryChange = async () => {
    if (selectedPosts.size === 0) {
      toast.error('Wybierz ogłoszenia do przeniesienia')
      return
    }

    if (!bulkCategoryId) {
      toast.error('Wybierz kategorię docelową')
      return
    }

    try {
      const { error } = await supabase
        .from('posts')
        .update({ category_id: bulkCategoryId })
        .in('id', Array.from(selectedPosts))

      if (error) throw error

      toast.success(`Przeniesiono ${selectedPosts.size} ogłoszeń do kategorii: ${bulkCategoryPath.map(c => c.name).join(' > ')}`)
      setSelectedPosts(new Set())
      setShowBulkCategorySelector(false)
      setBulkCategoryId('')
      setBulkCategoryPath([])
      fetchPosts()
    } catch (error) {
      console.error('Error changing category:', error)
      toast.error('Błąd przenoszenia kategorii')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/30', label: 'Aktywne' },
      pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-500/30', label: 'Oczekujące' },
      expired: { bg: 'bg-gray-500/10', text: 'text-gray-600', border: 'border-gray-500/30', label: 'Wygasłe' },
      archived: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/30', label: 'Zarchiwizowane' },
    }
    return badges[status as keyof typeof badges] || badges.expired
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-brand mx-auto mb-4" />
          <p className="text-muted-foreground">Ładowanie ogłoszeń...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Search & Filters */}
      <div className="mb-6 space-y-4 flex-shrink-0">
        {/* Search Bar - Full Width */}
        <Card className="border bg-background">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Szukaj po tytule, opisie, kategorii, użytkowniku, mieście..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-10 h-12 text-base border border-input focus:border-[#C44E35]/40 bg-background"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Filters & Actions */}
        <Card className="border bg-background">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">Filtry:</span>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 min-w-[180px] border border-input text-sm bg-background hover:border-border transition-colors">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie statusy</SelectItem>
                    <SelectItem value="active">Aktywne</SelectItem>
                    <SelectItem value="pending">Oczekujące</SelectItem>
                    <SelectItem value="expired">Wygasłe</SelectItem>
                    <SelectItem value="archived">Zarchiwizowane</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={aiFilter} onValueChange={setAiFilter}>
                  <SelectTrigger className="h-9 min-w-[170px] border border-input text-sm bg-background hover:border-border transition-colors">
                    <SelectValue placeholder="Źródło" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie źródła</SelectItem>
                    <SelectItem value="human">Użytkownicy</SelectItem>
                    <SelectItem value="ai">AI</SelectItem>
                  </SelectContent>
                </Select>

                <Popover open={openCityPopover} onOpenChange={setOpenCityPopover}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCityPopover}
                      className="h-9 min-w-[170px] justify-between border border-input text-sm bg-background hover:border-border transition-colors font-normal"
                    >
                      {cityFilter === 'all' ? 'Miasto' : cityFilter}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[250px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Szukaj miasta..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>Nie znaleziono miasta.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="all"
                            onSelect={() => {
                              setCityFilter('all')
                              setOpenCityPopover(false)
                            }}
                          >
                            Wszystkie miasta
                          </CommandItem>
                          {uniqueCities.map((city) => (
                            <CommandItem
                              key={city}
                              value={city}
                              onSelect={(currentValue) => {
                                setCityFilter(currentValue)
                                setOpenCityPopover(false)
                              }}
                            >
                              {city}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <div className="h-6 w-px bg-border" />

                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="Od"
                  className="h-9 w-[160px] border border-input text-sm bg-background hover:border-border transition-colors [color-scheme:light] dark:[color-scheme:dark]"
                />

                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="Do"
                  className="h-9 w-[160px] border border-input text-sm bg-background hover:border-border transition-colors [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>

              {/* Actions & Stats */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">Na stronę:</span>
                  <Select value={postsPerPage.toString()} onValueChange={(val) => setPostsPerPage(Number(val))}>
                    <SelectTrigger className="h-9 w-[90px] border border-input text-sm bg-background hover:border-border transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="200">200</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(dateFrom || dateTo || statusFilter !== 'all' || aiFilter !== 'all' || cityFilter !== 'all' || searchQuery) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('all')
                      setAiFilter('all')
                      setCityFilter('all')
                      setDateFrom('')
                      setDateTo('')
                    }}
                    className="h-9 px-3 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Bulk Actions */}
      {selectedPosts.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
          <div className="bg-card shadow-2xl border p-4 min-w-[800px] rounded-xl">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="bg-[#C44E35] text-primary-foreground w-10 h-10 flex items-center justify-center font-bold text-sm shadow-sm">
                  {selectedPosts.size}
                </div>
                <p className="font-semibold text-foreground">
                  Wybrano {selectedPosts.size} {selectedPosts.size === 1 ? 'ogłoszenie' : 'ogłoszeń'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowBulkCategorySelector(true)}
                  className="h-10 gap-2 bg-background border border-input hover:bg-accent hover:border-border"
                >
                  <FolderTree className="h-4 w-4" />
                  Przenieś
                </Button>

                <div className="flex items-center gap-2">
                  <Select value={bulkStatusValue} onValueChange={setBulkStatusValue}>
                    <SelectTrigger className="w-[140px] !h-10 bg-background border border-input">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktywne</SelectItem>
                      <SelectItem value="pending">Oczekujące</SelectItem>
                      <SelectItem value="expired">Wygasłe</SelectItem>
                      <SelectItem value="archived">Zarchiwizowane</SelectItem>
                    </SelectContent>
                  </Select>

                  {bulkStatusValue && (
                    <Button
                      variant="default"
                      onClick={confirmBulkStatusChange}
                      className="h-10 px-4 bg-[#C44E35] hover:bg-[#B33D2A] text-primary-foreground shadow-sm"
                    >
                      OK
                    </Button>
                  )}
                </div>

                <div className="h-8 w-px bg-border" />

                <Button
                  variant="outline"
                  onClick={handleBulkDelete}
                  className="h-10 px-4 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 bg-background"
                >
                  Usuń
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPosts(new Set())
                    setBulkStatusValue('')
                  }}
                  className="h-10 w-10 p-0 hover:bg-accent"
                  title="Anuluj zaznaczenie"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts table */}
      <Card className="border bg-background flex-1 flex flex-col overflow-hidden">
        <CardContent className="p-0 flex-1 overflow-auto">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b-2 border-border">
                <tr>
                  <th className="px-4 py-4 text-center w-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="h-5 w-5 flex items-center justify-center hover:bg-accent transition-colors"
                        >
                          <div className={`h-4 w-4 border flex items-center justify-center transition-colors ${
                            selectedPosts.size > 0
                              ? 'bg-[#C44E35] border-[#C44E35]'
                              : 'border-input hover:border-border'
                          }`}>
                            {selectedPosts.size > 0 && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[320px]">
                        <DropdownMenuItem onClick={selectAllOnPage} className="py-2.5 cursor-pointer">
                          <div className="mr-3 h-4 w-4 flex-shrink-0 flex items-center justify-center">
                            <CheckSquare className="h-4 w-4" />
                          </div>
                          <span className="flex-1">Zaznacz na tej stronie</span>
                          <span className="text-xs text-muted-foreground ml-2">({currentPosts.length})</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={selectAllFiltered} className="py-2.5 cursor-pointer">
                          <div className="mr-3 h-4 w-4 flex-shrink-0 flex items-center justify-center relative">
                            <CheckSquare className="h-3.5 w-3.5 absolute -left-0.5 -top-0.5 opacity-40" />
                            <div className="absolute left-0.5 top-0.5 bg-background">
                              <CheckSquare className="h-3.5 w-3.5" />
                            </div>
                          </div>
                          <span className="flex-1">Zaznacz na wszystkich stronach</span>
                          <span className="text-xs text-muted-foreground ml-2">({filteredPosts.length})</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={deselectAll} disabled={selectedPosts.size === 0} className="py-2.5 cursor-pointer">
                          <Square className="mr-3 h-4 w-4 flex-shrink-0" />
                          <span className="flex-1">Odznacz wszystkie</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-foreground/80">
                    <button
                      onClick={() => handleSort('title')}
                      className="flex items-center gap-2 hover:text-foreground transition-colors mx-auto"
                    >
                      Ogłoszenie
                      {sortField === 'title' && (
                        sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      )}
                      {sortField !== 'title' && <ArrowUpDown className="h-3 w-3 opacity-30" />}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-foreground/80">Użytkownik</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-foreground/80">
                    <button
                      onClick={() => handleSort('city')}
                      className="flex items-center gap-2 hover:text-foreground transition-colors mx-auto"
                    >
                      Lokalizacja
                      {sortField === 'city' && (
                        sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      )}
                      {sortField !== 'city' && <ArrowUpDown className="h-3 w-3 opacity-30" />}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-foreground/80">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-2 hover:text-foreground transition-colors mx-auto"
                    >
                      Status
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      )}
                      {sortField !== 'status' && <ArrowUpDown className="h-3 w-3 opacity-30" />}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-foreground/80">
                    <button
                      onClick={() => handleSort('created_at')}
                      className="flex items-center gap-2 hover:text-foreground transition-colors mx-auto"
                    >
                      Data
                      {sortField === 'created_at' && (
                        sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      )}
                      {sortField !== 'created_at' && <ArrowUpDown className="h-3 w-3 opacity-30" />}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-foreground/80">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {currentPosts.map((post) => (
                  <tr
                    key={post.id}
                    className={`hover:bg-accent/50 transition-colors ${selectedPosts.has(post.id) ? 'bg-[#C44E35]/5' : ''}`}
                  >
                    <td className="px-4 py-4 text-center">
                      <Checkbox
                        checked={selectedPosts.has(post.id)}
                        onCheckedChange={() => toggleSelectPost(post.id)}
                      />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="max-w-md mx-auto">
                        <p className="font-semibold text-sm text-foreground mb-1 line-clamp-1">{post.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {post.category_path || 'Brak kategorii'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="text-sm">
                        <p className="font-medium text-foreground">{post.profiles?.full_name || 'Anonim'}</p>
                        <p className="text-xs text-muted-foreground">{post.profiles?.email || '-'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm text-muted-foreground">{post.city}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {(() => {
                        const badge = getStatusBadge(post.status)
                        return (
                          <span className={`inline-flex items-center gap-1 ${badge.bg} ${badge.text} px-2.5 py-1 text-xs font-semibold border ${badge.border} rounded-lg`}>
                            {badge.label}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(post.created_at).toLocaleDateString('pl-PL', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/posts/${post.id}`} target="_blank">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 rounded-lg bg-card border border-border hover:bg-muted flex items-center justify-center transition-all"
                            title="Zobacz ogłoszenie"
                          >
                            <ExternalLink className="h-4 w-4 text-foreground" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(post)}
                          className="h-9 w-9 p-0 rounded-lg bg-card border border-border hover:bg-muted flex items-center justify-center transition-all"
                          title="Edytuj"
                        >
                          <Edit2 className="h-4 w-4 text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(post.id)}
                          className="h-9 w-9 p-0 rounded-lg bg-card border border-border hover:bg-muted flex items-center justify-center transition-all"
                          title="Usuń"
                        >
                          <Trash2 className="h-4 w-4 text-foreground" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-6 border-t-2 border-border bg-muted/30">
              <p className="text-sm text-muted-foreground">
                Strona <span className="font-semibold text-foreground">{currentPage}</span> z <span className="font-semibold text-foreground">{totalPages}</span>
                {' '}({filteredPosts.length} ogłoszeń)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className=""
                >
                  ← Poprzednia
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className=""
                >
                  Następna →
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
        <DialogContent className="!max-w-[1400px] sm:!max-w-[1400px] max-h-[95vh] overflow-hidden flex flex-col ">
          <DialogHeader className="flex-shrink-0 pb-4 border-b border-border">
            <DialogTitle className="text-2xl font-bold text-foreground">Edytuj ogłoszenie</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingPost?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6 overflow-y-auto pr-2 flex-1">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="edit-title" className="text-sm font-semibold mb-1.5 block">Tytuł <span className="text-[#C44E35]">*</span></Label>
                <Input
                  id="edit-title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="h-10 border"
                />
              </div>

              {/* Category */}
              <div>
                <Label className="text-sm font-semibold mb-1.5 block">Kategoria <span className="text-[#C44E35]">*</span></Label>
                <button
                  type="button"
                  onClick={() => setShowCategorySelector(true)}
                  className="w-full h-10 border border-input px-3 text-left hover:bg-accent hover:border-border transition-colors flex items-center justify-between text-sm"
                >
                  <span className={categoryPath.length > 0 ? 'text-foreground truncate' : 'text-muted-foreground'}>
                    {categoryPath.length > 0
                      ? categoryPath.map(c => c.name).join(' > ')
                      : 'Wybierz kategorię'
                    }
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </button>
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-city" className="text-sm font-semibold mb-1.5 block">Miasto <span className="text-[#C44E35]">*</span></Label>
                  <Input
                    id="edit-city"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="h-10 border"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-district" className="text-sm font-semibold mb-1.5 block">Dzielnica</Label>
                  <Input
                    id="edit-district"
                    value={editFormData.district}
                    onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                    className="h-10 border"
                  />
                </div>
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-price-type" className="text-sm font-semibold mb-1.5 block">Typ ceny</Label>
                  <Select
                    value={editFormData.price_type}
                    onValueChange={(value: 'hourly' | 'fixed' | 'free') =>
                      setEditFormData({ ...editFormData, price_type: value })
                    }
                  >
                    <SelectTrigger className="w-full !h-10 border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Stała cena</SelectItem>
                      <SelectItem value="hourly">Za godzinę</SelectItem>
                      <SelectItem value="free">Za darmo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-price" className="text-sm font-semibold mb-1.5 block">Cena (zł)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                    disabled={editFormData.price_type === 'free'}
                    className="h-10 border"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="edit-status" className="text-sm font-semibold mb-1.5 block">Status</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                >
                  <SelectTrigger className="w-full !h-10 border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktywne</SelectItem>
                    <SelectItem value="pending">Oczekujące</SelectItem>
                    <SelectItem value="expired">Wygasłe</SelectItem>
                    <SelectItem value="archived">Zarchiwizowane</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right Column - Description */}
            <div>
              <Label className="text-sm font-semibold mb-1.5 block">Opis <span className="text-[#C44E35]">*</span></Label>
              <RichTextEditor
                content={editFormData.description}
                onChange={(content) => setEditFormData({ ...editFormData, description: content })}
                placeholder="Opis ogłoszenia..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t flex-shrink-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setEditingPost(null)}
              disabled={saving}
              className="h-11 px-6 rounded-full"
            >
              Anuluj
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving}
              className="bg-brand hover:bg-brand/90 text-brand-foreground h-11 px-8 rounded-full border-0 font-semibold"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Zapisywanie...
                </>
              ) : (
                'Zapisz zmiany'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Selector Modal (Edit) */}
      <CategorySelector
        open={showCategorySelector}
        onOpenChange={setShowCategorySelector}
        onSelect={(categoryId, path) => {
          setSelectedCategoryId(categoryId)
          setCategoryPath(path)
        }}
        selectedCategoryId={selectedCategoryId}
      />

      {/* Bulk Category Change Modal */}
      <Dialog open={showBulkCategorySelector} onOpenChange={setShowBulkCategorySelector}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Przenieś ogłoszenia do kategorii</DialogTitle>
            <DialogDescription>
              Wybierz kategorię docelową dla {selectedPosts.size} wybranych ogłoszeń
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                setShowBulkCategorySelector(false)
                setTimeout(() => {
                  setShowCategorySelector(true)
                }, 100)
              }}
              className="w-full border border-input p-4 text-left hover:bg-accent hover:border-border transition-colors flex items-center justify-between"
            >
              <span className={bulkCategoryPath.length > 0 ? 'text-foreground' : 'text-muted-foreground'}>
                {bulkCategoryPath.length > 0
                  ? bulkCategoryPath.map(c => c.name).join(' > ')
                  : 'Wybierz kategorię'
                }
              </span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowBulkCategorySelector(false)
                setBulkCategoryId('')
                setBulkCategoryPath([])
              }}
              className=""
            >
              Anuluj
            </Button>
            <Button
              onClick={handleBulkCategoryChange}
              disabled={!bulkCategoryId}
              className="bg-[#C44E35] hover:bg-[#B33D2A] "
            >
              Przenieś ogłoszenia
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Selector for Bulk (embedded) */}
      <CategorySelector
        open={showCategorySelector && showBulkCategorySelector}
        onOpenChange={(open) => {
          setShowCategorySelector(open)
          if (!open) {
            setTimeout(() => {
              setShowBulkCategorySelector(true)
            }, 100)
          }
        }}
        onSelect={(categoryId, path) => {
          setBulkCategoryId(categoryId)
          setBulkCategoryPath(path)
          setShowCategorySelector(false)
          setTimeout(() => {
            setShowBulkCategorySelector(true)
          }, 100)
        }}
        selectedCategoryId={bulkCategoryId}
      />
    </>
  )
}
