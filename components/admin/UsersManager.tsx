'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UserBadge } from '@/components/ui/user-badge'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface Profile {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  verified: boolean
  is_company: boolean
  is_ai_bot: boolean
  banned: boolean
  created_at: string
}

interface UsersManagerProps {
  initialUsers: Profile[]
}

export function UsersManager({ initialUsers }: UsersManagerProps) {
  const [users, setUsers] = useState<Profile[]>(initialUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'badges' | 'info' | 'settings'>('badges')
  const [banReason, setBanReason] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase()
    return (
      user.full_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query)
    )
  })

  const updateUserFlag = async (userId: string, field: 'verified' | 'is_company' | 'is_ai_bot', value: boolean) => {
    setLoading(userId)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('id', userId)

      if (error) throw error

      // Update local state
      setUsers(users.map(user =>
        user.id === userId ? { ...user, [field]: value } : user
      ))
      toast.success('Użytkownik zaktualizowany!')
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Nie udało się zaktualizować użytkownika', {
        description: 'Spróbuj ponownie'
      })
    } finally {
      setLoading(null)
    }
  }

  const toggleExpand = (userId: string) => {
    setExpandedUserId(expandedUserId === userId ? null : userId)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('ID skopiowane do schowka!')
    } catch (err) {
      console.error('Failed to copy:', err)
      toast.error('Nie udało się skopiować')
    }
  }

  const banUser = async (userId: string) => {
    if (!banReason.trim()) {
      toast.error('Podaj powód bana')
      return
    }

    setLoading(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ban', reason: banReason })
      })

      if (!res.ok) throw new Error('Failed to ban user')

      setUsers(users.map(user =>
        user.id === userId ? { ...user, banned: true } : user
      ))
      setBanReason('')
      toast.success('Użytkownik został zbanowany')
    } catch (error) {
      console.error('Error banning user:', error)
      toast.error('Nie udało się zbanować użytkownika')
    } finally {
      setLoading(null)
    }
  }

  const unbanUser = async (userId: string) => {
    setLoading(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unban' })
      })

      if (!res.ok) throw new Error('Failed to unban user')

      setUsers(users.map(user =>
        user.id === userId ? { ...user, banned: false } : user
      ))
      toast.success('Użytkownik został odbanowany')
    } catch (error) {
      console.error('Error unbanning user:', error)
      toast.error('Nie udało się odbanować użytkownika')
    } finally {
      setLoading(null)
    }
  }

  const deleteUser = async (userId: string) => {
    setLoading(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete user')

      setUsers(users.filter(user => user.id !== userId))
      setShowDeleteConfirm(null)
      setExpandedUserId(null)
      toast.success('Użytkownik został usunięty')
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Nie udało się usunąć użytkownika')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card className="border-2 border-black/5 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              type="text"
              placeholder="Szukaj użytkownika po nazwie, email lub ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-10 h-12 text-base rounded-xl border-2 border-black/10 focus:border-[#C44E35]/40 bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-0 rounded-3xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/5 border-b border-black/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Użytkownik</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Email</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-black">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-black">Data utworzenia</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-black">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-black/5 flex items-center justify-center">
                      <svg className="w-10 h-10 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-black/60">Nie znaleziono użytkowników</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <React.Fragment key={user.id}>
                    <tr
                      className={`hover:bg-black/5 transition-colors ${
                        expandedUserId === user.id ? 'bg-black/5' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            {user.avatar_url ? (
                              <Image
                                src={user.avatar_url}
                                alt={user.full_name || 'User'}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[#C44E35]/10 flex items-center justify-center">
                                <span className="text-sm font-semibold text-[#C44E35]">
                                  {user.full_name?.charAt(0) || 'U'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-black truncate">
                              {user.full_name || 'Bez nazwy'}
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => copyToClipboard(user.id)}
                                className="text-xs text-black/50 hover:text-black transition-colors flex items-center gap-1 group"
                                title="Kliknij aby skopiować ID"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span className="group-hover:underline">Kopiuj ID</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-black/70 truncate max-w-xs">
                          {user.email || 'Brak email'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          {user.banned ? (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-lg text-xs font-semibold">
                              Zbanowany
                            </span>
                          ) : (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-semibold">
                              Aktywny
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="text-sm text-black/70">
                          {new Date(user.created_at).toLocaleDateString('pl-PL')}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleExpand(user.id)}
                          className="rounded-lg"
                        >
                          {expandedUserId === user.id ? (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                              Zamknij
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                              </svg>
                              Zarządzaj
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>

                    {/* Expanded Controls */}
                    {expandedUserId === user.id && (
                      <tr key={`${user.id}-expanded`}>
                        <td colSpan={5} className="bg-black/5 px-6 py-6">
                          {/* Tabs Navigation */}
                          <div className="flex gap-2 mb-6 border-b border-black/10">
                            <button
                              onClick={() => setActiveTab('badges')}
                              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                                activeTab === 'badges'
                                  ? 'text-[#C44E35]'
                                  : 'text-black/60 hover:text-black'
                              }`}
                            >
                              Badges
                              {activeTab === 'badges' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C44E35]" />
                              )}
                            </button>
                            <button
                              onClick={() => setActiveTab('info')}
                              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                                activeTab === 'info'
                                  ? 'text-[#C44E35]'
                                  : 'text-black/60 hover:text-black'
                              }`}
                            >
                              Informacje
                              {activeTab === 'info' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C44E35]" />
                              )}
                            </button>
                            <button
                              onClick={() => setActiveTab('settings')}
                              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                                activeTab === 'settings'
                                  ? 'text-[#C44E35]'
                                  : 'text-black/60 hover:text-black'
                              }`}
                            >
                              Ustawienia
                              {activeTab === 'settings' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C44E35]" />
                              )}
                            </button>
                          </div>

                          {/* Tab Content */}
                          <div>
                              {activeTab === 'badges' && (
                                <div>
                                  <h4 className="text-sm font-semibold text-black mb-4">Zarządzaj odznakami użytkownika</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Verified */}
                                    <div className="bg-white rounded-2xl p-4 border border-black/10">
                                      <div className="flex items-center gap-2 mb-3">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm font-medium text-black">Zweryfikowany</span>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant={user.verified ? "default" : "outline"}
                                        onClick={() => updateUserFlag(user.id, 'verified', !user.verified)}
                                        disabled={loading === user.id}
                                        className={`w-full rounded-lg ${
                                          user.verified
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                            : 'border-2 hover:bg-blue-50'
                                        }`}
                                      >
                                        {user.verified ? '✓ Aktywny' : 'Nieaktywny'}
                                      </Button>
                                    </div>

                                    {/* Company */}
                                    <div className="bg-white rounded-2xl p-4 border border-black/10">
                                      <div className="flex items-center gap-2 mb-3">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <span className="text-sm font-medium text-black">Firma</span>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant={user.is_company ? "default" : "outline"}
                                        onClick={() => updateUserFlag(user.id, 'is_company', !user.is_company)}
                                        disabled={loading === user.id}
                                        className={`w-full rounded-lg ${
                                          user.is_company
                                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                            : 'border-2 hover:bg-purple-50'
                                        }`}
                                      >
                                        {user.is_company ? '✓ Aktywny' : 'Nieaktywny'}
                                      </Button>
                                    </div>

                                    {/* AI Bot */}
                                    <div className="bg-white rounded-2xl p-4 border border-black/10">
                                      <div className="flex items-center gap-2 mb-3">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm font-medium text-black">AI Bot</span>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant={user.is_ai_bot ? "default" : "outline"}
                                        onClick={() => updateUserFlag(user.id, 'is_ai_bot', !user.is_ai_bot)}
                                        disabled={loading === user.id}
                                        className={`w-full rounded-lg ${
                                          user.is_ai_bot
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : 'border-2 hover:bg-green-50'
                                        }`}
                                      >
                                        {user.is_ai_bot ? '✓ Aktywny' : 'Nieaktywny'}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {activeTab === 'info' && (
                                <div className="bg-white rounded-2xl p-6 border border-black/10">
                                  <h4 className="text-sm font-semibold text-black mb-4">Szczegółowe informacje</h4>
                                  <div className="space-y-3 text-sm">
                                    <div className="flex justify-between py-2 border-b border-black/5">
                                      <span className="text-black/60">Pełne ID:</span>
                                      <button
                                        onClick={() => copyToClipboard(user.id)}
                                        className="text-black font-mono hover:text-[#C44E35] transition-colors flex items-center gap-2"
                                      >
                                        {user.id}
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                      </button>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-black/5">
                                      <span className="text-black/60">Email:</span>
                                      <span className="text-black">{user.email || 'Brak'}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-black/5">
                                      <span className="text-black/60">Data utworzenia:</span>
                                      <span className="text-black">{new Date(user.created_at).toLocaleString('pl-PL')}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                      <span className="text-black/60">Status konta:</span>
                                      <span className={user.banned ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                                        {user.banned ? 'Zbanowany' : 'Aktywny'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {activeTab === 'settings' && (
                                <div className="space-y-4">
                                  {/* Ban/Unban Section */}
                                  <div className="bg-white rounded-2xl p-6 border border-black/10">
                                    <h4 className="text-sm font-semibold text-black mb-4">Zarządzanie dostępem</h4>

                                    {user.banned ? (
                                      <div className="space-y-4">
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                          <div className="flex items-center gap-2 mb-2">
                                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <span className="font-semibold text-red-900">Użytkownik zbanowany</span>
                                          </div>
                                          <p className="text-sm text-red-800">Ten użytkownik został zablokowany i nie może korzystać z platformy.</p>
                                        </div>
                                        <Button
                                          onClick={() => unbanUser(user.id)}
                                          disabled={loading === user.id}
                                          className="w-full rounded-lg bg-green-600 hover:bg-green-700 text-white"
                                        >
                                          {loading === user.id ? 'Odbanowywanie...' : 'Odbanuj użytkownika'}
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="space-y-4">
                                        <div className="space-y-2">
                                          <label htmlFor={`ban-reason-${user.id}`} className="text-sm font-medium text-black">
                                            Powód bana
                                          </label>
                                          <Input
                                            id={`ban-reason-${user.id}`}
                                            placeholder="np. Spam, Nieodpowiednie treści, Naruszenie regulaminu..."
                                            value={banReason}
                                            onChange={(e) => setBanReason(e.target.value)}
                                            className="rounded-lg"
                                          />
                                          <p className="text-xs text-black/60">Podaj powód zablokowania tego użytkownika</p>
                                        </div>
                                        <Button
                                          onClick={() => banUser(user.id)}
                                          disabled={loading === user.id || !banReason.trim()}
                                          className="w-full rounded-lg bg-red-600 hover:bg-red-700 text-white"
                                        >
                                          {loading === user.id ? 'Banowanie...' : 'Zbanuj użytkownika'}
                                        </Button>
                                      </div>
                                    )}
                                  </div>

                                  {/* Delete User Section */}
                                  <div className="bg-white rounded-2xl p-6 border border-red-200">
                                    <h4 className="text-sm font-semibold text-red-900 mb-4">Strefa niebezpieczna</h4>

                                    {showDeleteConfirm === user.id ? (
                                      <div className="space-y-4">
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                          <p className="text-sm text-red-900 font-semibold mb-2">Czy na pewno chcesz usunąć tego użytkownika?</p>
                                          <p className="text-xs text-red-800">Ta akcja jest nieodwracalna. Wszystkie dane użytkownika, w tym ogłoszenia, zostaną trwale usunięte.</p>
                                        </div>
                                        <div className="flex gap-3">
                                          <Button
                                            onClick={() => setShowDeleteConfirm(null)}
                                            variant="outline"
                                            className="flex-1 rounded-lg"
                                          >
                                            Anuluj
                                          </Button>
                                          <Button
                                            onClick={() => deleteUser(user.id)}
                                            disabled={loading === user.id}
                                            className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                                          >
                                            {loading === user.id ? 'Usuwanie...' : 'Tak, usuń'}
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        <p className="text-sm text-black/60 mb-3">Trwale usuń użytkownika i wszystkie jego dane z platformy.</p>
                                        <Button
                                          onClick={() => setShowDeleteConfirm(user.id)}
                                          variant="outline"
                                          className="w-full rounded-lg border-red-300 text-red-700 hover:bg-red-50"
                                        >
                                          Usuń użytkownika
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
