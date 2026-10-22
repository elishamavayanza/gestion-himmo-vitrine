import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '../../../components/Feedback/EmptyState'
import { useOrganizationShowcase } from '../hooks/useOrganizationShowcase'

export function OrganizationShowcasePage() {
  const { slug = '' } = useParams()
  const { organization, loading, error } = useOrganizationShowcase(slug)
  if (loading) return <main className="public-page"><p role="status" className="status-message">Chargement de la vitrine…</p></main>
  if (error || !organization) return <main className="public-page"><EmptyState title="Vitrine indisponible" description={error ?? 'Cette vitrine n’est pas accessible.'} action={<Link className="ui-button ui-button--secondary" to="/">Retour à l’accueil</Link>} /></main>

  return (
    <main className="public-page organization-page">
      <section className="organization-hero">
        {organization.logo ? <img className="organization-hero__logo" src={organization.logo} alt={`Logo de ${organization.name}`} /> : <span className="organization-hero__mark" aria-hidden="true">{organization.name.slice(0, 1)}</span>}
        <div><p className="eyebrow">Vitrine partenaire</p><h1>{organization.name}</h1><p>{[organization.city, organization.country].filter(Boolean).join(', ') || 'Annonces immobilières publiées sur H‑Immo'}</p></div>
        <div className="organization-hero__actions"><span>{organization.availableUnitsCount} bien{organization.availableUnitsCount > 1 ? 's' : ''} disponible{organization.availableUnitsCount > 1 ? 's' : ''}</span><Link className="ui-button ui-button--primary" to={`/organisations/${encodeURIComponent(slug)}/annonces`}>Voir les annonces</Link></div>
      </section>
      {organization.description && <section className="organization-description"><h2>À propos de l’agence</h2><p>{organization.description}</p></section>}
      <section id="contact" className="organization-contact"><div><h2>Contacter l’agence</h2><p>Pour toute question sur un bien, contactez directement l’organisation.</p></div><div className="organization-contact__actions"><a href={`mailto:${organization.email}`}>{organization.email}</a><a href={`tel:${organization.phone.replace(/[^+\d]/g, '')}`}>{organization.phone}</a></div></section>
      {organization.availableUnitsCount === 0 && <EmptyState title="Aucun bien disponible pour le moment" description="Revenez plus tard pour découvrir les nouvelles annonces de cette agence." />}
    </main>
  )
}
