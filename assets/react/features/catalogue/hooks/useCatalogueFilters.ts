import { useState, type FormEvent } from 'react'
import type { Currency, ListingType } from '../../../services/api/publicShowcase.types'
import type { ListingFilters } from '../types/listing.types'

export interface CatalogueFilterDraft {
  city: string
  type: string
  bedrooms: string
  offerType: string
  minPrice: string
  maxPrice: string
  currency: string
}

const isDecimalAmount = (value: string) => /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(value)
const toMinorUnits = (value: string) => {
  if (!isDecimalAmount(value)) return null
  const [whole, fraction = ''] = value.split('.')
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'))
}

export function useCatalogueFilters(
  initial: ListingFilters,
  onApply: (filters: CatalogueFilterDraft) => void,
) {
  const [draft, setDraft] = useState<CatalogueFilterDraft>({
    city: initial.city ?? '',
    type: initial.type ?? '',
    bedrooms: initial.bedrooms ?? '',
    offerType: initial.offerType ?? (initial.minRent || initial.maxRent ? 'rent' : ''),
    minPrice: initial.minPrice ?? initial.minRent ?? '',
    maxPrice: initial.maxPrice ?? initial.maxRent ?? '',
    currency: initial.currency ?? '',
  })
  const [error, setError] = useState<string | null>(null)

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const minimum = draft.minPrice.trim()
    const maximum = draft.maxPrice.trim()
    if ((minimum || maximum) && !draft.currency) {
      setError('Choisissez une devise pour filtrer les prix.')
      return
    }
    if ((minimum && !isDecimalAmount(minimum)) || (maximum && !isDecimalAmount(maximum))) {
      setError('Saisissez un montant valide avec au plus deux décimales.')
      return
    }
    const minimumUnits = minimum ? toMinorUnits(minimum) : null
    const maximumUnits = maximum ? toMinorUnits(maximum) : null
    if (minimumUnits !== null && maximumUnits !== null && minimumUnits > maximumUnits) {
      setError('Le prix minimum doit être inférieur ou égal au prix maximum.')
      return
    }
    onApply(draft)
  }

  function reset() {
    setError(null)
    setDraft({ city: '', type: '', bedrooms: '', offerType: '', minPrice: '', maxPrice: '', currency: '' })
    onApply({ city: '', type: '', bedrooms: '', offerType: '', minPrice: '', maxPrice: '', currency: '' })
  }

  function change<K extends keyof CatalogueFilterDraft>(key: K, value: CatalogueFilterDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  return {
    draft,
    error,
    apply,
    reset,
    change,
    options: {
      city: draft.city || undefined,
      type: draft.type ? draft.type as ListingType : undefined,
      bedrooms: draft.bedrooms || undefined,
      offerType: draft.offerType ? draft.offerType as 'rent' | 'sale' : undefined,
      minPrice: draft.minPrice || undefined,
      maxPrice: draft.maxPrice || undefined,
      currency: draft.currency ? draft.currency as Currency : undefined,
    },
  }
}
