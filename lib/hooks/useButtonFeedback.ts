'use client'

import { useState, useCallback } from 'react'

type FeedbackState = 'idle' | 'success' | 'error'

interface UseButtonFeedbackOptions {
  /**
   * Jak długo pokazywać feedback (ms)
   * @default 1200
   */
  duration?: number
}

/**
 * Hook do inline feedback w buttonach
 *
 * Zamiast toast notifications, pokazuje feedback bezpośrednio w buttonie
 * gdzie user aktualnie patrzy.
 *
 * @example
 * ```tsx
 * const { state, triggerSuccess, triggerError } = useButtonFeedback()
 *
 * const handleClick = async () => {
 *   try {
 *     await doSomething()
 *     triggerSuccess()
 *   } catch {
 *     triggerError()
 *   }
 * }
 *
 * return (
 *   <button>
 *     {state === 'success' ? <Check /> : <Copy />}
 *   </button>
 * )
 * ```
 */
export function useButtonFeedback(options: UseButtonFeedbackOptions = {}) {
  const { duration = 1200 } = options
  const [state, setState] = useState<FeedbackState>('idle')

  const triggerSuccess = useCallback(() => {
    setState('success')
    setTimeout(() => setState('idle'), duration)
  }, [duration])

  const triggerError = useCallback(() => {
    setState('error')
    setTimeout(() => setState('idle'), duration)
  }, [duration])

  const reset = useCallback(() => {
    setState('idle')
  }, [])

  return {
    state,
    isIdle: state === 'idle',
    isSuccess: state === 'success',
    isError: state === 'error',
    triggerSuccess,
    triggerError,
    reset,
  }
}
