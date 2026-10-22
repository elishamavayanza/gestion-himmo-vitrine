import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { queryClient } from './queryClient'
import { PublicLayout } from '../components/Navigation/PublicLayout'
import { CataloguePage } from '../features/catalogue/pages/CataloguePage'
import { HomePage } from '../features/catalogue/pages/HomePage'
import { ListingDetailPage } from '../features/annonces/pages/ListingDetailPage'
import { OrganizationShowcasePage } from '../features/organisations/pages/OrganizationShowcasePage'
import { AboutPage } from '../features/organisations/pages/AboutPage'
import { NotFoundPage } from './NotFoundPage'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <PublicLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/a-propos" element={<AboutPage />} />
          <Route path="/organisations/:slug" element={<OrganizationShowcasePage />} />
          <Route path="/organisations/:slug/annonces" element={<CataloguePage />} />
          <Route path="/organisations/:slug/annonces/:uuid" element={<ListingDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </PublicLayout>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
