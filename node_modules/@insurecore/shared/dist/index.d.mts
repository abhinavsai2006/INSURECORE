import { z } from 'zod';

declare enum Role {
    ADMIN = "ADMIN",
    AGENT = "AGENT",
    CUSTOMER = "CUSTOMER"
}
declare enum PolicyStatus {
    ACTIVE = "ACTIVE",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED",
    PENDING = "PENDING",
    RENEWAL_DUE = "RENEWAL_DUE"
}
declare enum ClaimStatus {
    SUBMITTED = "SUBMITTED",
    UNDER_REVIEW = "UNDER_REVIEW",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    SETTLED = "SETTLED"
}
declare enum PaymentStatus {
    PAID = "PAID",
    PENDING = "PENDING",
    OVERDUE = "OVERDUE",
    FAILED = "FAILED"
}
declare enum PolicyType {
    HEALTH = "HEALTH",
    LIFE = "LIFE",
    MOTOR = "MOTOR",
    HOME = "HOME",
    TRAVEL = "TRAVEL"
}
declare enum PremiumFrequency {
    MONTHLY = "MONTHLY",
    QUARTERLY = "QUARTERLY",
    YEARLY = "YEARLY"
}
declare enum DocCategory {
    KYC = "KYC",
    POLICY = "POLICY",
    CLAIM_EVIDENCE = "CLAIM_EVIDENCE",
    OTHER = "OTHER"
}
declare enum PaymentMethod {
    CARD = "CARD",
    UPI = "UPI",
    BANK_TRANSFER = "BANK_TRANSFER",
    CASH = "CASH"
}
declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    phone: z.ZodString;
    address: z.ZodString;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    pincode: z.ZodOptional<z.ZodString>;
    dob: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, Date, string | Date>;
    gender: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name: string;
    phone: string;
    address: string;
    dob: Date;
    city?: string | undefined;
    state?: string | undefined;
    pincode?: string | undefined;
    gender?: string | undefined;
}, {
    email: string;
    password: string;
    name: string;
    phone: string;
    address: string;
    dob: string | Date;
    city?: string | undefined;
    state?: string | undefined;
    pincode?: string | undefined;
    gender?: string | undefined;
}>;
declare const createAgentSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    phone: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name: string;
    phone: string;
}, {
    email: string;
    password: string;
    name: string;
    phone: string;
}>;
declare const createCustomerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    address: z.ZodString;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    pincode: z.ZodOptional<z.ZodString>;
    dob: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, Date, string | Date>;
    gender: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    name: string;
    phone: string;
    address: string;
    dob: Date;
    city?: string | undefined;
    state?: string | undefined;
    pincode?: string | undefined;
    gender?: string | undefined;
}, {
    email: string;
    name: string;
    phone: string;
    address: string;
    dob: string | Date;
    city?: string | undefined;
    state?: string | undefined;
    pincode?: string | undefined;
    gender?: string | undefined;
}>;
declare const createPolicySchema: z.ZodObject<{
    customerId: z.ZodString;
    agentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    policyType: z.ZodNativeEnum<typeof PolicyType>;
    planName: z.ZodString;
    sumInsured: z.ZodNumber;
    premiumAmount: z.ZodNumber;
    premiumFrequency: z.ZodNativeEnum<typeof PremiumFrequency>;
    startDate: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, Date, string | Date>;
    endDate: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, Date, string | Date>;
    nominee: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    customerId: string;
    policyType: PolicyType;
    planName: string;
    sumInsured: number;
    premiumAmount: number;
    premiumFrequency: PremiumFrequency;
    startDate: Date;
    endDate: Date;
    agentId?: string | null | undefined;
    nominee?: string | undefined;
}, {
    customerId: string;
    policyType: PolicyType;
    planName: string;
    sumInsured: number;
    premiumAmount: number;
    premiumFrequency: PremiumFrequency;
    startDate: string | Date;
    endDate: string | Date;
    agentId?: string | null | undefined;
    nominee?: string | undefined;
}>;
declare const createClaimSchema: z.ZodObject<{
    policyId: z.ZodString;
    claimAmount: z.ZodNumber;
    reason: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    policyId: string;
    claimAmount: number;
    reason: string;
    description?: string | undefined;
}, {
    policyId: string;
    claimAmount: number;
    reason: string;
    description?: string | undefined;
}>;
declare const updateClaimStatusSchema: z.ZodObject<{
    status: z.ZodNativeEnum<typeof ClaimStatus>;
    approvedAmount: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    reviewNotes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status: ClaimStatus;
    approvedAmount?: number | null | undefined;
    reviewNotes?: string | null | undefined;
}, {
    status: ClaimStatus;
    approvedAmount?: number | null | undefined;
    reviewNotes?: string | null | undefined;
}>;
declare const createPaymentSchema: z.ZodObject<{
    policyId: z.ZodString;
    amount: z.ZodNumber;
    method: z.ZodNativeEnum<typeof PaymentMethod>;
    transactionRef: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    policyId: string;
    amount: number;
    method: PaymentMethod;
    transactionRef?: string | undefined;
}, {
    policyId: string;
    amount: number;
    method: PaymentMethod;
    transactionRef?: string | undefined;
}>;
type LoginInput = z.infer<typeof loginSchema>;
type RegisterInput = z.infer<typeof registerSchema>;
type CreateAgentInput = z.infer<typeof createAgentSchema>;
type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
type CreatePolicyInput = z.infer<typeof createPolicySchema>;
type CreateClaimInput = z.infer<typeof createClaimSchema>;
type UpdateClaimStatusInput = z.infer<typeof updateClaimStatusSchema>;
type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
interface ApiResponse<T = any> {
    data?: T;
    message?: string;
    error?: {
        code: string;
        message: string;
        fields?: Record<string, string>;
    };
}
interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export { type ApiResponse, ClaimStatus, type CreateAgentInput, type CreateClaimInput, type CreateCustomerInput, type CreatePaymentInput, type CreatePolicyInput, DocCategory, type LoginInput, type PaginatedResponse, PaymentMethod, PaymentStatus, PolicyStatus, PolicyType, PremiumFrequency, type RegisterInput, Role, type UpdateClaimStatusInput, createAgentSchema, createClaimSchema, createCustomerSchema, createPaymentSchema, createPolicySchema, loginSchema, registerSchema, updateClaimStatusSchema };
