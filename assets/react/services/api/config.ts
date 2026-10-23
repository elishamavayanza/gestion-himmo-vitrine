const configuredApiBaseUrl = import.meta.env?.VITE_HIMMO_API_BASE_URL?.trim()

/** URL de base de l’API H‑Immo, configurable par environnement. */
export function getApiBaseUrl(): string {
  return (configuredApiBaseUrl || '/api').replace(/\/$/, '')
}
