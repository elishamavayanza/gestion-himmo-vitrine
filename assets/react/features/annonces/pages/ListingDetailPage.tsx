import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { EmptyState } from '../../../components/Feedback/EmptyState'
import { useListingDetail } from '../hooks/useListingDetail'
import { formatPublicListingPrice } from '../../../services/publicListingPresentation'
import { InquiryForm } from '../../demandes/components'

const typeLabels: Record<string, string> = { apartment: 'Appartement', house: 'Maison', shop: 'Boutique', office: 'Bureau', restaurant: 'Restaurant', room: 'Chambre', warehouse: 'Entrepôt', workshop: 'Atelier', storage: 'Espace de stockage', parking: 'Parking', other: 'Autre bien' }

export function ListingDetailPage() {
  const { slug = '', uuid = '' } = useParams()
  const location = useLocation()
  const { listing, loading, error } = useListingDetail(slug, uuid)
  const [failedPhotos, setFailedPhotos] = useState<Set<string>>(() => new Set())
  const requestedReturnTo = (location.state as { returnTo?: unknown } | null)?.returnTo
  const cataloguePath = `/organisations/${encodeURIComponent(slug)}/annonces`
  const returnTo = typeof requestedReturnTo === 'string' && (requestedReturnTo === '/annonces' || requestedReturnTo.startsWith('/annonces?'))
    ? requestedReturnTo
    : typeof requestedReturnTo === 'string' && requestedReturnTo.startsWith(`${cataloguePath}?`)
      ? requestedReturnTo
    : cataloguePath
  if (loading) return <main className="public-page"><p role="status" className="status-message">Chargement de l’annonce…</p></main>
  if (error || !listing) return <main className="public-page"><EmptyState title="Annonce indisponible" description={error ?? 'Cette annonce n’est plus accessible.'} action={<Link className="ui-button ui-button--secondary" to={returnTo}>Retour aux annonces</Link>} /></main>

  const photos = [...listing.photos].sort((a, b) => a.position - b.position)
  return (
    <main className="public-page listing-detail">
      <Link className="back-link" to={returnTo}>← Retour aux annonces</Link>
      <div className="listing-detail__heading"><div><p className="eyebrow">{typeLabels[listing.type] ?? 'Bien immobilier'} · {listing.city}</p><h1>{listing.title || listing.buildingName || listing.reference}</h1><p>Référence {listing.reference}</p></div><p className="listing-detail__price">{formatPublicListingPrice(listing)}</p></div>
      {photos.length > 0 && photos.some((photo) => !failedPhotos.has(photo.url)) ? <div className="listing-gallery">{photos.filter((photo) => !failedPhotos.has(photo.url)).map((photo, index) => <img key={`${photo.position}-${photo.url}`} src={photo.url} alt={`Photo ${index + 1} · ${typeLabels[listing.type] ?? 'Bien immobilier'} à ${listing.city}`} loading="lazy" onError={() => setFailedPhotos((previous) => new Set(previous).add(photo.url))} />)}</div> : <div className="listing-gallery listing-gallery--empty">Photos non disponibles</div>}
      <section className="listing-detail__body"><h2>À propos de ce bien</h2>{listing.description ? <p>{listing.description}</p> : <p>La description de ce bien n’est pas disponible.</p>}<dl className="listing-facts">{listing.surface && <div><dt>Surface</dt><dd>{listing.surface} m²</dd></div>}{listing.bedrooms !== null && <div><dt>Chambres</dt><dd>{listing.bedrooms}</dd></div>}{listing.rooms !== null && <div><dt>Pièces</dt><dd>{listing.rooms}</dd></div>}{listing.bathrooms !== null && <div><dt>Salles de bain</dt><dd>{listing.bathrooms}</dd></div>}<div><dt>Étage</dt><dd>{listing.floor}</dd></div><div><dt>Ville</dt><dd>{listing.city}</dd></div></dl></section><InquiryForm slug={slug} unitUuid={listing.unitId} />
    </main>
  )
}
