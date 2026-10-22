import { ApiError } from './api.types'
import { getApiBaseUrl } from './config'

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

/** Client HTTP commun. Les autorisations restent systématiquement côté API H‑Immo. */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const normalizedPath = path.replace(/^\/+/, '')
  const response = await fetch(`${getApiBaseUrl()}/${normalizedPath}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { message?: string; details?: unknown } | null
    throw new ApiError(payload?.message ?? `La requête a échoué (${response.status}).`, response.status, payload?.details)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
