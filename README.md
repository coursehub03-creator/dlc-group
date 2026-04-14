# DLC Group Platform

Production-minded multilingual legal consulting platform for **DLC Group (Diamond Legal Consulting Group)**.

## Features
- Premium bilingual (Arabic/English) public website with RTL support foundations.
- Service catalog and dynamic service detail routes.
- Client and admin portal route map.
- AI legal assistant with streaming responses via OpenAI API.
- Prisma schema for legal operations domain: service requests, cases, patent/trademark, land disputes, monitoring, blog, FAQ, testimonials.
- Contact/lead capture API with validation and database persistence.
- NextAuth credentials setup with role metadata placeholder.
- SEO essentials: metadata, sitemap, robots.

## Tech Stack
- Next.js App Router + TypeScript + Tailwind CSS
- Prisma + PostgreSQL
- NextAuth
- React Hook Form + Zod
- OpenAI API streaming

## Local Setup
1. Copy `.env.example` to `.env`.
2. Install deps: `npm install`.
3. Generate Prisma client: `npm run prisma:generate`.
4. Run migrations: `npm run prisma:migrate`.
5. Seed sample data: `npm run prisma:seed`.
6. Start app: `npm run dev`.

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string.
- `AUTH_SECRET`: Auth secret.
- `NEXTAUTH_URL`: Base URL.
- `OPENAI_API_KEY`: OpenAI key.

## Production Build
- `npm run build`
- `npm run start`

## Deployment Notes (Vercel)
- Set all env vars in Vercel project.
- Use managed PostgreSQL and run migrations in CI/deploy hook.
- For uploads, current abstraction is local-first placeholder; move to S3-compatible adapter.

## Future Enhancements
- Full CMS integration for managed homepage/services/blog content.
- Rich client/admin dashboards with charts and SLA tracking.
- RAG-enhanced AI assistant with jurisdiction-aware legal sources.
- E2E tests for request workflows.
