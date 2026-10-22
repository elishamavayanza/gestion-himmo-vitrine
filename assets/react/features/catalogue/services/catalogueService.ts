import { request } from '../../../services/api/client'
import type { ListingFilters } from '../types/listing.types'
import type { ListingPage } from '../../../services/api/publicShowcase.types'

interface Feedback<T> { data: T }

export async function getOrganizationListings(slug: string, filters: ListingFilters = {}): Promise<ListingPage> {
  const params = new URLSearchParams()
  if (filters.type) params.set('type', filters.type)
  if (filters.bedrooms) params.set('bedrooms', filters.bedrooms)
  if (filters.currency) params.set('currency', filters.currency)
  if (filters.currency && filters.minRent) params.set('minRent', filters.minRent)
  if (filters.currency && filters.maxRent) params.set('maxRent', filters.maxRent)
  params.set('page', String(filters.page ?? 1))
  params.set('limit', String(filters.limit ?? 12))

  const query = params.toString()
  const response = await request<Feedback<ListingPage>>(
    `public/organizations/${encodeURIComponent(slug)}/listings${query ? `?${query}` : ''}`,
  )
  return response.data
}
