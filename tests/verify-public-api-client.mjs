import assert from 'node:assert/strict'
import test from 'node:test'
import { z } from 'zod'
import { ApiError } from '../assets/react/services/api/api.types.ts'
import { requestFeedbackData } from '../assets/react/services/api/client.ts'

test('le client valide les enveloppes, conserve les erreurs HTTP et remonte les erreurs réseau', async () => {
  const originalFetch = globalThis.fetch
  const schema = z.object({ id: z.string() })
  try {
    globalThis.fetch = async () => new Response(JSON.stringify({ data: { id: 'public-id' } }), { status: 200 })
    assert.deepEqual(await requestFeedbackData('public/test', schema), { id: 'public-id' })

    globalThis.fetch = async () => new Response(JSON.stringify({ data: { id: 7 } }), { status: 200 })
    await assert.rejects(requestFeedbackData('public/test', schema), { name: 'ZodError' })

    globalThis.fetch = async () => new Response(JSON.stringify({ message: 'Indisponible' }), { status: 404 })
    await assert.rejects(requestFeedbackData('public/test', schema), (error) => error instanceof ApiError && error.status === 404)

    globalThis.fetch = async () => { throw new TypeError('network') }
    await assert.rejects(requestFeedbackData('public/test', schema), /network/)
  } finally {
    globalThis.fetch = originalFetch
  }
})
