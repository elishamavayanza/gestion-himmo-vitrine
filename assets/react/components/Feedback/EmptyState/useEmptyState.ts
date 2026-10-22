import { useId } from 'react'

export function useEmptyState() {
  const headingId = useId()
  return { headingId }
}
