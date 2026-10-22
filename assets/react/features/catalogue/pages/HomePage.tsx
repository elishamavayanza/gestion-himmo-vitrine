import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/UI/Button'
import { TextField } from '../../../components/Form/TextField'

export function HomePage() {
  const [slug, setSlug] = useState('')
  const navigate = useNavigate()
  function openShowcase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = slug.trim().toLowerCase()
    if (normalized) navigate(`/organisations/${encodeURIComponent(normalized)}`)
  }

  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="welcome-title">
        <img
          className="home-hero__image"
          src="https://images.unsplash.com/photo-1673350474055-e62f5818fcfe?auto=format&fit=crop&w=2200&q=85"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
        />
        <div className="home-hero__copy">
          <p className="eyebrow">Le logement qui vous ressemble</p>
          <h1 id="welcome-title">Le bon lieu pour votre prochain chapitre.</h1>
          <p className="welcome-copy">Découvrez les biens que les agences partenaires ont choisi de publier. Accédez à leur vitrine à l’aide du lien public communiqué par l’organisation.</p>
        </div>
        <form id="trouver-une-vitrine" className="showcase-lookup" onSubmit={openShowcase}>
          <h2>Accéder à une vitrine partenaire</h2>
          <p>Entrez le lien ou le code public communiqué par l’agence.</p>
          <div className="showcase-lookup__fields">
            <TextField label="Code de la vitrine" value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="ex. immo-plus" required autoComplete="off" />
            <Button type="submit">Découvrir</Button>
          </div>
        </form>
      </section>
      <section className="home-note"><span className="home-note__icon" aria-hidden="true">⌂</span><div><h2>Des annonces publiées par les agences</h2><p>Les disponibilités et informations affichées sont fournies par H‑Immo et peuvent évoluer. Chaque annonce reste rattachée à l’agence qui la publie.</p></div></section>
    </main>
  )
}
