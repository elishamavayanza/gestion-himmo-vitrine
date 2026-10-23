import assert from 'node:assert/strict'
import test from 'node:test'
import { getGlobalListings, getOrganizationListings } from '../assets/react/features/catalogue/services/catalogueService.ts'

test('le catalogue encode ses filtres et transmet pagination et annulation au backend', async () => {
  const originalFetch = globalThis.fetch
  const controller = new AbortController()
  let requestedUrl = ''
  let requestOptions
  try {
    globalThis.fetch = async (input, options) => {
      requestedUrl = String(input)
      requestOptions = options
      return new Response(JSON.stringify({ data: { items: [], total: 0, page: 3, pages: 0 } }), { status: 200 })
    }
    const result = await getOrganizationListings('agence / centre', {
      city: 'Goma & Nord', type: 'house', bedrooms: '2', offerType: 'sale',
      minPrice: '100', maxPrice: '900', currency: 'USD', page: 3, limit: 10,
    }, controller.signal)
    const url = new URL(requestedUrl, 'http://localhost')
    assert.equal(url.pathname, '/api/public/organizations/agence%20%2F%20centre/listings')
    assert.deepEqual(Object.fromEntries(url.searchParams), {
      city: 'Goma & Nord', type: 'house', bedrooms: '2', offerType: 'sale', currency: 'USD',
      minPrice: '100', maxPrice: '900', page: '3', limit: '10',
    })
    assert.equal(requestOptions.signal, controller.signal)
    assert.deepEqual(result, { items: [], total: 0, page: 3, pages: 0 })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('le catalogue global charge les annonces sans slug et conserve leur vitrine', async () => {
  const originalFetch = globalThis.fetch
  let requestedUrl = ''
  try {
    globalThis.fetch = async (input) => {
      requestedUrl = String(input)
      return new Response(JSON.stringify({ data: {
        items: [{ organizationSlug: 'agence-centre', organizationName: 'Agence Centre', listing: {
          unitId: 'unit-uuid', listingId: 'listing-uuid', title: 'Appartement à louer', offerType: 'rent', price: '350.00',
          reference: 'A-01', type: 'apartment', floor: 0, description: null, monthlyRent: '350.00', currency: 'USD',
          surface: '65.00', bedrooms: 2, rooms: 3, bathrooms: 1, city: 'Bukavu', buildingName: 'Résidence Centre', photos: [],
        } }], total: 1, page: 1, pages: 1,
      } }), { status: 200 })
    }

    const result = await getGlobalListings({ offerType: 'rent', page: 1, limit: 8 })
    const url = new URL(requestedUrl, 'http://localhost')
    assert.equal(url.pathname, '/api/public/listings')
    assert.deepEqual(Object.fromEntries(url.searchParams), { offerType: 'rent', page: '1', limit: '8' })
    assert.equal(result.items[0]?.organizationSlug, 'agence-centre')
    assert.equal(result.items[0]?.organizationName, 'Agence Centre')
    assert.equal(result.items[0]?.unitId, 'unit-uuid')
  } finally {
    globalThis.fetch = originalFetch
  }
})
