export const PUBLIC_LISTING_TYPES = [
  'apartment', 'house', 'shop', 'office', 'restaurant', 'room',
  'warehouse', 'workshop', 'storage', 'parking', 'other',
] as const

export type ListingType = (typeof PUBLIC_LISTING_TYPES)[number]
export type Currency = 'USD' | 'CDF'

export interface PublicListing {
  unitId: string
  reference: string
  type: string
  floor: number
  description: string | null
  monthlyRent: string
  currency: Currency
  surface: string | null
  bedrooms: number | null
  rooms: number | null
  bathrooms: number | null
  city: string
  buildingName: string
  photos: Array<{ url: string; position: number }>
}

export interface ListingPage {
  items: PublicListing[]
  total: number
  page: number
  pages: number
}

export interface OrganizationShowcase {
  name: string
  logo: string | null
  description: string | null
  address: string | null
  city: string | null
  country: string | null
  email: string
  phone: string
  availableUnitsCount: number
}
