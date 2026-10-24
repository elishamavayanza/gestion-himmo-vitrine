import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const siteUrl = process.env.PUBLIC_SITE_URL?.trim().replace(/\/$/, '')
const apiBase = (process.env.PUBLIC_API_BASE_URL?.trim() || (process.env.HIMMO_API_URL ? `${process.env.HIMMO_API_URL.replace(/\/$/, '')}/api` : '')).replace(/\/$/, '')
const outputDirectory = resolve('dist')
if (!siteUrl) throw new Error('PUBLIC_SITE_URL est obligatoire pour générer une sitemap canonique.')
if (!apiBase) throw new Error('PUBLIC_API_BASE_URL est obligatoire pour générer la sitemap à partir des données publiées.')
const maximumPages = 500
const urls = new Map()

function add(path, lastmod) {
  const url = new URL(path, `${siteUrl}/`).toString()
  urls.set(url, lastmod ? new Date(lastmod).toISOString().slice(0, 10) : null)
}

function escapeXml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;')
}

add('/')
add('/a-propos')
add('/annonces')

{
  let page = 1
  let pages = 1
  while (page <= pages && page <= maximumPages) {
    const endpoint = new URL(`${apiBase}/public/listings`)
    endpoint.searchParams.set('page', String(page))
    endpoint.searchParams.set('limit', '100')
    const response = await fetch(endpoint, { headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error(`Lecture du catalogue public impossible (${response.status}).`)
    const payload = await response.json()
    const result = payload?.data
    if (!Array.isArray(result?.items)) throw new Error('La réponse du catalogue public ne respecte pas le contrat attendu.')
    pages = Number.isInteger(result.pages) ? result.pages : 1
    for (const item of result.items) {
      const slug = typeof item?.organizationSlug === 'string' ? item.organizationSlug : ''
      const unitId = typeof item?.listing?.unitId === 'string' ? item.listing.unitId : ''
      if (!slug || !unitId) continue
      add(`/organisations/${encodeURIComponent(slug)}/annonces/${encodeURIComponent(unitId)}`)
    }
    page += 1
  }
  let organizationPage = 1
  let organizationPages = 1
  while (organizationPage <= organizationPages && organizationPage <= maximumPages) {
    const endpoint = new URL(`${apiBase}/public/organizations`)
    endpoint.searchParams.set('page', String(organizationPage))
    endpoint.searchParams.set('limit', '100')
    const response = await fetch(endpoint, { headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error(`Lecture des vitrines publiques impossible (${response.status}).`)
    const payload = await response.json()
    const result = payload?.data
    if (!Array.isArray(result?.items)) throw new Error('La réponse des vitrines publiques ne respecte pas le contrat attendu.')
    organizationPages = Number.isInteger(result.pages) ? result.pages : 1
    for (const slug of result.items) if (typeof slug === 'string' && slug) add(`/organisations/${encodeURIComponent(slug)}`)
    organizationPage += 1
  }
  if (pages > maximumPages || organizationPages > maximumPages) console.warn(`Catalogue tronqué à ${maximumPages} pages pour respecter les limites du sitemap.`)
}

const entries = [...urls.entries()].map(([loc, lastmod]) => `  <url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`).join('\n')
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`
const robots = `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`
await mkdir(outputDirectory, { recursive: true })
await writeFile(resolve(outputDirectory, 'sitemap.xml'), sitemap)
await writeFile(resolve(outputDirectory, 'robots.txt'), robots)
console.log(`Sitemap générée : ${urls.size} URL publique(s).`)
