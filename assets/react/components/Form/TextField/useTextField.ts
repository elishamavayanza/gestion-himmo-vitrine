import { useFieldAccessibility } from '../useFieldAccessibility'

interface UseTextFieldOptions {
  id?: string
  name?: string
  hint?: string
  error?: string
  describedBy?: string
}

export function useTextField(options: UseTextFieldOptions) {
  return useFieldAccessibility(options)
}
