import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/UI/Button'
import { SelectField } from '../../../components/Form/SelectField'
import { TextField } from '../../../components/Form/TextField'
import type { Currency, ListingOfferType } from '../../../services/api/publicShowcase.types'
import { Minus, Plus, Search } from 'lucide-react'
import { HomeCatalogueSection } from '../components'
import { heroSlides, useHeroSlideshow } from '../hooks/useHeroSlideshow'

const decimalPattern = /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/
const toMinorUnits = (value: string) => {
  const [whole, fraction = ''] = value.split('.')
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'))
}

export function HomePage() {
  const [slug, setSlug] = useState('')
  const [city, setCity] = useState('')
  const [offerType, setOfferType] = useState<ListingOfferType | ''>('')
  const [currency, setCurrency] = useState<Currency | ''>('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [searchError, setSearchError] = useState<string | null>(null)
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const navigate = useNavigate()
  const slideshow = useHeroSlideshow()

  function searchListings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSearchError(null)
    const minimum = minPrice.trim()
    const maximum = maxPrice.trim()
    if ((minimum || maximum) && !currency) {
      setSearchError('Choisissez une devise pour rechercher par prix.')
      return
    }
    if ((minimum && !decimalPattern.test(minimum)) || (maximum && !decimalPattern.test(maximum))) {
      setSearchError('Saisissez un prix valide avec au plus deux décimales.')
      return
    }
    if (minimum && maximum && toMinorUnits(minimum) > toMinorUnits(maximum)) {
      setSearchError('Le prix minimum doit être inférieur ou égal au prix maximum.')
      return
    }
    const params = new URLSearchParams()
    if (city.trim()) params.set('city', city.trim())
    if (offerType) params.set('offerType', offerType)
    if (minimum) params.set('minPrice', minimum)
    if (maximum) params.set('maxPrice', maximum)
    if (currency) params.set('currency', currency)
    params.set('page', '1')
    navigate(`/annonces?${params.toString()}`)
  }

  function quickSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (city.trim()) params.set('city', city.trim())
    params.set('page', '1')
    navigate(`/annonces?${params.toString()}`)
  }

  function openShowcase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = slug.trim().toLowerCase()
    if (normalized) navigate(`/organisations/${encodeURIComponent(normalized)}`)
  }

  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="welcome-title">
        <div className="home-hero__slides" aria-hidden="true">
          {heroSlides.map((slide, index) => (
            <img
              key={slide.src}
              className={`home-hero__image${index === slideshow.activeIndex ? ' home-hero__image--active' : ''}${slideshow.failedSlides.includes(index) ? ' home-hero__image--failed' : ''}`}
              src={slide.src}
              alt=""
              fetchPriority={index === 0 ? 'high' : 'auto'}
              loading={index === 0 ? 'eager' : 'lazy'}
              onError={() => slideshow.markSlideFailed(index)}
            />
          ))}
        </div>
        <div className="home-hero__decor" aria-hidden="true" />
        <div className="home-hero__copy">
          <p className="eyebrow">Le logement qui vous ressemble</p>
          <h1 id="welcome-title">Trouvez le lieu qui vous ressemble.</h1>
          <p className="welcome-copy">Explorez les biens proposés par nos agences partenaires et trouvez une maison, un appartement ou un terrain qui correspond à votre projet.</p>
        </div>
        <div className={`showcase-lookup${filtersExpanded ? ' showcase-lookup--expanded' : ''}`}>
          {!filtersExpanded ? (
            <form className="showcase-quick" onSubmit={quickSearch}>
              <Search size={19} aria-hidden="true" />
              <input aria-label="Rechercher par ville" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Rechercher une ville…" autoComplete="address-level2" />
              <button type="button" className="showcase-quick__expand" onClick={() => setFiltersExpanded(true)} aria-label="Afficher tous les filtres" aria-expanded="false" aria-controls="showcase-search-details"><Plus size={21} aria-hidden="true" /></button>
            </form>
          ) : (
            <div id="showcase-search-details" className="showcase-search-details">
              <div className="showcase-search__heading">
                <div><h2>Rechercher un bien</h2><p>Affinez votre recherche par ville, offre et budget.</p></div>
                <button type="button" className="showcase-search__collapse" onClick={() => setFiltersExpanded(false)} aria-label="Réduire les filtres" aria-expanded="true" aria-controls="showcase-search-details"><Minus size={19} aria-hidden="true" /></button>
              </div>
              <form className="showcase-search" onSubmit={searchListings}>
                <div className="showcase-search__fields">
                  <TextField label="Ville" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Ex. Goma, Bukavu…" autoComplete="address-level2" />
                  <SelectField label="Type d’offre" value={offerType} onChange={(event) => setOfferType(event.target.value as ListingOfferType | '')}>
                    <option value="">Location et vente</option><option value="rent">À louer</option><option value="sale">À vendre</option>
                  </SelectField>
                  <TextField label="Prix minimum" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="Sans minimum" type="text" inputMode="decimal" />
                  <TextField label="Prix maximum" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Sans maximum" type="text" inputMode="decimal" />
                  <SelectField label="Devise" value={currency} onChange={(event) => setCurrency(event.target.value as Currency | '')}>
                    <option value="">Toutes les devises</option><option value="USD">USD</option><option value="CDF">CDF</option>
                  </SelectField>
                  <Button type="submit">Rechercher les annonces</Button>
                </div>
                {searchError && <p className="showcase-search__error" role="alert">{searchError}</p>}
              </form>
              <form id="trouver-une-vitrine" className="showcase-code" onSubmit={openShowcase}>
                <div><h3>Vous connaissez une agence ?</h3><p>Ouvrez sa vitrine avec le code public communiqué.</p></div>
                <div className="showcase-code__fields">
                  <TextField label="Code de la vitrine" value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="Ex. immo-plus" required autoComplete="off" />
                  <Button type="submit" variant="secondary">Ouvrir</Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
      <HomeCatalogueSection />
      <section className="home-note"><span className="home-note__icon" aria-hidden="true">⌂</span><div><h2>Des annonces publiées par les agences</h2><p>Les disponibilités et informations affichées sont fournies par H‑Immo et peuvent évoluer. Chaque annonce reste rattachée à l’agence qui la publie.</p></div></section>
    </main>
  )
}
