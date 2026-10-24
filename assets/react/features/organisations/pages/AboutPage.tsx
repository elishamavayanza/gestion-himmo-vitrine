import { usePublicSeo } from '../../../services/seo'
export function AboutPage() {
  usePublicSeo({ title: 'À propos de H‑Immo Habitat', description: 'Découvrez comment H‑Immo Habitat présente les annonces publiques de ses agences partenaires.', canonicalPath: '/a-propos' })
  return (
    <main className="public-page about-page">
      <header className="page-heading"><p className="eyebrow">À propos</p><h1>Une vitrine commune, des agences indépendantes</h1><p>H‑Immo Vitrine rassemble les annonces que les organisations partenaires choisissent de rendre publiques. Chaque agence reste responsable des biens qu’elle publie.</p></header>
      <section className="about-principles"><article><span aria-hidden="true">01</span><h2>Des annonces choisies</h2><p>Les biens ne sont visibles que lorsque leur organisation les publie et que l’API les considère disponibles.</p></article><article><span aria-hidden="true">02</span><h2>Une information à jour</h2><p>Les annonces et leur disponibilité sont récupérées auprès de H‑Immo. Une annonce retirée ou occupée n’est plus accessible ici.</p></article><article><span aria-hidden="true">03</span><h2>Un contact direct</h2><p>Les coordonnées affichées sur une vitrine sont celles que l’organisation a rendues publiques.</p></article></section>
    </main>
  )
}
