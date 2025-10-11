'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Ban, Check, UserCheck, Calendar, User } from 'lucide-react'
import { unbanUser } from '@/lib/actions/admin-reports'

interface BannedUser {
  id: string
  full_name: string
  email: string
  banned_at: string
  ban_reason: string
  banned_by_name: string
}

interface BannedUsersListProps {
  initialUsers: BannedUser[]
}

export function BannedUsersList({ initialUsers }: BannedUsersListProps) {
  const [users, setUsers] = useState<BannedUser[]>(initialUsers)
  const [selectedUser, setSelectedUser] = useState<BannedUser | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showConfirmUnban, setShowConfirmUnban] = useState(false)
  const [unbanReason, setUnbanReason] = useState('')

  const handleUnbanUser = async () => {
    if (!selectedUser || !unbanReason.trim()) {
      alert('Podaj powód odbanowania')
      return
    }
    setIsProcessing(true)

    try {
      const result = await unbanUser(selectedUser.id, unbanReason)

      alert(result.message)

      // Remove from list
      setUsers(users.filter(u => u.id !== selectedUser.id))
      setSelectedUser(null)
      setUnbanReason('')
      setShowConfirmUnban(false)
    } catch (error: any) {
      alert('Błąd: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  if (users.length === 0) {
    return (
      <Card className="border-0 rounded-3xl bg-white p-12">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">
            Brak zbanowanych użytkowników
          </h2>
          <p className="text-black/60">
            Wszyscy użytkownicy mają dostęp do platformy.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-6">
      {/* Users List */}
      <div>
        <Card className="border-0 rounded-3xl bg-white overflow-hidden">
          <div className="divide-y divide-black/5">
            {users.map((user) => (
              <div
                key={user.id}
                className="p-6 hover:bg-[#F5F1E8] transition-colors cursor-pointer"
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                      <Ban className="w-6 h-6 text-red-600" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-black">
                          {user.full_name}
                        </h3>
                        <p className="text-sm text-black/60">
                          {user.email}
                        </p>
                      </div>
                      <span className="text-sm text-black/50 flex-shrink-0">
                        {new Date(user.banned_at).toLocaleDateString('pl-PL', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Ban Reason */}
                    <div className="bg-red-50 rounded-2xl p-3 mb-2">
                      <p className="text-sm font-semibold text-red-900 mb-1">
                        Powód bana:
                      </p>
                      <p className="text-sm text-red-700">
                        {user.ban_reason}
                      </p>
                    </div>

                    {/* Banned by */}
                    <div className="text-sm text-black/60">
                      Zbanowany przez: <strong>{user.banned_by_name}</strong>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 text-black/40">
                    <UserCheck className="w-6 h-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Details Panel */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        {selectedUser ? (
          <Card className="border-0 rounded-3xl bg-white p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <Ban className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-black">
                  Szczegóły bana
                </h2>
                <p className="text-sm text-black/60">
                  {selectedUser.full_name}
                </p>
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-semibold text-black/70 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Użytkownik
                </label>
                <p className="text-black mt-1">{selectedUser.full_name}</p>
                <p className="text-sm text-black/60 mt-1">{selectedUser.email}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-black/70 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data zbanowania
                </label>
                <p className="text-black mt-1">
                  {new Date(selectedUser.banned_at).toLocaleString('pl-PL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-black/70">Powód bana</label>
                <div className="bg-red-50 rounded-2xl p-4 mt-1">
                  <p className="text-red-900">{selectedUser.ban_reason}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-black/70">Zbanowany przez</label>
                <p className="text-black mt-1">{selectedUser.banned_by_name}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-6 border-t border-black/10">
              <button
                onClick={() => setShowConfirmUnban(true)}
                disabled={isProcessing}
                className="w-full px-4 py-3 rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                Odbanuj użytkownika
              </button>

              <p className="text-xs text-black/50 mt-2">
                <strong>Info:</strong> Odbanowanie przywróci użytkownikowi pełny dostęp do platformy.
              </p>
            </div>

            {/* Unban Confirmation Dialog */}
            {showConfirmUnban && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-black">Odbanuj użytkownika</h3>
                  </div>

                  <p className="text-black/70 mb-4">
                    Czy na pewno chcesz odbanować użytkownika <strong>{selectedUser?.full_name}</strong>?
                    Użytkownik odzyska pełny dostęp do platformy.
                  </p>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-black mb-2">
                      Powód odbanowania (wymagane) *
                    </label>
                    <textarea
                      value={unbanReason}
                      onChange={(e) => setUnbanReason(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
                      rows={3}
                      placeholder="Np. Apelacja przyjęta, zakończenie okresu kary, błędny ban..."
                      disabled={isProcessing}
                    />
                    <p className="text-xs text-black/50 mt-1">
                      Ten powód zostanie zapisany w historii
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowConfirmUnban(false)
                        setUnbanReason('')
                      }}
                      disabled={isProcessing}
                      className="flex-1 px-6 py-3 rounded-full border border-black/10 hover:bg-black/5 transition-colors font-semibold text-black"
                    >
                      Anuluj
                    </button>
                    <button
                      onClick={handleUnbanUser}
                      disabled={isProcessing || !unbanReason.trim()}
                      className="flex-1 px-6 py-3 rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? 'Odbanowywanie...' : 'Odbanuj'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ) : (
          <Card className="border-0 rounded-3xl bg-white p-12">
            <div className="text-center">
              <Ban className="w-12 h-12 text-black/30 mx-auto mb-4" />
              <p className="text-black/60">
                Wybierz użytkownika z listy, aby zobaczyć szczegóły
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
