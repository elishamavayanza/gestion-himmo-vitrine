import { useQuery } from '@tanstack/react-query'
import { publicRequestError } from '../../../services/api/errorMessages'
import { getOrganizationListings } from '../services/catalogueService'
import type { ListingFilters } from '../types/listing.types'

export function useCatalogue(slug: string, filters: ListingFilters) {
  const query = useQuery({
    queryKey: ['public-listings', slug, filters],
    queryFn: () => getOrganizationListings(slug, filters),
    enabled: slug.length > 0,
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
