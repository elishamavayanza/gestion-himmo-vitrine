import { useQuery } from '@tanstack/react-query'
import { publicRequestError } from '../../../services/api/errorMessages'
import { getOrganizationListingPreview } from '../services/organizationService'

export function useOrganizationListingPreview(slug: string) {
  const query = useQuery({
    queryKey: ['public-organization-listing-preview', slug],
    queryFn: ({ signal }) => getOrganizationListingPreview(slug, signal),
    enabled: slug.length > 0,
  })

  const error = query.error
    ? publicRequestError(
        query.error,
        'Les annonces de cette agence ne sont pas accessibles.',
        'Impossible de charger les annonces de l’agence. Vérifiez votre connexion puis réessayez.',
      )
    : null

  return { listings: query.data?.items ?? [], loading: query.isPending, error, retry: () => { void query.refetch() } }
}
