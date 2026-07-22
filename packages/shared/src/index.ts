import { z } from 'zod';

// ==========================================
// ENUMS & CONSTANTS
// ==========================================

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  CUSTOMER = 'CUSTOMER',
  CLAIMS_OFFICER = 'CLAIMS_OFFICER',
  UNDERWRITER = 'UNDERWRITER',
  CUSTOMER_SUPPORT = 'CUSTOMER_SUPPORT',
}

export enum PolicyStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
  RENEWAL_DUE = 'RENEWAL_DUE',
}

export enum ClaimStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SETTLED = 'SETTLED',
}

export enum PaymentStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE',
  FAILED = 'FAILED',
}

export enum PolicyType {
  HEALTH = 'HEALTH',
  LIFE = 'LIFE',
  MOTOR = 'MOTOR',
  HOME = 'HOME',
  TRAVEL = 'TRAVEL',
}

export enum PremiumFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export enum DocCategory {
  KYC = 'KYC',
  POLICY = 'POLICY',
  CLAIM_EVIDENCE = 'CLAIM_EVIDENCE',
  OTHER = 'OTHER',
}

export enum PaymentMethod {
  CARD = 'CARD',
  UPI = 'UPI',
  BANK_TRANSFER = 'BANK_TRANSFER',
  NETBANKING = 'NETBANKING',
  CASH = 'CASH',
  EMI = 'EMI',
}

// ==========================================
// ZOD VALIDATION SCHEMAS
// ==========================================

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  dob: z.string().or(z.date()).transform((val) => new Date(val)),
  gender: z.string().optional(),
});

export const createAgentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Valid phone number is required'),
});

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Customer name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(3, 'Address is required'),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  dob: z.string().or(z.date()).optional().transform((val) => val ? new Date(val) : new Date('1990-01-01')),
  gender: z.string().optional(),
});

export const createPolicySchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  agentId: z.string().optional().nullable(),
  policyType: z.nativeEnum(PolicyType),
  planName: z.string().min(2, 'Plan name is required'),
  sumInsured: z.number().or(z.string().transform((v) => parseFloat(v))).pipe(z.number().positive('Sum insured must be positive')),
  premiumAmount: z.number().or(z.string().transform((v) => parseFloat(v))).pipe(z.number().positive('Premium amount must be positive')),
  premiumFrequency: z.nativeEnum(PremiumFrequency),
  startDate: z.string().or(z.date()).transform((val) => new Date(val)),
  endDate: z.string().or(z.date()).transform((val) => new Date(val)),
  nominee: z.string().optional(),
});

export const createClaimSchema = z.object({
  policyId: z.string().min(1, 'Policy selection is required'),
  claimAmount: z.number().or(z.string().transform((v) => parseFloat(v))).pipe(z.number().positive('Claim amount must be positive')),
  reason: z.string().min(5, 'Reason for claim is required'),
  description: z.string().optional(),
});

export const updateClaimStatusSchema = z.object({
  status: z.nativeEnum(ClaimStatus),
  approvedAmount: z.number().optional().nullable(),
  reviewNotes: z.string().optional().nullable(),
});

export const createPaymentSchema = z.object({
  policyId: z.string().min(1, 'Policy ID is required'),
  amount: z.number().or(z.string().transform((v) => parseFloat(v))).pipe(z.number().positive('Amount must be positive')),
  method: z.string().transform((v) => v.toUpperCase()),
  transactionRef: z.string().optional(),
});

// Types derived from Zod
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type CreatePolicyInput = z.infer<typeof createPolicySchema>;
export type CreateClaimInput = z.infer<typeof createClaimSchema>;
export type UpdateClaimStatusInput = z.infer<typeof updateClaimStatusSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

// API Response interfaces
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
