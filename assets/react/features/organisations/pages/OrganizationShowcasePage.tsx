import { usePublicSeo } from '../../../services/seo'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../../../components/UI/Button'
import { EmptyState } from '../../../components/Feedback/EmptyState'
import { formatPublicListingPrice } from '../../../services/publicListingPresentation'
import { useOrganizationListingPreview } from '../hooks/useOrganizationListingPreview'
import { useOrganizationShowcase } from '../hooks/useOrganizationShowcase'

const organizationTypeLabels: Record<string, string> = {
  apartment: 'Appartement', house: 'Maison', shop: 'Boutique', office: 'Bureau', restaurant: 'Restaurant',
  room: 'Chambre', warehouse: 'Entrepôt', workshop: 'Atelier', storage: 'Espace de stockage', parking: 'Parking', other: 'Autre bien',
}

export function OrganizationShowcasePage() {
  const { slug = '' } = useParams()
  const { organization, loading, error } = useOrganizationShowcase(slug)
  const preview = useOrganizationListingPreview(slug)
  const organizationPath = `/organisations/${encodeURIComponent(slug)}`
  usePublicSeo({
    title: organization?.name ? `Vitrine de ${organization.name}` : 'Vitrine immobilière partenaire',
    description: organization?.description || (organization ? `Découvrez les annonces immobilières publiées par ${organization.name}${organization.city ? ` à ${organization.city}` : ''}.` : 'Découvrez les annonces des agences partenaires H‑Immo.'),
    canonicalPath: organizationPath,
    image: organization?.logo,
    noIndex: loading || Boolean(error) || !organization,
    structuredData: organization ? { '@context': 'https://schema.org', '@type': 'RealEstateAgent', name: organization.name, url: new URL(organizationPath, window.location.origin).toString(), logo: organization.logo || undefined, description: organization.description || undefined, address: { '@type': 'PostalAddress', streetAddress: organization.address || undefined, addressLocality: organization.city || undefined, addressCountry: organization.country || undefined }, email: organization.email, telephone: organization.phone } : null,
  })

  if (loading) return <main className="public-page" aria-busy="true"><p role="status" className="status-message">Chargement de la vitrine…</p></main>
  if (error || !organization) return <main className="public-page"><EmptyState title="Vitrine indisponible" description={error ?? 'Cette vitrine n’est pas accessible.'} action={<Link className="ui-button ui-button--secondary" to="/">Retour à l’accueil</Link>} /></main>

  const location = [organization.city, organization.country].filter(Boolean).join(', ')
  return (
    <main className="public-page organization-page" aria-busy={preview.loading}>
      <section className="organization-hero" aria-labelledby="organization-title">
        {organization.logo ? <img className="organization-hero__logo" src={organization.logo} alt={`Logo de ${organization.name}`} /> : <span className="organization-hero__mark" aria-hidden="true">{organization.name.slice(0, 1)}</span>}
        <div className="organization-hero__identity"><p className="eyebrow">Vitrine partenaire</p><h1 id="organization-title">{organization.name}</h1><p>{location || 'Agence immobilière partenaire H‑Immo'}</p></div>
        <div className="organization-hero__actions"><span>{organization.availableUnitsCount} bien{organization.availableUnitsCount > 1 ? 's' : ''} disponible{organization.availableUnitsCount > 1 ? 's' : ''}</span><Link className="ui-button ui-button--primary" to={`${organizationPath}/annonces`}>Voir les annonces</Link><Link className="organization-hero__contact-link" to={`${organizationPath}/contact`}>Contacter l’agence</Link></div>
      </section>

      <section className="organization-profile" aria-labelledby="organization-profile-title">
        <div className="organization-profile__intro"><p className="eyebrow">L’agence</p><h2 id="organization-profile-title">Votre partenaire immobilier{organization.city ? ` à ${organization.city}` : ''}</h2><p>{organization.description || `Découvrez les biens sélectionnés par ${organization.name} et trouvez une offre qui correspond à votre projet.`}</p></div>
        <dl className="organization-profile__facts">
          <div><dt>Zone d’activité</dt><dd>{location || 'RDC'}</dd></div>
          {organization.address && <div><dt>Adresse</dt><dd>{organization.address}</dd></div>}
          <div><dt>Annonces disponibles</dt><dd>{organization.availableUnitsCount}</dd></div>
        </dl>
      </section>

      <section className="organization-listings" aria-labelledby="organization-listings-title">
        <div className="organization-section-heading"><div><p className="eyebrow">Sélection de l’agence</p><h2 id="organization-listings-title">Les biens disponibles</h2><p>Les annonces publiées par {organization.name}.</p></div><Link className="ui-button ui-button--secondary" to={`${organizationPath}/annonces`}>Parcourir toutes les annonces</Link></div>
        {preview.loading && <p className="status-message" role="status">Chargement des annonces…</p>}
        {preview.error && <EmptyState title="Annonces momentanément indisponibles" description={preview.error} action={<Button variant="secondary" onClick={preview.retry}>Réessayer</Button>} />}
        {!preview.loading && !preview.error && preview.listings.length === 0 && <EmptyState title="Aucun bien disponible pour le moment" description="De nouvelles annonces apparaîtront ici dès leur publication par l’agence." />}
        {!preview.loading && !preview.error && preview.listings.length > 0 && (
          <div className="organization-listings__grid">
            {preview.listings.map((listing) => {
              const photo = [...listing.photos].sort((a, b) => a.position - b.position)[0]
              return (
                <article className="organization-listing" key={listing.unitId}>
                  <Link className="organization-listing__media" to={`${organizationPath}/annonces/${encodeURIComponent(listing.unitId)}`} aria-label={`Voir ${listing.title}`}>
                    {photo ? <img src={photo.url} alt="" loading="lazy" /> : <span className="organization-listing__placeholder" aria-hidden="true">⌂</span>}
                    <span className="organization-listing__offer">{listing.offerType === 'rent' ? 'À louer' : 'À vendre'}</span>
                  </Link>
                  <div className="organization-listing__content"><p className="eyebrow">{organizationTypeLabels[listing.type] ?? 'Bien immobilier'} · {listing.city}</p><h3><Link to={`${organizationPath}/annonces/${encodeURIComponent(listing.unitId)}`}>{listing.title || listing.buildingName}</Link></h3><p className="organization-listing__facts">{listing.surface ? `${listing.surface} m²` : null}{listing.bedrooms ? ` · ${listing.bedrooms} ch.` : null}{listing.bathrooms ? ` · ${listing.bathrooms} sdb` : null}</p><p className="organization-listing__price">{formatPublicListingPrice(listing)}</p></div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
