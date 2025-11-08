'use client'

import { Check, X } from 'lucide-react'
import Link from 'next/link'

interface ProfileCompletionProps {
  profile: {
    full_name?: string | null
    avatar_url?: string | null
    bio?: string | null
    phone?: string | null
    city?: string | null
  }
}

export function ProfileCompletion({ profile }: ProfileCompletionProps) {
  const checks = [
    { key: 'full_name', label: 'Imię i nazwisko', completed: !!profile.full_name },
    { key: 'avatar_url', label: 'Zdjęcie profilowe', completed: !!profile.avatar_url },
    { key: 'bio', label: 'Opis profilu', completed: !!profile.bio },
    { key: 'phone', label: 'Numer telefonu', completed: !!profile.phone },
    { key: 'city', label: 'Miasto', completed: !!profile.city },
  ]

  const completedCount = checks.filter(c => c.completed).length
  const totalCount = checks.length
  const percentage = Math.round((completedCount / totalCount) * 100)

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-foreground">Kompletność profilu</span>
          <span className="text-sm font-bold text-brand">{percentage}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-brand transition-all duration-300 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        {checks.map((check) => (
          <div
            key={check.key}
            className="flex items-center gap-2 text-sm"
          >
            {check.completed ? (
              <div className="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-brand" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <X className="w-3 h-3 text-muted-foreground" />
              </div>
            )}
            <span className={check.completed ? 'text-foreground' : 'text-muted-foreground'}>
              {check.label}
            </span>
          </div>
        ))}
      </div>

      {/* Action button if not 100% */}
      {percentage < 100 && (
        <Link href="/dashboard/profile" className="block mt-4">
          <button className="w-full px-4 py-2.5 rounded-full bg-brand/10 hover:bg-brand/20 text-brand border-0 text-sm font-semibold transition-all">
            Uzupełnij profil
          </button>
        </Link>
      )}
    </div>
  )
}
