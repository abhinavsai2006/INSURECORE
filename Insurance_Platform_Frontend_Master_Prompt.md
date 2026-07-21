# MASTER FRONTEND PROMPT — "InsureCore" Insurance Management Platform
### Complete Frontend Build Specification (Screens, Components, Flows, Design System)

> Paste this entire document into your AI coding tool as the instruction set for building the **frontend only**. It assumes a REST API already exists (or will be mocked) and focuses entirely on: every screen, every component, every state, and the full visual design system, to a professional flagship SaaS standard.

---

## 1. FRONTEND VISION

Build the complete frontend for **InsureCore**, a role-based insurance management web app, to the visual and interaction quality of a top-tier fintech/insurtech SaaS product (Stripe Dashboard / Gusto / Zenefits / Vanta level). Data-dense but calm, confident typography, real charts, real empty/loading/error states, smooth micro-interactions. Nothing should look like a default bootstrap CRUD template.

---

## 2. TECH STACK

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui primitives |
| Server state | TanStack Query |
| Client/UI state | Zustand |
| Routing | React Router v6 (nested routes + layouts) |
| Forms | React Hook Form + Zod resolvers |
| Charts | Recharts |
| Icons | lucide-react |
| Animation | Framer Motion (subtle transitions only) |
| Tables | TanStack Table (sort/filter/pagination) |
| Dates | date-fns |
| PDF/image preview | react-pdf / native `<img>` |
| Toasts | sonner or shadcn toast |

Folder structure:
```
src/
  app/                 # router setup, layout shells
  components/ui/       # design-system primitives (button, input, table, badge...)
  components/shared/   # composed shared components (StatusBadge, DataTable, EmptyState...)
  features/
    auth/
    dashboard/
    customers/
    policies/
    claims/
    payments/
    documents/
    reports/
    settings/
    notifications/
  hooks/
  lib/                 # api client, utils, constants
  store/               # zustand stores
  types/
```

---

## 3. ROLES DRIVING THE UI

Three roles reuse the same component library but see different nav, scopes, and permissions:

- **Admin** — full access to everything, system settings, audit logs.
- **Agent** — customers/policies/claims/payments scoped to their book of business.
- **Customer** — self-service: own policies, pay premiums, file claims, upload documents.

Route guarding: a `<RequireAuth roles={[...]}>` wrapper redirects unauthorized roles to their own dashboard, not to a blank error page.

---

## 4. APP SHELL (built once, used everywhere)

### 4.1 Layout structure
- **Sidebar** (left, collapsible to icon-only rail): logo/wordmark at top, nav grouped into sections (Overview / Operations / Records / Insights / Admin), active-item highlight with accent bar, collapse toggle at bottom, role-based item visibility.
- **Topbar**: breadcrumb trail (left), global search input with `⌘K` shortcut hint (center-left), notification bell with unread-count badge and dropdown panel, user avatar menu (Profile, Settings, Logout) on far right.
- **Command palette** (`⌘K`): fuzzy-search across customers, policies, claims, and pages; keyboard navigable.
- **Content area**: max-width container, consistent page header pattern (title + description + primary action button, top-right), consistent 24px spacing rhythm.
- **Mobile**: sidebar collapses into a bottom tab bar for Customer role (max 5 icons: Home, Policies, Claims, Documents, Profile); Admin/Agent get a hamburger drawer.

### 4.2 Global/shared components (build these first, they power every screen)
- `Button` (primary/secondary/ghost/destructive/link, with loading spinner state)
- `Input`, `Select`, `Textarea`, `DatePicker`, `FileUpload` (drag-and-drop, progress bar, file-type icon preview)
- `Badge`/`StatusChip` — color-coded by domain status (see §9)
- `DataTable` — sticky header, column sort, row density toggle, pagination footer, row-selection checkboxes, sticky "bulk actions" bar when rows selected, column visibility toggle
- `Card` / `StatCard` (KPI cards with icon, value, delta vs. previous period, sparkline)
- `Modal` and `Drawer` (drawer preferred for create/edit forms so context isn't lost)
- `Stepper` (multi-step wizards — policy creation, claim submission, signup)
- `Timeline` (vertical stepper for claim status / audit history)
- `Tabs`
- `EmptyState` (illustration/icon + heading + description + CTA button)
- `Skeleton` loaders matching each screen's real layout (never a generic spinner for list/detail pages)
- `Toast` notifications for every successful/failed mutation
- `ConfirmDialog` for destructive actions (cancel policy, reject claim, delete document)
- `DocumentPreview` (inline PDF/image viewer in a modal)
- `AvatarGroup`, `SearchBar`, `FilterBar` (chips for active filters, "Clear all")

---

## 5. COMPLETE SCREEN LIST

### 5.1 Public / Auth screens
1. **Landing Page** — marketing hero, value props (3-4 feature highlights with icons), trust strip, footer with links, CTA buttons → Login/Sign Up. This is a real marketing page, not just a login box.
2. **Login** — email/password, "remember me," forgot password link, error state for invalid credentials, loading state on submit.
3. **Customer Sign Up** — multi-step: (1) Account (email/password), (2) Personal Details (name, DOB, phone, address), (3) KYC Upload (ID document drag-and-drop) — with a progress stepper header.
4. **Forgot Password** → **Check your email** confirmation screen → **Reset Password** screen (token-based).
5. **404 / Not Found** and **403 / Unauthorized** screens, on-brand, with a "Back to dashboard" button.

### 5.2 Admin screens
1. **Admin Dashboard**
   - Row of 4-5 `StatCard`s: Active Policies, Premium Collected (MTD), Open Claims, Overdue Payments, New Customers (this month) — each with trend delta.
   - Two-column chart row: Premium Collection (12-month line/area chart) + Claims by Status (donut).
   - Policy Type Distribution (bar chart).
   - "Expiring Soon" policy widget (mini table, next 30 days).
   - Recent Activity feed (latest audit log entries, human-readable).
2. **Employees / Agents**
   - List page: searchable/filterable table (name, email, status, # assigned policies, join date), "Add Agent" button opens a Drawer form.
   - Agent Detail page: profile header card, tabs for Assigned Policies / Performance Stats (claims handled, policies sold chart).
3. **Customers**
   - List page: search bar, filter chips (KYC status), `DataTable` (name, email, phone, # policies, KYC badge, created date), row click → detail.
   - Customer Detail page: profile header (avatar, name, contact info, KYC badge, edit button), Tabs: **Profile** (editable form) / **Policies** (table) / **Claims** (table) / **Payments** (table) / **Documents** (grid) / **Activity History** (Timeline component).
4. **Policies**
   - List page: filter bar (status, type, agent, date range), `DataTable` (policy #, customer, type, premium, status chip, end date), "Create Policy" primary button.
   - Create Policy wizard (Drawer or full-page Stepper): Step 1 select/search customer → Step 2 choose policy type & plan → Step 3 coverage & premium details (sum insured, premium amount, frequency, start/end date) → Step 4 review & confirm (summary card) → success screen with generated policy number.
   - Policy Detail page: header card (policy #, status badge, key figures), Tabs: **Overview** / **Payments** (schedule + history) / **Claims** (linked claims) / **Documents** / **Audit Trail** (Timeline). Action buttons: Renew, Cancel (with `ConfirmDialog`), Download Policy PDF.
5. **Claims**
   - Board view (Kanban: Submitted / Under Review / Approved / Rejected / Settled columns, drag or button-based transitions) with a toggle to switch to **Table view**.
   - Claim Detail page: claim summary card, `DocumentPreview` gallery for evidence, Timeline of status changes, Approve/Reject action panel (amount field + notes textarea), review-notes history.
6. **Premium Tracking**
   - Payments `DataTable` (policy #, customer, amount, due date, status chip, method).
   - Overdue Alerts panel (highlighted card list).
   - "Record Payment" Drawer form.
   - Payment Detail drawer/modal (receipt view, download).
7. **Documents**
   - Library view: grid of document cards (thumbnail/icon, filename, category badge, linked customer/policy/claim, upload date), filter by category and linked entity.
   - Upload Drawer (drag-and-drop, category select, link to customer/policy/claim).
   - `DocumentPreview` modal on click.
8. **Reports Dashboard**
   - Full analytics page: date-range picker at top.
   - Chart grid: Active vs Expired Policies (bar), Claims Statistics (approval rate gauge + avg settlement time stat), Premium Collection trend (line), Customer Growth (area/funnel).
   - "Monthly Business Report" card with Export as PDF / Export as Excel buttons.
9. **Audit Logs**
   - `DataTable` (timestamp, actor, action, entity type/id), filter bar (actor, entity type, date range), row click opens a diff viewer modal (before/after JSON rendered as a readable diff).
10. **System Settings**
    - Tabs: Company Profile (logo, name, contact), Policy Types & Plans (manage list), Notification Templates (email text editors), Roles & Permissions overview (read-only matrix table like §3 of the master doc).

### 5.3 Agent screens
Reuses Admin components, scoped to the agent's own data:
- **Agent Dashboard** — scoped `StatCard`s (My Customers, My Active Policies, Pending Claim Reviews, This Month's Premium Collected).
- **Customers**, **Policies**, **Claims**, **Premium Tracking**, **Documents** — same components as Admin, with data pre-filtered and no access to Employees/Settings/Audit nav items.

### 5.4 Customer screens
1. **Customer Dashboard** — policy summary `StatCard`s or cards-per-policy, "Premium Due" banner (if applicable, with Pay Now CTA), recent claim status mini-timeline, quick action buttons (Pay Premium / File a Claim / Upload Document).
2. **My Policies** — card grid (one card per policy: type icon, plan name, status badge, premium, end date) → Policy Detail page (coverage summary, premium schedule, "Download Policy PDF" button, "Request Renewal" button near expiry).
3. **Pay Premium** — flow: select policy (if multiple due) → confirm amount → choose method (Card/UPI/Bank Transfer — mock) → confirmation screen with receipt download. Separate **Payment History** tab/table.
4. **My Claims**
   - Claims list (status badges).
   - **Submit New Claim** Stepper: Step 1 select policy → Step 2 claim details (reason dropdown, amount, description) → Step 3 upload evidence documents → Step 4 review & submit → success screen with claim number.
   - Claim Detail page with a visual status Timeline (Submitted → Under Review → Approved/Rejected → Settled) matching the state machine.
5. **Documents** — my documents grid, upload new (category: KYC/Policy/Claim/Other), download/view.
6. **Profile & Settings** — editable personal info form, change password form, notification preference toggles.
7. **Notifications Center** — full list of notifications, filter (unread/all), mark-as-read, click-through to relevant entity.

---

## 6. REQUIRED UI STATES (apply to every list/detail screen without exception)

- **Loading** — skeleton components shaped like the real content (not spinners) for tables, cards, and detail headers.
- **Empty** — `EmptyState` with a relevant icon/illustration, one-line explanation, and a primary CTA (e.g., "No policies yet — Create your first policy").
- **Error** — inline error card with retry button; never a blank white screen.
- **Success** — toast confirmation after every create/update/delete, plus optimistic UI updates via TanStack Query where safe.
- **Permission-denied inline** — for role-scoped sections, hide rather than show-then-block.

---

## 7. KEY FRONTEND FLOWS (build as full multi-step journeys, not isolated forms)

**A. Sign up → onboarding:** Landing → Sign Up (3-step) → Success screen → redirected to Customer Dashboard (empty state until Agent issues first policy).

**B. Policy creation (Admin/Agent):** Policies list → Create Policy button → 4-step wizard → review screen → success screen with policy number → auto-redirect to new Policy Detail page.

**C. Premium payment (Customer):** Dashboard "Pay Now" banner → Pay Premium flow (3 steps) → confirmation → toast + updated dashboard stat.

**D. Claim submission (Customer) → review (Agent) → resolution:** Customer submits claim (4-step wizard) → appears in Agent's Claims board under "Submitted" → Agent opens detail, moves to "Under Review," adds notes → Approves/Rejects with amount/reason → Customer's Claim Detail Timeline updates live (or on next load) to reflect new status.

**E. Reporting (Admin):** Reports Dashboard → adjust date range → charts update → click Export → PDF/Excel download triggers with a loading state on the export button.

---

## 8. VISUAL DESIGN SYSTEM

- **Color**: deep navy/ink (`#0F1729`–ish) for sidebar/headers; one confident accent (emerald or indigo) for primary buttons/active states/links; neutral gray scale for surfaces and borders; semantic status colors (see §9).
- **Typography**: Inter (or similar geometric sans) for all UI text; tabular numerals (`font-variant-numeric: tabular-nums`) for all monetary/numeric columns so figures align.
- **Spacing/radius**: consistent 4/8/12/16/24px spacing scale; 8-12px border radius on cards, 6-8px on inputs/buttons — soft but not overly rounded.
- **Elevation**: subtle shadows on cards/drawers/modals only (`shadow-sm`/`shadow-md`), flat design otherwise.
- **Iconography**: lucide-react throughout, consistent stroke width, icons paired with every nav item and stat card.
- **Motion**: Framer Motion for drawer/modal enter-exit, page-section fade-in on load, and status-chip color transitions — kept subtle, never gratuitous.
- **Responsiveness**: full mobile support; Admin/Agent tables become horizontally scrollable or convert to stacked cards below `md` breakpoint; Customer flows are mobile-first since customers are the most likely to use phones.
- **Accessibility**: all interactive elements keyboard-navigable, visible focus rings, form fields properly labeled, color never the sole indicator of status (pair with icon/text).

---

## 9. STATUS COLOR CONVENTIONS (use consistently across all badges/chips)

| Domain | Status | Color |
|---|---|---|
| Policy | Active | green |
| Policy | Renewal Due | amber |
| Policy | Pending | slate/blue |
| Policy | Expired / Cancelled | gray/red |
| Claim | Submitted | blue |
| Claim | Under Review | amber |
| Claim | Approved | green |
| Claim | Rejected | red |
| Claim | Settled | slate (with checkmark icon) |
| Payment | Paid | green |
| Payment | Pending | amber |
| Payment | Overdue | red |
| Payment | Failed | red (with warning icon) |

---

## 10. COMPONENT-LEVEL DETAIL EXAMPLES (for the AI to follow as a pattern)

**StatCard**: icon (top-left, in a tinted circle), label (small, muted), value (large, bold, tabular-nums), delta badge (▲/▼ % vs last period, green/red), optional mini sparkline bottom edge.

**Policy card (Customer view)**: colored left-edge accent bar by policy type, type icon + plan name, status badge top-right, premium amount + frequency, "renews on {date}" or "expires in {n} days" microcopy, "View Details →" link.

**Claim timeline**: vertical line connecting circular step markers (filled = complete, outlined = current, gray = pending), each step labeled with status name, timestamp, and actor (e.g., "Reviewed by Agent Priya S. — Jul 18, 2026"), rejected state shown in red with reason text inline.

**DataTable filter bar**: search input (icon-prefixed) + dropdown filters rendered as pill buttons that turn solid/accent when active + a "Clear filters" text link that appears only when filters are active + results count ("142 policies").

---

## 11. BUILD ORDER FOR THE AI CODING AGENT

1. Design-system primitives (`components/ui/*`) — Button, Input, Select, Badge, Card, Table, Modal, Drawer, Tabs, Skeleton, EmptyState, Toast, ConfirmDialog.
2. App shell — Sidebar, Topbar, routing layout, auth guard, role-based nav.
3. Auth screens (Login, Sign Up stepper, Forgot/Reset Password).
4. Admin Dashboard (establishes the chart + StatCard patterns reused everywhere).
5. Customers module (list + detail with tabs) — becomes the template for Policies/Claims detail pages.
6. Policies module (list + create wizard + detail).
7. Claims module (board view + detail + submission wizard for Customer role).
8. Payments module (list + record + detail).
9. Documents module (library + upload + preview).
10. Reports Dashboard (charts + export).
11. Notifications Center + bell dropdown.
12. Settings/Audit Logs (Admin only).
13. Agent-scoped and Customer-scoped screen variants (reusing components from steps 5-9).
14. Full responsive + accessibility + empty/loading/error state pass across every screen.
15. Mock API layer (or connect to real backend) with realistic seed data so every screen can be demoed end-to-end.

---

## 12. INSTRUCTIONS TO THE AI CODING AGENT

- Build the design-system primitives first; every screen after that must be composed from them — no one-off unstyled HTML elements.
- Every table/list screen requires working search, filter, sort, and pagination against real or mocked data — never static hardcoded rows left in production code.
- Every form must use React Hook Form + Zod with inline validation messages.
- Every screen must implement all four states from §6 (loading/empty/error/success) — do not skip these as "later polish."
- Follow the color/status conventions in §9 exactly and consistently everywhere a status appears.
- Keep visual consistency: once a pattern (StatCard, DataTable, Drawer form) is built, reuse it — do not reinvent per-module.
