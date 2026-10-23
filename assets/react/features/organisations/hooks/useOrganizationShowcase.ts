import { useQuery } from '@tanstack/react-query'
import { publicRequestError } from '../../../services/api/errorMessages'
import { getOrganizationShowcase } from '../services/organizationService'

export function useOrganizationShowcase(slug: string) {
  const query = useQuery({
    queryKey: ['public-organization', slug],
    queryFn: ({ signal }) => getOrganizationShowcase(slug, signal),
    enabled: slug.length > 0,
  })

  const error = query.error
    ? publicRequestError(
        query.error,
        'Cette vitrine n’existe pas ou n’est pas publiée.',
        'Impossible de charger cette vitrine. Vérifiez votre connexion puis réessayez.',
      )
    : null

  return { organization: query.data ?? null, loading: query.isPending, error }
}
