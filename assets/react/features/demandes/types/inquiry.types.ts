import { z, type infer as ZodInfer } from 'zod/mini'

export type CustomerInquiryType = 'information' | 'visit'

export const customerInquiryReceiptSchema = z.object({
  reference: z.string().check(z.minLength(1)),
  receivedAt: z.string().check(z.minLength(1)),
})

export interface CustomerInquiryRequest {
  type: CustomerInquiryType
  name: string
  phone: string
  email?: string
  message?: string
  privacyConsent: boolean
  challengeToken: string
  website: string
  turnstileToken: string | null
}

export const publicInquiryChallengeSchema = z.object({ token: z.string().check(z.minLength(1), z.maxLength(200)) })
export type PublicInquiryChallenge = ZodInfer<typeof publicInquiryChallengeSchema>

export type CustomerInquiryReceipt = ZodInfer<typeof customerInquiryReceiptSchema>
