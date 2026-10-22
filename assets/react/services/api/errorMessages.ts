import { ApiError } from './api.types'

export function publicRequestError(
  error: unknown,
  notFoundMessage: string,
  fallbackMessage: string,
): string {
  if (error instanceof ApiError && error.status === 404) return notFoundMessage
  return fallbackMessage
}
