import { lazy, Suspense } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { queryClient } from './queryClient'
import { PublicLayout } from '../components/Navigation/PublicLayout'
import { HomePage } from '../features/catalogue/pages/HomePage'
const CataloguePage = lazy(() => import('../features/catalogue/pages/CataloguePage').then((module) => ({ default: module.CataloguePage })))
const ListingDetailPage = lazy(() => import('../features/annonces/pages/ListingDetailPage').then((module) => ({ default: module.ListingDetailPage })))
const OrganizationShowcasePage = lazy(() => import('../features/organisations/pages/OrganizationShowcasePage').then((module) => ({ default: module.OrganizationShowcasePage })))
const OrganizationContactPage = lazy(() => import('../features/organisations/pages/OrganizationContactPage').then((module) => ({ default: module.OrganizationContactPage })))
const AboutPage = lazy(() => import('../features/organisations/pages/AboutPage').then((module) => ({ default: module.AboutPage })))
const NotFoundPage = lazy(() => import('./NotFoundPage').then((module) => ({ default: module.NotFoundPage })))

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <PublicLayout>
        <Suspense fallback={<main className="public-page" aria-busy="true"><p role="status" className="status-message">Chargement de la page…</p></main>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/a-propos" element={<AboutPage />} />
          <Route path="/annonces" element={<CataloguePage />} />
          <Route path="/organisations/:slug" element={<OrganizationShowcasePage />} />
          <Route path="/organisations/:slug/contact" element={<OrganizationContactPage />} />
          <Route path="/organisations/:slug/annonces" element={<CataloguePage />} />
          <Route path="/organisations/:slug/annonces/:uuid" element={<ListingDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
        </PublicLayout>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
