import { useCallback, useMemo, useState, type KeyboardEvent } from 'react'
import { useLocation } from 'react-router-dom'

const CURRENT_YEAR = new Date().getFullYear()

export interface PublicLayoutOptions {
  brandName?: string
  brandSuffix?: string
  homeHref?: string
  homeLabel?: string
  footerMessage?: string
}

export function usePublicLayout(options: PublicLayoutOptions = {}) {
  const [openPath, setOpenPath] = useState<string | null>(null)
  const location = useLocation()
  const menuOpen = openPath === location.pathname
  const organizationSlug = useMemo(() => {
    const match = location.pathname.match(/^\/organisations\/([^/]+)/)
    return match ? decodeURIComponent(match[1]) : null
  }, [location.pathname])
  const closeMenu = useCallback(() => setOpenPath(null), [])
  const toggleMenu = useCallback(() => setOpenPath((path) => path === location.pathname ? null : location.pathname), [location.pathname])

  return {
    currentYear: CURRENT_YEAR,
    brandName: options.brandName ?? 'H‑Immo',
    brandSuffix: options.brandSuffix ?? 'Habitat',
    homeHref: options.homeHref ?? '/',
    homeLabel: options.homeLabel ?? 'Accueil',
    footerMessage: options.footerMessage ?? 'Les annonces sont publiées par les organisations sur H‑Immo.',
    organizationSlug,
    menuOpen,
    closeMenu,
    onMenuKeyDown: (event: KeyboardEvent) => { if (event.key === 'Escape') closeMenu() },
    toggleMenu,
  }
}
