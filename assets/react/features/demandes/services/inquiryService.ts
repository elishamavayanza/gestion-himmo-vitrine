import { requestFeedbackData } from '../../../services/api/client'
import { customerInquiryReceiptSchema, type CustomerInquiryReceipt, type CustomerInquiryRequest } from '../types/inquiry.types'
import { publicInquiryPath } from './inquiryContract'

export async function createPublicInquiry(
  slug: string,
  unitUuid: string,
  payload: CustomerInquiryRequest,
  idempotencyKey: string,
): Promise<CustomerInquiryReceipt> {
  return requestFeedbackData(publicInquiryPath(slug, unitUuid), customerInquiryReceiptSchema, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: payload,
  })
}
