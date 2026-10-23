import { z } from 'zod'

export const PUBLIC_LISTING_TYPES = [
  'apartment', 'house', 'shop', 'office', 'restaurant', 'room',
  'warehouse', 'workshop', 'storage', 'parking', 'other',
] as const

export const publicListingSchema = z.object({
  unitId: z.string().min(1),
  listingId: z.string().min(1),
  title: z.string(),
  offerType: z.enum(['rent', 'sale']),
  price: z.string(),
  reference: z.string(),
  type: z.string(),
  floor: z.number(),
  description: z.string().nullable(),
  monthlyRent: z.string().nullable(),
  currency: z.enum(['USD', 'CDF']),
  surface: z.string().nullable(),
  bedrooms: z.number().nullable(),
  rooms: z.number().nullable(),
  bathrooms: z.number().nullable(),
  city: z.string(),
  buildingName: z.string(),
  photos: z.array(z.object({ url: z.string().min(1), position: z.number().int() })),
})

export const listingPageSchema = z.object({
  items: z.array(publicListingSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pages: z.number().int().nonnegative(),
})

export const publicOrganizationListingSchema = z.object({
  organizationSlug: z.string().min(1),
  organizationName: z.string().min(1),
  listing: publicListingSchema,
})

export const globalListingPageSchema = z.object({
  items: z.array(publicOrganizationListingSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pages: z.number().int().nonnegative(),
})

export const organizationShowcaseSchema = z.object({
  name: z.string(),
  logo: z.string().min(1).nullable(),
  description: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  email: z.string(),
  phone: z.string(),
  availableUnitsCount: z.number().int().nonnegative(),
})

export type ListingType = (typeof PUBLIC_LISTING_TYPES)[number]
export type ListingOfferType = z.infer<typeof publicListingSchema>['offerType']
export type Currency = z.infer<typeof publicListingSchema>['currency']

export type PublicListing = z.infer<typeof publicListingSchema>
export type ListingPage = z.infer<typeof listingPageSchema>
export type PublicOrganizationListing = z.infer<typeof publicOrganizationListingSchema>
export type GlobalListingPage = z.infer<typeof globalListingPageSchema>
export type OrganizationShowcase = z.infer<typeof organizationShowcaseSchema>
