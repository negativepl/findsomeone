'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Trash2, Ban, Shield, Building2, Bot, Copy, CheckCircle2 } from 'lucide-react'

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
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [userToBan, setUserToBan] = useState<Profile | null>(null)
  const [banReason, setBanReason] = useState('')

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

      setUsers(users.map(user =>
        user.id === userId ? { ...user, [field]: value } : user
      ))
      toast.success('Zaktualizowano!')
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Błąd aktualizacji')
    } finally {
      setLoading(null)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Skopiowano do schowka!')
    } catch (err) {
      toast.error('Nie udało się skopiować')
    }
  }

  const openBanDialog = (user: Profile) => {
    setUserToBan(user)
    setBanReason('')
    setBanDialogOpen(true)
  }

  const banUser = async () => {
    if (!userToBan || !banReason.trim()) {
      toast.error('Podaj powód bana')
      return
    }

    setLoading(userToBan.id)
    try {
      const res = await fetch(`/api/admin/users/${userToBan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ban', reason: banReason })
      })

      if (!res.ok) throw new Error('Failed to ban user')

      setUsers(users.map(user =>
        user.id === userToBan.id ? { ...user, banned: true } : user
      ))
      toast.success('Użytkownik zbanowany')
      setBanDialogOpen(false)
      setUserToBan(null)
      setBanReason('')
    } catch (error) {
      toast.error('Błąd banowania')
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
      toast.success('Użytkownik odbanowany')
    } catch (error) {
      toast.error('Błąd odbanowania')
    } finally {
      setLoading(null)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Czy na pewno chcesz TRWALE usunąć tego użytkownika? Ta operacja jest nieodwracalna!')) return

    setLoading(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete user')

      setUsers(users.filter(user => user.id !== userId))
      toast.success('Użytkownik usunięty')
    } catch (error) {
      toast.error('Błąd usuwania')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
      {/* Search */}
      <Card className="border bg-muted flex-shrink-0">
        <CardContent className="p-4">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
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
              className="pl-12 pr-10 h-12 text-base border border-input focus:border-ring bg-muted"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
      <Card className="border bg-muted flex-1 flex flex-col overflow-hidden">
        <CardContent className="p-0 flex-1 overflow-auto">
          <div className="overflow-x-auto h-full">
            <table className="w-full">
              <thead className="bg-muted/50 border-b-2 border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Użytkownik</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Odznaki</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Data</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-muted-foreground">Nie znaleziono użytkowników</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <Image
                              src={user.avatar_url}
                              alt={user.full_name || 'User'}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-brand">
                                {user.full_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {user.full_name || 'Bez nazwy'}
                            </p>
                            <button
                              onClick={() => copyToClipboard(user.id)}
                              className="text-xs text-muted-foreground hover:text-brand transition-colors flex items-center gap-1"
                              title="Kliknij aby skopiować ID"
                            >
                              <Copy className="w-3 h-3" />
                              ID
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {user.email || 'Brak email'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className={`w-4 h-4 ${user.verified ? 'text-foreground' : 'text-muted-foreground'}`} />
                            <Switch
                              checked={user.verified}
                              onCheckedChange={(checked) => updateUserFlag(user.id, 'verified', checked)}
                              disabled={loading === user.id}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className={`w-4 h-4 ${user.is_company ? 'text-foreground' : 'text-muted-foreground'}`} />
                            <Switch
                              checked={user.is_company}
                              onCheckedChange={(checked) => updateUserFlag(user.id, 'is_company', checked)}
                              disabled={loading === user.id}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Bot className={`w-4 h-4 ${user.is_ai_bot ? 'text-foreground' : 'text-muted-foreground'}`} />
                            <Switch
                              checked={user.is_ai_bot}
                              onCheckedChange={(checked) => updateUserFlag(user.id, 'is_ai_bot', checked)}
                              disabled={loading === user.id}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.banned ? (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-1 text-xs font-semibold border border-red-200 rounded-lg">
                            <Ban className="w-3 h-3" />
                            Zbanowany
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-600 px-2.5 py-1 text-xs font-semibold border border-green-500/30 rounded-lg">
                            Aktywny
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="text-xs text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString('pl-PL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          {user.banned ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => unbanUser(user.id)}
                              disabled={loading === user.id}
                              className="h-9 w-9 p-0 rounded-lg bg-accent border border-border hover:bg-accent/80 transition-all"
                              title="Odbanuj"
                            >
                              <Shield className="h-4 w-4 text-foreground" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openBanDialog(user)}
                              disabled={loading === user.id}
                              className="h-9 w-9 p-0 rounded-lg bg-accent border border-border hover:bg-accent/80 transition-all"
                              title="Zbanuj"
                            >
                              <Ban className="h-4 w-4 text-foreground" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteUser(user.id)}
                            disabled={loading === user.id}
                            className="h-9 w-9 p-0 rounded-lg bg-accent border border-border hover:bg-accent/80 transition-all"
                            title="Usuń"
                          >
                            <Trash2 className="h-4 w-4 text-foreground" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Zbanuj użytkownika</DialogTitle>
            <DialogDescription>
              Podaj powód zablokowania użytkownika {userToBan?.full_name || userToBan?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ban-reason">Powód bana</Label>
              <Textarea
                id="ban-reason"
                placeholder="np. Spam, Nieodpowiednie treści, Naruszenie regulaminu..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="min-h-[100px] "
              />
              <p className="text-xs text-muted-foreground">
                Ten powód zostanie zapisany i będzie widoczny w logach
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setBanDialogOpen(false)
                setUserToBan(null)
                setBanReason('')
              }}
              className=""
            >
              Anuluj
            </Button>
            <Button
              onClick={banUser}
              disabled={!banReason.trim() || loading === userToBan?.id}
              className="bg-red-600 hover:bg-red-700 text-white "
            >
              {loading === userToBan?.id ? 'Banowanie...' : 'Zbanuj użytkownika'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
