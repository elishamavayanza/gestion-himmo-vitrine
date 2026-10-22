import { useFieldAccessibility } from '../useFieldAccessibility'

interface UseSelectFieldOptions {
  id?: string
  name?: string
  hint?: string
  error?: string
  describedBy?: string
}

export function useSelectField(options: UseSelectFieldOptions) {
  return useFieldAccessibility(options)
}
