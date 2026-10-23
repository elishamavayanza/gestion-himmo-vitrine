import assert from 'node:assert/strict'
import test from 'node:test'
import { formatPublicListingPrice } from '../assets/react/services/publicListingPresentation.ts'

test('une location publique affiche le prix et la périodicité mensuelle', () => {
  assert.equal(formatPublicListingPrice({ offerType: 'rent', price: '500.00', currency: 'USD' }), '500.00 USD / mois')
})

test('une vente publique affiche son prix réel sans périodicité de loyer', () => {
  assert.equal(formatPublicListingPrice({ offerType: 'sale', price: '125000.00', currency: 'CDF' }), '125000.00 CDF · Prix de vente')
})
