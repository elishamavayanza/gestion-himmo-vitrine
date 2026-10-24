import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'

const listing = {
  unitId: 'unit-seo-123', listingId: 'listing-seo-123', title: 'Appartement test indexable', offerType: 'rent', price: '350.00', currency: 'USD', reference: 'SEO-123', type: 'apartment', floor: 2,
  description: 'Appartement public à Bukavu, deux chambres et une belle vue.', monthlyRent: '350.00', surface: '65.00', bedrooms: 2, rooms: 3, bathrooms: 1, city: 'Bukavu', buildingName: 'Résidence Test', photos: [{ url: '/uploads/test-photo.jpg', position: 1 }],
}
const organization = { name: 'Agence publique test', logo: null, description: 'Agence de test accessible au public.', address: null, city: 'Bukavu', country: 'CD', email: 'contact@test.local', phone: '+243000000000', availableUnitsCount: 1 }

test('le serveur rend les pages publiques sans JavaScript et reflète les statuts API', async () => {
  const api = createServer((request, response) => {
    const path = request.url || ''
    if (path.startsWith('/uploads/')) {
      response.writeHead(200, { 'Content-Type': 'image/jpeg' }).end('image')
      return
    }
    response.setHeader('Content-Type', 'application/json')
    if (path === '/api/public/listings?page=1&limit=12' || path === '/api/public/listings?page=1&limit=100') {
      response.end(JSON.stringify({ data: { items: [{ organizationSlug: 'agence-test', organizationName: organization.name, listing }], total: 1, page: 1, pages: 1 } }))
    } else if (path === '/api/public/organizations?page=1&limit=100') {
      response.end(JSON.stringify({ data: { items: ['agence-test', 'vitrine-sans-annonce'], total: 2, page: 1, pages: 1 } }))
    } else if (path === '/api/public/organizations/agence-test/showcase') {
      response.end(JSON.stringify({ data: organization }))
    } else if (path === '/api/public/organizations/agence-test/listings/unit-seo-123') {
      response.end(JSON.stringify({ data: listing }))
    } else if (path.startsWith('/api/public/organizations/agence-test/listings?')) {
      response.end(JSON.stringify({ data: { items: [listing], total: 1, page: 1, pages: 1 } }))
    } else if (path.includes('/missing-listing')) {
      response.writeHead(404).end(JSON.stringify({ status: 404 }))
    } else {
      response.writeHead(404).end(JSON.stringify({ status: 404 }))
    }
  })
  await new Promise((resolveListen) => api.listen(0, '127.0.0.1', resolveListen))
  const apiAddress = api.address()
  assert.ok(apiAddress && typeof apiAddress === 'object')
  const temporaryDirectory = await mkdtemp(join(tmpdir(), 'ma-vitrine-ssr-'))
  const distribution = join(temporaryDirectory, 'dist')
  await mkdir(distribution)
  await writeFile(join(distribution, 'index.html'), '<!doctype html><html lang="fr"><head><title>Accueil</title></head><body><div id="root"></div></body></html>')
  const portProbe = createServer()
  await new Promise((resolveListen) => portProbe.listen(0, '127.0.0.1', resolveListen))
  const sitePort = portProbe.address().port
  await new Promise((resolveClose) => portProbe.close(resolveClose))
  const serverScript = resolve('scripts/server.mjs')
  const child = spawn(process.execPath, [serverScript], { cwd: temporaryDirectory, env: { ...process.env, PORT: String(sitePort), PUBLIC_SITE_URL: `http://127.0.0.1:${sitePort}`, PUBLIC_API_BASE_URL: `http://127.0.0.1:${apiAddress.port}/api` }, stdio: 'ignore' })
  try {
    let response
    for (let attempt = 0; attempt < 30; attempt++) {
      try { response = await fetch(`http://127.0.0.1:${sitePort}/organisations/agence-test/annonces/unit-seo-123`); break } catch { await new Promise((resolveDelay) => setTimeout(resolveDelay, 50)) }
    }
    assert.ok(response, 'le serveur Node démarre')
    const html = await response.text()
    assert.equal(response.status, 200)
    assert.ok(html.includes('Appartement test indexable | H‑Immo Habitat'))
    assert.match(html, /<h1>Appartement test indexable<\/h1>/)
    assert.match(html, /Appartement public à Bukavu/)
    assert.ok(html.includes(`rel="canonical" href="http://127.0.0.1:${sitePort}/organisations/agence-test/annonces/unit-seo-123"`))
    assert.ok(html.includes('application/ld+json'))
    assert.match(html, /alt="Photo de Appartement test indexable à Bukavu"/)
    assert.ok(html.includes(`http://127.0.0.1:${sitePort}/uploads/test-photo.jpg`), 'les photos du rendu initial passent par la même origine que l’application')
    assert.match(html, /id="public-seo-fallback"/)
    assert.match(html, /id="root"><\/div>/)

    const unitPhoto = await fetch(`http://127.0.0.1:${sitePort}/uploads/units/photo.jpg`)
    assert.equal(unitPhoto.headers.get('cache-control'), 'private, max-age=2592000, immutable')
    const profilePhoto = await fetch(`http://127.0.0.1:${sitePort}/uploads/users/avatar.jpg`)
    assert.equal(profilePhoto.headers.get('cache-control'), 'no-store', 'les médias de comptes ne sont pas mis en cache')

    const orgPage = await fetch(`http://127.0.0.1:${sitePort}/organisations/agence-test`)
    assert.match(await orgPage.text(), /Agence publique test/)
    const filteredPage = await fetch(`http://127.0.0.1:${sitePort}/annonces?ville=Bukavu`)
    const filteredHtml = await filteredPage.text()
    assert.match(filteredHtml, /name="robots" content="noindex, nofollow"/)
    assert.ok(filteredHtml.includes(`rel="canonical" href="http://127.0.0.1:${sitePort}/annonces"`))
    const missing = await fetch(`http://127.0.0.1:${sitePort}/organisations/agence-test/annonces/missing-listing`)
    assert.equal(missing.status, 404)
    assert.match(await missing.text(), /<h1>Page introuvable<\/h1>/)
    const sitemapResponse = await fetch(`http://127.0.0.1:${sitePort}/sitemap.xml`)
    const sitemap = await sitemapResponse.text()
    assert.equal(sitemapResponse.status, 200)
    assert.match(sitemap, /unit-seo-123/)
    assert.match(sitemap, /vitrine-sans-annonce/)
    assert.equal([...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].some(([, url]) => url.includes('?')), false) // pas de paramètres de recherche
    const robots = await fetch(`http://127.0.0.1:${sitePort}/robots.txt`)
    assert.equal(robots.status, 200)
    assert.ok((await robots.text()).includes(`Sitemap: http://127.0.0.1:${sitePort}/sitemap.xml`))
  } finally {
    child.kill('SIGTERM')
    api.close()
    await rm(temporaryDirectory, { recursive: true, force: true })
  }
})
