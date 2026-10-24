import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { CatalogueListing } from '../types/listing.types'
import { formatPublicListingPrice } from '../../../services/publicListingPresentation'
import { listingTypeLabels } from '../services/cataloguePresentation'
import { Bath, BedDouble, MapPin, Ruler } from 'lucide-react'

interface ListingCardProps {
  slug: string
  listing: CatalogueListing
  eager?: boolean
  headingLevel?: 'h2' | 'h3'
}

const residentialTypes = new Set(['apartment', 'house', 'room'])

export function ListingCard({ slug, listing, eager = false, headingLevel = 'h3' }: ListingCardProps) {
  const location = useLocation()
  const [photoFailed, setPhotoFailed] = useState(false)
  const photo = [...listing.photos].sort((a, b) => a.position - b.position)[0]
  const typeLabel = listingTypeLabels[listing.type as keyof typeof listingTypeLabels] ?? 'Bien immobilier'
  const features = [
    listing.surface ? { icon: Ruler, label: `${listing.surface} m²` } : null,
    residentialTypes.has(listing.type) && listing.bedrooms !== null && listing.bedrooms > 0 ? { icon: BedDouble, label: `${listing.bedrooms} ch.` } : null,
    residentialTypes.has(listing.type) && listing.bathrooms !== null && listing.bathrooms > 0 ? { icon: Bath, label: `${listing.bathrooms} sdb` } : null,
  ].filter((feature) => feature !== null)
  const organizationSlug = listing.organizationSlug || slug
  const Heading = headingLevel
  const detailPath = `/organisations/${encodeURIComponent(organizationSlug)}/annonces/${encodeURIComponent(listing.unitId)}`
  const detailState = { returnTo: location.pathname === '/' ? '/annonces' : `${location.pathname}${location.search}` }
  return (
    <article className="listing-card" data-listing-type={listing.type}>
      <Link className="listing-card__media" to={detailPath} state={detailState} aria-label={`Voir ${typeLabel.toLowerCase()} ${listing.reference}`}>
        {photo && !photoFailed ? <img src={photo.url} alt={`${typeLabel} à ${listing.city}`} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} onError={() => setPhotoFailed(true)} /> : <span className="listing-card__placeholder" aria-hidden="true">Photo indisponible</span>}
        <span className={`listing-card__offer listing-card__offer--${listing.offerType}`}>{listing.offerType === 'rent' ? 'À louer' : 'À vendre'}</span>
      </Link>
      <div className="listing-card__content">
        <p className="listing-card__location"><MapPin size={15} aria-hidden="true" /><span>{listing.city}</span><span aria-hidden="true">·</span><span>{typeLabel}</span></p>
        <Heading><Link to={detailPath} state={detailState}>{listing.title || listing.buildingName || listing.reference}</Link></Heading>
        <div className="listing-card__features" aria-label="Caractéristiques du bien">
          {features.length > 0 ? features.map(({ icon: Icon, label }) => <span key={label}><Icon size={16} aria-hidden="true" />{label}</span>) : <span className="listing-card__details-link">Voir les détails du bien</span>}
        </div>
        <p className="listing-card__price">{formatPublicListingPrice(listing)}</p>
        {listing.organizationName && <p className="listing-card__agency"><span>Publié par</span> {listing.organizationName}</p>}
      </div>
    </article>
  )
}
