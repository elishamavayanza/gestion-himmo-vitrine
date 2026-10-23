import { Link } from 'react-router-dom'
import { Button } from '../../../components/UI/Button'
import { EmptyState } from '../../../components/Feedback/EmptyState'
import { useCatalogue } from '../hooks/useCatalogue'
import type { CatalogueListing } from '../types/listing.types'
import { groupCatalogueListings } from '../services/cataloguePresentation'
import { ListingCard } from './ListingCard'

const categories = [
  { label: 'Toutes les annonces', params: '' },
  { label: 'À louer', params: '?offerType=rent' },
  { label: 'À vendre', params: '?offerType=sale' },
  { label: 'Maisons', params: '?type=house' },
  { label: 'Appartements', params: '?type=apartment' },
]

export function HomeCatalogueSection() {
  const { result, loading, error, retry } = useCatalogue('', { page: 1, limit: 8 })

  return (
    <section className="home-catalogue" aria-labelledby="home-catalogue-title">
      <div className="home-catalogue__heading">
        <p className="eyebrow">Annonces publiques</p>
        <h2 id="home-catalogue-title">Les biens disponibles maintenant</h2>
        <p>Découvrez directement les annonces publiées par nos agences partenaires.</p>
      </div>

      <nav className="home-catalogue__categories" aria-label="Parcourir les annonces par catégorie">
        {categories.map(({ label, params }) => (
          <Link key={label} to={`/annonces${params}`}>{label}</Link>
        ))}
      </nav>

      {loading && <p className="status-message" role="status">Chargement des annonces publiques…</p>}
      {error && <EmptyState title="Annonces momentanément indisponibles" description={error} action={<Button onClick={retry}>Réessayer</Button>} />}
      {!loading && !error && result && result.items.length === 0 && (
        <EmptyState title="Aucune annonce disponible pour le moment" description="Les nouvelles annonces publiques apparaîtront ici dès leur publication par une agence partenaire." />
      )}
      {!loading && !error && result && result.items.length > 0 && (
        <>
          <div className="home-catalogue__groups">
            {groupCatalogueListings(result.items).map((group) => (
              <section key={group.id} className="home-catalogue__group" aria-labelledby={`home-catalogue-${group.id}`}>
                <div className="home-catalogue__group-heading">
                  <div>
                    <h3 id={`home-catalogue-${group.id}`}>{group.title}</h3>
                    <p>{group.description}</p>
                  </div>
                  <span>{group.items.length} {group.items.length === 1 ? 'annonce' : 'annonces'}</span>
                </div>
                <div className="listing-grid">
                  {group.items.map((listing: CatalogueListing) => <ListingCard key={listing.unitId} slug="" listing={listing} />)}
                </div>
              </section>
            ))}
          </div>
          {result.total > result.items.length && (
            <div className="home-catalogue__more">
              <Link className="ui-button ui-button--primary" to="/annonces">Voir toutes les annonces</Link>
            </div>
          )}
        </>
      )}
    </section>
  )
}
