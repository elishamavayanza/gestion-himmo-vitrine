import { useMemo } from 'react'

interface UseCardOptions {
  padding: 'none' | 'small' | 'medium' | 'large'
  className?: string
}

export function useCard({ padding, className = '' }: UseCardOptions) {
  return useMemo(
    () => ['ui-card', 'ui-card--padding-' + padding, className].filter(Boolean).join(' '),
    [padding, className],
  )
}
