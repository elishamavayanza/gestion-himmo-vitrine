import assert from 'node:assert/strict'
import test from 'node:test'
import { listingPageSchema, organizationShowcaseSchema, publicListingSchema } from '../assets/react/services/api/publicShowcase.types.ts'
import { customerInquiryReceiptSchema } from '../assets/react/features/demandes/types/inquiry.types.ts'

const listing = {
  unitId: 'unit-uuid', listingId: 'listing-uuid', title: 'Appartement lumineux', offerType: 'rent',
  price: '500.00', reference: 'APP-01', type: 'apartment', floor: 2, description: null,
  monthlyRent: '500.00', currency: 'USD', surface: '70.00', bedrooms: 2, rooms: 3,
  bathrooms: 1, city: 'Goma', buildingName: 'Résidence publique', photos: [{ url: '/media/cover.jpg', position: 0 }],
}

test('le contrat de catalogue accepte les données publiques attendues', () => {
  assert.equal(listingPageSchema.parse({ items: [listing], total: 1, page: 1, pages: 1 }).items[0]?.unitId, 'unit-uuid')
})

test('un contrat incomplet ou mal typé est refusé au lieu de devenir une annonce partielle', () => {
  assert.equal(publicListingSchema.safeParse({ ...listing, price: 500 }).success, false)
  assert.equal(listingPageSchema.safeParse({ items: [listing], total: -1, page: 1, pages: 1 }).success, false)
})

test('la présentation publique et le reçu de demande sont validés', () => {
  assert.equal(organizationShowcaseSchema.parse({ name: 'Agence', logo: null, description: null, address: null, city: 'Goma', country: 'RDC', email: 'contact@example.test', phone: '+243000000000', availableUnitsCount: 1 }).name, 'Agence')
  assert.equal(customerInquiryReceiptSchema.safeParse({ reference: 'REQ-1', receivedAt: '2026-10-23T10:00:00+00:00' }).success, true)
  assert.equal(customerInquiryReceiptSchema.safeParse({ reference: '', receivedAt: '' }).success, false)
})
