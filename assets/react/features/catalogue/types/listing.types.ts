import type { Currency, ListingType } from '../../../services/api/publicShowcase.types'

export type { Currency, ListingPage, ListingType, OrganizationShowcase, PublicListing } from '../../../services/api/publicShowcase.types'

export interface ListingFilters {
  type?: ListingType
  bedrooms?: string
  minRent?: string
  maxRent?: string
  currency?: Currency
  page?: number
  limit?: number
}
