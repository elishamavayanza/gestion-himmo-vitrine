import { useEffect, useRef, useState } from 'react'

interface TurnstileWidgetProps {
  siteKey: string
  resetKey: number
  onTokenChange: (token: string) => void
  onAvailabilityChange: (available: boolean) => void
}

interface TurnstileApi {
  render: (container: HTMLElement, options: {
    sitekey: string
    action: string
    callback: (token: string) => void
    'expired-callback': () => void
    'error-callback': () => void
  }) => string
  remove: (widgetId: string) => void
}

declare global {
  interface Window { turnstile?: TurnstileApi }
}

let apiScriptPromise: Promise<void> | null = null

function loadTurnstileApi(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  if (apiScriptPromise) return apiScriptPromise

  const loading = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-turnstile-api]')
    const script = existing ?? document.createElement('script')
    const loaded = () => window.turnstile ? resolve() : reject(new Error('Turnstile indisponible.'))
    const failed = () => reject(new Error('Turnstile indisponible.'))
    script.addEventListener('load', loaded, { once: true })
    script.addEventListener('error', failed, { once: true })
    if (!existing) {
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.defer = true
      script.dataset.turnstileApi = 'true'
      document.head.append(script)
    }
  })
  apiScriptPromise = loading.catch((error: unknown) => {
    apiScriptPromise = null
    throw error
  })

  return apiScriptPromise
}

export function TurnstileWidget({ siteKey, resetKey, onTokenChange, onAvailabilityChange }: TurnstileWidgetProps) {
  const container = useRef<HTMLDivElement>(null)
  const [errorResetKey, setErrorResetKey] = useState<number | null>(null)
  const error = errorResetKey === resetKey

  useEffect(() => {
    if (!siteKey) {
      let cancelled = false
      queueMicrotask(() => {
        if (cancelled) return
        onAvailabilityChange(import.meta.env.DEV)
        onTokenChange('')
      })
      return () => { cancelled = true }
    }

    let cancelled = false
    let widgetId: string | undefined
    queueMicrotask(() => {
      if (!cancelled) onAvailabilityChange(false)
    })
    loadTurnstileApi().then(() => {
      if (cancelled || !container.current || !window.turnstile) return
      widgetId = window.turnstile.render(container.current, {
        sitekey: siteKey,
        action: 'public_inquiry',
        callback: (token) => { onTokenChange(token); onAvailabilityChange(true) },
        'expired-callback': () => { onTokenChange(''); onAvailabilityChange(false) },
        'error-callback': () => { onTokenChange(''); onAvailabilityChange(false); setErrorResetKey(resetKey) },
      })
    }).catch(() => {
      if (cancelled) return
      onTokenChange('')
      onAvailabilityChange(false)
      setErrorResetKey(resetKey)
    })

    return () => {
      cancelled = true
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId)
    }
  }, [siteKey, resetKey, onAvailabilityChange, onTokenChange])

  if (!siteKey) {
    return <p className="inquiry-form__turnstile-note" role="status">{import.meta.env.DEV ? 'Vérification Turnstile désactivée en développement.' : 'La vérification sécurisée est momentanément indisponible.'}</p>
  }

  return <div className="inquiry-form__turnstile">
    <div ref={container} aria-label="Vérification anti-robot Cloudflare Turnstile" />
    {error && <p className="inquiry-form__error" role="alert">Impossible de charger la vérification sécurisée. Vérifiez votre connexion puis rechargez la page.</p>}
  </div>
}
