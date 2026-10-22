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
  return (
    <>
      <form className="catalogue-filters" onSubmit={filters.apply}>
        <SelectField label="Type de bien" value={filters.draft.type} onChange={(event) => filters.change('type', event.target.value)}>
          {listingTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </SelectField>
        <TextField label="Chambres minimum" type="number" min="0" step="1" inputMode="numeric" value={filters.draft.bedrooms} onChange={(event) => filters.change('bedrooms', event.target.value)} />
        <SelectField label="Devise" value={filters.draft.currency} onChange={(event) => filters.change('currency', event.target.value as Currency | '')}>
          <option value="">Toutes les devises</option><option value="USD">USD</option><option value="CDF">CDF</option>
        </SelectField>
        <TextField label="Loyer minimum" hint="Choisissez une devise ci-dessus." disabled={!filters.draft.currency} type="text" inputMode="decimal" value={filters.draft.minRent} onChange={(event) => filters.change('minRent', event.target.value)} />
        <TextField label="Loyer maximum" hint="Choisissez une devise ci-dessus." disabled={!filters.draft.currency} type="text" inputMode="decimal" value={filters.draft.maxRent} onChange={(event) => filters.change('maxRent', event.target.value)} />
        <div className="catalogue-filters__actions"><Button type="submit">Rechercher</Button><Button type="button" variant="secondary" onClick={filters.reset}>Effacer</Button></div>
      </form>
      {filters.error && <p className="filter-error" role="alert">{filters.error}</p>}
    </>
  )
}
