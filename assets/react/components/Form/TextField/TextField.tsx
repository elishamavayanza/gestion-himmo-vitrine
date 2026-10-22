import type { InputHTMLAttributes } from 'react'
import { useTextField } from './useTextField'

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
}

export function TextField({ id, label, hint, error, className = '', ...props }: TextFieldProps) {
  const field = useTextField({
    id,
    name: props.name,
    hint,
    error,
    describedBy: props['aria-describedby'],
  })

  return (
    <div className="ui-field">
      <label className="ui-field__label" htmlFor={field.controlId}>{label}</label>
      <input
        className={['ui-field__control', error ? 'ui-field__control--error' : '', className].filter(Boolean).join(' ')}
        id={field.controlId}
        aria-invalid={error ? true : undefined}
        aria-describedby={field.ariaDescribedBy}
        {...props}
      />
      {hint && !error && <span className="ui-field__hint" id={field.hintId}>{hint}</span>}
      {error && <span className="ui-field__error" id={field.errorId}>{error}</span>}
    </div>
  )
}
