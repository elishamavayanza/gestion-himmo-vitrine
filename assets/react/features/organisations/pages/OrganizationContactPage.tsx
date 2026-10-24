import { usePublicSeo } from '../../../services/seo'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '../../../components/Feedback/EmptyState'
import { useOrganizationShowcase } from '../hooks/useOrganizationShowcase'

export function OrganizationContactPage() {
  const { slug = '' } = useParams()
  const { organization, loading, error } = useOrganizationShowcase(slug)
  const organizationPath = `/organisations/${encodeURIComponent(slug)}`
  usePublicSeo({ title: organization ? `Contact ${organization.name}` : 'Contacter une agence', description: organization ? `Coordonnées publiques de ${organization.name}. Contactez l’agence au sujet de ses biens immobiliers.` : 'Contactez une agence immobilière partenaire H‑Immo.', canonicalPath: `${organizationPath}/contact`, noIndex: true })

  if (loading) return <main className="public-page"><p role="status" className="status-message">Chargement des coordonnées…</p></main>
  if (error || !organization) return <main className="public-page"><EmptyState title="Coordonnées indisponibles" description={error ?? 'Cette vitrine n’est pas accessible.'} action={<Link className="ui-button ui-button--secondary" to="/">Retour à l’accueil</Link>} /></main>

  return (
    <main className="public-page organization-contact-page">
      <Link className="back-link" to={organizationPath}>← Retour à l’accueil de l’agence</Link>
      <header className="organization-contact-page__heading"><p className="eyebrow">Contact agence</p><h1>Parlons de votre projet immobilier.</h1><p>Contactez directement {organization.name} pour obtenir des renseignements sur ses biens ou ses services.</p></header>
      <section className="organization-contact-page__card" aria-labelledby="organization-contact-title">
        <div className="organization-contact-page__identity">
          {organization.logo ? <img src={organization.logo} alt={`Logo de ${organization.name}`} /> : <span aria-hidden="true">{organization.name.slice(0, 1)}</span>}
          <div><p className="eyebrow">Votre interlocuteur</p><h2 id="organization-contact-title">{organization.name}</h2><p>{[organization.city, organization.country].filter(Boolean).join(', ')}</p></div>
        </div>
        <div className="organization-contact-page__methods">
          <a href={`mailto:${organization.email}`}><span>Courriel</span><strong>{organization.email}</strong><small>Écrire à l’agence</small></a>
          <a href={`tel:${organization.phone.replace(/[^+\d]/g, '')}`}><span>Téléphone</span><strong>{organization.phone}</strong><small>Appeler l’agence</small></a>
          {organization.address && <div><span>Adresse</span><strong>{organization.address}</strong><small>{[organization.city, organization.country].filter(Boolean).join(', ')}</small></div>}
        </div>
        <div className="organization-contact-page__footer"><p>Vous souhaitez d’abord parcourir les biens disponibles ?</p><Link className="ui-button ui-button--primary" to={`${organizationPath}/annonces`}>Voir les annonces de l’agence</Link></div>
      </section>
    </main>
  )
}
