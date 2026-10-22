import type { HTMLAttributes } from 'react'
import { useBadge, type BadgeTone } from './useBadge'

export type { BadgeTone } from './useBadge'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
}

export function Badge({ tone = 'neutral', className = '', ...props }: BadgeProps) {
  const badgeClassName = useBadge({ tone, className })
  return <span className={badgeClassName} {...props} />
}
