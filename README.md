# InfraKalk MVP

Production-oriented MVP for NS3459 import, resource-based estimation, subcontractor invitation, and priced export.

## Stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL (Neon)
- NextAuth (credentials demo provider)
- Zod validation
- fast-xml-parser

## Features implemented
- NS3459 XML drag/drop import (`ProsjektNS`, `Postnrplan`, `Poster/Post`, `Kode`, `Kodetekst`, `Prisinfo`)
- Automatic project hierarchy population: chapters + price items
- NS3420 structured description model and expandable UI display
- Resource lines + purchase lines with formulas
- Resource template dropdown auto-fill (override per line)
- Subcontractor invitation flow with tokenized restricted portal
- Internal project page with chapter tree, item table, exports
- Priced item export to XML and server-generated PDF response
- Seeded demo project and templates

## Setup
1. Copy `.env.example` to `.env` and set Neon/Postgres connection.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma client + migrate:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate -- --name init
   ```
4. Seed:
   ```bash
   npm run prisma:seed
   ```
5. Run:
   ```bash
   npm run dev
   ```
6. Open `http://localhost:3000`.

## Main pages
- `/` project list
- `/project/seed-project` project workspace
- `/external/bid/:token` external subcontractor portal

## Notes
- PDF endpoint emits minimal server-side generated PDF-like payload for MVP compatibility.
- Email sending is represented by returning secure invitation link in API response; hook your mail provider in `POST /api/projects/[projectId]/invite`.
