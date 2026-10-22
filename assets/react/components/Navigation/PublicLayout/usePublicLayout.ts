import { useMemo } from 'react'

const CURRENT_YEAR = new Date().getFullYear()

export interface PublicLayoutOptions {
  brandName?: string
  brandSuffix?: string
  homeHref?: string
  homeLabel?: string
  footerMessage?: string
}

export function usePublicLayout(options: PublicLayoutOptions = {}) {
  return useMemo(() => ({
    currentYear: CURRENT_YEAR,
    brandName: options.brandName ?? 'H‑Immo',
    brandSuffix: options.brandSuffix ?? 'Vitrine',
    homeHref: options.homeHref ?? '/',
    homeLabel: options.homeLabel ?? 'Accueil',
    footerMessage: options.footerMessage ?? 'Les annonces sont publiées par les organisations sur H‑Immo.',
  }), [
    options.brandName,
    options.brandSuffix,
    options.homeHref,
    options.homeLabel,
    options.footerMessage,
  ])
}
