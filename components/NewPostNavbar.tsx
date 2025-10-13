'use client'

import { useStepContext } from '@/app/dashboard/posts/new/NewPostClient'

export function NewPostNavbar() {
  const stepContext = useStepContext()

  if (!stepContext) return null

  const { currentStep, totalSteps, stepTitle } = stepContext

  return (
    <div className="md:hidden">
      <h1 className="text-base font-semibold text-black">{stepTitle}</h1>
      <p className="text-xs text-black/60">Krok {currentStep}/{totalSteps}</p>
    </div>
  )
}
