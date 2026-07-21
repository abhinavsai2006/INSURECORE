// src/index.ts
import { z } from "zod";
var Role = /* @__PURE__ */ ((Role2) => {
  Role2["ADMIN"] = "ADMIN";
  Role2["AGENT"] = "AGENT";
  Role2["CUSTOMER"] = "CUSTOMER";
  return Role2;
})(Role || {});
var PolicyStatus = /* @__PURE__ */ ((PolicyStatus2) => {
  PolicyStatus2["ACTIVE"] = "ACTIVE";
  PolicyStatus2["EXPIRED"] = "EXPIRED";
  PolicyStatus2["CANCELLED"] = "CANCELLED";
  PolicyStatus2["PENDING"] = "PENDING";
  PolicyStatus2["RENEWAL_DUE"] = "RENEWAL_DUE";
  return PolicyStatus2;
})(PolicyStatus || {});
var ClaimStatus = /* @__PURE__ */ ((ClaimStatus2) => {
  ClaimStatus2["SUBMITTED"] = "SUBMITTED";
  ClaimStatus2["UNDER_REVIEW"] = "UNDER_REVIEW";
  ClaimStatus2["APPROVED"] = "APPROVED";
  ClaimStatus2["REJECTED"] = "REJECTED";
  ClaimStatus2["SETTLED"] = "SETTLED";
  return ClaimStatus2;
})(ClaimStatus || {});
var PaymentStatus = /* @__PURE__ */ ((PaymentStatus2) => {
  PaymentStatus2["PAID"] = "PAID";
  PaymentStatus2["PENDING"] = "PENDING";
  PaymentStatus2["OVERDUE"] = "OVERDUE";
  PaymentStatus2["FAILED"] = "FAILED";
  return PaymentStatus2;
})(PaymentStatus || {});
var PolicyType = /* @__PURE__ */ ((PolicyType2) => {
  PolicyType2["HEALTH"] = "HEALTH";
  PolicyType2["LIFE"] = "LIFE";
  PolicyType2["MOTOR"] = "MOTOR";
  PolicyType2["HOME"] = "HOME";
  PolicyType2["TRAVEL"] = "TRAVEL";
  return PolicyType2;
})(PolicyType || {});
var PremiumFrequency = /* @__PURE__ */ ((PremiumFrequency2) => {
  PremiumFrequency2["MONTHLY"] = "MONTHLY";
  PremiumFrequency2["QUARTERLY"] = "QUARTERLY";
  PremiumFrequency2["YEARLY"] = "YEARLY";
  return PremiumFrequency2;
})(PremiumFrequency || {});
var DocCategory = /* @__PURE__ */ ((DocCategory2) => {
  DocCategory2["KYC"] = "KYC";
  DocCategory2["POLICY"] = "POLICY";
  DocCategory2["CLAIM_EVIDENCE"] = "CLAIM_EVIDENCE";
  DocCategory2["OTHER"] = "OTHER";
  return DocCategory2;
})(DocCategory || {});
var PaymentMethod = /* @__PURE__ */ ((PaymentMethod2) => {
  PaymentMethod2["CARD"] = "CARD";
  PaymentMethod2["UPI"] = "UPI";
  PaymentMethod2["BANK_TRANSFER"] = "BANK_TRANSFER";
  PaymentMethod2["CASH"] = "CASH";
  return PaymentMethod2;
})(PaymentMethod || {});
var loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});
var registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  dob: z.string().or(z.date()).transform((val) => new Date(val)),
  gender: z.string().optional()
});
var createAgentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Valid phone number is required")
});
var createCustomerSchema = z.object({
  name: z.string().min(2, "Customer name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  dob: z.string().or(z.date()).transform((val) => new Date(val)),
  gender: z.string().optional()
});
var createPolicySchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  agentId: z.string().optional().nullable(),
  policyType: z.nativeEnum(PolicyType),
  planName: z.string().min(2, "Plan name is required"),
  sumInsured: z.number().positive("Sum insured must be positive"),
  premiumAmount: z.number().positive("Premium amount must be positive"),
  premiumFrequency: z.nativeEnum(PremiumFrequency),
  startDate: z.string().or(z.date()).transform((val) => new Date(val)),
  endDate: z.string().or(z.date()).transform((val) => new Date(val)),
  nominee: z.string().optional()
});
var createClaimSchema = z.object({
  policyId: z.string().min(1, "Policy selection is required"),
  claimAmount: z.number().positive("Claim amount must be positive"),
  reason: z.string().min(5, "Reason for claim is required"),
  description: z.string().optional()
});
var updateClaimStatusSchema = z.object({
  status: z.nativeEnum(ClaimStatus),
  approvedAmount: z.number().optional().nullable(),
  reviewNotes: z.string().optional().nullable()
});
var createPaymentSchema = z.object({
  policyId: z.string().min(1, "Policy ID is required"),
  amount: z.number().positive("Amount must be positive"),
  method: z.nativeEnum(PaymentMethod),
  transactionRef: z.string().optional()
});
export {
  ClaimStatus,
  DocCategory,
  PaymentMethod,
  PaymentStatus,
  PolicyStatus,
  PolicyType,
  PremiumFrequency,
  Role,
  createAgentSchema,
  createClaimSchema,
  createCustomerSchema,
  createPaymentSchema,
  createPolicySchema,
  loginSchema,
  registerSchema,
  updateClaimStatusSchema
};
