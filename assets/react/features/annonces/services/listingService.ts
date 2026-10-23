import { requestFeedbackData } from '../../../services/api/client'
import { publicListingSchema, type PublicListing } from '../../../services/api/publicShowcase.types'

export async function getPublicListing(slug: string, uuid: string, signal?: AbortSignal): Promise<PublicListing> {
  return requestFeedbackData(
    `public/organizations/${encodeURIComponent(slug)}/listings/${encodeURIComponent(uuid)}`,
    publicListingSchema,
    { signal },
  )
}
