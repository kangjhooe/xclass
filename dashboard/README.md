## Pulse Dashboard

**Version: 0.1**

Production-ready Next.js app router starter featuring authentication, Prisma, and a modern dashboard UI built with shadcn/ui and Tailwind CSS.

### Features

- App Router with fully typed API routes and server components.
- Authentication via NextAuth.js with credentials and optional Google OAuth.
- PostgreSQL database powered by Prisma ORM, including seed data.
- shadcn/ui dashboard layout with responsive sidebar, theming, and Framer Motion transitions.
- Zod-powered validation shared across client and server.
- ESLint, Prettier (with Tailwind plugin), TypeScript, and Sonner toast notifications.

### Requirements

- Node.js 18.18+ (or 20+ recommended)
- PostgreSQL 13+

### Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```
   - `DATABASE_URL`: PostgreSQL connection string.
   - `NEXTAUTH_SECRET`: Strong secret for NextAuth (use `openssl rand -base64 32`).
   - `NEXTAUTH_URL`: Application URL (e.g. `http://localhost:3000`).
   - Optional: set `AUTH_GOOGLE=true` and add `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` to enable Google OAuth.

3. Set up the database schema and seed demo records:
   ```bash
   npm run db:generate
   npm run db:migrate -- --name init
   npm run db:seed
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000). You can log in with the seeded account `demo@example.com` / `Password123!`, or register a new user.

### Useful Commands

- `npm run lint` – Run ESLint.
- `npm run format` – Format code with Prettier.
- `npm run db:deploy` – Apply latest Prisma migrations in production environments.

### Deployment Notes

- Set all environment variables on your hosting provider (Vercel, Render, etc.).
- Run `npm run db:deploy` and `npm run db:seed` against your production database before starting the server.
- Review `prisma/schema.prisma` before extending the data model, then regenerate and migrate (`npm run db:generate`, `npm run db:migrate -- --name <change>`).
