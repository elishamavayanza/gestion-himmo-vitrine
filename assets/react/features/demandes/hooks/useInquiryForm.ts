import { useRef, useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ApiError } from '../../../services/api/api.types'
import { createPublicInquiry } from '../services/inquiryService'
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

export function useInquiryForm(slug: string, unitUuid: string) {
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
    const payload = buildInquiryPayload(fields)
    try {
      await mutation.mutateAsync({ payload, key: idempotencyKey.current })
    } catch {
      // L’erreur est rendue depuis l’état de la mutation, sans rejet non géré.
    }
  }

  const error = mutation.error instanceof ApiError
    ? mutation.error.status === 404
      ? 'Cette annonce n’est plus disponible. Consultez les autres annonces de l’agence.'
      : mutation.error.status === 422
        ? 'Vérifiez les champs et confirmez votre accord avant de réessayer.'
        : mutation.error.status === 429
          ? 'Trop de demandes ont été envoyées. Réessayez un peu plus tard.'
          : mutation.error.status === 409
            ? 'Cette demande a déjà été transmise. Modifiez le formulaire si vous souhaitez envoyer une autre demande.'
            : 'Votre demande n’a pas pu être envoyée. Vérifiez votre connexion puis réessayez.'
    : mutation.error
      ? 'Votre demande n’a pas pu être envoyée. Vérifiez votre connexion puis réessayez.'
      : null

  return { fields, change, submit, pending: mutation.isPending, sent: mutation.isSuccess, error }
}
