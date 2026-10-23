import { useQuery } from '@tanstack/react-query'
import { publicRequestError } from '../../../services/api/errorMessages'
import { getGlobalListings, getOrganizationListings } from '../services/catalogueService'
import type { CataloguePageResult, ListingFilters } from '../types/listing.types'

export function useCatalogue(slug: string, filters: ListingFilters) {
  const query = useQuery({
    queryKey: ['public-listings', slug, filters],
    queryFn: async ({ signal }): Promise<CataloguePageResult> => {
      if (!slug) return getGlobalListings(filters, signal)
      const result = await getOrganizationListings(slug, filters, signal)
      return { ...result, items: result.items }
    },
  })

  const error = query.error
    ? publicRequestError(
        query.error,
        'Cette vitrine ou ses annonces ne sont pas accessibles.',
        'Impossible de charger les annonces. Vérifiez votre connexion puis réessayez.',
      )
    : null

  return {
    result: query.data ?? null,
    loading: query.isPending,
    error,
    retry: () => { void query.refetch() },
  }
}
