import { useQuery } from '@tanstack/react-query'
import { publicRequestError } from '../../../services/api/errorMessages'
import { getPublicListing } from '../services/listingService'

export function useListingDetail(slug: string, uuid: string) {
  const query = useQuery({
    queryKey: ['public-listing', slug, uuid],
    queryFn: ({ signal }) => getPublicListing(slug, uuid, signal),
    enabled: slug.length > 0 && uuid.length > 0,
  })

  const error = query.error
    ? publicRequestError(
        query.error,
        'Cette annonce n’est plus accessible ou disponible.',
        'Impossible de charger cette annonce. Vérifiez votre connexion puis réessayez.',
      )
    : null

  return { listing: query.data ?? null, loading: query.isPending, error }
}
