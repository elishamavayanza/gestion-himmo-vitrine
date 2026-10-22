import { useId } from 'react'

interface UseFieldAccessibilityOptions {
  id?: string
  name?: string
  hint?: string
  error?: string
  describedBy?: string
}

export function useFieldAccessibility({ id, name, hint, error, describedBy }: UseFieldAccessibilityOptions) {
  const generatedId = useId()
  const controlId = id ?? name ?? generatedId
  const hintId = hint ? controlId + '-hint' : undefined
  const errorId = error ? controlId + '-error' : undefined
  const ariaDescribedBy = [describedBy, hintId, errorId].filter(Boolean).join(' ') || undefined

  return { controlId, hintId, errorId, ariaDescribedBy }
}
