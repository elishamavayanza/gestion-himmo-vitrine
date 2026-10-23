import type { PublicListing } from './api/publicShowcase.types'

/** Affiche le prix commercial transmis par l’API sans assimiler une vente à un loyer. */
export function formatPublicListingPrice(listing: Pick<PublicListing, 'offerType' | 'price' | 'currency'>): string {
  const qualifier = listing.offerType === 'rent' ? ' / mois' : ' · Prix de vente'
  return `${listing.price} ${listing.currency}${qualifier}`
}
