import type { Currency, ListingOfferType, ListingType } from '../../../services/api/publicShowcase.types'

import type { PublicListing } from '../../../services/api/publicShowcase.types'

export type { Currency, ListingOfferType, ListingPage, ListingType, OrganizationShowcase, PublicListing } from '../../../services/api/publicShowcase.types'

export interface CatalogueListing extends PublicListing {
  organizationSlug?: string
  organizationName?: string
}

export interface CataloguePageResult {
  items: CatalogueListing[]
  total: number
  page: number
  pages: number
}

export interface ListingFilters {
  city?: string
  type?: ListingType
  bedrooms?: string
  offerType?: ListingOfferType
  minPrice?: string
  maxPrice?: string
  /** Alias d’URL conservés pour les anciennes recherches de loyers. */
  minRent?: string
  maxRent?: string
  currency?: Currency
  page?: number
  limit?: number
}
