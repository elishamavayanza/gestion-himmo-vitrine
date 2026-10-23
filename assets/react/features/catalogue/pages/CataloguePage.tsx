import { useCallback, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Button } from '../../../components/UI/Button'
import { EmptyState } from '../../../components/Feedback/EmptyState'
import { useCatalogue } from '../hooks/useCatalogue'
import type { ListingFilters } from '../types/listing.types'
import { PUBLIC_LISTING_TYPES, type Currency, type ListingOfferType, type ListingType } from '../../../services/api/publicShowcase.types'
import { CatalogueFilterForm, ListingCard } from '../components'
import type { CatalogueFilterDraft } from '../hooks/useCatalogueFilters'

const validTypes = new Set<string>(PUBLIC_LISTING_TYPES)
const isDecimalAmount = (value: string) => /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(value)

export function CataloguePage() {
  const { slug = '' } = useParams()
  const isGlobalCatalogue = !slug
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo<ListingFilters>(() => {
    const rawPage = Number(searchParams.get('page') || 1)
    const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1
    const rawType = searchParams.get('type') ?? ''
    const rawOfferType = searchParams.get('offerType') ?? ''
    const rawCurrency = searchParams.get('currency') ?? ''
    const city = searchParams.get('city') ?? ''
    const bedrooms = searchParams.get('bedrooms') ?? ''
    const minPrice = searchParams.get('minPrice') ?? searchParams.get('minRent') ?? ''
    const maxPrice = searchParams.get('maxPrice') ?? searchParams.get('maxRent') ?? ''
    const legacyRentFilter = searchParams.has('minRent') || searchParams.has('maxRent')
    return {
      city: city || undefined,
      type: validTypes.has(rawType) ? rawType as ListingType : undefined,
      bedrooms: /^\d+$/.test(bedrooms) ? bedrooms : undefined,
      offerType: ['rent', 'sale'].includes(rawOfferType) ? rawOfferType as ListingOfferType : legacyRentFilter ? 'rent' : undefined,
      minPrice: isDecimalAmount(minPrice) ? minPrice : undefined,
      maxPrice: isDecimalAmount(maxPrice) ? maxPrice : undefined,
      currency: ['USD', 'CDF'].includes(rawCurrency) ? rawCurrency as Currency : undefined,
      page,
      limit: 12,
    }
  }, [searchParams])
  const { result, loading, error, retry } = useCatalogue(slug, filters)

  const applyFilters = useCallback((draft: CatalogueFilterDraft) => {
    const next = new URLSearchParams()
    Object.entries(draft).forEach(([key, value]) => { if (value) next.set(key, value) })
    next.set('page', '1')
    setSearchParams(next)
  }, [setSearchParams])

  const clearFilters = useCallback(() => { setSearchParams({ page: '1' }) }, [setSearchParams])

  return (
    <main className="public-page catalogue-page">
      <header className="page-heading">
        <p className="eyebrow">Catalogue public</p>
        <h1>Trouvez un bien</h1>
        <p>{isGlobalCatalogue ? 'Parcourez les annonces publiques disponibles auprès de toutes les agences partenaires.' : 'Parcourez les biens publiés et disponibles par cette organisation.'}</p>
      </header>
      <CatalogueFilterForm key={searchParams.toString()} initial={filters} onApply={applyFilters} />
      {loading && <p className="status-message" role="status">Chargement des annonces…</p>}
      {error && <EmptyState title="Annonces indisponibles" description={error} action={<Button onClick={retry}>Réessayer</Button>} />}
      {!loading && !error && result && (
        <>
          <div className="catalogue-summary"><p>{result.total} annonce{result.total > 1 ? 's' : ''} disponible{result.total > 1 ? 's' : ''}</p><p>Page {result.page} sur {result.pages}</p></div>
          {result.items.length === 0 ? <EmptyState title="Aucun bien pour ces critères" description="Essayez d’élargir votre recherche ou d’effacer certains filtres." action={<Button variant="secondary" onClick={clearFilters}>Effacer les filtres</Button>} /> : <div className="listing-grid">{result.items.map((listing) => <ListingCard key={listing.unitId} slug={slug} listing={listing} />)}</div>}
          {result.pages > 1 && <nav className="pagination" aria-label="Pagination des annonces"><Button variant="secondary" disabled={result.page <= 1} onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: String(result.page - 1) })}>Précédent</Button><span>Page {result.page} / {result.pages}</span><Button variant="secondary" disabled={result.page >= result.pages} onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: String(result.page + 1) })}>Suivant</Button></nav>}
        </>
      )}
    </main>
  )
}
