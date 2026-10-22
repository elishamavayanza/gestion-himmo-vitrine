import { PublicLayout } from '../components/Navigation/PublicLayout'
import { getApiBaseUrl } from '../services/api/config'

function App() {
  return (
    <PublicLayout>
      <main className="home-page">
        <section className="welcome-panel" aria-labelledby="welcome-title">
          <p className="eyebrow">Vitrine immobilière</p>
          <h1 id="welcome-title">Découvrez les biens publiés sur H‑Immo</h1>
          <p className="welcome-copy">
            Cet espace public présentera le catalogue des biens publiés et permettra aux visiteurs
            de contacter l’organisation concernée.
          </p>
          <div className="setup-note" role="status">
            <span className="setup-indicator" aria-hidden="true" />
            <span>Environnement prêt · API : {getApiBaseUrl()}</span>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}

export default App
