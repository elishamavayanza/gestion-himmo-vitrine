import type { ReactNode } from 'react'
import { useEmptyState } from './useEmptyState'

export interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({ title, description, icon, action, className = '' }: EmptyStateProps) {
  const { headingId } = useEmptyState()

  return (
    <section
      className={['ui-empty-state', className].filter(Boolean).join(' ')}
      aria-labelledby={headingId}
    >
      {icon && <span className="ui-empty-state__icon" aria-hidden="true">{icon}</span>}
      <h2 id={headingId}>{title}</h2>
      {description && <p>{description}</p>}
      {action && <div className="ui-empty-state__action">{action}</div>}
    </section>
  )
}
