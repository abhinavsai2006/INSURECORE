# InsureCore — UI/UX & App Design Document

**Insurance Management Platform**
Design Reference for Product, Design & Engineering

---

## 1. Purpose of This Document

This document translates the InsureCore product and frontend specifications into a design-first reference: the design philosophy, the visual system, the information architecture, and screen-by-screen UX behavior. It's meant to sit alongside the master build prompts as the single source of truth for *what the product should look and feel like*, independent of any specific coding tool.

**Design bar:** modern fintech/insurtech SaaS — think Stripe Dashboard, Gusto, or Vanta applied to insurance. Calm, data-dense, confident. Nothing should read as a generic admin template.

---

## 2. Design Principles

1. **Clarity over decoration.** Every screen exists to help someone make a decision — approve a claim, chase a payment, check coverage. Visual noise that doesn't support that decision gets cut.
2. **Status is always legible.** Policies, claims, and payments all move through state machines. Status must be instantly scannable — color, icon, and text together, never color alone.
3. **Context isn't lost.** Prefer drawers over full-page navigation for create/edit actions so the underlying list stays visible.
4. **Every state is designed, not defaulted.** Loading, empty, error, and success are treated as first-class screens, not afterthoughts.
5. **One product, three lenses.** Admin, Agent, and Customer share the same component library and visual language, scoped by data and permissions — not three different-looking apps bolted together.
6. **Numbers behave like numbers.** Tabular figures align in columns; money is never ambiguous about currency or period.

---

## 3. Visual Design System

### 3.1 Color

| Token | Use | Value direction |
|---|---|---|
| `ink` | Sidebar, headers, high-emphasis text | Deep navy, ~`#0F1729` |
| `accent` | Primary buttons, active nav state, links | One confident color — emerald or indigo |
| `surface` | Cards, panels | Neutral white/near-white |
| `border` | Dividers, table lines | Light neutral gray |
| `muted` | Secondary text, labels | Mid gray |

**Semantic status colors** (used consistently across every badge/chip in the product):

| Domain | Status | Color |
|---|---|---|
| Policy | Active | Green |
| Policy | Renewal Due | Amber |
| Policy | Pending | Slate/Blue |
| Policy | Expired / Cancelled | Gray / Red |
| Claim | Submitted | Blue |
| Claim | Under Review | Amber |
| Claim | Approved | Green |
| Claim | Rejected | Red |
| Claim | Settled | Slate + checkmark icon |
| Payment | Paid | Green |
| Payment | Pending | Amber |
| Payment | Overdue | Red |
| Payment | Failed | Red + warning icon |

Rule: color is always paired with an icon or text label — never the sole signal.

### 3.2 Typography

- UI typeface: **Inter** (or comparable geometric sans).
- Financial and numeric columns use **tabular numerals** so figures align vertically in tables — this alone makes a finance-adjacent product feel trustworthy.
- Type scale: page title → section header → card label → body → caption, with consistent weight steps (semibold for titles/labels, regular for body).

### 3.3 Spacing, Radius, Elevation

- Spacing scale: 4 / 8 / 12 / 16 / 24px, applied consistently — 24px page padding rhythm.
- Radius: 8–12px on cards/drawers/modals, 6–8px on inputs/buttons — soft but not rounded-pill everywhere.
- Elevation: subtle shadows (`shadow-sm`/`shadow-md`) reserved for floating surfaces — cards, modals, drawers. Everything else is flat.

### 3.4 Iconography & Motion

- One icon set throughout (lucide-style), consistent stroke weight, an icon on every nav item and stat card.
- Motion is restrained: drawer/modal enter-exit transitions, section fade-in on load, status-chip color transitions. Never gratuitous animation.

### 3.5 Responsiveness

- Admin/Agent tables collapse to horizontally scrollable or stacked-card layouts below tablet width.
- Customer-facing flows are designed mobile-first, since customers are the most likely to be on a phone — sidebar becomes a bottom tab bar (Home, Policies, Claims, Documents, Profile).

### 3.6 Accessibility

- All interactive elements keyboard-navigable with visible focus rings.
- Every form field has a real label (not placeholder-as-label).
- Status is never color-only (see 3.1).
- Sufficient contrast on all text/background pairs, including inside colored status chips.

---

## 4. Information Architecture

### 4.1 Site map (by access level)

```
Public
 ├─ Landing Page
 ├─ Login
 ├─ Customer Sign Up (3-step)
 ├─ Forgot / Reset Password
 └─ 404 / 403

Authenticated shell (Sidebar + Topbar, role-scoped)
 ├─ Dashboard                (Admin / Agent / Customer variants)
 ├─ Customers                (Admin, Agent)
 │   └─ Customer Detail → Profile / Policies / Claims / Payments / Documents / History
 ├─ Employees & Agents       (Admin only)
 │   └─ Agent Detail → Assigned Policies / Performance
 ├─ Policies                 (Admin, Agent) · "My Policies" (Customer)
 │   └─ Policy Detail → Overview / Payments / Claims / Documents / Audit Trail
 ├─ Claims                   (board + table view, Admin/Agent) · "My Claims" (Customer)
 │   └─ Claim Detail → Timeline / Evidence / Decision
 ├─ Premium Tracking         (Admin, Agent) · "Pay Premium" (Customer)
 ├─ Documents                (all roles, scoped)
 ├─ Reports                  (Admin, scoped view for Agent)
 ├─ Notifications Center     (all roles)
 ├─ Audit Logs               (Admin only)
 ├─ Settings                 (Admin: system-wide · Customer: profile/personal)
```

### 4.2 Navigation grouping (sidebar)

Sidebar items are grouped into sections rather than a flat list, so the nav itself communicates the product's mental model:

- **Overview** — Dashboard
- **Operations** — Customers, Policies, Claims, Premium Tracking
- **Records** — Documents
- **Insights** — Reports, Audit Logs
- **Admin** — Employees/Agents, Settings

Each role sees only the sections relevant to it; sections aren't shown-then-blocked, they simply don't render.

---

## 5. App Shell

The shell is built once and shared across every authenticated screen.

- **Sidebar** — left, collapsible to an icon-only rail. Logo/wordmark at top, grouped nav (above), active item marked with an accent bar, collapse toggle at the bottom.
- **Topbar** — breadcrumb trail (left), global search with a `⌘K` hint (center-left), notification bell with unread badge + dropdown, user avatar menu (Profile / Settings / Logout) on the right.
- **Command palette (`⌘K`)** — fuzzy search across customers, policies, claims, and pages, fully keyboard-navigable. A flagship-feeling shortcut for power users (agents triaging many records).
- **Content area** — consistent page header pattern: title + one-line description + primary action button, top-right. Consistent 24px spacing rhythm below it.
- **Mobile** — Customer role gets a bottom tab bar; Admin/Agent get a hamburger drawer instead of a persistent sidebar.

---

## 6. Core Component Library

These are built once and every screen is composed from them — no one-off unstyled elements.

| Component | Purpose / notable behavior |
|---|---|
| `Button` | Primary / secondary / ghost / destructive / link variants, built-in loading spinner state |
| `Input`, `Select`, `Textarea`, `DatePicker` | Standard form primitives, always paired with a real label |
| `FileUpload` | Drag-and-drop, progress bar, file-type icon preview |
| `StatusChip` / `Badge` | Color-coded per §3.1, icon + text, never color alone |
| `DataTable` | Sticky header, column sort, density toggle, pagination footer, row-selection with a sticky bulk-actions bar, column visibility toggle |
| `StatCard` | Icon in a tinted circle, muted label, large tabular-numeral value, delta badge (▲/▼ vs. prior period), optional sparkline |
| `Modal` / `Drawer` | Drawer preferred for create/edit so the underlying list stays in view |
| `Stepper` | Multi-step wizards — signup, policy creation, claim submission |
| `Timeline` | Vertical status history — claim lifecycle, audit trail |
| `Tabs` | Detail-page sectioning (Profile / Policies / Claims / …) |
| `EmptyState` | Icon + heading + one-line explanation + primary CTA |
| `Skeleton` | Shaped like the real content it replaces — never a generic spinner |
| `Toast` | Confirms every successful or failed mutation |
| `ConfirmDialog` | Guards destructive actions (cancel policy, reject claim, delete document) |
| `DocumentPreview` | Inline PDF/image viewer inside a modal |
| `FilterBar` | Search input + pill-style filter chips (solid when active) + "Clear filters" link + live results count |

### Component detail patterns

**StatCard** — icon top-left in a tinted circle → muted label → bold tabular value → delta badge → optional sparkline along the bottom edge.

**Policy card (Customer view)** — colored left-edge accent bar keyed to policy type → type icon + plan name → status badge top-right → premium amount and frequency → contextual microcopy ("renews on {date}" or "expires in {n} days") → "View Details →" link.

**Claim timeline** — vertical connecting line with circular step markers (filled = complete, outlined = current, gray = pending); each step shows status, timestamp, and actor ("Reviewed by Agent Priya S. — Jul 18, 2026"); a rejected state renders in red with the reason inline, not hidden behind a click.

---

## 7. Required States (every list/detail screen, no exceptions)

| State | Behavior |
|---|---|
| Loading | Skeletons shaped like the real layout — never a generic spinner |
| Empty | `EmptyState` with a relevant icon, one-line explanation, and a primary CTA ("No policies yet — Create your first policy") |
| Error | Inline error card with a retry action — never a blank screen |
| Success | Toast confirmation on every mutation, optimistic UI updates where safe |
| Permission-scoped | Hidden outright rather than shown-then-blocked |

---

## 8. Screen-by-Screen UX Specification

### 8.1 Public / Auth

**Landing Page** — real marketing page: hero + one-line value prop, 3–4 feature highlights with icons, a trust strip, footer with links, CTA buttons into Login/Sign Up. Sets the tone that this is a serious product, not a bare login form.

**Login** — email/password, "remember me," forgot-password link, inline error for invalid credentials, loading state on submit.

**Customer Sign Up** — 3-step wizard with a progress header:
1. Account (email/password)
2. Personal details (name, DOB, phone, address)
3. KYC upload (ID document, drag-and-drop)

**Forgot / Reset Password** — Forgot Password → "Check your email" confirmation → token-based Reset Password screen.

**404 / 403** — on-brand illustration, short explanation, "Back to dashboard" button.

### 8.2 Admin Screens

**Dashboard**
- Row of `StatCard`s: Active Policies, Premium Collected (MTD), Open Claims, Overdue Payments, New Customers (this month) — each with a trend delta.
- Two-column chart row: Premium Collection trend (12-month line/area) + Claims by Status (donut).
- Policy Type Distribution (bar chart).
- "Expiring Soon" mini-table (next 30 days).
- Recent Activity feed, written in human-readable language rather than raw log lines.

**Employees / Agents**
- List: search + status filter, "Add Agent" opens a Drawer form.
- Detail: profile header card, tabs for Assigned Policies and Performance Stats.

**Customers**
- List: search bar, KYC-status filter chips, `DataTable` (name, email, phone, # policies, KYC badge, created date).
- Detail: profile header (avatar, contact info, KYC badge, edit) with tabs — Profile / Policies / Claims / Payments / Documents / Activity History (Timeline).

**Policies**
- List: filter bar (status, type, agent, date range), `DataTable` (policy #, customer, type, premium, status chip, end date).
- **Create Policy wizard** (4 steps): select customer → plan/type → coverage & premium → review & issue. Ends on a success screen with the generated policy number, auto-redirecting into the new Policy Detail page.
- Detail: tabs for Overview / Payments / Claims / Documents / Audit Trail.

**Claims**
- Kanban board (Submitted / Under Review / Approved / Rejected / Settled) with a table-view toggle for anyone who prefers rows over columns.
- Detail: evidence viewer, approve/reject controls with a notes field, amount adjustment on approval.

**Premium Tracking**
- Payments table, an overdue-alert panel, a record-payment modal, and a payment-detail drawer.

**Documents**
- Searchable library grouped by customer/policy/claim, inline PDF/image preview modal, upload drawer.

**Reports Dashboard**
- Full-page analytics: Active vs. Expired Policies, Claim Statistics (approval rate, average settlement time), Premium Collection trend, Customer Growth funnel.
- Monthly Business Report generator with PDF/Excel export (export button shows its own loading state).

**Audit Logs**
- `DataTable` (timestamp, actor, action, entity type/id), filter bar (actor, entity type, date range), row click opens a before/after diff viewer.

**System Settings**
- Tabs: Company Profile, Policy Types & Plans, Notification Templates, Roles & Permissions (read-only matrix).

### 8.3 Agent Screens

Reuses every Admin component, scoped to the agent's own book of business:
- **Dashboard** — scoped `StatCard`s (My Customers, My Active Policies, Pending Claim Reviews, This Month's Premium Collected).
- Customers, Policies, Claims, Premium Tracking, Documents — identical components, filtered data, no Employees/Settings/Audit nav items.

### 8.4 Customer Screens

**Dashboard** — per-policy summary cards, a "Premium Due" banner with a Pay Now CTA when applicable, a recent-claim mini-timeline, and quick actions (Pay Premium / File a Claim / Upload Document).

**My Policies** — card grid (type icon, plan name, status badge, premium, end date) → Policy Detail (coverage summary, premium schedule, "Download Policy PDF," "Request Renewal" surfaced near expiry).

**Pay Premium** — select policy (if more than one is due) → confirm amount → choose method (Card/UPI/Bank Transfer, mocked) → confirmation screen with a downloadable receipt. Payment History lives in its own tab.

**My Claims**
- List with status badges.
- **Submit New Claim** stepper (4 steps): select policy → claim details (reason, amount, description) → upload evidence → review & submit → success screen with the claim number.
- Detail page with the visual status Timeline matching the claim state machine.

**Documents** — personal document grid, categorized upload (KYC/Policy/Claim/Other), download/view.

**Profile & Settings** — editable personal info, change password, notification preference toggles.

**Notifications Center** — full list, unread/all filter, mark-as-read, click-through to the relevant entity.

---

## 9. Key User Journeys

**A. Sign up → onboarding**
Landing → 3-step Sign Up → success screen → Customer Dashboard (shown in its empty state until an agent issues the first policy).

**B. Policy issuance (Admin/Agent)**
Policies list → Create Policy → 4-step wizard → review screen → success screen with the policy number → auto-redirect into the new Policy Detail page.

**C. Premium payment (Customer)**
Dashboard "Pay Now" banner → 3-step Pay Premium flow → confirmation → toast + updated dashboard stat.

**D. Claim lifecycle (Customer → Agent → resolution)**
Customer submits a claim (4-step wizard) → appears on the Agent's Claims board under Submitted → Agent moves it to Under Review, adds notes → Approves (with amount) or Rejects (with reason) → the Customer's Claim Detail Timeline reflects the new status.

**E. Reporting (Admin)**
Reports Dashboard → adjust date range → charts update → Export → PDF/Excel download with a loading state on the export button.

Each journey should be designed end-to-end, including its failure paths (invalid form step, upload failure, expired session mid-flow) — not just the happy path.

---

## 10. Design QA Checklist (use before calling any screen "done")

- [ ] Loading, empty, error, and success states are all designed — not just the populated table.
- [ ] Every status uses the correct color from §3.1, paired with an icon or text.
- [ ] Financial figures use tabular numerals and align in their column.
- [ ] Create/edit actions use a Drawer, not a full-page navigation, unless the flow is a multi-step wizard.
- [ ] Destructive actions are behind a `ConfirmDialog`.
- [ ] The screen is usable at mobile width without horizontal scrolling of the whole page (tables may scroll internally).
- [ ] All interactive elements are reachable and visibly focused via keyboard alone.
- [ ] Role-scoped content is hidden for unauthorized roles, not shown-then-blocked.
