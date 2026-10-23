import { Children, isValidElement, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent, ReactNode, SelectHTMLAttributes } from 'react'
import { useSelectField } from './useSelectField'

interface SelectOption {
  value: string
  label: string
  disabled: boolean
}

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  hint?: string
  error?: string
}

export function SelectField({
  id,
  label,
  hint,
  error,
  className = '',
  children,
  name,
  value,
  defaultValue,
  onChange,
  disabled = false,
  required = false,
  ...nativeProps
}: SelectFieldProps) {
  const field = useSelectField({ id, name, hint, error, describedBy: nativeProps['aria-describedby'] })
  const generatedListId = useId()
  const listId = `${field.controlId}-${generatedListId}-options`
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const typeaheadRef = useRef('')
  const typeaheadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const options = useMemo(() => Children.toArray(children).flatMap((child): SelectOption[] => {
    if (!isValidElement<{ value?: string; disabled?: boolean; children?: ReactNode }>(child) || child.type !== 'option') return []
    return [{
      value: String(child.props.value ?? ''),
      label: typeof child.props.children === 'string' || typeof child.props.children === 'number' ? String(child.props.children) : '',
      disabled: Boolean(child.props.disabled),
    }]
  }), [children])
  const initialValue = String(value ?? defaultValue ?? options[0]?.value ?? '')
  const [uncontrolledValue, setUncontrolledValue] = useState(initialValue)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, options.findIndex((option) => option.value === initialValue)))
  const selectedValue = String(value ?? uncontrolledValue)
  const selectedOption = options.find((option) => option.value === selectedValue)
  const activeOption = options[activeIndex]

  useEffect(() => {
    if (!open) return
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer)
  }, [open])

  useEffect(() => () => {
    if (typeaheadTimeoutRef.current) clearTimeout(typeaheadTimeoutRef.current)
  }, [])

  const openAt = (direction: 1 | -1 = 1) => {
    const selectedIndex = options.findIndex((option) => option.value === selectedValue && !option.disabled)
    const firstEnabled = options.findIndex((option) => !option.disabled)
    const lastEnabled = options.findLastIndex((option) => !option.disabled)
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : direction > 0 ? firstEnabled : lastEnabled)
    setOpen(true)
  }

  const selectOption = (option: SelectOption) => {
    if (option.disabled) return
    if (value === undefined) setUncontrolledValue(option.value)
    const eventTarget = { value: option.value, name: name ?? '' } as HTMLSelectElement
    onChange?.({ target: eventTarget, currentTarget: eventTarget } as ChangeEvent<HTMLSelectElement>)
    setOpen(false)
    triggerRef.current?.focus()
  }

  const moveActive = (start: number, step: 1 | -1) => {
    for (let index = start + step; index >= 0 && index < options.length; index += step) {
      if (!options[index].disabled) {
        setActiveIndex(index)
        return
      }
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) openAt(event.key === 'ArrowDown' ? 1 : -1)
      else moveActive(activeIndex, event.key === 'ArrowDown' ? 1 : -1)
      return
    }
    if (event.key === 'Escape' && open) {
      event.preventDefault()
      setOpen(false)
      return
    }
    if ((event.key === 'Enter' || event.key === ' ') && open) {
      event.preventDefault()
      if (activeOption) selectOption(activeOption)
      return
    }
    if (event.key === 'Home' && open) {
      event.preventDefault()
      const first = options.findIndex((option) => !option.disabled)
      if (first >= 0) setActiveIndex(first)
      return
    }
    if (event.key === 'End' && open) {
      event.preventDefault()
      const last = options.findLastIndex((option) => !option.disabled)
      if (last >= 0) setActiveIndex(last)
      return
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      typeaheadRef.current += event.key.toLocaleLowerCase()
      if (typeaheadTimeoutRef.current) clearTimeout(typeaheadTimeoutRef.current)
      typeaheadTimeoutRef.current = setTimeout(() => { typeaheadRef.current = '' }, 700)
      const match = options.findIndex((option) => !option.disabled && option.label.toLocaleLowerCase().startsWith(typeaheadRef.current))
      if (match >= 0) {
        setActiveIndex(match)
        if (open) return
        selectOption(options[match])
      }
    }
  }

  return (
    <div className="ui-field">
      <label className="ui-field__label" id={`${field.controlId}-label`} htmlFor={field.controlId}>{label}</label>
      <div className="ui-select" ref={rootRef} data-open={open || undefined}>
        <select
          {...nativeProps}
          className="ui-select__native"
          id={`${field.controlId}-native`}
          name={name}
          value={selectedValue}
          tabIndex={-1}
          aria-hidden="true"
          onChange={() => undefined}
          disabled={disabled}
        >
          {children}
        </select>
        <button
          ref={triggerRef}
          type="button"
          id={field.controlId}
          className={['ui-field__control', 'ui-field__select', 'ui-select__trigger', error ? 'ui-field__control--error' : '', className].filter(Boolean).join(' ')}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && activeOption ? `${listId}-${activeIndex}` : undefined}
          aria-labelledby={`${field.controlId}-label`}
          aria-invalid={error ? true : undefined}
          aria-describedby={field.ariaDescribedBy}
          aria-required={required || undefined}
          disabled={disabled}
          onClick={() => open ? setOpen(false) : openAt()}
          onKeyDown={handleKeyDown}
          onBlur={(event) => {
            if (!rootRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false)
          }}
        >
          <span className="ui-select__value">{selectedOption?.label ?? ''}</span>
          <span className="ui-select__chevron" aria-hidden="true" />
        </button>
        {open && (
          <div className="ui-select__menu" id={listId} role="listbox" aria-labelledby={`${field.controlId}-label`}>
            {options.map((option, index) => (
              <button
                key={`${option.value}-${index}`}
                id={`${listId}-${index}`}
                type="button"
                className="ui-select__option"
                role="option"
                aria-selected={option.value === selectedValue}
                aria-disabled={option.disabled || undefined}
                data-active={index === activeIndex || undefined}
                disabled={option.disabled}
                tabIndex={-1}
                onPointerEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {hint && !error && <span className="ui-field__hint" id={field.hintId}>{hint}</span>}
      {error && <span className="ui-field__error" id={field.errorId}>{error}</span>}
    </div>
  )
}
