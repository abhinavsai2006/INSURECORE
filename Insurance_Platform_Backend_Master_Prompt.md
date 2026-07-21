# MASTER BACKEND PROMPT — "InsureCore" Insurance Management Platform
### Complete Backend Build Specification (Architecture, Database, API, Security, Jobs)

> Paste this entire document into your AI coding tool as the instruction set for building the **backend only**. It defines the full system architecture, data model, every API endpoint with contracts, auth/security model, business rules/state machines, background jobs, file handling, and testing/deployment plan — to a production-grade standard.

---

## 1. BACKEND VISION

Build the complete backend for **InsureCore**, a role-based insurance management platform. It must be secure, auditable, well-validated, and structured so the API is a clean, predictable contract for any frontend (web or mobile) to consume. Treat this as if it will run a real book of insurance business — correctness of state transitions, money, and audit trails matters more than speed of shipping.

---

## 2. TECH STACK

| Layer | Technology |
|---|---|
| Runtime | Node.js (LTS) + TypeScript |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (access + refresh) + bcrypt |
| Validation | Zod (shared schemas, ideally in a `packages/shared` module) |
| File uploads | Multer → local disk (dev) / S3-compatible bucket (prod) via a storage adapter |
| PDF generation | PDFKit |
| Excel export | exceljs |
| Email | Nodemailer (dev: console/ethereal transport; prod: real SMTP/SES) |
| Scheduled jobs | node-cron |
| Logging | pino (structured JSON logs) |
| API docs | swagger-jsdoc + swagger-ui-express, served at `/api/docs` |
| Testing | Vitest + Supertest |
| Containerization | Docker + Docker Compose (api + postgres) |
| Hosting | Render or Railway (API + Postgres) |

---

## 3. PROJECT STRUCTURE

```
apps/api/
  src/
    config/            # env loading, constants
    middleware/         # auth, authorize, errorHandler, requestLogger, rateLimiter, upload
    modules/
      auth/
        auth.controller.ts
        auth.service.ts
        auth.routes.ts
        auth.schema.ts     # zod
      users/
      customers/
      policies/
      claims/
      payments/
      documents/
      reports/
      notifications/
      auditLogs/
    jobs/               # cron jobs
    lib/
      prisma.ts
      storage/           # StorageAdapter interface + local/s3 implementations
      pdf/                # PDFKit generators
      email/              # nodemailer wrapper + templates
      logger.ts
    app.ts                # express app assembly
    server.ts             # entrypoint
  prisma/
    schema.prisma
    seed.ts
  tests/
  .env.example
  Dockerfile
```

Each module follows: **routes → controller (thin, request/response only) → service (business logic) → Prisma (data access)**. Controllers never talk to Prisma directly.

---

## 4. DATABASE SCHEMA (Prisma — authoritative)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  AGENT
  CUSTOMER
}

enum PolicyStatus {
  PENDING
  ACTIVE
  RENEWAL_DUE
  EXPIRED
  CANCELLED
}

enum ClaimStatus {
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  REJECTED
  SETTLED
}

enum PaymentStatus {
  PENDING
  PAID
  OVERDUE
  FAILED
}

enum PolicyType {
  HEALTH
  LIFE
  MOTOR
  HOME
  TRAVEL
}

enum PremiumFrequency {
  MONTHLY
  QUARTERLY
  YEARLY
}

model User {
  id            String    @id @default(uuid())
  name          String
  email         String    @unique
  password      String
  role          Role
  phone         String?
  avatarUrl     String?
  isActive      Boolean   @default(true)
  refreshToken  String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  agentPolicies Policy[]  @relation("AgentPolicies")
  auditLogs     AuditLog[]
  notifications Notification[]
  customer      Customer?
}

model Customer {
  id           String    @id @default(uuid())
  userId       String?   @unique
  user         User?     @relation(fields: [userId], references: [id])
  name         String
  dob          DateTime
  gender       String?
  phone        String
  email        String    @unique
  address      String
  city         String?
  state        String?
  pincode      String?
  kycVerified  Boolean   @default(false)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  policies     Policy[]
  documents    Document[]

  @@index([email])
}

model Policy {
  id               String        @id @default(uuid())
  policyNumber     String        @unique
  customerId       String
  customer         Customer      @relation(fields: [customerId], references: [id])
  agentId          String?
  agent            User?         @relation("AgentPolicies", fields: [agentId], references: [id])
  policyType       PolicyType
  planName         String
  sumInsured       Decimal
  premiumAmount    Decimal
  premiumFrequency PremiumFrequency
  startDate        DateTime
  endDate          DateTime
  status           PolicyStatus  @default(PENDING)
  nominee          String?
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt

  claims           Claim[]
  payments         Payment[]
  documents        Document[]

  @@index([customerId])
  @@index([status])
}

model Claim {
  id             String       @id @default(uuid())
  claimNumber    String       @unique
  policyId       String
  policy         Policy       @relation(fields: [policyId], references: [id])
  claimAmount    Decimal
  approvedAmount Decimal?
  reason         String
  description    String?
  status         ClaimStatus  @default(SUBMITTED)
  reviewedById   String?
  reviewNotes    String?
  submissionDate DateTime     @default(now())
  resolvedDate   DateTime?

  documents      Document[]

  @@index([policyId])
  @@index([status])
}

model Payment {
  id             String        @id @default(uuid())
  policyId       String
  policy         Policy        @relation(fields: [policyId], references: [id])
  amount         Decimal
  dueDate        DateTime
  paymentDate    DateTime?
  paymentStatus  PaymentStatus @default(PENDING)
  method         String?
  transactionRef String?
  idempotencyKey String?       @unique
  createdAt      DateTime      @default(now())

  @@index([policyId])
  @@index([paymentStatus])
}

model Document {
  id          String    @id @default(uuid())
  customerId  String?
  customer    Customer? @relation(fields: [customerId], references: [id])
  policyId    String?
  policy      Policy?   @relation(fields: [policyId], references: [id])
  claimId     String?
  claim       Claim?    @relation(fields: [claimId], references: [id])
  fileName    String
  filePath    String
  fileType    String
  fileSizeKb  Int
  docCategory String    // KYC | POLICY | CLAIM_EVIDENCE | OTHER
  uploadedAt  DateTime  @default(now())
}

model AuditLog {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  action     String   // e.g. POLICY_CREATED, CLAIM_APPROVED
  entityType String   // Policy | Claim | Payment | Customer | User
  entityId   String
  metadata   Json?    // { before, after } diff
  createdAt  DateTime @default(now())

  @@index([entityType, entityId])
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  title     String
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

Migrations: use `prisma migrate dev` locally, `prisma migrate deploy` in CI/CD. Ship a `prisma/seed.ts` that creates 1 admin, 3 agents, 25 customers, 40 policies (mixed statuses), 60 payments (mixed statuses incl. overdue), 15 claims (spread across all statuses), and matching documents — enough for every dashboard chart to render real-looking data.

---

## 5. AUTH & SECURITY MODEL

- **Password hashing**: bcrypt, cost factor 12.
- **JWT access token**: 15 min expiry, payload `{ sub: userId, role, customerId? }`.
- **Refresh token**: 7-day expiry, stored httpOnly + secure + sameSite cookie, also hashed and stored on `User.refreshToken` for revocation; rotated on every refresh.
- **Login rate limiting**: max 5 attempts/min per IP+email combo (express-rate-limit), lockout message after threshold.
- **Authorization**: `authorize(...roles: Role[])` middleware on every protected route; additionally, service-layer functions re-check row ownership (e.g., a Customer can only ever query their own `customerId`, enforced in the query itself, not just the route guard).
- **Input validation**: every request body/query/params validated with Zod at the route boundary; invalid input returns `400` with field-level errors, never reaches the service layer.
- **Headers/hardening**: `helmet`, CORS locked to known frontend origin(s), `express-rate-limit` globally (100 req/min/IP) plus stricter limits on auth routes.
- **File upload safety**: Multer restricted to `application/pdf, image/jpeg, image/png`, max 10MB, filename sanitized/UUID-renamed on disk, virus-scan hook placeholder (stub function, real integration optional).
- **Secrets**: all via `.env` (never committed); `.env.example` documents every required variable.
- **Audit logging**: every create/update/delete on Policy, Claim, Payment, Customer, User writes an `AuditLog` row with actor, action, entity, and a before/after diff in `metadata`.

---

## 6. BUSINESS RULES & STATE MACHINES (enforce server-side, reject illegal transitions with `409`)

**Policy status:**
```
PENDING → ACTIVE → RENEWAL_DUE → EXPIRED
                 → CANCELLED (from PENDING, ACTIVE, or RENEWAL_DUE)
```

**Claim status:**
```
SUBMITTED → UNDER_REVIEW → APPROVED → SETTLED
                         → REJECTED
```

**Payment status:**
```
PENDING → PAID
PENDING → OVERDUE (via cron, if dueDate passed and unpaid)
PENDING/OVERDUE → FAILED (on failed transaction attempt)
```

**Numbering:**
- Policy number: `POL-{YYYY}-{6-digit zero-padded sequence}` e.g. `POL-2026-000123`.
- Claim number: `CLM-{YYYY}-{6-digit zero-padded sequence}`.
- Generated atomically in a DB transaction to avoid collisions under concurrency.

**Money:** all monetary fields use Prisma `Decimal` (never `Float`) to avoid rounding errors; format/round only at the presentation layer.

**Idempotency:** `POST /payments` accepts an `Idempotency-Key` header; if a payment with that key already exists, return the existing record instead of creating a duplicate.

---

## 7. FULL API SPECIFICATION

Base path: `/api/v1`. All responses: success → `{ data, message }`; error → `{ error: { code, message, fields? } }`. List endpoints support `?page=1&limit=20&sort=field:asc|desc&search=...` plus resource-specific filters.

### 7.1 Auth
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | /auth/register | Public | Customer self-signup, creates User+Customer |
| POST | /auth/login | Public | Returns access token + sets refresh cookie |
| POST | /auth/refresh | Public (cookie) | Rotates refresh token |
| POST | /auth/logout | Authenticated | Clears refresh cookie, invalidates stored token |
| POST | /auth/forgot-password | Public | Sends reset email (mock) |
| POST | /auth/reset-password | Public (token) | |
| GET | /auth/me | Authenticated | Returns current user profile |

### 7.2 Users (Admin only, manages Agents/Admins)
| Method | Path | Notes |
|---|---|---|
| GET | /users | filter by role/status |
| POST | /users | create Agent/Admin |
| GET | /users/:id | |
| PATCH | /users/:id | |
| DELETE | /users/:id | soft-delete via `isActive=false` |

### 7.3 Customers
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | /customers | Admin/Agent (all/assigned), Customer (self only) | |
| POST | /customers | Admin/Agent | |
| GET | /customers/:id | scoped | |
| PATCH | /customers/:id | scoped | |
| GET | /customers/:id/history | scoped | unified timeline: policies+claims+payments+documents |

### 7.4 Policies
| Method | Path | Notes |
|---|---|---|
| GET | /policies | filters: status, type, agentId, customerId, dateRange |
| POST | /policies | generates policyNumber, status=PENDING |
| GET | /policies/:id | |
| PATCH | /policies/:id | edits plan/premium details pre-activation |
| POST | /policies/:id/activate | PENDING → ACTIVE |
| POST | /policies/:id/renew | extends endDate, creates new payment cycle |
| POST | /policies/:id/cancel | any active state → CANCELLED, requires reason |
| GET | /policies/expiring-soon | next 30 days, for dashboard widget |
| GET | /policies/:id/pdf | generates policy document PDF |

### 7.5 Claims
| Method | Path | Notes |
|---|---|---|
| GET | /claims | filters: status, policyId, dateRange |
| POST | /claims | Customer only, status=SUBMITTED, generates claimNumber |
| GET | /claims/:id | |
| PATCH | /claims/:id/status | Agent/Admin only; body: `{ status, approvedAmount?, reviewNotes? }`; validates legal transition |
| GET | /claims/:id/timeline | derived from AuditLog entries for that claim |

### 7.6 Payments
| Method | Path | Notes |
|---|---|---|
| GET | /payments | filters: policyId, status, dateRange |
| POST | /payments | requires `Idempotency-Key` header |
| GET | /payments/:id | |
| GET | /payments/overdue | |
| POST | /payments/:id/mark-paid | Admin/Agent manual reconciliation |
| GET | /payments/:id/receipt.pdf | |

### 7.7 Documents
| Method | Path | Notes |
|---|---|---|
| POST | /documents/upload | multipart/form-data via Multer; body includes `docCategory` + one of `customerId/policyId/claimId` |
| GET | /documents/:id | metadata |
| GET | /documents/:id/download | streams file via signed short-lived URL or auth-checked stream |
| DELETE | /documents/:id | Admin/Agent, or owning Customer |

### 7.8 Reports
| Method | Path | Notes |
|---|---|---|
| GET | /reports/overview | KPI summary for dashboard StatCards |
| GET | /reports/policies | active vs expired vs cancelled breakdown |
| GET | /reports/claims | status breakdown, approval rate, avg resolution time |
| GET | /reports/premium-collection | time-series, filterable by date range |
| GET | /reports/customer-growth | new customers per month time-series |
| GET | /reports/export/pdf | Monthly Business Report PDF |
| GET | /reports/export/excel | same data as Excel workbook |

### 7.9 Notifications
| Method | Path | Notes |
|---|---|---|
| GET | /notifications | current user's notifications |
| PATCH | /notifications/:id/read | |
| PATCH | /notifications/read-all | |

### 7.10 Audit Logs (Admin only)
| Method | Path | Notes |
|---|---|---|
| GET | /audit-logs | filters: userId, entityType, entityId, dateRange |

### 7.11 Health/meta
| Method | Path | Notes |
|---|---|---|
| GET | /health | uptime/db-connectivity check for hosting platform |
| GET | /docs | Swagger UI |

---

## 8. MIDDLEWARE PIPELINE (exact order)

```
helmet()
cors({ origin: FRONTEND_URL, credentials: true })
express.json({ limit: '2mb' })
cookieParser()
requestLogger (pino-http)
globalRateLimiter
[route-specific: authenticate → authorize(roles) → validate(zodSchema) → controller]
notFoundHandler
centralizedErrorHandler   // maps thrown AppError -> {status, error:{code,message,fields}}
```

Define a small `AppError` class hierarchy (`ValidationError`, `NotFoundError`, `ForbiddenError`, `ConflictError`) that services throw and the centralized handler translates to correct HTTP codes.

---

## 9. BACKGROUND JOBS (node-cron)

| Job | Schedule | Action |
|---|---|---|
| Policy expiry sweep | daily 00:15 | flips `ACTIVE`/`RENEWAL_DUE` policies past `endDate` → `EXPIRED` |
| Renewal-due flag | daily 00:20 | flags `ACTIVE` policies within 30 days of `endDate` → `RENEWAL_DUE`, creates Notification |
| Overdue payment sweep | daily 00:30 | flips `PENDING` payments past `dueDate` → `OVERDUE`, creates Notification |
| Digest email (optional) | daily 07:00 | sends agents a summary of pending claim reviews |

Jobs live in `src/jobs/`, registered once in `server.ts`, guarded so they don't double-run in a multi-instance deployment (simple DB-lock flag or run only on a designated instance).

---

## 10. FILE STORAGE ABSTRACTION

Define a `StorageAdapter` interface:
```ts
interface StorageAdapter {
  save(file: Buffer, key: string, mimeType: string): Promise<string>; // returns storage path/URL
  getSignedUrl(key: string, expiresInSec: number): Promise<string>;
  delete(key: string): Promise<void>;
}
```
Implement `LocalStorageAdapter` (writes to `/uploads`, dev only) and `S3StorageAdapter` (prod). Select implementation via `STORAGE_DRIVER` env var. Document routes and services depend only on the interface, never on a concrete implementation.

---

## 11. PDF & EXCEL GENERATION

- **Policy PDF**: PDFKit template with company header, policy number, customer details, coverage table, premium schedule, signature block.
- **Payment receipt PDF**: simpler one-page receipt with transaction ref, amount, date, policy number.
- **Monthly Business Report PDF**: cover page + summary tables (mirrors the Reports screens).
- **Excel export**: exceljs workbook with one sheet per report section (Policies, Claims, Payments, Customer Growth), formatted headers and number formats.

---

## 12. VALIDATION SCHEMAS (Zod — representative examples to follow as a pattern)

```ts
export const createPolicySchema = z.object({
  customerId: z.string().uuid(),
  agentId: z.string().uuid().optional(),
  policyType: z.nativeEnum(PolicyType),
  planName: z.string().min(2),
  sumInsured: z.coerce.number().positive(),
  premiumAmount: z.coerce.number().positive(),
  premiumFrequency: z.nativeEnum(PremiumFrequency),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  nominee: z.string().optional(),
}).refine(d => d.endDate > d.startDate, {
  message: "endDate must be after startDate",
  path: ["endDate"],
});

export const updateClaimStatusSchema = z.object({
  status: z.enum(["UNDER_REVIEW", "APPROVED", "REJECTED", "SETTLED"]),
  approvedAmount: z.coerce.number().positive().optional(),
  reviewNotes: z.string().min(3).optional(),
}).refine(d => d.status !== "APPROVED" || d.approvedAmount !== undefined, {
  message: "approvedAmount is required when approving a claim",
  path: ["approvedAmount"],
});
```
Every module gets an equivalent `*.schema.ts` file; controllers call `validate(schema)` middleware before the handler runs.

---

## 13. TESTING PLAN

- **Unit tests** (Vitest): service-layer business logic — state machine transitions, policy/claim number generation, idempotency handling, permission-scoping helpers.
- **Integration tests** (Supertest + a test Postgres DB or Testcontainers): full request/response cycles per module — auth flow, CRUD + authorization boundaries (e.g., Customer A cannot fetch Customer B's policy → expect 403/404).
- **Coverage target**: prioritize the state-machine and money-handling code paths over trivial CRUD getters.
- CI: run `prisma migrate deploy` against a test DB, then the full test suite, on every PR.

---

## 14. ENVIRONMENT VARIABLES (`.env.example`)

```
DATABASE_URL=postgresql://user:pass@localhost:5432/insurecore
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
FRONTEND_URL=http://localhost:5173
STORAGE_DRIVER=local            # local | s3
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
PORT=4000
NODE_ENV=development
```

---

## 15. DEPLOYMENT

- **Dockerfile**: multi-stage build (install → build TS → slim runtime image running compiled JS).
- **docker-compose.yml**: `api` + `postgres` services for local dev, with a volume for Postgres data and `/uploads`.
- **Production**: deploy API + Postgres to Render or Railway; run `prisma migrate deploy` as a release step; set all env vars in the platform's secrets manager; enable HTTPS-only and set `FRONTEND_URL` to the deployed frontend origin for CORS.
- **Health check**: `/health` endpoint wired to the hosting platform's health-check config.

---

## 16. BUILD ORDER FOR THE AI CODING AGENT

1. Scaffold project structure, Docker Compose, Prisma schema + migration + seed script.
2. Core infra: Prisma client singleton, logger, error classes, centralized error handler, storage adapter, env config loader.
3. Auth module fully working (register/login/refresh/logout/me) + `authenticate`/`authorize` middleware, tested end-to-end.
4. Users (Admin-manages-Agents) module.
5. Customers module (CRUD + scoped access + history endpoint).
6. Policies module (CRUD + state machine transitions + numbering + PDF export).
7. Payments module (CRUD + idempotency + overdue logic + receipt PDF).
8. Claims module (CRUD + state machine + timeline derivation).
9. Documents module (upload/download/delete with storage adapter).
10. Reports module (aggregation queries + PDF/Excel export).
11. Notifications module + AuditLog write-through wired into every mutating service call across all modules above.
12. Cron jobs (policy expiry, renewal-due, overdue payments).
13. Swagger docs generated from route schemas.
14. Full test suite (unit + integration) and CI pipeline.
15. Dockerize and deploy; smoke-test every endpoint against the deployed frontend.

---

## 17. INSTRUCTIONS TO THE AI CODING AGENT

- Follow the routes → controller → service → Prisma layering strictly; do not put business logic or Prisma calls inside controllers.
- Enforce every state-machine transition in §6 server-side with a `409 Conflict` on illegal transitions — never trust the client to only send valid transitions.
- Every mutating endpoint must write an `AuditLog` entry with a before/after diff.
- Every list endpoint must implement real pagination, sorting, filtering, and search — no in-memory `.filter()` over an unbounded `findMany()`.
- Never use `Float` for money; always `Decimal`, and only format/round at the response/presentation boundary.
- Validate all input with Zod at the route boundary before it reaches a service function.
- Write integration tests for every authorization boundary (a Customer must never be able to read/write another customer's data; an Agent must never bypass Admin-only routes).
- Keep the API response envelope (`{data, message}` / `{error:{...}}`) identical across all modules.
