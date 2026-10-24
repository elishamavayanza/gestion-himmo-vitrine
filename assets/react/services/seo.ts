import { useEffect } from 'react'

interface PublicSeoOptions {
  title: string
  description: string
  canonicalPath: string
  image?: string | null
  noIndex?: boolean
  structuredData?: Record<string, unknown> | null
}

const SITE_NAME = 'H‑Immo Habitat'
const DEFAULT_IMAGE = '/hero-fallback.svg'

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.append(element)
  }
  element.content = content
}

function setCanonical(url: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!element) {
    element = document.createElement('link')
    element.rel = 'canonical'
    document.head.append(element)
  }
  element.href = url
}

/** Synchronise les métadonnées de chaque route publique après son rendu. */
export function usePublicSeo({ title, description, canonicalPath, image, noIndex = false, structuredData }: PublicSeoOptions) {
  useEffect(() => {
    const canonicalUrl = new URL(canonicalPath, window.location.origin).toString()
    const imageUrl = new URL(image || DEFAULT_IMAGE, window.location.origin).toString()
    const pageTitle = `${title} | ${SITE_NAME}`
    document.title = pageTitle
    document.documentElement.lang = 'fr'
    setMeta('name', 'description', description)
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow')
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:site_name', SITE_NAME)
    setMeta('property', 'og:locale', 'fr_FR')
    setMeta('property', 'og:title', pageTitle)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', canonicalUrl)
    setMeta('property', 'og:image', imageUrl)
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', pageTitle)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', imageUrl)
    setCanonical(canonicalUrl)

    document.getElementById('public-seo-jsonld')?.remove()
    if (structuredData) {
      const script = document.createElement('script')
      script.id = 'public-seo-jsonld'
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(structuredData).replace(/</g, '\\u003c')
      document.head.append(script)
    }
  }, [title, description, canonicalPath, image, noIndex, structuredData])
}
