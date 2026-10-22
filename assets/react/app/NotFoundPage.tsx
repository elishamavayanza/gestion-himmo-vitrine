import { Link } from 'react-router-dom'
import { EmptyState } from '../components/Feedback/EmptyState'

export function NotFoundPage() {
  return <main className="public-page"><EmptyState title="Page introuvable" description="Cette page n’existe pas ou n’est plus disponible." action={<Link className="ui-button ui-button--primary" to="/">Retour à l’accueil</Link>} /></main>
}
