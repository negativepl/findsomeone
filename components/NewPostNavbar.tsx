'use client'

// TODO: This component needs to be refactored to receive props instead of using context
// import { useStepContext } from '@/app/dashboard/my-posts/new/NewPostClient'

export function NewPostNavbar() {
  // const stepContext = useStepContext()
  // if (!stepContext) return null
  // const { currentStep, totalSteps, stepTitle} = stepContext

  // Temporarily disabled until context is properly set up
  return null

  // return (
  //   <div className="md:hidden">
  //     <h1 className="text-base font-semibold text-black">{stepTitle}</h1>
  //     <p className="text-xs text-black/60">Krok {currentStep}/{totalSteps}</p>
  //   </div>
  // )
}
