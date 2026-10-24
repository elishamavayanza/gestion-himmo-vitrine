import { requestFeedbackData } from '../../../services/api/client'
import { customerInquiryReceiptSchema, publicInquiryChallengeSchema, type CustomerInquiryReceipt, type CustomerInquiryRequest, type PublicInquiryChallenge } from '../types/inquiry.types'
import { publicInquiryChallengePath, publicInquiryPath } from './inquiryContract'

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

export async function getPublicInquiryChallenge(slug: string, unitUuid: string, signal?: AbortSignal): Promise<PublicInquiryChallenge> {
  return requestFeedbackData(publicInquiryChallengePath(slug, unitUuid), publicInquiryChallengeSchema, { signal })
}
