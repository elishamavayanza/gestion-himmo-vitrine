import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import { resolve, sep } from 'node:path'
import { Readable } from 'node:stream'

const dist = resolve('dist')
const siteUrl = new URL(required('PUBLIC_SITE_URL'))
const apiBase = new URL(required('PUBLIC_API_BASE_URL').replace(/\/$/, '') + '/')
const port = Number(process.env.PORT || 4173)
const cache = new Map()
const compressedAssetCache = new Map()
const cacheMs = 20_000
let sitemapEntryCache = null
let sitemapEntryCacheAt = 0

function required(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} est obligatoire pour lancer le serveur de production.`)
  return value
}

if (siteUrl.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(siteUrl.hostname)) throw new Error('PUBLIC_SITE_URL doit utiliser HTTPS en production.')
if (apiBase.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(apiBase.hostname)) throw new Error('PUBLIC_API_BASE_URL doit utiliser HTTPS en production.')

const indexHtml = await readFile(resolve(dist, 'index.html'), 'utf8')

function htmlEscape(value = '') {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')
}

function absoluteApiMedia(path) {
  try {
    const url = new URL(path, apiBase.origin)
    if (!['http:', 'https:'].includes(url.protocol)) return ''
    if (url.origin === apiBase.origin && url.pathname.startsWith('/uploads/')) {
      return new URL(`${url.pathname}${url.search}`, siteUrl).toString()
    }
    return url.toString()
  } catch {
    return ''
  }
}

function cached(key, fetcher) {
  const hit = cache.get(key)
  if (hit && hit.expiresAt > Date.now()) return hit.value
  const value = Promise.resolve().then(fetcher)
  cache.set(key, { value, expiresAt: Date.now() + cacheMs })
  value.catch(() => { if (cache.get(key)?.value === value) cache.delete(key) })
  return value
}

async function api(path) {
  const target = new URL(path.replace(/^\/+/, ''), apiBase)
  let response
  try {
    response = await fetch(target, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(5000) })
  } catch {
    throw Object.assign(new Error('API indisponible'), { status: 503 })
  }
  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload || !Object.hasOwn(payload, 'data')) {
    throw Object.assign(new Error('API indisponible'), { status: response.status === 404 ? 404 : 503 })
  }
  return payload.data
}

function seoDocument({ title, description, canonicalPath, image, preloadImage, preloadImageSrcSet, noIndex = false, structuredData = null, fallback }) {
  const canonical = new URL(canonicalPath, siteUrl).toString()
  const shareImage = image ? absoluteApiMedia(image) || new URL('/hero-fallback.svg', siteUrl).toString() : new URL('/hero-fallback.svg', siteUrl).toString()
  const pageTitle = `${title} | H‑Immo Habitat`
  const safeJsonLd = structuredData ? JSON.stringify(structuredData).replaceAll('<', '\\u003c') : ''
  const preload = preloadImage ? `<link rel="preload" as="image" href="${htmlEscape(preloadImage)}" imagesrcset="${htmlEscape(preloadImageSrcSet || preloadImage)}" imagesizes="100vw" fetchpriority="high">` : ''
  const tags = [
    preload,
    `<meta name="description" content="${htmlEscape(description)}">`,
    `<meta name="robots" content="${noIndex ? 'noindex, nofollow' : 'index, follow'}">`,
    `<link rel="canonical" href="${htmlEscape(canonical)}">`,
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="H‑Immo Habitat">',
    '<meta property="og:locale" content="fr_FR">',
    `<meta property="og:title" content="${htmlEscape(pageTitle)}">`,
    `<meta property="og:description" content="${htmlEscape(description)}">`,
    `<meta property="og:url" content="${htmlEscape(canonical)}">`,
    `<meta property="og:image" content="${htmlEscape(shareImage)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
  ].join('\n    ')
  let document = indexHtml.replace(/<title>[^<]*<\/title>/, `<title>${htmlEscape(pageTitle)}</title>`)
  document = document.replace('</head>', `    ${tags}\n    ${safeJsonLd ? `<script id="public-seo-jsonld" type="application/ld+json">${safeJsonLd}</script>` : ''}\n    <script>document.documentElement.classList.add('js')</script>\n  </head>`)
  document = document.replace('<div id="root"></div>', `<div id="public-seo-fallback">${fallback}</div><div id="root"></div>`)
  document = document.replace('</head>', '<style>.js #public-seo-fallback{display:none}</style></head>')
  return document
}

function fallbackFrame(content) {
  return `<header><a href="/">H‑Immo Habitat</a> · <a href="/annonces">Voir les annonces</a></header>${content}`
}

function listingCards(items, organizationSlug = '') {
  return items.map((item) => {
    const organization = organizationSlug ? null : item.organizationSlug
    const listing = item.listing ?? item
    const slug = organizationSlug || organization
    const href = `/organisations/${encodeURIComponent(slug)}/annonces/${encodeURIComponent(listing.unitId)}`
    const photo = [...(listing.photos ?? [])].sort((a, b) => a.position - b.position)[0]
    const image = photo ? `<img src="${htmlEscape(absoluteApiMedia(photo.url))}" alt="Photo de ${htmlEscape(listing.title || listing.type)} à ${htmlEscape(listing.city)}">` : ''
    const label = listing.offerType === 'rent' ? 'À louer' : 'À vendre'
    return `<article><a href="${href}">${image}<span>${label}</span><h2>${htmlEscape(listing.title || listing.buildingName || 'Bien immobilier')}</h2></a><p>${htmlEscape(listing.city)} · ${htmlEscape(listing.type)}</p><p>${htmlEscape(listing.price)} ${htmlEscape(listing.currency)}${listing.offerType === 'rent' ? ' / mois' : ''}</p></article>`
  }).join('\n')
}

function listingSchema(listing, slug, uuid) {
  const url = new URL(`/organisations/${encodeURIComponent(slug)}/annonces/${encodeURIComponent(uuid)}`, siteUrl).toString()
  const type = listing.type === 'apartment' ? 'Apartment' : listing.type === 'house' ? 'House' : 'Place'
  return {
    '@context': 'https://schema.org', '@type': 'RealEstateListing', name: listing.title || listing.buildingName,
    description: listing.description || undefined, url, image: (listing.photos ?? []).map((photo) => absoluteApiMedia(photo.url)).filter(Boolean),
    offers: { '@type': 'Offer', price: listing.price, priceCurrency: listing.currency, availability: 'https://schema.org/InStock', url, businessFunction: listing.offerType === 'rent' ? 'http://purl.org/goodrelations/v1#LeaseOut' : 'http://purl.org/goodrelations/v1#Sell' },
    about: { '@type': type, name: listing.buildingName || listing.title, address: { '@type': 'PostalAddress', addressLocality: listing.city }, floorSize: listing.surface ? { '@type': 'QuantitativeValue', value: listing.surface, unitCode: 'MTK' } : undefined, numberOfRooms: listing.rooms ?? undefined, numberOfBedrooms: listing.bedrooms ?? undefined, numberOfBathroomsTotal: listing.bathrooms ?? undefined },
  }
}

async function pageFor(pathname, query) {
  if (pathname === '/') {
    const result = await cached('global-listings', () => api('public/listings?page=1&limit=12'))
    const cards = listingCards(result.items ?? [])
    const fallback = fallbackFrame(`<main><p>Annonces publiques</p><h1>Les biens disponibles maintenant</h1><p>Découvrez les annonces publiées par nos agences partenaires.</p><nav><a href="/annonces">Toutes les annonces</a></nav><section>${cards || '<p>Aucun bien disponible pour le moment.</p>'}</section></main>`)
    const heroImage = 'https://images.unsplash.com/photo-1673350474055-e62f5818fcfe?auto=format&fit=crop&w=1800&q=75'
    const heroImageSrcSet = `${heroImage.replace('w=1800', 'w=720')} 720w, ${heroImage.replace('w=1800', 'w=1200')} 1200w, ${heroImage} 1800w`
    return seoDocument({ title: 'Annonces immobilières disponibles', description: 'Découvrez les maisons, appartements, terrains et locaux publiés par les agences partenaires H‑Immo.', canonicalPath: '/', preloadImage: heroImage, preloadImageSrcSet: heroImageSrcSet, structuredData: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'H‑Immo Habitat', url: siteUrl.toString(), inLanguage: 'fr' }, fallback })
  }
  if (pathname === '/a-propos') {
    return seoDocument({ title: 'À propos de H‑Immo Habitat', description: 'Découvrez comment H‑Immo Habitat présente les annonces publiques de ses agences partenaires.', canonicalPath: pathname, fallback: fallbackFrame('<main><h1>Une vitrine commune, des agences indépendantes</h1><p>H‑Immo Vitrine rassemble les annonces que les organisations partenaires choisissent de rendre publiques. Chaque agence reste responsable des biens qu’elle publie.</p></main>') })
  }
  if (pathname === '/annonces') {
    const result = await cached('global-listings', () => api('public/listings?page=1&limit=12'))
    return seoDocument({ title: 'Toutes les annonces immobilières', description: 'Parcourez les annonces immobilières publiées et disponibles auprès des agences partenaires H‑Immo.', canonicalPath: pathname, noIndex: query.size > 0, fallback: fallbackFrame(`<main><h1>Trouvez un bien immobilier</h1><p>${Number(result.total) || 0} annonces publiques disponibles.</p><section>${listingCards(result.items ?? []) || '<p>Aucun bien disponible.</p>'}</section></main>`) })
  }

  const organizationRoute = pathname.match(/^\/organisations\/([^/]+)(?:\/(contact|annonces)(?:\/([^/]+))?)?$/)
  if (!organizationRoute) return null
  let slug
  try { slug = decodeURIComponent(organizationRoute[1]) } catch { return null }
  const section = organizationRoute[2] ?? ''
  const uuid = organizationRoute[3] ?? ''
  const orgPath = `/organisations/${encodeURIComponent(slug)}`
  const org = await cached(`showcase:${slug}`, () => api(`public/organizations/${encodeURIComponent(slug)}/showcase`))

  if (section === 'contact') {
    return seoDocument({ title: `Contacter ${org.name}`, description: `Coordonnées publiques de ${org.name}. Contactez l’agence au sujet de ses biens immobiliers.`, canonicalPath: `${orgPath}/contact`, noIndex: true, fallback: fallbackFrame(`<main><p>Contact agence</p><h1>Parlons de votre projet immobilier.</h1><h2>${htmlEscape(org.name)}</h2><p>${htmlEscape([org.city, org.country].filter(Boolean).join(', '))}</p><p><a href="mailto:${htmlEscape(org.email)}">${htmlEscape(org.email)}</a></p><p><a href="tel:${htmlEscape(org.phone)}">${htmlEscape(org.phone)}</a></p><a href="${orgPath}/annonces">Voir les annonces</a></main>`) })
  }

  if (!section) {
    const description = org.description || `Découvrez les annonces immobilières publiées par ${org.name}${org.city ? ` à ${org.city}` : ''}.`
    return seoDocument({ title: `Vitrine de ${org.name}`, description, canonicalPath: orgPath, image: org.logo, structuredData: { '@context': 'https://schema.org', '@type': 'RealEstateAgent', name: org.name, url: new URL(orgPath, siteUrl).toString(), logo: org.logo ? absoluteApiMedia(org.logo) : undefined, description: org.description || undefined, address: { '@type': 'PostalAddress', streetAddress: org.address || undefined, addressLocality: org.city || undefined, addressCountry: org.country || undefined }, email: org.email, telephone: org.phone }, fallback: fallbackFrame(`<main><p>Vitrine partenaire</p><h1>${htmlEscape(org.name)}</h1><p>${htmlEscape([org.city, org.country].filter(Boolean).join(', '))}</p><p>${htmlEscape(description)}</p><p>${Number(org.availableUnitsCount) || 0} biens disponibles</p><a href="${orgPath}/annonces">Voir les annonces de l’agence</a></main>`) })
  }

  if (section === 'annonces' && uuid) {
    const listing = await cached(`listing:${slug}:${uuid}`, () => api(`public/organizations/${encodeURIComponent(slug)}/listings/${encodeURIComponent(uuid)}`))
    const photo = [...(listing.photos ?? [])].sort((a, b) => a.position - b.position)[0]
    const photoHtml = photo ? `<img src="${htmlEscape(absoluteApiMedia(photo.url))}" alt="Photo de ${htmlEscape(listing.title || listing.type)} à ${htmlEscape(listing.city)}">` : ''
    const description = listing.description || `${listing.type} à ${listing.city}${listing.surface ? `, ${listing.surface} m²` : ''}. Contactez l’agence sur H‑Immo Habitat.`
    const facts = [listing.surface ? `<li>Surface : ${htmlEscape(listing.surface)} m²</li>` : '', listing.rooms !== null ? `<li>Pièces : ${htmlEscape(listing.rooms)}</li>` : '', listing.bedrooms !== null ? `<li>Chambres : ${htmlEscape(listing.bedrooms)}</li>` : '', listing.bathrooms !== null ? `<li>Salles de bain : ${htmlEscape(listing.bathrooms)}</li>` : ''].join('')
    const fallback = fallbackFrame(`<main><a href="${orgPath}/annonces">← Retour aux annonces</a><p>${htmlEscape(listing.type)} · ${htmlEscape(listing.city)}</p><h1>${htmlEscape(listing.title || listing.buildingName || listing.reference)}</h1><p>Référence ${htmlEscape(listing.reference)}</p><p><strong>${htmlEscape(listing.price)} ${htmlEscape(listing.currency)}${listing.offerType === 'rent' ? ' / mois' : ''}</strong></p>${photoHtml}<section><h2>À propos de ce bien</h2><p>${htmlEscape(description)}</p><ul>${facts}</ul></section><p>Contactez ${htmlEscape(org.name)} au sujet de cette annonce.</p><a href="${orgPath}/contact">Contacter l’agence</a></main>`)
    return seoDocument({ title: listing.title || listing.buildingName || 'Annonce immobilière', description: description.slice(0, 300), canonicalPath: `${orgPath}/annonces/${encodeURIComponent(uuid)}`, image: photo?.url, structuredData: listingSchema(listing, slug, uuid), fallback })
  }

  if (section === 'annonces') {
    const result = await cached(`org-listings:${slug}`, () => api(`public/organizations/${encodeURIComponent(slug)}/listings?page=1&limit=12`))
    return seoDocument({ title: `Annonces de ${org.name}`, description: `Consultez les biens publiés et disponibles par ${org.name} sur H‑Immo Habitat.`, canonicalPath: `${orgPath}/annonces`, noIndex: query.size > 0, fallback: fallbackFrame(`<main><h1>Annonces de ${htmlEscape(org.name)}</h1><p>${Number(result.total) || 0} biens disponibles.</p><section>${listingCards(result.items ?? [], slug) || '<p>Aucun bien disponible pour le moment.</p>'}</section></main>`) })
  }

  return null
}

async function fetchAllPages(path, limit = 100) {
  const all = []
  let page = 1
  let pages = 1
  do {
    const result = await api(`${path}?page=${page}&limit=${limit}`)
    if (!Array.isArray(result.items)) throw Object.assign(new Error('Réponse paginée incorrecte'), { status: 503 })
    all.push(...result.items)
    pages = Number.isSafeInteger(result.pages) ? result.pages : 1
    page++
    if (all.length > 50_000) throw Object.assign(new Error('Sitemap trop volumineuse'), { status: 503 })
  } while (page <= pages)
  return all
}

async function sitemap() {
  if (sitemapEntryCache && Date.now() - sitemapEntryCacheAt < 60_000) return sitemapEntryCache
  const [listings, organizations] = await Promise.all([
    fetchAllPages('public/listings'),
    fetchAllPages('public/organizations'),
  ])
  const urls = new Set([new URL('/', siteUrl).toString(), new URL('/a-propos', siteUrl).toString(), new URL('/annonces', siteUrl).toString()])
  for (const item of listings) {
    if (item?.organizationSlug && item?.listing?.unitId) urls.add(new URL(`/organisations/${encodeURIComponent(item.organizationSlug)}/annonces/${encodeURIComponent(item.listing.unitId)}`, siteUrl).toString())
  }
  for (const slug of organizations) if (typeof slug === 'string' && slug) urls.add(new URL(`/organisations/${encodeURIComponent(slug)}`, siteUrl).toString())
  sitemapEntryCache = [...urls].map((url) => `  <url><loc>${htmlEscape(url)}</loc></url>`).join('\n')
  sitemapEntryCacheAt = Date.now()
  return sitemapEntryCache
}

async function serveProxy(request, response, url) {
  const apiRequest = url.pathname.startsWith('/api/public/')
  const mediaRequest = url.pathname.startsWith('/uploads/')
  if (!apiRequest && !mediaRequest) return false
  if (!['GET', 'POST', 'HEAD'].includes(request.method || 'GET')) { response.writeHead(405).end(); return true }
  const target = apiRequest
    ? new URL(url.pathname.replace(/^\/api\//, '') + url.search, apiBase)
    : new URL(url.pathname + url.search, apiBase.origin)
  const headers = {}
  for (const name of ['accept', 'content-type', 'idempotency-key']) if (request.headers[name]) headers[name] = request.headers[name]
  try {
    const upstream = await fetch(target, { method: request.method, headers, body: ['GET', 'HEAD'].includes(request.method || '') ? undefined : await readBody(request), signal: AbortSignal.timeout(15_000) })
    const immutablePublicImage = /^\/uploads\/(?:units|organizations)\//.test(url.pathname)
    response.writeHead(upstream.status, {
      'Content-Type': upstream.headers.get('content-type') || 'application/octet-stream',
      // Les chemins users restent non stockés. Seules les photos et marques liées à l’offre publique ont une URL immuable.
      'Cache-Control': immutablePublicImage ? 'private, max-age=2592000, immutable' : upstream.headers.get('cache-control') || 'no-store',
    })
    if (!upstream.body || request.method === 'HEAD') response.end()
    else Readable.fromWeb(upstream.body).pipe(response)
  } catch {
    response.writeHead(503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }).end(JSON.stringify({ message: 'Service temporairement indisponible.' }))
  }
  return true
}

async function readBody(request) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > 32_768) throw Object.assign(new Error('Payload too large'), { status: 413 })
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', siteUrl)
  try {
    if (await serveProxy(request, response, url)) return
    if (url.pathname === '/robots.txt') {
      response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=60' }).end(`User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml', siteUrl)}\n`)
      return
    }
    if (url.pathname === '/sitemap.xml') {
      const entries = await sitemap()
      response.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=60' }).end(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`)
      return
    }
    if (url.pathname.startsWith('/assets/') || ['/favicon.svg', '/hero-fallback.svg'].includes(url.pathname)) {
      const file = resolve(dist, `.${decodeURIComponent(url.pathname)}`)
      if (!file.startsWith(`${dist}${sep}`)) { response.writeHead(404).end(); return }
      const info = await stat(file).catch(() => null)
      if (!info?.isFile()) { response.writeHead(404).end(); return }
      const type = file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.svg') ? 'image/svg+xml' : 'application/octet-stream'
      const compressible = ['text/javascript', 'text/css', 'image/svg+xml'].includes(type)
      const acceptsGzip = /\bgzip\b/i.test(request.headers['accept-encoding'] || '') && !/\bgzip\s*;\s*q=0(?:\.0*)?(?:\s*,|\s*$)/i.test(request.headers['accept-encoding'] || '')
      const headers = { 'Content-Type': `${type}; charset=utf-8`, 'Cache-Control': 'public, max-age=31536000, immutable', ...(compressible ? { Vary: 'Accept-Encoding' } : {}) }
      let body
      if (compressible && acceptsGzip) {
        const cachedAsset = compressedAssetCache.get(file)
        if (cachedAsset?.mtimeMs === info.mtimeMs && cachedAsset.size === info.size) body = cachedAsset.body
        else {
          body = gzipSync(await readFile(file), { level: 6 })
          compressedAssetCache.set(file, { mtimeMs: info.mtimeMs, size: info.size, body })
        }
        headers['Content-Encoding'] = 'gzip'
        headers['Content-Length'] = String(body.length)
      } else {
        body = await readFile(file)
        headers['Content-Length'] = String(body.length)
      }
      response.writeHead(200, headers)
      response.end(request.method === 'HEAD' ? undefined : body)
      return
    }
    if (!['GET', 'HEAD'].includes(request.method || 'GET')) { response.writeHead(405).end(); return }
    const html = await pageFor(url.pathname, url.searchParams)
    if (html === null) {
      response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' }).end('<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><title>Page introuvable | H‑Immo Habitat</title></head><body><main><h1>Page introuvable</h1><p>Cette page n’existe pas ou n’est plus disponible.</p><a href="/">Retour à l’accueil</a></main></body></html>')
      return
    }
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=20, stale-while-revalidate=20' })
    response.end(html)
  } catch (error) {
    const status = Number.isInteger(error?.status) ? error.status : 503
    if (status === 404) {
      response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' }).end('<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><title>Page introuvable | H‑Immo Habitat</title></head><body><main><h1>Page introuvable</h1><p>Cette page n’existe pas ou n’est plus disponible.</p><a href="/">Retour à l’accueil</a></main></body></html>')
      return
    }
    response.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store', 'Retry-After': '30' }).end('<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><title>Service temporairement indisponible</title></head><body><main><h1>Cette page est temporairement indisponible</h1><p>Réessayez dans quelques instants.</p></main></body></html>')
  }
})

server.listen(port, '0.0.0.0', () => console.log(`MaVitrine écoute sur le port ${port}.`))
