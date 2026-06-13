# CLAUDE.md — Atlas

> Guidance for Claude / AI agents and developers working in this repository.
> Read this fully before making changes. The rules in **§11 Never break** are hard constraints.
>
> **Status:** this repo is the **target React Native (Expo) + Turborepo monorepo**. The product currently exists as a **TanStack Start web app built in Lovable** — that app is the *reference build* and the **source of truth for behavior, schema, and design**. Sections below state the **current reality** and, where the native target differs, the **mapping**. Verified against the Lovable ground-truth inventory dated 2026-06-13.

---

## 1. What Atlas is & the problem it solves

**Atlas is a consumer "life operating system."** It detects and organizes a person's life obligations — bills, renewals, subscriptions, appointments, deadlines, documents — around real-world **entities** (home, car, pets, subscriptions, accounts, bank, insurance, health). It surfaces what needs attention, lets the user resolve it in one tap, and tracks recurring/auto-paid items.

**The problem:** people track life admin across a fragmented mix of calendars, notes, email, and memory. Things slip because they're overloaded or because they *forgot the obligation existed at all*. There's no single, calm place that knows everything you're responsible for and tells you what matters this week.

**Core loop:** `ingest → detect → organize → notify → resolve → repeat`.
**The single most important user action:** resolving a surfaced obligation (done / snooze / dismiss / automate) on a prioritized feed. *Inbox-zero for life admin.*
**North-star metric:** weekly obligations resolved on time.

## 2. Target user (ICP)

Primarily **25–44**, living alone or with a partner, with enough recurring responsibilities (most 5+/month; power users 20+) that life admin creates real mental load. They value a **calm, uncluttered** system and currently cobble together calendars, notes, and memory. Early signal skews tech-comfortable; treat as directional until the formal problem interviews confirm it. Validated pains: "I forgot it existed," "too many things at once," "no system for knowing what's urgent." Mental-load categories extend **beyond bills** into household, appointments, and home/vehicle maintenance.

## 3. Core features & main user flow

1. User signs in. On first signup, `handle_new_user()` **seeds 5 default entities (Home, Car, Pet, Subscriptions, Accounts) and 10 sample obligations**, and sets profile defaults (language `fr`, currency `CAD`).
2. **Home** (`/`) shows the obligation feed with a weekly **ProgressRing** + summary.
3. Tapping an obligation row **expands it inline** (accordion) with details and actions: Done, Snooze, Edit, View Entity, Dismiss (and Cancel Subscription for auto-paid items). Automate is **stubbed ("coming soon")**.
4. Resolving fires a toast-wrapped action; if the item recurs, the next occurrence is created.
5. Obligations attach to **entities**; **Calendar** (week/month), **Budget** (planned/paid/committed + 6/12-month histograms), and **History** (event log) give other views.
6. New obligations: manual add (FAB on relevant pages, `ObligationFormSheet`), and **scan-a-bill** (photo → AI extraction → confirm). Email/bank ingestion is **not built yet**.

**Routes:** `/` Home · `/calendar` · `/budget` · `/entities` + `/entities/:id` · `/obligations/:id` · `/scan` · `/settings` · `/history` · `/auth` · `/add` (add entity) · `/privacy`.

## 4. Tech stack

### Current implementation (Lovable web — the reference build)
| Layer | Technology |
|---|---|
| Framework | **TanStack Start v1** (React 19, SSR/SSG, Vite 7) |
| Router | TanStack Router (file-based, `src/routes/`) |
| Server state | **TanStack Query v5** (`useQuery` / `useMutation`) |
| Client state | React `useState` only — **no global store** (no Zustand/Redux) |
| Styling | **Tailwind CSS v4** with CSS theme variables in `src/styles.css` |
| UI primitives | **shadcn/ui** (`src/components/ui/`) |
| Icons | Lucide React · Toasts: Sonner |
| Backend | **Supabase** (Postgres, Auth, Storage) |
| Auth | Supabase Auth + custom "Remember Me" (`sessionStorage` sentinel `TAB_ALIVE_KEY`) |
| AI | **Gemini 2.5 Flash via the Lovable AI Gateway** |

### Target (this repo: Expo native) — and the mapping
- **Expo (React Native) + TypeScript (strict)**; **Turborepo + pnpm** monorepo. *(Decision D1: React Native/Expo over Flutter.)*
- **Carries over conceptually:** TanStack Query (works in RN), Supabase + the schema, Tailwind tokens (via **NativeWind**), Lucide (`lucide-react-native`), the i18n dictionaries, all business logic.
- **Must be replaced (Lovable/web-specific — do not assume these exist in native):**
  - **TanStack Start / Router → Expo Router** (file-based).
  - **Lovable AI Gateway + `.server` functions → a direct, Law-25-compliant LLM provider called from a Supabase Edge Function** (the gateway will not exist; see §7 and Decision D4).
  - **shadcn/ui (web) → React Native components** in `packages/ui`.
  - **`sessionStorage` remember-me → Expo SecureStore / Supabase session persistence.**
  - **Sonner → a native toast.**

> The web app is the **design/logic spec**, not code to port line-for-line. The Supabase backend is reused as-is.

## 5. Monorepo layout (target)

> The current Lovable app is a **single TanStack Start project**, not a monorepo. The monorepo is introduced by this repo.

```
atlas/
├─ apps/
│  ├─ mobile/          # Expo React Native app (primary deliverable)
│  └─ web/             # optional: marketing/waitlist (later)
├─ packages/
│  ├─ ui/              # shared RN components (ObligationRow, etc.)
│  ├─ core/            # domain logic & types: recurrence, priority, money, bucketing
│  ├─ supabase/        # supabase-js client + generated DB types + typed queries/hooks
│  ├─ i18n/            # EN/FR dictionaries (ported from src/lib/i18n.tsx)
│  └─ config/          # eslint, tsconfig, nativewind preset, design tokens
├─ supabase/
│  ├─ migrations/      # SQL — the schema is the SOURCE OF TRUTH
│  └─ functions/       # edge functions: scan, (future) email-ingest, detection
├─ turbo.json
├─ package.json
└─ CLAUDE.md
```

Shared domain logic (recurrence, priority/proximity, money normalization, bucketing) lives in `packages/core` and is imported everywhere — never duplicated. All DB access goes through typed hooks in `packages/supabase` (mirroring the current `src/lib/use-*.ts` pattern).

## 6. Data model & key entities (authoritative)

The Supabase schema is **authoritative**. Tables, all **owner-locked by RLS** ("users manage own rows"). This reflects the **current live schema** — match it exactly.

**`profiles`** — `id` (UUID PK, FK→`auth.users` CASCADE), `display_name`, `language` (default `fr`), `currency` (default `CAD`), `week_start` (TEXT, default `sunday`), `reminder_lead_days` (INT, default `3`), `push_enabled` (BOOL, default `false`), `quiet_hours_start`, `quiet_hours_end`, `avatar_initials`, `created_at`.

**`entities`** — `id`, `user_id`, `type` (TEXT: `home`/`car`/`pet`/`subscription`/`account`/`bank`/`insurance`/`health`), `name`, `icon` (Lucide name), `color` (hex seed), `metadata` (JSONB), `created_at`.

**`obligations`** *(core)* — `id`, `user_id`, `entity_id` (FK→`entities` SET NULL), `title` (NOT NULL), `description`, `type` (default `task`: bill/renewal/appointment/deadline/task), `amount` (NUMERIC), `currency` (CAD), `due_date`, `status` (default `open`: open/done/snoozed/dismissed/automated), `priority` (default `medium`: low/medium/high/urgent), `source` (default `manual`: **manual/seed/scan/recurrence** — note: **no email/bank source yet**), `snoozed_until`, `resolved_at`, `resolved_method` (paid/automated/dismissed), `resolution_note`, `vendor`, `recurrence` (default `none`: none/weekly/**biweekly**/monthly/quarterly/yearly), **`auto_paid` (BOOL)**, **`paying_account` (TEXT, e.g. "Visa •4242")**, `created_at`.

**`obligation_events`** — `id`, `user_id`, `obligation_id`, `action` (created/resolved/snoozed/automated/dismissed), `amount`, `occurred_at`, `note`.

**`budgets`** — `id`, `user_id`, `entity_id`, `period` (default `monthly`), `limit_amount` (NOT NULL).

**`documents`** — `id`, `user_id`, `entity_id`, `obligation_id`, `name` (NOT NULL), **`file_url`**, `kind` (default `document`), **`storage_path`** (Supabase Storage path).

**`automations`** — `id`, `user_id`, `obligation_id`, `entity_id`, `kind` (default `reminder`), `config` (JSONB), `status` (default `active`).

**`consents`** — `id`, `user_id`, `purpose` (e.g. `scan`), `policy_version`, `granted_at`, `withdrawn_at`.

**Database functions (the only server-side logic today):**
- `handle_new_user()` — trigger on `auth.users` INSERT; seeds 5 entities + 10 obligations and profile defaults.
- `delete_my_account_data()` — SECURITY DEFINER; deletes all of a user's rows across tables, then the profile (account deletion / Law 25 erasure).

**Storage:** bucket **`scans`**, path `{user_id}/{uuid}.jpg`, RLS-scoped to the owner's folder.

> **Important correction vs. earlier drafts:** there are **no `resolved_at`/event-logging triggers** on `obligations`. Recurrence advancement, event logging, and auto-paid rollover are done in **app hooks** (see §8), not the database. For the native rebuild this logic must be re-implemented (in shared `packages/core` + queries) or, preferably, **promoted to DB triggers** for durability — treat that as an open decision, not a given.

## 7. AI / scanning & the (future) email→obligations pipeline

**Current (scan-a-bill, built):** a server function `scanObligation` (`src/lib/scan.functions.ts`) sends an image data URL to **Gemini 2.5 Flash via the Lovable AI Gateway** and returns a `ScanDraft`: `{ title, vendor, amount, currency, due_date, type, suggested_entity_type, confidence }`. Flow: consent check → upload to `scans` bucket → extract → user reviews/edits draft → save creates an `obligation` + `document`.

**Native migration rule:** the **Lovable AI Gateway will not exist** in this repo. Re-implement scanning as a **Supabase Edge Function** that calls a chosen provider directly, keeping the **same `ScanDraft` contract**. The provider is **Decision D4** and must be Law-25-compliant (data residency + no-training). The API key lives only in the edge-function environment.

**Email/bank → obligations is NOT built** (the `source` enum has no `email`/`bank` value). When built (Phase 2), it must be **server-side only**: pre-filter → LLM structured extraction reusing the `ScanDraft`-style contract → confidence gating → user confirmation for low-confidence/sensitive items → persist with the new `source`. Consent-gated via `consents`; data-minimized (store the structured obligation, not the raw inbox).

## 8. Business logic (in `src/lib/` today → `packages/core` in native)

- **Priority:** `derivePriority(due)` → Urgent `< 0` days, High `≤ 2`, Medium `≤ 7`, Low `> 7`.
- **Proximity:** `proximity(due)` → `overdue (<0)`, `soon (≤2)`, `ahead (>2)`; drives the due-pill color.
- **Status lifecycle:** `open → snoozed → open` (when `snoozed_until` passes); `open → done` (creates next recurrence if recurring); `open → dismissed` (no recurrence); `open → automated` (creates an `automation`); `auto_paid + past due → automated` then next occurrence.
- **Recurrence:** `advanceDate(due, recurrence)` rolls forward one interval; `useResolveObligation` creates the next obligation (`source: 'recurrence'`) on resolve (not dismiss).
- **Auto-paid subscriptions:** `isSubscriptionLike(o, entity)` = `type === 'renewal'` or `entity.type === 'subscription'`. `isAutoPaid(o)` = `auto_paid && recurrence !== 'none'`. `useAutoPaidRollover` (mounted in `AppShell`) scans on data change: for auto-paid past-due items it marks the current one `automated`, creates the next future occurrence, and skips intermediate dates. `useCancelSubscription` sets `status:'dismissed'`, `recurrence:'none'`, `auto_paid:false`. **Note:** "auto-paid" is a **user-tracked flag/label, not real payment execution** — Atlas does not move money.
- **Weekly progress:** `weeklyProgress(obligations)` = resolved-this-week vs active-due-within-7-days → `ProgressRing`.
- **Budget:** computed directly from `obligations` (the `budgets` table is **not fully wired into display**). `monthlyEquivalent(amount, recurrence)` normalizes recurring amounts to monthly; shows Planned / Paid / Committed + 6/12-month histograms.
- **Home grouping intent:** the planned **Needs attention / Upcoming / Later** sections map onto `derivePriority`/`proximity` (Needs attention ≈ overdue + urgent/high; Upcoming ≈ next 7 days; Later ≈ beyond + undated). Confirm whether the three named sections are implemented before relying on them.

## 9. Design decisions & principles

- **The app UI is a LIGHT theme**, not the deep-space dark look. Surfaces are off-white/white with a **deep-navy desktop sidebar**; semantic accent tokens drive everything. **Dark-mode CSS variables exist but there is no toggle.**
  - Tokens (in `src/styles.css`, → `packages/config`): `--background` (off-white), `--foreground` (near-black), `--card` (white), `--border`, `--primary` (blue, active nav), **`--teal` (primary CTAs: Save/Add/Done)**, `--overdue` (red/orange), `--amber` (soon/high), `--green` (ahead/success), **`--purple` (auto-paid badges + subscription form section)**, `--navy` (sidebar), `--text-muted`, `--text-secondary`.
- **Deep-space / starfield + blue gradient is the BRAND & logo layer** (marketing, splash, app icon) — *not* the in-app surface style. Keep the two distinct.
- **Calm, uncluttered, compact.** Dense rows; expand one obligation inline rather than navigating away. No duplicated info on a row.
- **Feed-first.** Users think in to-do lists, not calendars — Home/feed is primary, Calendar secondary.
- **Don't over-gamify progress** (tested as polarizing). Keep the ProgressRing lightweight; lead with reduced mental load and the satisfaction of clearing.
- **Fonts/brand:** Archivo (display), Hanken Grotesk (body), JetBrains Mono (numbers); all visual values via design tokens.
- **EN/FR parity** on every screen.

## 10. What's built vs. not built

**Built (in the Lovable web app):** auth + custom remember-me; signup seeding; Home feed with `ObligationRow` (compact + expanded states); `ObligationFormSheet` (add/edit, with subscription section); Snooze popover; **auto-paid subscription model + rollover**; Calendar (week/month); Budget (planned/paid/committed + histograms); Entities grid + detail; Obligation detail; **Scan-a-bill (Gemini via Lovable Gateway)**; History event log; Settings (incl. quiet hours, account deletion); Privacy explainer + scan consent; EN/FR i18n; weekly ProgressRing.

**Not built / stubbed:**
- This **native Expo app** (this repo) — the client is rebuilt here; only the backend + design + logic carry over.
- **Automations / Vault / Shared** tabs — disabled in nav ("Soon").
- **Automate** action — blurred "Coming soon" on `ObligationRow`.
- **Email & bank ingestion** + at-scale detection (Phase 2; server-side only; no `email`/`bank` source yet).
- **Push notifications** — `push_enabled` column exists, but no service worker / no native push.
- **Notifications bell** — present in UI, no implementation.
- **Dark-mode toggle** — tokens exist, no switch.
- **Budget targets** — `budgets` table exists but UI computes from `obligations`; targets not fully wired.
- **Real payment/autopay** — auto-paid is a label only; no money movement.
- **Production hardening:** CI/CD, secrets management, monitoring, backups.

## 11. Never break / never change (hard rules)

1. **Logo:** the Atlas mark (rounded arrow-"A" + centered sphere) is **user-provided artwork**; use the supplied files as-is. **Never** redraw, vectorize, recolor, or substitute.
2. **Supabase schema is the source of truth.** Change it only via migrations in `supabase/migrations/`. Never make ad-hoc edits to a live database.
3. **RLS is the security boundary.** Every table stays owner-locked. The web build has a server-only admin client (`client.server.ts`) — the **service_role key may live ONLY in server/edge environments, never in the browser or the RN bundle**. The native client uses the **anon key only**.
4. **Ingestion & AI parsing are server-side.** Scan/email/bank parsing run in edge functions, never in the client. The Lovable AI Gateway must be replaced with a direct edge-function call (Decision D4).
5. **Law 25 / Québec:** Canadian data residency; explicit consent recorded in `consents` before any data connection; LLM provider must be no-training + residency-respecting; **French copy is legally required (Bill 96)** — keep EN/FR parity. `delete_my_account_data()` is the erasure path; keep it working.
6. **Data minimization:** persist the structured obligation, not raw email/financial content.
7. **Preserve the core resolve loop, the `ObligationRow` states, and the auto-paid/recurrence behavior** — they are the product.
8. **"Auto-paid" never moves money** — it is a user-tracked flag. Do not wire it to real payments without an explicit product+legal decision.
9. **No dark patterns.** North-star is obligations resolved on time, not time-in-app.

## 12. Coding conventions & preferences

- **TypeScript strict; no `any`.** Reuse the generated DB types (`integrations/supabase/types.ts` → `packages/supabase`).
- **Functional components + hooks.** Server state via **TanStack Query**; data access through typed hooks (`use-obligations`, `use-entities`, `use-profile`, `use-consent`, …). Keep the **toast-wrapped action layer** (`use-actions.ts`) pattern for mutations + Sonner/native-toast feedback.
- **No global client store** unless a real need arises — match the current `useState`-only approach.
- **No DB calls inline in components** — go through the query/hook layer.
- **No hardcoded user-facing strings** — everything through the i18n dictionaries (EN + FR), `t("key", { n })`.
- **No hardcoded colors/spacing/fonts** — use the design tokens (`--teal`, `--purple`, `--overdue`, etc.) via the NativeWind/Tailwind preset.
- **Shared domain logic in `packages/core`** with unit tests (priority, proximity, `advanceDate`, auto-paid rollover, `monthlyEquivalent`, weekly progress).
- **Env vars:** client-safe values use `EXPO_PUBLIC_`; secrets (service_role, LLM keys) live only in edge-function env.
- **Naming:** PascalCase components, camelCase functions/vars, kebab-case non-component files. Conventional Commits.
- **Accessibility:** label interactive elements; respect dynamic type and reduced motion.

### Common commands (target)
```bash
pnpm install
pnpm dev                          # turbo dev
pnpm --filter mobile start        # expo start
pnpm --filter mobile ios|android
pnpm lint && pnpm typecheck && pnpm test
supabase db push                  # apply migrations
supabase functions deploy <name>  # deploy an edge function
eas build / eas submit            # native build + store submit
```

## 13. Phase 0 exit-gate context

This repo is the **native build that begins only after the transition gate (T5)**. Phase 0 (validate the Lovable MVP, ≥15 interviews, vision/ICP sign-off, scope/PRD freeze, data model/repo/RLS live, incorporation, privacy/ToS published, waitlist, cadence) culminates in **G9** (go/no-go). The transition gate (T1–T5) then confirms notifications are core, greenlights Phase 2 ingestion, fixes the native path (D1 = this repo), and confirms scope is stable — **T5 greenlights native**.

**For agents here:** the backend, design, and logic are settled inputs — match the Lovable reference build, wire to the existing Supabase project, and add native-only capabilities (push, background, camera, biometrics) plus the server-side ingestion/detection, honoring §11. Replace the Lovable-specific pieces (AI Gateway, TanStack Start, shadcn-web, sessionStorage remember-me) per the §4 mapping.

---

*When something is ambiguous or conflicts with a request, prefer the safer/more privacy-protective option and confirm with the product owner (Lucas). Assume Law 25 applies to anything touching user data.*
