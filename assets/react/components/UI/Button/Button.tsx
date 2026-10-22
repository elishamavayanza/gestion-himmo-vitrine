import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useButton, type ButtonSize, type ButtonVariant } from './useButton'

export type { ButtonSize, ButtonVariant } from './useButton'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  leadingIcon?: ReactNode
  loading?: boolean
  loadingLabel?: string
}

export function Button({
  variant = 'primary',
  size = 'medium',
  leadingIcon,
  className = '',
  children,
  type = 'button',
  disabled = false,
  loading = false,
  loadingLabel = 'Chargement…',
  ...props
}: ButtonProps) {
  const button = useButton({ variant, size, className, disabled, loading })

  return (
    <button
      className={button.className}
      type={type}
      disabled={button.disabled}
      aria-busy={button.busy}
      {...props}
    >
      {loading ? (
        <span className="ui-button__spinner" aria-hidden="true" />
      ) : (
        leadingIcon && <span className="ui-button__icon" aria-hidden="true">{leadingIcon}</span>
      )}
      <span>{loading ? loadingLabel : children}</span>
    </button>
  )
}
