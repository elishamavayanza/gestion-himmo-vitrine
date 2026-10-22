import { useMemo } from 'react'

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning'

interface UseBadgeOptions {
  tone: BadgeTone
  className?: string
}

export function useBadge({ tone, className = '' }: UseBadgeOptions) {
  return useMemo(
    () => ['ui-badge', 'ui-badge--' + tone, className].filter(Boolean).join(' '),
    [tone, className],
  )
}
