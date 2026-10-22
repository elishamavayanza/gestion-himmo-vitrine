import type { SelectHTMLAttributes } from 'react'
import { useSelectField } from './useSelectField'

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  hint?: string
  error?: string
}

export function SelectField({ id, label, hint, error, className = '', children, ...props }: SelectFieldProps) {
  const field = useSelectField({
    id,
    name: props.name,
    hint,
    error,
    describedBy: props['aria-describedby'],
  })

  return (
    <div className="ui-field">
      <label className="ui-field__label" htmlFor={field.controlId}>{label}</label>
      <select
        className={['ui-field__control', 'ui-field__select', error ? 'ui-field__control--error' : '', className].filter(Boolean).join(' ')}
        id={field.controlId}
        aria-invalid={error ? true : undefined}
        aria-describedby={field.ariaDescribedBy}
        {...props}
      >
        {children}
      </select>
      {hint && !error && <span className="ui-field__hint" id={field.hintId}>{hint}</span>}
      {error && <span className="ui-field__error" id={field.errorId}>{error}</span>}
    </div>
  )
}
