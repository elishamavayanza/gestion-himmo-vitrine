import assert from 'node:assert/strict'
import test from 'node:test'
import { buildInquiryPayload, publicInquiryPath } from '../assets/react/features/demandes/services/inquiryContract.ts'

test('le contrat transmet le type, retire les espaces et omet les champs facultatifs vides', () => {
  assert.deepEqual(buildInquiryPayload({ type: 'visit', name: '  Amina  ', phone: ' +243 000 ', email: '', message: '  ', privacyConsent: true }), {
    type: 'visit', name: 'Amina', phone: '+243 000', privacyConsent: true,
  })
})

test('le contrat encode le slug et l’UUID dans la route publique des demandes', () => {
  assert.equal(publicInquiryPath('agence/centre', 'unit id'), 'public/organizations/agence%2Fcentre/listings/unit%20id/inquiries')
})
