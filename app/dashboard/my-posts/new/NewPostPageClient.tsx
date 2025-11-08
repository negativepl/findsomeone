'use client'

import { User } from '@supabase/supabase-js'
import { NewPostClient, useStepContext, StepContext } from './NewPostClient'
import { useState } from 'react'

interface NewPostPageClientProps {
  user: User
}

function StepIndicator() {
  const stepContext = useStepContext()

  if (!stepContext) {
    return null
  }

  const { currentStep, totalSteps, stepTitle } = stepContext

  return (
    <>
      {/* White background extension above step indicator */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-[60px] z-30 bg-white" />

      {/* Step indicator */}
      <div className="md:hidden fixed top-[60px] left-0 right-0 z-30 bg-white border-b border-black/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-black">{stepTitle}</h1>
          <p className="text-base font-semibold text-black/60">Krok {currentStep}/{totalSteps}</p>
        </div>
      </div>
    </>
  )
}

export function NewPostPageClient({ user }: NewPostPageClientProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 6

  const getStepTitle = (step: number): string => {
    switch (step) {
      case 1: return 'Tytuł i opis'
      case 2: return 'Kategoria'
      case 3: return 'Zdjęcia'
      case 4: return 'Lokalizacja'
      case 5: return 'Budżet'
      case 6: return 'Podsumowanie'
      default: return 'Dodaj ogłoszenie'
    }
  }

  const stepContextValue = {
    currentStep,
    totalSteps,
    stepTitle: getStepTitle(currentStep)
  }

  return (
    <StepContext.Provider value={stepContextValue}>
      <StepIndicator />
      <NewPostClient onStepChange={setCurrentStep} />
    </StepContext.Provider>
  )
}
