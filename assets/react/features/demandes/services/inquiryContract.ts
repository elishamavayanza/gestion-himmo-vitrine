import type { CustomerInquiryRequest, CustomerInquiryType } from '../types/inquiry.types'

export interface InquiryFields {
  type: CustomerInquiryType
  name: string
  phone: string
  email: string
  message: string
  privacyConsent: boolean
}

export function publicInquiryChallengePath(slug: string, unitUuid: string): string {
  return `${publicInquiryPath(slug, unitUuid)}/challenge`
}

export function publicInquiryPath(slug: string, unitUuid: string): string {
  return `public/organizations/${encodeURIComponent(slug)}/listings/${encodeURIComponent(unitUuid)}/inquiries`
}

export function buildInquiryPayload(fields: InquiryFields, challengeToken: string, website = '', turnstileToken: string | null = null): CustomerInquiryRequest {
  return {
    type: fields.type,
    name: fields.name.trim(),
    phone: fields.phone.trim(),
    ...(fields.email.trim() ? { email: fields.email.trim() } : {}),
    ...(fields.message.trim() ? { message: fields.message.trim() } : {}),
    privacyConsent: fields.privacyConsent,
    challengeToken,
    website,
    turnstileToken,
  }
}
