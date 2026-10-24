import { useCallback, useEffect, useState } from 'react'
import { Button } from '../../../components/UI/Button'
import { TextField } from '../../../components/Form/TextField'
import { useInquiryForm } from '../hooks/useInquiryForm'
import { TurnstileWidget } from './TurnstileWidget'

interface InquiryFormProps {
  slug: string
  unitUuid: string
}

export function InquiryForm({ slug, unitUuid }: InquiryFormProps) {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? ''
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileAvailable, setTurnstileAvailable] = useState(import.meta.env.DEV && !siteKey)
  const form = useInquiryForm(slug, unitUuid, turnstileToken)
  const { error, refreshChallenge } = form
  const turnstileResetKey = error ? 1 : 0
  const handleTurnstileToken = useCallback((token: string) => setTurnstileToken(token || null), [])
  const handleTurnstileAvailability = useCallback((available: boolean) => setTurnstileAvailable(available), [])
  const canSubmit = form.challengeReady && turnstileAvailable && (import.meta.env.DEV && !siteKey || Boolean(turnstileToken))

  useEffect(() => {
    if (!error) return
    queueMicrotask(() => setTurnstileToken(null))
    refreshChallenge()
  }, [error, refreshChallenge])

  if (form.sent) {
    return <section className="inquiry-form" aria-labelledby="inquiry-heading">
      <h2 id="inquiry-heading">Votre demande est transmise</h2>
      <p role="status">Merci. L’agence pourra vous recontacter au sujet de cette annonce.</p>
    </section>
  }

  return (
    <section className="inquiry-form" aria-labelledby="inquiry-heading">
      <h2 id="inquiry-heading">Demander des informations ou une visite</h2>
      <p className="inquiry-form__intro">Votre demande sera envoyée à l’agence responsable de cette annonce.</p>
      <form onSubmit={form.submit}>
        <div className="inquiry-form__website" aria-hidden="true"><label htmlFor="inquiry-website">Site web</label><input id="inquiry-website" name="website" type="text" tabIndex={-1} autoComplete="off" /></div>
        <fieldset className="inquiry-form__types">
          <legend>Votre demande</legend>
          <label><input type="radio" name="type" value="information" checked={form.fields.type === 'information'} onChange={() => form.change('type', 'information')} /> Demander des informations</label>
          <label><input type="radio" name="type" value="visit" checked={form.fields.type === 'visit'} onChange={() => form.change('type', 'visit')} /> Demander une visite</label>
        </fieldset>
        <div className="inquiry-form__fields">
          <TextField label="Nom" name="name" autoComplete="name" maxLength={120} required value={form.fields.name} onChange={(event) => form.change('name', event.target.value)} />
          <TextField label="Téléphone" name="phone" type="tel" autoComplete="tel" maxLength={30} minLength={7} required value={form.fields.phone} onChange={(event) => form.change('phone', event.target.value)} />
          <TextField label="Courriel (facultatif)" name="email" type="email" autoComplete="email" maxLength={180} value={form.fields.email} onChange={(event) => form.change('email', event.target.value)} />
          <div className="ui-field inquiry-form__message">
            <label className="ui-field__label" htmlFor="inquiry-message">Message (facultatif)</label>
            <textarea id="inquiry-message" className="ui-field__control" name="message" rows={4} maxLength={2000} value={form.fields.message} onChange={(event) => form.change('message', event.target.value)} />
            <span className="ui-field__hint">N’incluez aucune information confidentielle.</span>
          </div>
        </div>
        <TurnstileWidget siteKey={siteKey} resetKey={turnstileResetKey} onTokenChange={handleTurnstileToken} onAvailabilityChange={handleTurnstileAvailability} />
        <label className="inquiry-form__consent">
          <input type="checkbox" required checked={form.fields.privacyConsent} onChange={(event) => form.change('privacyConsent', event.target.checked)} />
          <span>J’accepte que l’agence utilise ces coordonnées pour répondre à cette demande.</span>
        </label>
        {form.challengeError && <p className="inquiry-form__error" role="alert">Le formulaire ne peut pas être vérifié pour le moment. Rechargez la page puis réessayez.</p>}
        {form.error && <p className="inquiry-form__error" role="alert">{form.error}</p>}
        <Button type="submit" loading={form.pending} disabled={form.pending || !canSubmit} loadingLabel="Envoi en cours…">Envoyer ma demande</Button>
      </form>
    </section>
  )
}
