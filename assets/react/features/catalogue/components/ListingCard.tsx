import { Link } from 'react-router-dom'
import type { PublicListing } from '../types/listing.types'

interface ListingCardProps {
  slug: string
  listing: PublicListing
}

const typeLabels: Record<string, string> = { apartment: 'Appartement', house: 'Maison', shop: 'Boutique', office: 'Bureau', restaurant: 'Restaurant', room: 'Chambre', warehouse: 'Entrepôt', workshop: 'Atelier', storage: 'Espace de stockage', parking: 'Parking', other: 'Autre bien' }

export function ListingCard({ slug, listing }: ListingCardProps) {
  const photo = [...listing.photos].sort((a, b) => a.position - b.position)[0]
  return (
    <article className="listing-card">
      <Link className="listing-card__media" to={`/organisations/${encodeURIComponent(slug)}/annonces/${encodeURIComponent(listing.unitId)}`} aria-label={`Voir ${typeLabels[listing.type] ?? 'le bien'} ${listing.reference}`}>
        {photo ? <img src={photo.url} alt={`${typeLabels[listing.type] ?? 'Bien immobilier'} à ${listing.city}`} loading="lazy" /> : <span className="listing-card__placeholder" aria-hidden="true">H‑Immo</span>}
      </Link>
      <div className="listing-card__content">
        <div className="listing-card__eyebrow">{typeLabels[listing.type] ?? 'Bien immobilier'} · {listing.city}</div>
        <h3><Link to={`/organisations/${encodeURIComponent(slug)}/annonces/${encodeURIComponent(listing.unitId)}`}>{listing.buildingName || listing.reference}</Link></h3>
        <p className="listing-card__features">{[listing.surface ? `${listing.surface} m²` : null, listing.bedrooms !== null ? `${listing.bedrooms} ch.` : null, listing.bathrooms !== null ? `${listing.bathrooms} sdb` : null].filter(Boolean).join(' · ') || 'Détails disponibles sur la fiche'}</p>
        <p className="listing-card__price">{listing.monthlyRent} {listing.currency}<span> / mois</span></p>
      </div>
    </article>
  )
}
