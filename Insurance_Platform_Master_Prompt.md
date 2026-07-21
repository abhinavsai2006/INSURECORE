# MASTER PROMPT — "InsureCore" Insurance Management Platform
### Flagship-Grade Full-Stack Build Specification (Frontend + Backend + System Design)

> Paste this entire document into your AI coding tool (Claude Code, Cursor, etc.) as the master instruction. It defines the complete product: every screen, every flow, the full data model, the API surface, and the system architecture, written to a professional/enterprise SaaS standard (think Stripe Dashboard / Gusto / Zenefits level of polish, applied to insurance).

---

## 1. PRODUCT VISION

Build **InsureCore**, a production-grade, multi-tenant-ready Insurance Management Platform that lets an insurance company run its entire policy lifecycle — customer onboarding, policy issuance, premium collection, claims processing, document management, and executive reporting — through one secure, role-based web application.

**Design bar:** modern fintech/insurtech SaaS. Clean data-dense tables, calm neutral palette with one confident accent color, real dashboards (not toy charts), skeleton loading states, empty states, and micro-interactions. Nothing should look like a bootcamp CRUD app — it should look fundable.

---

## 2. TECH STACK (authoritative — do not substitute without asking)

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript, Vite |
| Styling | Tailwind CSS + shadcn/ui component primitives |
| State/data | TanStack Query (server state) + Zustand (UI state) |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod resolvers |
| Charts | Recharts (or Chart.js) |
| Backend | Node.js + Express.js (TypeScript) |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (access + refresh tokens) + bcrypt |
| File uploads | Multer → local disk in dev, S3-compatible bucket in prod |
| Validation | Zod (shared schemas between client/server via a `shared` package) |
| PDF generation | PDFKit |
| Email | Nodemailer (mock/dev transport) |
| API docs | OpenAPI/Swagger via `swagger-jsdoc` |
| Testing | Vitest + Supertest (backend), React Testing Library (frontend) |
| Infra | Docker Compose (db + api + web) for local dev |
| Hosting | Backend: Render/Railway. Frontend: Vercel. DB: Neon/Supabase/Railway Postgres |

Monorepo layout:
```
insurecore/
  apps/
    web/           # React frontend
    api/           # Express backend
  packages/
    shared/        # Zod schemas, TS types, constants shared by web+api
  prisma/
    schema.prisma
  docker-compose.yml
```

---

## 3. USER ROLES & PERMISSION MATRIX

Three roles, enforced both at API middleware level and UI route-guard level.

| Capability | Admin | Agent | Customer |
|---|---|---|---|
| Manage employees/agents | ✅ | ❌ | ❌ |
| Register customers | ✅ | ✅ | Self-register only |
| Create/edit policies | ✅ | ✅ | ❌ |
| Cancel/renew policies | ✅ | ✅ | Request renewal only |
| View own policies | ✅ (all) | ✅ (assigned) | ✅ (own) |
| Submit claims | ❌ | ❌ | ✅ |
| Verify/approve/reject claims | ✅ | ✅ | ❌ |
| Record premium payments | ✅ | ✅ | ✅ (self-pay) |
| Upload documents | ✅ | ✅ | ✅ |
| View reports/dashboards | ✅ (full) | ✅ (scoped) | ❌ |
| System settings, audit log | ✅ | ❌ | ❌ |

Auth model: JWT access token (15 min) + httpOnly refresh cookie (7 days), silent refresh on 401, role claim embedded in token and re-validated server-side on every protected route (never trust client role alone).

---

## 4. DATA MODEL (Prisma schema — full, not the placeholder from the brief)

```prisma
enum Role {
  ADMIN
  AGENT
  CUSTOMER
}

enum PolicyStatus {
  ACTIVE
  EXPIRED
  CANCELLED
  PENDING
  RENEWAL_DUE
}

enum ClaimStatus {
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  REJECTED
  SETTLED
}

enum PaymentStatus {
  PAID
  PENDING
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

model User {
  id            String   @id @default(uuid())
  name          String
  email         String   @unique
  password      String
  role          Role
  phone         String?
  avatarUrl     String?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  agentPolicies Policy[]        @relation("AgentPolicies")
  auditLogs     AuditLog[]
  customer      Customer?
}

model Customer {
  id            String   @id @default(uuid())
  userId        String?  @unique
  user          User?    @relation(fields: [userId], references: [id])
  name          String
  dob           DateTime
  gender        String?
  phone         String
  email         String   @unique
  address       String
  city          String?
  state         String?
  pincode       String?
  kycVerified   Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  policies      Policy[]
  documents     Document[]
}

model Policy {
  id              String        @id @default(uuid())
  policyNumber    String        @unique
  customerId      String
  customer        Customer      @relation(fields: [customerId], references: [id])
  agentId         String?
  agent           User?         @relation("AgentPolicies", fields: [agentId], references: [id])
  policyType      PolicyType
  planName        String
  sumInsured      Decimal
  premiumAmount   Decimal
  premiumFrequency String       // MONTHLY | QUARTERLY | YEARLY
  startDate       DateTime
  endDate         DateTime
  status          PolicyStatus  @default(PENDING)
  nominee         String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  claims          Claim[]
  payments        Payment[]
  documents       Document[]
}

model Claim {
  id              String       @id @default(uuid())
  claimNumber     String       @unique
  policyId        String
  policy          Policy       @relation(fields: [policyId], references: [id])
  claimAmount     Decimal
  approvedAmount  Decimal?
  reason          String
  description     String?
  status          ClaimStatus  @default(SUBMITTED)
  reviewedById    String?
  reviewNotes     String?
  submissionDate  DateTime     @default(now())
  resolvedDate    DateTime?

  documents       Document[]
}

model Payment {
  id             String        @id @default(uuid())
  policyId       String
  policy         Policy        @relation(fields: [policyId], references: [id])
  amount         Decimal
  dueDate        DateTime
  paymentDate    DateTime?
  paymentStatus  PaymentStatus @default(PENDING)
  method         String?       // CARD | UPI | BANK_TRANSFER | CASH
  transactionRef String?
  createdAt      DateTime      @default(now())
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
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  action      String
  entityType  String
  entityId    String
  metadata    Json?
  createdAt   DateTime @default(now())
}

model Notification {
  id         String   @id @default(uuid())
  userId     String
  title      String
  message    String
  isRead     Boolean  @default(false)
  createdAt  DateTime @default(now())
}
```

---

## 5. BACKEND — API SURFACE (REST, versioned under `/api/v1`)

Conventions: all list endpoints support `?page`, `?limit`, `?sort`, `?search`, and relevant filters. All mutating endpoints validate with Zod, write an AuditLog entry, and return `{ data, message }`. Errors return `{ error: { code, message, fields? } }` with correct HTTP status.

```
Auth
  POST   /auth/register            (customer self-signup)
  POST   /auth/login
  POST   /auth/refresh
  POST   /auth/logout
  POST   /auth/forgot-password
  POST   /auth/reset-password

Users (Admin only)
  GET    /users
  POST   /users                    (create agent/admin)
  GET    /users/:id
  PATCH  /users/:id
  DELETE /users/:id

Customers
  GET    /customers                (Admin/Agent: all, Customer: self)
  POST   /customers                (Admin/Agent registers a customer)
  GET    /customers/:id
  PATCH  /customers/:id
  GET    /customers/:id/history    (policies + claims + payments timeline)

Policies
  GET    /policies
  POST   /policies
  GET    /policies/:id
  PATCH  /policies/:id
  POST   /policies/:id/renew
  POST   /policies/:id/cancel
  GET    /policies/expiring-soon

Claims
  GET    /claims
  POST   /claims
  GET    /claims/:id
  PATCH  /claims/:id/status        (approve/reject/settle, Agent/Admin)
  GET    /claims/:id/timeline

Payments
  GET    /payments
  POST   /payments
  GET    /payments/:id
  GET    /payments/overdue
  POST   /payments/:id/mark-paid

Documents
  POST   /documents/upload         (multer, multipart/form-data)
  GET    /documents/:id
  GET    /documents/:id/download
  DELETE /documents/:id

Reports (Admin/Agent)
  GET    /reports/overview         (KPI summary)
  GET    /reports/policies
  GET    /reports/claims
  GET    /reports/premium-collection
  GET    /reports/customer-growth
  GET    /reports/export/pdf
  GET    /reports/export/excel

Notifications
  GET    /notifications
  PATCH  /notifications/:id/read

Audit (Admin only)
  GET    /audit-logs
```

Middleware stack (in order): `helmet` → CORS → rate limiter → JSON body parser → request logger → `authenticate` (JWT) → `authorize(roles[])` → route handler → centralized error handler.

---

## 6. SYSTEM DESIGN NOTES

- **Multi-role, single database, row-scoped access.** No separate schemas per role; enforce visibility via query filters (customer sees only `customerId = req.user.customerId`, agent sees only assigned policies unless Admin).
- **Policy numbering**: server-generated, format `POL-{YEAR}-{6-digit-sequence}`. Claims: `CLM-{YEAR}-{6-digit}`.
- **State machines**: Policy (`PENDING → ACTIVE → RENEWAL_DUE → EXPIRED/CANCELLED`) and Claim (`SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED → SETTLED`) are enforced server-side; illegal transitions rejected with 409.
- **Scheduled jobs** (node-cron): nightly job flips policies to `EXPIRED` past `endDate`, flags `RENEWAL_DUE` 30 days before, flags overdue payments, and queues notification emails.
- **File storage**: abstracted behind a `StorageAdapter` interface so local disk (dev) and S3 (prod) are swappable without touching route code.
- **Auditability**: every create/update/delete on Policy, Claim, Payment writes to `AuditLog` with before/after diff in `metadata`.
- **Idempotency**: payment creation accepts an `Idempotency-Key` header to prevent double-charge on retry.
- **Security**: bcrypt cost 12, JWT rotation, rate-limited login (5/min), input sanitization, file-type/size validation on uploads (PDF/JPG/PNG only, 10MB cap), signed short-lived URLs for document downloads.

---

## 7. FRONTEND — INFORMATION ARCHITECTURE (ALL SCREENS)

### 7.1 Public / Auth
1. **Landing page** — hero, product pitch, trust badges, CTA to login/signup (marketing-grade, not just a login box).
2. **Login**
3. **Customer Sign Up** (multi-step: account → personal details → KYC upload)
4. **Forgot Password / Reset Password**

### 7.2 Shared Shell (all authenticated roles)
- Persistent left sidebar (collapsible), top bar with global search, notifications bell (dropdown with unread count), user menu (profile, settings, logout).
- Sidebar nav items vary by role (see §3 matrix).
- Breadcrumbs on every inner page.
- Command palette (⌘K) for quick navigation/search — flagship touch.

### 7.3 Admin Screens
1. **Admin Dashboard** — KPI cards (Active Policies, Total Premium Collected MTD, Open Claims, Overdue Payments, New Customers this month), trend charts (premium collection over 12 months, claims by status donut, policy type distribution bar), recent activity feed, expiring-soon policy widget.
2. **Employees/Agents** — list (search, filter by status), Add Agent modal/drawer, Agent detail page (assigned policies, performance stats).
3. **Customers** — list with search/filter, Customer detail page (tabs: Profile, Policies, Claims, Payments, Documents, Activity History).
4. **Policies** — list (filters: status, type, agent, date range), Policy detail page (tabs: Overview, Payments, Claims, Documents, Audit Trail), Create Policy wizard (multi-step: select customer → plan/type → coverage & premium → review & issue).
5. **Claims** — Kanban-style board (Submitted / Under Review / Approved / Rejected / Settled columns) + table view toggle, Claim detail page (evidence viewer, approve/reject with notes, amount adjustment).
6. **Premium Tracking** — payments table, overdue alert panel, record-payment modal, payment detail drawer.
7. **Documents** — searchable document library grouped by customer/policy/claim, preview modal (PDF/image inline viewer), upload drawer.
8. **Reports Dashboard** — full-page analytics: Active vs Expired Policies, Claim Statistics (approval rate, avg settlement time), Premium Collection trends, Customer Growth funnel, Monthly Business Report generator with PDF/Excel export.
9. **Audit Logs** — filterable table of every system action, with actor, entity, timestamp, diff viewer.
10. **System Settings** — company profile, policy types/plans config, notification templates, roles/permissions overview.

### 7.4 Agent Screens
- Agent Dashboard (scoped KPIs: my customers, my policies, pending claim reviews assigned to me).
- Customers (register/search/edit — same components as Admin, scoped).
- Policies (create/renew/cancel — scoped to own book of business).
- Claims (review queue, approve/reject).
- Premium Tracking (record payments for own policies).
- Documents (verify KYC uploads).

### 7.5 Customer Screens
1. **Customer Dashboard** — policy summary cards, upcoming premium due banner, recent claim status, quick actions (Pay Premium, File a Claim, Upload Document).
2. **My Policies** — card/list of all policies, Policy Detail page (coverage summary, premium schedule, download policy PDF).
3. **Pay Premium** — payment flow (select policy → amount → method → confirmation), Payment History tab.
4. **My Claims** — Submit New Claim (stepper: select policy → claim details → upload evidence → review & submit), Claim tracker with status timeline (visual stepper matching claim state machine).
5. **Documents** — my uploaded documents, upload new (KYC/policy/claim), download.
6. **Profile & Settings** — edit personal info, change password, notification preferences.
7. **Notifications Center** — full list, mark-as-read, filters.

### 7.6 Cross-cutting UI states to design for every list/table screen
Loading (skeletons), Empty (illustration + CTA), Error (retry), and Success/toast confirmations for every mutation.

---

## 8. KEY USER FLOWS (write these as explicit acceptance criteria)

**Flow A — Policy Issuance:** Agent registers customer → Agent runs Create Policy wizard → system generates policy number, sets status `PENDING` → Admin/Agent confirms → status → `ACTIVE` → confirmation email (mock) → policy visible in customer's dashboard.

**Flow B — Premium Payment:** Customer sees due payment banner → clicks Pay Premium → selects method → payment recorded (`PENDING`→`PAID`) → policy payment history updates → receipt PDF generated.

**Flow C — Claim Lifecycle:** Customer submits claim with documents → status `SUBMITTED` → Agent moves to `UNDER_REVIEW`, verifies documents → Agent/Admin sets `APPROVED` (with approved amount) or `REJECTED` (with reason) → on approval, Admin marks `SETTLED` after payout → customer sees live status timeline throughout.

**Flow D — Renewal:** Cron flags policies `RENEWAL_DUE` 30 days pre-expiry → customer/agent notified → renewal action creates a new premium cycle and extends `endDate`, logged in audit trail.

**Flow E — Reporting:** Admin opens Reports Dashboard → filters by date range/policy type → views charts → exports Monthly Business Report as PDF/Excel.

---

## 9. VISUAL DESIGN SYSTEM

- **Palette**: deep navy/ink primary (`#0F1729`-ish) for nav/headers, one confident accent (e.g., emerald or indigo) for primary actions, neutral grays for surfaces, semantic colors for status chips (green=active/approved, amber=pending/due, red=overdue/rejected, slate=expired/cancelled).
- **Typography**: Inter or similar for UI, tabular numerals for financial figures.
- **Components**: status badges/chips everywhere status appears, data tables with sticky headers + column sort + row density toggle, drawers for create/edit (not full page nav where avoidable), stepper components for wizards, timeline component for claim/audit history.
- **Data viz**: Recharts — line chart (premium collection trend), donut (claims by status), bar (policy type distribution), area (customer growth).
- Fully responsive; sidebar collapses to bottom nav on mobile for Customer role.

---

## 10. BUILD ORDER (give this to the coding agent as an execution plan)

1. Scaffold monorepo, Docker Compose (Postgres), Prisma schema + migrations + seed script (seed with realistic fake data: 3 agents, 25 customers, 40 policies, 60 payments, 15 claims).
2. Backend: auth module (register/login/refresh/roles) + middleware stack.
3. Backend: Customers, Policies, Claims, Payments, Documents, Reports modules (in that order), each with Zod validation + tests.
4. Frontend: app shell (sidebar/topbar/routing/auth guard), design system primitives (buttons, inputs, tables, badges, modals/drawers) before feature screens.
5. Frontend: Auth screens → Admin Dashboard → Customers → Policies → Claims → Payments → Documents → Reports → Settings/Audit.
6. Frontend: Agent and Customer role screens (reuse Admin components, scope data).
7. Cron jobs, email mock, PDF/Excel export.
8. Polish pass: empty states, skeletons, toasts, responsive QA, accessibility pass (labels, focus states, contrast).
9. Seed demo accounts for 3 roles, write README with setup + demo credentials, deploy (Render/Railway + Vercel).

---

## 11. BONUS FEATURES (implement only after core is fully working)

QR code policy verification, OCR for KYC document extraction, dark mode, multi-language (i18n scaffolding), export to PDF/Excel (core reports), audit log diff viewer, email/SMS (mock) reminders for due premiums.

---

## 12. INSTRUCTIONS TO THE CODING AGENT

- Build feature-by-feature, fully working end-to-end (DB → API → UI) before moving to the next feature — no stubbed screens with fake static data left behind.
- Every list screen must hit the real API with pagination, search, and filters wired up.
- Every form must validate client-side (Zod + RHF) and re-validate server-side.
- Do not skip loading/empty/error states — treat them as required, not optional polish.
- Match the visual design system in §9 consistently across every screen; no default unstyled browser form elements.
- After each module, run and fix TypeScript errors and tests before proceeding.
