import { usePublicSeo } from '../../../services/seo'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../../../components/UI/Button'
import { EmptyState } from '../../../components/Feedback/EmptyState'
import { formatPublicListingPrice } from '../../../services/publicListingPresentation'
import { useOrganizationListingPreview } from '../hooks/useOrganizationListingPreview'
import { useOrganizationHeroSlideshow } from '../hooks/useOrganizationHeroSlideshow'
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
  const heroImages = useMemo(() => {
    const seen = new Set<string>()
    const images: string[] = []
    for (const listing of preview.listings) {
      for (const photo of [...listing.photos].sort((a, b) => a.position - b.position)) {
        if (seen.has(photo.url)) continue
        seen.add(photo.url)
        images.push(photo.url)
        if (images.length === 6) return images
      }
    }
    return images
  }, [preview.listings])
  const slideshow = useOrganizationHeroSlideshow(heroImages)
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
      <section className="organization-showcase-hero" aria-labelledby="organization-title">
        <div className="organization-showcase-hero__slides" aria-hidden="true">
          {heroImages.map((image, index) => !slideshow.failedImages.has(index) && (
            <img key={image} className={`organization-showcase-hero__image${index === slideshow.activeIndex ? ' organization-showcase-hero__image--active' : ''}`} src={image} alt="" loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'} onError={() => slideshow.markImageFailed(index)} />
          ))}
        </div>
        <div className="organization-showcase-hero__decor" aria-hidden="true" />
        <div className="organization-showcase-hero__copy">
          <p className="eyebrow">Vitrine partenaire{organization.city ? ` · ${organization.city}` : ''}</p>
          <h1 id="organization-title">{organization.name}</h1>
          <p className="organization-showcase-hero__description">{organization.description || `Découvrez les biens immobiliers proposés par ${organization.name}${location ? ` à ${location}` : ''}.`}</p>
        </div>
        <aside className="organization-showcase-hero__panel" aria-label="Annonces de l’agence">
          {organization.logo ? <img className="organization-showcase-hero__logo" src={organization.logo} alt="" /> : <span className="organization-showcase-hero__mark" aria-hidden="true">{organization.name.slice(0, 1)}</span>}
          <div><span className="organization-showcase-hero__count">{organization.availableUnitsCount}</span><span className="organization-showcase-hero__count-label">bien{organization.availableUnitsCount === 1 ? '' : 's'} disponible{organization.availableUnitsCount === 1 ? '' : 's'}</span></div>
          <Link className="ui-button ui-button--primary" to={`${organizationPath}/annonces`}>Explorer les annonces</Link>
        </aside>
      </section>

      <div className="organization-home-sections">
      <section className="organization-profile" aria-labelledby="organization-profile-title">
        <div className="organization-profile__intro"><p className="eyebrow">Votre parcours</p><h2 id="organization-profile-title">Trouvez le bien qui vous correspond</h2><p>Parcourez la sélection de l’agence, comparez les informations utiles et contactez-la au sujet d’une annonce précise.</p></div>
        <div className="organization-profile__journey" aria-label="Étapes pour trouver un bien">
          <article><span aria-hidden="true">01</span><h3>Explorez les annonces</h3><p>Parcourez les biens actuellement publiés par l’agence.</p></article>
          <article><span aria-hidden="true">02</span><h3>Comparez les détails</h3><p>Consultez les photos, les prix et les caractéristiques de chaque bien.</p></article>
          <article><span aria-hidden="true">03</span><h3>Demandez une visite</h3><p>Depuis une annonce, envoyez une demande liée au bien qui vous intéresse.</p></article>
        </div>
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
      </div>
    </main>
  )
}
