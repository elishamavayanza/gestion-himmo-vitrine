import { requestFeedbackData } from '../../../services/api/client'
import { listingPageSchema, organizationShowcaseSchema, type ListingPage, type OrganizationShowcase } from '../../../services/api/publicShowcase.types'

export async function getOrganizationShowcase(slug: string, signal?: AbortSignal): Promise<OrganizationShowcase> {
  return requestFeedbackData(
    `public/organizations/${encodeURIComponent(slug)}/showcase`,
    organizationShowcaseSchema,
    { signal },
  )
}

export async function getOrganizationListingPreview(slug: string, signal?: AbortSignal): Promise<ListingPage> {
  return requestFeedbackData(
    `public/organizations/${encodeURIComponent(slug)}/listings?page=1&limit=3`,
    listingPageSchema,
    { signal },
  )
}
