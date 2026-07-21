"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ClaimStatus: () => ClaimStatus,
  DocCategory: () => DocCategory,
  PaymentMethod: () => PaymentMethod,
  PaymentStatus: () => PaymentStatus,
  PolicyStatus: () => PolicyStatus,
  PolicyType: () => PolicyType,
  PremiumFrequency: () => PremiumFrequency,
  Role: () => Role,
  createAgentSchema: () => createAgentSchema,
  createClaimSchema: () => createClaimSchema,
  createCustomerSchema: () => createCustomerSchema,
  createPaymentSchema: () => createPaymentSchema,
  createPolicySchema: () => createPolicySchema,
  loginSchema: () => loginSchema,
  registerSchema: () => registerSchema,
  updateClaimStatusSchema: () => updateClaimStatusSchema
});
module.exports = __toCommonJS(index_exports);
var import_zod = require("zod");
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
var loginSchema = import_zod.z.object({
  email: import_zod.z.string().email("Please enter a valid email address"),
  password: import_zod.z.string().min(6, "Password must be at least 6 characters")
});
var registerSchema = import_zod.z.object({
  name: import_zod.z.string().min(2, "Name must be at least 2 characters"),
  email: import_zod.z.string().email("Please enter a valid email address"),
  password: import_zod.z.string().min(6, "Password must be at least 6 characters"),
  phone: import_zod.z.string().min(10, "Phone number must be at least 10 digits"),
  address: import_zod.z.string().min(5, "Address is required"),
  city: import_zod.z.string().optional(),
  state: import_zod.z.string().optional(),
  pincode: import_zod.z.string().optional(),
  dob: import_zod.z.string().or(import_zod.z.date()).transform((val) => new Date(val)),
  gender: import_zod.z.string().optional()
});
var createAgentSchema = import_zod.z.object({
  name: import_zod.z.string().min(2, "Name is required"),
  email: import_zod.z.string().email("Valid email is required"),
  password: import_zod.z.string().min(6, "Password must be at least 6 characters"),
  phone: import_zod.z.string().min(10, "Valid phone number is required")
});
var createCustomerSchema = import_zod.z.object({
  name: import_zod.z.string().min(2, "Customer name is required"),
  email: import_zod.z.string().email("Valid email is required"),
  phone: import_zod.z.string().min(10, "Valid phone number is required"),
  address: import_zod.z.string().min(5, "Address is required"),
  city: import_zod.z.string().optional(),
  state: import_zod.z.string().optional(),
  pincode: import_zod.z.string().optional(),
  dob: import_zod.z.string().or(import_zod.z.date()).transform((val) => new Date(val)),
  gender: import_zod.z.string().optional()
});
var createPolicySchema = import_zod.z.object({
  customerId: import_zod.z.string().min(1, "Customer is required"),
  agentId: import_zod.z.string().optional().nullable(),
  policyType: import_zod.z.nativeEnum(PolicyType),
  planName: import_zod.z.string().min(2, "Plan name is required"),
  sumInsured: import_zod.z.number().positive("Sum insured must be positive"),
  premiumAmount: import_zod.z.number().positive("Premium amount must be positive"),
  premiumFrequency: import_zod.z.nativeEnum(PremiumFrequency),
  startDate: import_zod.z.string().or(import_zod.z.date()).transform((val) => new Date(val)),
  endDate: import_zod.z.string().or(import_zod.z.date()).transform((val) => new Date(val)),
  nominee: import_zod.z.string().optional()
});
var createClaimSchema = import_zod.z.object({
  policyId: import_zod.z.string().min(1, "Policy selection is required"),
  claimAmount: import_zod.z.number().positive("Claim amount must be positive"),
  reason: import_zod.z.string().min(5, "Reason for claim is required"),
  description: import_zod.z.string().optional()
});
var updateClaimStatusSchema = import_zod.z.object({
  status: import_zod.z.nativeEnum(ClaimStatus),
  approvedAmount: import_zod.z.number().optional().nullable(),
  reviewNotes: import_zod.z.string().optional().nullable()
});
var createPaymentSchema = import_zod.z.object({
  policyId: import_zod.z.string().min(1, "Policy ID is required"),
  amount: import_zod.z.number().positive("Amount must be positive"),
  method: import_zod.z.nativeEnum(PaymentMethod),
  transactionRef: import_zod.z.string().optional()
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
