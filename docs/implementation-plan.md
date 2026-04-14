# DLC Group Implementation Route Map & Plan

## 1) Route Map

### Public routes
- `/`
- `/about`
- `/services`
- `/services/[slug]`
- `/patents`
- `/trademarks`
- `/land-disputes`
- `/global-monitoring`
- `/legal-consultations`
- `/blog`
- `/blog/[slug]`
- `/faq`
- `/contact`
- `/ai-assistant`
- `/terms`
- `/privacy-policy`

### Auth routes
- `/auth/sign-in`
- `/auth/sign-up`
- `/auth/forgot-password`
- `/auth/reset-password`

### Client portal routes
- `/client/dashboard`
- `/client/requests`
- `/client/cases`
- `/client/documents`
- `/client/messages`
- `/client/billing`
- `/client/settings`

### Admin portal routes
- `/admin/dashboard`
- `/admin/service-requests`
- `/admin/patent-requests`
- `/admin/trademark-requests`
- `/admin/monitoring-requests`
- `/admin/cases`
- `/admin/clients`
- `/admin/team`
- `/admin/content`
- `/admin/analytics`
- `/admin/ai-configs`

### API routes
- `/api/auth/[...nextauth]`
- `/api/contact`
- `/api/ai/chat`
- `/api/requests`

## 2) Prisma Data Model Summary
- Identity/Auth: `User`, `Profile`, `Account`, `Session`.
- Intake/Operations: `ServiceCategory`, `ServiceRequest`, `Case`, `CaseStatusHistory`, `CaseNote`.
- Practice-specific requests: `PatentRequest`, `TrademarkRequest`, `LandDisputeRequest`, `MonitoringRequest`.
- Content: `BlogPost`, `FAQ`, `Testimonial`.
- AI: `AIConversation`, `AIMessage`.
- Governance/Audit: `ContactInquiry`, `ActivityLog`.

## 3) Environment Variables Needed
- `DATABASE_URL`: PostgreSQL connection URL used by Prisma.
- `AUTH_SECRET`: secret used by NextAuth.
- `NEXTAUTH_URL`: base app URL for auth callbacks.
- `OPENAI_API_KEY`: key used by the AI assistant API.

## 4) Phased Implementation Plan
1. Replace placeholder unified request API with typed persistence logic.
2. Connect public legal service forms to submit to the unified endpoint.
3. Validate payloads consistently with Zod and Prisma.
4. Verify formatting/build checks.
