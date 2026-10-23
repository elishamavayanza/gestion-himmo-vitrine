import assert from 'node:assert/strict'
import test from 'node:test'
import { groupCatalogueListings } from '../assets/react/features/catalogue/services/cataloguePresentation.ts'

const listing = (type, unitId = type) => ({ type, unitId })

test('le catalogue classe les unités par famille sans perdre leur type précis', () => {
  const groups = groupCatalogueListings([
    listing('apartment', 'apartment-1'),
    listing('house', 'house-1'),
    listing('room', 'room-1'),
    listing('shop', 'shop-1'),
    listing('workshop', 'workshop-1'),
    listing('parking', 'parking-1'),
    listing('other', 'other-1'),
    listing('new-api-type', 'future-type-1'),
  ])

  assert.deepEqual(groups.map(({ id, items }) => [id, items.map(({ unitId }) => unitId)]), [
    ['housing', ['apartment-1', 'house-1', 'room-1']],
    ['business', ['shop-1', 'workshop-1']],
    ['parking', ['parking-1']],
    ['other', ['other-1', 'future-type-1']],
  ])
})

test('le catalogue masque les familles vides et conserve toutes les annonces reçues', () => {
  const items = [listing('office', 'office-1'), listing('storage', 'storage-1')]
  const groups = groupCatalogueListings(items)

  assert.equal(groups.length, 1)
  assert.equal(groups[0]?.id, 'business')
  assert.deepEqual(groups[0]?.items, items)
})
