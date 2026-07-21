# InsureCore Insurance Management Platform

A comprehensive insurance management platform built with a modern tech stack.

## Overview

This project implements a full-stack insurance management platform with role-based access control for Administrators, Agents, and Customers. The system includes features for policy management, claims processing, payment tracking, document management, and reporting.

## Technology Stack

### Frontend
- React 18 + TypeScript
- Vite for bundling and development
- Tailwind CSS for styling
- React Router v6 for navigation
- React Hook Form + Zod for form validation
- Zustand for state management
- Lucide React for icons
- Recharts for data visualization

### Backend
- Node.js + Express.js + TypeScript
- PostgreSQL database with Prisma ORM
- JWT-based authentication with refresh tokens
- RESTful API design
- File upload handling with Multer
- PDF generation with PDFKit
- Excel export with ExcelJS
- Background jobs with node-cron

## Features

### Authentication
- User registration and login
- JWT access tokens (15 min) + refresh tokens (7 days)
- Password hashing with bcrypt
- Role-based access control (Admin, Agent, Customer)

### Policy Management
- Create, view, update, and cancel policies
- Policy renewal functionality
- Policy number generation (POL-YYYY-XXXXXX)
- PDF policy document generation
- Status tracking (PENDING, ACTIVE, RENEWAL_DUE, EXPIRED, CANCELLED)

### Claims Management
- Submit claims with supporting documents
- Claim status tracking (SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, SETTLED)
- Claim approval/reject
- Claim timeline

### Payment Processing of insurance payment processing
- Receipt PDF generation
- Overdue payment detection
- Idempotency key support

### Document Management
- Document upload (KYC, policy, claim evidence, other)
- Document viewing and download
- Document categorization
- File type and size validation

### Reporting
- Dashboard with key metrics
- Policy, claims, and payments, and customer growth reports
- PDF and Excel export capabilities
- Real-time data visualization

### Notifications
- In-app notifications
- Read/unread status
- Mark as read functionality

### Audit Trail
- Comprehensive audit logging
- Before/after data tracking
- User action tracking

## Architecture

### Backend Structure
```
src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── middleware/      # Auth, validation, error handling
├── lib/             # Database, storage, utilities
└── jobs/            # Cron jobs
```

### Frontend Structure
```
src/
├── components/      # Reusable UI components
│   ├── ui/          # Primitive components (Button, Input, etc.)
│   └── shared/      # Layout components (Sidebar, Topbar)
├── features/        # Feature-specific pages and components
├── lib/             # API client, utilities
├── store/           # State management (Zustand)
└── app/             # Routing and layout
```

## API Endpoints

### Authentication
- POST `/auth/register` - User registration
- POST `/auth/login` - User login
- POST `/auth/refresh` - Token refresh
- POST `/auth/logout` - User logout
- POST `/auth/forgot-password` - Password reset initiation
- POST `/auth/reset-password` - Password reset completion
- GET `/auth/me` - Get current user

### Users (Admin only)
- GET `/users` - List users
- POST `/users` - Create user
- GET `/users/:id` - Get user
- PATCH `/users/:id` - Update user
- DELETE `/users/:id` - Delete user

### Customers
- GET `/customers` - List customers (filtered by role)
- POST `/customers` - Create customer
- GET `/customers/:id` - Get customer
- PATCH `/customers/:id` - Update customer
- GET `/customers/:id/history` - Get customer history

### Policies
- GET `/policies` - List policies (filtered by role)
- POST `/policies` - Create policy
- GET `/policies/:id` - Get policy
- PATCH `/policies/:id` - Update policy
- POST `/policies/:id/activate` - Activate policy
- POST `/policies/:id/cancel` - Cancel policy
- POST `/policies/:id/renew` - Renew policy
- GET `/policies/expiring-soon` - Get expiring policies
- GET `/policies/:id/pdf` - Download policy PDF

### Claims
- GET `/claims` - List claims (filtered by role)
- POST `/claims` - Create claim
- GET `/claims/:id` - Get claim
- PATCH `/claims/:id/status` - Update claim status
- GET `/claims/:id/timeline` - Get claim timeline

### Payments
- GET `/payments` - List payments (filtered by role)
- POST `/payments` - Create payment
- GET `/payments/:id` - Get payment
- POST `/payments/:id/mark-paid` - Mark payment as paid
- GET `/payments/overdue` - Get overdue payments
- GET `/payments/:id/receipt.pdf` - Download payment receipt

### Documents
- POST `/documents/upload` - Upload document
- GET `/documents/:id` - Get document metadata
- GET `/documents/:id/download` - Download document
- DELETE `/documents/:id` - Delete document

### Reports
- GET `/reports/overview` - Dashboard overview
- GET `/reports/policies` - Policies report
- GET `/reports/claims` - Claims report
- GET `/reports/payments` - Payments report
- GET `/reports/customer-growth` - Customer growth report
- GET `/reports/export/pdf` - Export PDF report
- GET `/reports/export/excel` - Export Excel report

### Notifications
- GET `/notifications` - Get user notifications
- PATCH `/notifications/:id/read` - Mark notification as read
- PATCH `/notifications/read-all` - Mark all notifications as read

### Audit Logs (Admin only)
- GET `/audit-logs` - Get audit log entries

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/insurecore?schema=public"
PORT=5000
JWT_SECRET="your_jwt_secret_key_here"
JWT_REFRESH_SECRET="your_jwt_refresh_secret_key_here"
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env)
```
VITE_API_URL=/api
```

## Database Schema

The system uses Prisma ORM with PostgreSQL. Key entities include:

- User (with roles: ADMIN, AGENT, CUSTOMER)
- Customer (linked to User)
- Policy (linked to Customer and User/agent)
- Claim (linked to Policy)
- Payment (linked to Policy)
- Document (linked to Customer, Policy, or Claim)
- AuditLog (tracks all changes)
- Notification (user notifications)

## Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd apps/api
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd ../web
   npm install
   ```
4. Set up the database:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```
5. Start the development servers:
   ```bash
   # In one terminal
   cd apps/api
   npm run dev
   
   # In another terminal
   cd ../web
   npm run dev
   ```

## Features Implemented

✅ User authentication and authorization
✅ Policy management (CRUD, renewal, activation, cancellation)
✅ Claims management (submission, status updates, timeline)
✅ Payment processing (recording, tracking, overdue detection)
✅ Document management (upload, viewing, categorization)
✅ Reporting and analytics dashboard
✅ Role-based access control
✅ Audit logging
✅ Notification system
✅ Responsive design
✅ Dark/light mode support
✅ Form validation
✅ Loading and error states
✅ PDF and Excel export capabilities

## Future Enhancements

- Email/SMS notifications
- Two-factor authentication
- Advanced search and filtering
- Data export in multiple formats
- Multi-language support
- Advanced analytics and forecasting
- Mobile application
- Third-party integrations (payment gateways, email services)