import { z } from 'zod'

export type CustomerInquiryType = 'information' | 'visit'

export const customerInquiryReceiptSchema = z.object({
  reference: z.string().min(1),
  receivedAt: z.string().min(1),
})

export interface CustomerInquiryRequest {
  type: CustomerInquiryType
  name: string
  phone: string
  email?: string
  message?: string
  privacyConsent: boolean
}

export type CustomerInquiryReceipt = z.infer<typeof customerInquiryReceiptSchema>
