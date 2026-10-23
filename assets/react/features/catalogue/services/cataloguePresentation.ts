import type { ListingType } from '../../../services/api/publicShowcase.types'
import type { CatalogueListing } from '../types/listing.types'

export const listingTypeLabels: Record<ListingType, string> = {
  apartment: 'Appartement',
  house: 'Maison',
  shop: 'Boutique',
  office: 'Bureau',
  restaurant: 'Restaurant',
  room: 'Chambre',
  warehouse: 'Entrepôt',
  workshop: 'Atelier',
  storage: 'Espace de stockage',
  parking: 'Parking',
  other: 'Autre bien',
}

export interface CatalogueListingGroup {
  id: 'housing' | 'business' | 'parking' | 'other'
  title: string
  description: string
  items: CatalogueListing[]
}

const groupDefinitions: Array<Omit<CatalogueListingGroup, 'items'> & { types: ListingType[] }> = [
  {
    id: 'housing',
    title: 'Logements',
    description: 'Appartements, maisons et chambres',
    types: ['apartment', 'house', 'room'],
  },
  {
    id: 'business',
    title: 'Locaux et espaces professionnels',
    description: 'Boutiques, bureaux, ateliers et autres espaces d’activité',
    types: ['shop', 'office', 'restaurant', 'workshop', 'warehouse', 'storage'],
  },
  {
    id: 'parking',
    title: 'Stationnement',
    description: 'Places et espaces de stationnement',
    types: ['parking'],
  },
  {
    id: 'other',
    title: 'Autres biens',
    description: 'Autres types d’unités publiées',
    types: ['other'],
  },
]

export function groupCatalogueListings(items: CatalogueListing[]): CatalogueListingGroup[] {
  const knownTypes = new Set(groupDefinitions.flatMap(({ types }) => types))
  return groupDefinitions
    .map(({ types, ...group }) => ({
      ...group,
      items: items.filter((listing) => types.includes(listing.type as ListingType) || (group.id === 'other' && !knownTypes.has(listing.type as ListingType))),
    }))
    .filter((group) => group.items.length > 0)
}
