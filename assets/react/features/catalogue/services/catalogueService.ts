import { requestFeedbackData } from '../../../services/api/client.ts'
import type { CataloguePageResult, ListingFilters } from '../types/listing.types'
import { globalListingPageSchema, listingPageSchema, type ListingPage } from '../../../services/api/publicShowcase.types.ts'

export async function getOrganizationListings(slug: string, filters: ListingFilters = {}, signal?: AbortSignal): Promise<ListingPage> {
  const params = new URLSearchParams()
  if (filters.city) params.set('city', filters.city)
  if (filters.type) params.set('type', filters.type)
  if (filters.bedrooms) params.set('bedrooms', filters.bedrooms)
  if (filters.offerType) params.set('offerType', filters.offerType)
  if (filters.currency) params.set('currency', filters.currency)
  if (filters.currency && filters.minPrice) params.set('minPrice', filters.minPrice)
  if (filters.currency && filters.maxPrice) params.set('maxPrice', filters.maxPrice)
  // Une URL partagée avant ce contrat continue à filtrer les loyers.
  if (filters.currency && filters.minRent) params.set('minRent', filters.minRent)
  if (filters.currency && filters.maxRent) params.set('maxRent', filters.maxRent)
  params.set('page', String(filters.page ?? 1))
  params.set('limit', String(filters.limit ?? 12))

  const query = params.toString()
  return requestFeedbackData(
    `public/organizations/${encodeURIComponent(slug)}/listings${query ? `?${query}` : ''}`,
    listingPageSchema,
    { signal },
  )
}

export async function getGlobalListings(filters: ListingFilters = {}, signal?: AbortSignal): Promise<CataloguePageResult> {
  const params = new URLSearchParams()
  if (filters.type) params.set('type', filters.type)
  if (filters.bedrooms) params.set('bedrooms', filters.bedrooms)
  if (filters.offerType) params.set('offerType', filters.offerType)
  if (filters.currency) params.set('currency', filters.currency)
  if (filters.currency && filters.minPrice) params.set('minPrice', filters.minPrice)
  if (filters.currency && filters.maxPrice) params.set('maxPrice', filters.maxPrice)
  params.set('page', String(filters.page ?? 1))
  params.set('limit', String(filters.limit ?? 12))

  const response = await requestFeedbackData(
    `public/listings?${params.toString()}`,
    globalListingPageSchema,
    { signal },
  )
  return {
    ...response,
    items: response.items.map(({ organizationSlug, organizationName, listing }) => ({
      ...listing,
      organizationSlug,
      organizationName,
    })),
  }
}
