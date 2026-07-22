import { z } from 'zod';

export enum Role {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  CUSTOMER = 'CUSTOMER',
  UNDERWRITER = 'UNDERWRITER',
  CLAIMS_HANDLER = 'CLAIMS_HANDLER',
}

export enum PolicyStatus {
  DRAFT = 'DRAFT',
  PENDING_UNDERWRITING = 'PENDING_UNDERWRITING',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  RENEWAL_DUE = 'RENEWAL_DUE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export enum ClaimStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SETTLED = 'SETTLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export const createPolicySchema = z.object({
  customerId: z.string().optional(),
  agentId: z.string().optional(),
  policyType: z.string().default('HEALTH'),
  planName: z.string().default('Comprehensive Shield'),
  sumInsured: z.number().default(250000),
  premiumAmount: z.number().default(1450),
  premiumFrequency: z.string().default('YEARLY'),
  startDate: z.any().optional(),
  endDate: z.any().optional(),
  nomineeName: z.string().optional(),
  nomineeRelation: z.string().optional(),
  nomineePhone: z.string().optional(),
  nominee: z.any().optional(),
  details: z.any().optional(),
});

export const createClaimSchema = z.object({
  policyId: z.string(),
  claimAmount: z.number().positive(),
  reason: z.string().min(2),
  description: z.string().optional(),
  incidentDate: z.any().optional(),
  details: z.any().optional(),
});

export const updateClaimStatusSchema = z.object({
  status: z.nativeEnum(ClaimStatus),
  approvedAmount: z.number().optional(),
  rejectionReason: z.string().optional(),
  reviewNotes: z.string().optional(),
});

export const createCustomerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  dob: z.any().optional(),
  gender: z.string().optional(),
});

export const createAgentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});

export const createPaymentSchema = z.object({
  policyId: z.string(),
  amount: z.number().positive(),
  method: z.string().default('CARD'),
  transactionRef: z.string().optional(),
});
