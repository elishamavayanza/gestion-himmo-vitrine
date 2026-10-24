import { z, type infer as ZodInfer } from 'zod/mini'

export const PUBLIC_LISTING_TYPES = [
  'apartment', 'house', 'shop', 'office', 'restaurant', 'room',
  'warehouse', 'workshop', 'storage', 'parking', 'other',
] as const

export const publicListingSchema = z.object({
  unitId: z.string().check(z.minLength(1)),
  listingId: z.string().check(z.minLength(1)),
  title: z.string(),
  offerType: z.enum(['rent', 'sale']),
  price: z.string(),
  reference: z.string(),
  type: z.string(),
  floor: z.number(),
  description: z.nullable(z.string()),
  monthlyRent: z.nullable(z.string()),
  currency: z.enum(['USD', 'CDF']),
  surface: z.nullable(z.string()),
  bedrooms: z.nullable(z.number()),
  rooms: z.nullable(z.number()),
  bathrooms: z.nullable(z.number()),
  city: z.string(),
  buildingName: z.string(),
  photos: z.array(z.object({ url: z.string().check(z.minLength(1)), position: z.number().check(z.int()) })),
})

export const listingPageSchema = z.object({
  items: z.array(publicListingSchema),
  total: z.number().check(z.int(), z.nonnegative()),
  page: z.number().check(z.int(), z.positive()),
  pages: z.number().check(z.int(), z.nonnegative()),
})

export const publicOrganizationListingSchema = z.object({
  organizationSlug: z.string().check(z.minLength(1)),
  organizationName: z.string().check(z.minLength(1)),
  listing: publicListingSchema,
})

export const globalListingPageSchema = z.object({
  items: z.array(publicOrganizationListingSchema),
  total: z.number().check(z.int(), z.nonnegative()),
  page: z.number().check(z.int(), z.positive()),
  pages: z.number().check(z.int(), z.nonnegative()),
})

export const organizationShowcaseSchema = z.object({
  name: z.string(),
  logo: z.nullable(z.string().check(z.minLength(1))),
  description: z.nullable(z.string()),
  address: z.nullable(z.string()),
  city: z.nullable(z.string()),
  country: z.nullable(z.string()),
  email: z.string(),
  phone: z.string(),
  availableUnitsCount: z.number().check(z.int(), z.nonnegative()),
})

export type ListingType = (typeof PUBLIC_LISTING_TYPES)[number]
export type ListingOfferType = ZodInfer<typeof publicListingSchema>['offerType']
export type Currency = ZodInfer<typeof publicListingSchema>['currency']

export type PublicListing = ZodInfer<typeof publicListingSchema>
export type ListingPage = ZodInfer<typeof listingPageSchema>
export type PublicOrganizationListing = ZodInfer<typeof publicOrganizationListingSchema>
export type GlobalListingPage = ZodInfer<typeof globalListingPageSchema>
export type OrganizationShowcase = ZodInfer<typeof organizationShowcaseSchema>
