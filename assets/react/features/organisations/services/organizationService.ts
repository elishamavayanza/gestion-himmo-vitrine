import { request } from '../../../services/api/client'
import type { OrganizationShowcase } from '../../../services/api/publicShowcase.types'

interface Feedback<T> { data: T }

export async function getOrganizationShowcase(slug: string): Promise<OrganizationShowcase> {
  const response = await request<Feedback<OrganizationShowcase>>(
    `public/organizations/${encodeURIComponent(slug)}/showcase`,
  )
  return response.data
}
