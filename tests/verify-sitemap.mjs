import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'

test('la sitemap ne reprend que les URLs d’annonces publiques actuelles', async () => {
  const server = createServer((request, response) => {
    const path = request.url ?? ''
    assert.match(path, /^\/api\/public\/(listings|organizations)\?page=1&limit=100$/)
    response.writeHead(200, { 'Content-Type': 'application/json' })
    const items = path.includes('/organizations') ? ['agence-publique', 'vitrine-sans-annonce'] : [{ organizationSlug: 'agence-publique', listing: { unitId: 'unit-123' } }]
    response.end(JSON.stringify({ data: { items, total: items.length, page: 1, pages: 1 } }))
  })
  await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen))
  const address = server.address()
  assert.ok(address && typeof address === 'object')
  const directory = await mkdtemp(join(tmpdir(), 'h-immo-sitemap-'))
  try {
    const script = resolve('scripts/generate-sitemap.mjs')
    const result = await new Promise((resolveProcess, reject) => {
      const child = spawn(process.execPath, [script], { cwd: directory, env: { ...process.env, PUBLIC_SITE_URL: 'https://vitrine.test', PUBLIC_API_BASE_URL: `http://127.0.0.1:${address.port}/api` }, stdio: 'pipe' })
      let output = ''
      child.stdout.on('data', (chunk) => { output += chunk })
      child.stderr.on('data', (chunk) => { output += chunk })
      child.on('error', reject)
      child.on('close', (code) => resolveProcess({ code, output }))
    })
    assert.equal(result.code, 0, result.output)
    const sitemap = await readFile(join(directory, 'dist', 'sitemap.xml'), 'utf8')
    assert.match(sitemap, /https:\/\/vitrine\.test\/organisations\/agence-publique\/annonces\/unit-123/)
    assert.match(sitemap, /https:\/\/vitrine\.test\/organisations\/agence-publique<\/loc>/)
    assert.doesNotMatch(sitemap, /<loc>[^<]*\?/)
    const robots = await readFile(join(directory, 'dist', 'robots.txt'), 'utf8')
    assert.match(robots, /Sitemap: https:\/\/vitrine\.test\/sitemap\.xml/)
    assert.match(robots, /Allow: \/\n/)
    assert.doesNotMatch(robots, /Disallow:/)
  } finally {
    server.close()
    await rm(directory, { recursive: true, force: true })
  }
})


test('la génération échoue proprement si l’API ne répond pas et préserve l’instantané précédent', async () => {
  const server = createServer((_request, response) => {
    response.writeHead(503, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ message: 'indisponible' }))
  })
  await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen))
  const address = server.address()
  assert.ok(address && typeof address === 'object')
  const directory = await mkdtemp(join(tmpdir(), 'h-immo-sitemap-outage-'))
  try {
    const outputDirectory = join(directory, 'dist')
    const existingSitemap = join(outputDirectory, 'sitemap.xml')
    await import('node:fs/promises').then(({ mkdir, writeFile }) => mkdir(outputDirectory, { recursive: true }).then(() => writeFile(existingSitemap, 'ancienne sitemap intacte')))
    const script = resolve('scripts/generate-sitemap.mjs')
    const result = await new Promise((resolveProcess, reject) => {
      const child = spawn(process.execPath, [script], { cwd: directory, env: { ...process.env, PUBLIC_SITE_URL: 'https://vitrine.test', PUBLIC_API_BASE_URL: `http://127.0.0.1:${address.port}/api` }, stdio: 'pipe' })
      let output = ''
      child.stdout.on('data', (chunk) => { output += chunk })
      child.stderr.on('data', (chunk) => { output += chunk })
      child.on('error', reject)
      child.on('close', (code) => resolveProcess({ code, output }))
    })
    assert.notEqual(result.code, 0)
    assert.match(result.output, /Lecture du catalogue public impossible/)
    assert.equal(await readFile(existingSitemap, 'utf8'), 'ancienne sitemap intacte')
  } finally {
    server.close()
    await rm(directory, { recursive: true, force: true })
  }
})
