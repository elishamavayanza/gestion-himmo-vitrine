import { useCallback, useRef, useState, type FormEvent } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ApiError } from '../../../services/api/api.types'
import { createPublicInquiry, getPublicInquiryChallenge } from '../services/inquiryService'
import type { CustomerInquiryRequest, CustomerInquiryType } from '../types/inquiry.types'
import { buildInquiryPayload } from '../services/inquiryContract'

interface InquiryFormFields {
  type: CustomerInquiryType
  name: string
  phone: string
  email: string
  message: string
  privacyConsent: boolean
}

const initialFields: InquiryFormFields = {
  type: 'information', name: '', phone: '', email: '', message: '', privacyConsent: false,
}

export function useInquiryForm(slug: string, unitUuid: string, turnstileToken: string | null) {
  const challenge = useQuery({ queryKey: ['public-inquiry-challenge', slug, unitUuid], queryFn: ({ signal }) => getPublicInquiryChallenge(slug, unitUuid, signal), enabled: Boolean(slug && unitUuid), staleTime: 20 * 60 * 1000, retry: 1 })
  const [fields, setFields] = useState(initialFields)
  const idempotencyKey = useRef<string | null>(null)
  const mutation = useMutation({
    mutationFn: ({ payload, key }: { payload: CustomerInquiryRequest; key: string }) =>
      createPublicInquiry(slug, unitUuid, payload, key),
  })

  function change<K extends keyof InquiryFormFields>(key: K, value: InquiryFormFields[K]) {
    idempotencyKey.current = null
    mutation.reset()
    setFields((current) => ({ ...current, [key]: value }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    mutation.reset()
    idempotencyKey.current ??= globalThis.crypto.randomUUID()
    if (!challenge.data?.token) return
    const website = String(new FormData(event.currentTarget).get('website') ?? '')
    const payload = buildInquiryPayload(fields, challenge.data.token, website, turnstileToken)
    try {
      await mutation.mutateAsync({ payload, key: idempotencyKey.current })
    } catch {
      // L’erreur est rendue depuis l’état de la mutation, sans rejet non géré.
    }
  }

  const refetchChallenge = challenge.refetch
  const refreshChallenge = useCallback(() => { void refetchChallenge() }, [refetchChallenge])

  const error = mutation.error instanceof ApiError
    ? mutation.error.status === 404
      ? 'Cette annonce n’est plus disponible. Consultez les autres annonces de l’agence.'
      : mutation.error.status === 422
        ? 'Vérifiez les champs et confirmez votre accord avant de réessayer.'
        : mutation.error.status === 429
          ? 'Trop de demandes ont été envoyées. Réessayez un peu plus tard.'
          : mutation.error.status === 400
          ? 'La vérification a échoué ou expiré. Rechargez le formulaire puis réessayez.'
          : mutation.error.status === 409
            ? 'Cette demande a déjà été transmise. Modifiez le formulaire si vous souhaitez envoyer une autre demande.'
            : 'Votre demande n’a pas pu être envoyée. Vérifiez votre connexion puis réessayez.'
    : mutation.error
      ? 'Votre demande n’a pas pu être envoyée. Vérifiez votre connexion puis réessayez.'
      : null

  return { fields, change, submit, pending: mutation.isPending, sent: mutation.isSuccess, error, challengeLoading: challenge.isPending, challengeError: challenge.isError, challengeReady: Boolean(challenge.data?.token), refreshChallenge }
}
