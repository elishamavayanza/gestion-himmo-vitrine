import { requestFeedbackData } from '../../../services/api/client'
import { organizationShowcaseSchema, type OrganizationShowcase } from '../../../services/api/publicShowcase.types'

export async function getOrganizationShowcase(slug: string, signal?: AbortSignal): Promise<OrganizationShowcase> {
  return requestFeedbackData(
    `public/organizations/${encodeURIComponent(slug)}/showcase`,
    organizationShowcaseSchema,
    { signal },
  )
}
