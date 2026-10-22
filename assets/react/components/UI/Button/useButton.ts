import { useMemo } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger'
export type ButtonSize = 'small' | 'medium' | 'large'

interface UseButtonOptions {
  variant: ButtonVariant
  size: ButtonSize
  className?: string
  disabled?: boolean
  loading?: boolean
}

export function useButton({ variant, size, className = '', disabled = false, loading = false }: UseButtonOptions) {
  const classes = useMemo(
    () => ['ui-button', 'ui-button--' + variant, 'ui-button--' + size, className].filter(Boolean).join(' '),
    [variant, size, className],
  )

  return {
    className: classes,
    disabled: disabled || loading,
    busy: loading || undefined,
  }
}
