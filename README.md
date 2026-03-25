# Zealthy Health — Mini EMR & Patient Portal

A full-stack mini-EMR and Patient Portal built with **Next.js 14**, **Prisma 7**, **SQLite/Turso**, and **NextAuth**.

## Features

### Admin EMR (`/admin`)
- Patient list with at-a-glance appointment and prescription counts
- Full patient detail view with CRUD for appointments and prescriptions
- Create new patients with name, email, and password
- Edit patient info (including password reset)
- Add/edit/delete appointments with provider name, datetime, repeat schedule (weekly/monthly), and optional end date
- Add/edit/delete prescriptions with medication (from approved list), dosage, quantity, refill date, and refill schedule

### Patient Portal (`/`)
- Login with email + password
- Dashboard showing:
  - Patient info
  - Upcoming appointments within the next 7 days (with recurrence calculation)
  - Medication refills due within the next 7 days
- Full appointment schedule (3 months out) with recurrence expansion
- Full prescription list with 3-month refill schedule

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite (dev) / Turso LibSQL (production)
- **ORM**: Prisma 7 with driver adapters
- **Auth**: NextAuth.js v4 (credentials provider)
- **Styling**: Tailwind CSS v4
- **Date handling**: date-fns

## Demo Credentials

| Email | Password |
|-------|----------|
| mark@some-email-provider.net | Password123! |
| lisa@some-email-provider.net | Password123! |

## Local Development

```bash
# Install dependencies
npm install

# Set up the database (SQLite)
npx prisma migrate dev

# Seed with sample data
node prisma/seed.cjs

# Start the dev server
npm run dev
```

Visit:
- Patient Portal: http://localhost:3000
- Admin EMR: http://localhost:3000/admin

## Deployment (Vercel + Turso)

### 1. Create a Turso database

```bash
# Install Turso CLI
npm install -g turso

# Sign in
turso auth login

# Create a database
turso db create zealthy-db

# Get connection info
turso db show zealthy-db
turso db tokens create zealthy-db
```

### 2. Push migrations to Turso

```bash
turso db shell zealthy-db < prisma/migrations/*/migration.sql
```

### 3. Seed the Turso database

Update `prisma/seed.cjs` temporarily to use Turso URL, then:

```bash
TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." node prisma/seed.cjs
```

### 4. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Set these environment variables in Vercel:

```
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-auth-token
NEXTAUTH_SECRET=your-random-secret
NEXTAUTH_URL=https://your-app.vercel.app
```

## Project Structure

```
app/
├── page.tsx                    # Patient login page (/)
├── portal/                     # Patient Portal (/portal)
│   ├── layout.tsx              # Portal nav + auth guard
│   ├── page.tsx                # Dashboard
│   ├── appointments/page.tsx   # Full appointment schedule
│   └── prescriptions/page.tsx  # Full prescription list
├── admin/                      # Admin EMR (/admin)
│   ├── layout.tsx              # Admin nav
│   ├── page.tsx                # Patient list
│   └── patients/
│       ├── new/page.tsx        # Create patient
│       └── [id]/page.tsx       # Patient detail + CRUD
└── api/                        # REST API routes
    ├── auth/[...nextauth]/     # NextAuth
    └── patients/               # Patient + nested CRUD

lib/
├── prisma.ts                   # Prisma client (SQLite/Turso)
├── auth.ts                     # NextAuth config
├── recurrence.ts               # Appointment/refill recurrence engine
└── dateUtils.ts                # Timezone-safe date formatting

prisma/
├── schema.prisma               # Prisma schema (SQLite)
├── seed.cjs                    # Database seeder
└── migrations/                 # SQL migrations
```
