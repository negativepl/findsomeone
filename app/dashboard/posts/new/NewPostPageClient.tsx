'use client'

import { User } from '@supabase/supabase-js'
import { NewPostClient, useStepContext, StepContext } from './NewPostClient'
import { NavbarClient } from '@/components/NavbarClient'
import { NavbarWrapper } from '@/components/NavbarWrapper'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface NewPostPageClientProps {
  user: User
}

function NewPostNavbarInner() {
  const stepContext = useStepContext()

  if (!stepContext) {
    return (
      <div className="md:hidden">
        <h1 className="text-base font-semibold text-black">Dodaj ogłoszenie</h1>
      </div>
    )
  }

  const { currentStep, totalSteps, stepTitle } = stepContext

  return (
    <div className="md:hidden">
      <h1 className="text-base font-semibold text-black">{stepTitle}</h1>
      <p className="text-xs text-black/60">Krok {currentStep}/{totalSteps}</p>
    </div>
  )
}

export function NewPostPageClient({ user }: NewPostPageClientProps) {
  const [profile, setProfile] = useState<{ avatar_url: string | null; full_name: string | null } | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 6

  const getStepTitle = (step: number): string => {
    switch (step) {
      case 1: return 'Podstawowe informacje'
      case 2: return 'Opis ogłoszenia'
      case 3: return 'Zdjęcia'
      case 4: return 'Lokalizacja'
      case 5: return 'Budżet'
      case 6: return 'Podsumowanie'
      default: return 'Dodaj ogłoszenie'
    }
  }

  useEffect(() => {
    const supabase = createClient()

    // Fetch profile
    supabase
      .from('profiles')
      .select('avatar_url, full_name')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setProfile(data)
      })
  }, [user.id])

  const stepContextValue = {
    currentStep,
    totalSteps,
    stepTitle: getStepTitle(currentStep)
  }

  return (
    <StepContext.Provider value={stepContextValue}>
      <NavbarWrapper alwaysVisible={true}>
        <NavbarClient user={user} showAddButton={false} stepInfo={<NewPostNavbarInner />} profile={profile} isAdmin={false} />
      </NavbarWrapper>
      <div className="h-[60px]" />
      <NewPostClient onStepChange={setCurrentStep} />
    </StepContext.Provider>
  )
}
