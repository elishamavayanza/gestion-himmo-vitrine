import { request } from '../../../services/api/client'
import type { PublicListing } from '../../../services/api/publicShowcase.types'

interface Feedback<T> { data: T }

export async function getPublicListing(slug: string, uuid: string): Promise<PublicListing> {
  const response = await request<Feedback<PublicListing>>(
    `public/organizations/${encodeURIComponent(slug)}/listings/${encodeURIComponent(uuid)}`,
  )
  return response.data
}
