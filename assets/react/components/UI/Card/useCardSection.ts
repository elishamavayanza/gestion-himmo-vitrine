import { useMemo } from 'react'

export type CardSection = 'header' | 'body' | 'footer'

export function useCardSection(section: CardSection, className = '') {
  return useMemo(
    () => ['ui-card__' + section, className].filter(Boolean).join(' '),
    [section, className],
  )
}
