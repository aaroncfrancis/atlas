# Atlas

A consumer **life operating system** — it detects and organizes life obligations
(bills, renewals, subscriptions, appointments, deadlines, documents) around
real-world entities, surfaces what needs attention, and lets you resolve it in
one tap. See [`CLAUDE.md`](./CLAUDE.md) for the full product + architecture spec.

This repository is the **native (Expo / React Native) rebuild**. The Supabase
backend, design system, and business logic are carried over from the reference
web build; the client is rebuilt here.

## Stack

- **Expo SDK 56** (React Native 0.85, React 19.2) + **Expo Router** (file-based)
- **TypeScript** strict · **Turborepo** + **pnpm** workspaces
- **NativeWind v4** (Tailwind CSS **v3**) for styling, driven by shared design tokens
- **TanStack Query v5** for server state · **Supabase** (Postgres / Auth / Storage)
- **vitest** for `@atlas/core` domain-logic tests · EN/FR i18n parity

## Prerequisites

- Node `>= 20` (this repo is pinned to 26 via `.nvmrc`)
- **pnpm 10** — if you don't have it: `npm install -g pnpm@10`
  (or `corepack enable pnpm` on machines where corepack is shimmed)
- For running the app: Xcode (iOS) and/or Android Studio, or Expo Go on a device

## Setup

```bash
pnpm install
cp .env.example apps/mobile/.env.local   # then fill in EXPO_PUBLIC_* values
pnpm --filter @atlas/mobile exec expo install --fix   # align native deps to the SDK
```

## Common commands

```bash
pnpm dev          # turbo dev across the workspace
pnpm mobile       # expo start (apps/mobile)
pnpm ios          # expo run on iOS
pnpm android      # expo run on Android
pnpm lint         # eslint across all packages
pnpm typecheck    # tsc --noEmit across all packages
pnpm test         # vitest (domain logic in @atlas/core)
```

## Layout

```
apps/
  mobile/    Expo app (primary deliverable)
  web/       marketing/waitlist placeholder (later)
packages/
  ui/        shared React Native components
  core/      domain logic & types (priority, proximity, recurrence, money, bucketing)
  supabase/  supabase-js client + typed query hooks
  i18n/      EN/FR dictionaries + provider
  config/    eslint, tsconfig base, NativeWind/Tailwind preset, design tokens
supabase/
  migrations/  SQL — the schema is the source of truth
  functions/   edge functions (scan, future ingestion) — server-side only
```

## Conventions

See `CLAUDE.md` §12. In short: TypeScript strict (no `any`); server state via
TanStack Query through typed hooks (no DB calls in components); no hardcoded
user-facing strings (i18n EN+FR); no hardcoded colors/fonts (design tokens);
shared domain logic in `@atlas/core` with unit tests; Conventional Commits.

## Security / Law 25

The Supabase schema is the source of truth and is changed only via
`supabase/migrations/`. Every table is owner-locked by RLS. The native client
uses the **anon key only**; the `service_role` key and any LLM provider key live
**only** in edge-function environments — never in the bundle. Canadian data
residency, recorded consent, and EN/FR parity (Bill 96) are required. See
`CLAUDE.md` §11.
