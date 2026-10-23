import { useState } from 'react'
import { Minus, Plus, Search } from 'lucide-react'
import { Button } from '../../../components/UI/Button'
import { SelectField } from '../../../components/Form/SelectField'
import { TextField } from '../../../components/Form/TextField'
import { useCatalogueFilters, type CatalogueFilterDraft } from '../hooks/useCatalogueFilters'
import { PUBLIC_LISTING_TYPES, type Currency, type ListingType } from '../../../services/api/publicShowcase.types'
import type { ListingFilters } from '../types/listing.types'

const listingTypeLabels: Record<ListingType, string> = {
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
  other: 'Autre',
}

const listingTypes: Array<{ value: ListingType | ''; label: string }> = [
  { value: '', label: 'Tous les types' },
  ...PUBLIC_LISTING_TYPES.map((value) => ({ value, label: listingTypeLabels[value] })),
]

interface CatalogueFilterFormProps {
  initial: ListingFilters
  onApply: (filters: CatalogueFilterDraft) => void
}

export function CatalogueFilterForm({ initial, onApply }: CatalogueFilterFormProps) {
  const filters = useCatalogueFilters(initial, onApply)
  const [filtersExpanded, setFiltersExpanded] = useState(Boolean(initial.type || initial.offerType || initial.bedrooms || initial.minPrice || initial.maxPrice || initial.currency))
  const [advancedOpen, setAdvancedOpen] = useState(Boolean(initial.bedrooms || initial.minPrice || initial.maxPrice || initial.currency))
  return (
    <>
      <form className={`catalogue-filters${filtersExpanded ? ' catalogue-filters--expanded' : ' catalogue-filters--collapsed'}`} onSubmit={filters.apply}>
        <div className="catalogue-filters__quick">
          <Search size={19} aria-hidden="true" />
          <input aria-label="Rechercher par ville" placeholder="Rechercher une ville…" autoComplete="address-level2" value={filters.draft.city} onChange={(event) => filters.change('city', event.target.value)} />
          <button type="button" className="catalogue-filters__expand" onClick={() => setFiltersExpanded((expanded) => !expanded)} aria-label={filtersExpanded ? 'Réduire les filtres' : 'Afficher tous les filtres'} aria-expanded={filtersExpanded} aria-controls="catalogue-filter-details">{filtersExpanded ? <Minus size={20} aria-hidden="true" /> : <Plus size={21} aria-hidden="true" />}</button>
        </div>
        <div id="catalogue-filter-details" className="catalogue-filters__details" hidden={!filtersExpanded}>
          <SelectField label="Type de bien" value={filters.draft.type} onChange={(event) => filters.change('type', event.target.value)}>
            {listingTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </SelectField>
          <SelectField label="Offre" value={filters.draft.offerType} onChange={(event) => filters.change('offerType', event.target.value)}>
            <option value="">Location et vente</option><option value="rent">Location</option><option value="sale">Vente</option>
          </SelectField>
          <details className="catalogue-filters__advanced" open={advancedOpen} onToggle={(event) => setAdvancedOpen(event.currentTarget.open)}>
            <summary>Plus de filtres (chambres et budget)</summary>
            <div className="catalogue-filters__advanced-fields">
              <TextField label="Chambres minimum" type="number" min="0" step="1" inputMode="numeric" value={filters.draft.bedrooms} onChange={(event) => filters.change('bedrooms', event.target.value)} />
              <SelectField label="Devise" value={filters.draft.currency} onChange={(event) => filters.change('currency', event.target.value as Currency | '')}>
                <option value="">Toutes les devises</option><option value="USD">USD</option><option value="CDF">CDF</option>
              </SelectField>
              <TextField label={filters.draft.offerType === 'rent' ? 'Loyer minimum' : filters.draft.offerType === 'sale' ? 'Prix de vente minimum' : 'Prix minimum'} hint="Choisissez une devise ci-dessus." disabled={!filters.draft.currency} type="text" inputMode="decimal" value={filters.draft.minPrice} onChange={(event) => filters.change('minPrice', event.target.value)} />
              <TextField label={filters.draft.offerType === 'rent' ? 'Loyer maximum' : filters.draft.offerType === 'sale' ? 'Prix de vente maximum' : 'Prix maximum'} hint="Choisissez une devise ci-dessus." disabled={!filters.draft.currency} type="text" inputMode="decimal" value={filters.draft.maxPrice} onChange={(event) => filters.change('maxPrice', event.target.value)} />
            </div>
          </details>
          <div className="catalogue-filters__actions"><Button type="submit">Rechercher</Button><Button type="button" variant="secondary" onClick={filters.reset}>Effacer</Button></div>
        </div>
      </form>
      {filters.error && <p className="filter-error" role="alert">{filters.error}</p>}
    </>
  )
}
