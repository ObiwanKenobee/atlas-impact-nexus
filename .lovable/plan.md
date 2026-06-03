# Atlas Sanctum — Phase 2: Persistence, Uploads, Receipts

This adds a real backend, file uploads, donor receipts, and richer Atlas AI citations on top of the existing Editorial Cartographic MVP.

## 1. Enable Lovable Cloud (backend + auth + storage)

Provision Lovable Cloud to get:
- Postgres with RLS
- Email/password + Google auth
- File storage bucket for photos / videos / report PDFs

## 2. Database schema (with RLS)

Tables (all in `public`, with GRANTs + RLS):

- `profiles(id, display_name, role)` — auto-created on signup. `role ∈ {donor, field_worker, community_leader}`.
- `projects(id, slug, title, category, community_id, goal_cents, raised_cents, donors, beneficiaries, verified_score, cover_url, created_at)` — seeded from current `atlas-store` data.
- `communities(id, slug, name, region, population, impact_score, …)` — seeded.
- `evidence(id, project_id, uploader_id, kind, title, meta, lat, lng, captured_at, media_url, iot_payload jsonb, report_text, created_at)` — `kind ∈ GPS|PHOTO|VIDEO|IoT|REPORT|BENEFICIARY`.
- `transactions(id, project_id, donor_id, amount_cents, receipt_number, created_at)`.
- RLS: anyone (anon + auth) can `SELECT` projects/communities/evidence/transactions; only `authenticated` users can insert evidence/transactions; uploader can update own evidence.
- Storage bucket `evidence-media` (public read, authenticated write).

## 3. Auth

- `/auth` page: email/password + Google.
- `SiteNav` shows Sign in / profile menu.
- `_authenticated/` layout gates Upload + Fund actions.

## 4. Upload form (`/impact/upload`, authenticated)

Single form, dynamic fields per `kind`:
- Project picker (required).
- Kind selector → reveals: GPS (lat/lng + "use my location"), Photo (file), Video (file), IoT (JSON textarea + preset throughput/soil-moisture templates), Report (rich text + optional PDF), Beneficiary (count + names).
- Title + free-text meta.
- Submits → upload media to storage → insert `evidence` row → toast + redirect to `/impact` with the new entry highlighted.

## 5. Funding + donor receipt

- `SupportDialog` calls a `createServerFn` that inserts a `transaction`, increments `projects.raised_cents/donors/beneficiaries`, inserts a `BENEFICIARY` evidence row, and returns the receipt.
- New `/receipts/$id` route renders a printable donor receipt (project, amount, date, receipt #, verification snapshot).
- "Download PDF" (client-side via `jspdf`) and "Download CSV" buttons on the receipt page and on `/impact` for the full ledger / transactions.

## 6. Trust Score breakdown panel

Replace the current static weighting card on `/impact` and `/projects/$id` with a computed breakdown:
- GPS confirmations (28%) — % of project days with a GPS ping in last 30d.
- Media + IoT completeness (22%) — ratio of expected vs received uploads.
- Beneficiary acknowledgements (26%) — confirmed beneficiaries / target.
- Independent audits (24%) — audit reports in last 90d, capped.
Each row shows raw count, contribution points, and a progress bar; total = project trust score.

## 7. Atlas AI grounded answers

Rewrite the responder to:
- Query Supabase (server fn) for projects/evidence/transactions matching the question.
- Return: short headline answer + 1–3 **evidence snippets** (quoted `meta`/`report_text`, kind, captured_at) + clickable citations.
- Citation chips link to: project page, community page, or `/impact/evidence/$id` (new modal/page that opens the exact GPS map pin, photo, video, IoT chart, or report).
- Suggested prompts updated to match real data shape.

## 8. Exports

- `/impact` gets "Export ledger CSV" (all evidence) and "Export transactions CSV".
- Receipt page: "Download receipt PDF".
- Project page: "Export impact summary PDF" (project + trust breakdown + last 10 evidence).

## Technical notes

- `bun add jspdf` for client-side PDF; CSV built inline.
- All writes through `createServerFn` with `requireSupabaseAuth`; reads via public server fns using `supabaseAdmin` for landing/impact/projects so unauthenticated visitors still see the ledger.
- Real-time feel: after mutations, invalidate React Query keys (`['projects']`, `['evidence']`, `['transactions']`).
- `atlas-store.ts` is removed; React Query becomes the single source of truth.
- Trust score computed in a SQL view `project_trust_breakdown` for consistency between project page and AI answers.

## Out of scope (ask before adding)

- Real payment processing (still demo amounts).
- Video transcoding / large-file chunked uploads (cap at 50MB).
- Multi-currency.

Ready to build on approval — enabling Lovable Cloud is the first step.
