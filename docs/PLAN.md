# Online Tools — implementation plan

## Product boundary

An original, local-first SEO workbench, not an API-backed keyword metrics product. No accounts, database, paywall, visitor analytics, external fonts, or remote keyword requests. The existing OpenSEO research project is separate and is not a visitor-facing API.

## Capability inspection (14 November 2026)

- Repository: `Malik-Soban-dev/toolsonline`, initial README only. Work stays on `arena/948d630f-toolsonline`.
- GitHub: authenticated `git` / `gh`, repository read/write available. Arena GitHub connector unsupported; CLI is the supported route.
- Vercel: connector enabled; team/project discovery works. Filtered searches for `tool` and `online` returned no matching project. Do not reuse unrelated projects or automatically create a project. The deployment connector cannot supply first-deployment `projectSettings` or auto-detection confirmation controls. Provide an Arena preview and a Vercel-ready static export.
- Supabase: connector supports projects, SQL, auth, functions, and keys. None is required; no database or secret access is justified.
- OpenSEO: no connector exposed. Do not infer API access from the research project.
- Parallel AI: no sub-agent capability exposed. Independent capability discovery and verification can run in parallel.
- Documents, email, calendar, storage, and issue trackers do not improve this implementation; leave those services untouched.

## Build sequence

1. Bespoke responsive workspace: quiet paper tones, pine/leaf accents, Manrope UI and Instrument Serif editorial headings; custom geometric identity.
2. Pure, tested local algorithms: CSV parser/column mapping, normalization/deduplication, lexical topic grouping, rule-based intent, template suggestions, text frequency, snippet/title/meta utilities.
3. Real interactions: file import, selection, filters, sorting, pagination, saved keywords, exports, opt-in local persistence, empty/error/success states, keyboard-friendly navigation.
4. Supporting routes: suggestions, text analyzer, SERP preview, title/meta helper, saved lists, methodology, about, privacy, terms, contact, and not-found.
5. Technical SEO: page-specific server-rendered metadata, schema, icons, social image, robots and sitemap gated on a real domain and explicit indexing opt-in. Previews are noindex.
6. Verify: unit tests, TypeScript, ESLint, production export, browser integration at desktop/mobile sizes, accessibility audit, network/privacy checks, and a live preview.

## Explicit exclusions

No fabricated volume, CPC, keyword difficulty, ranking predictions, live SERPs, Google autocomplete claims, external AI, production deployment, DNS/domain changes, or unnecessary infrastructure.

## Delivery status

All six build stages are complete. The final local verification passed 78 unit tests, 33 browser tests, clean-state type checking/build, all targeted route/modal accessibility audits, and a full zero-vulnerability npm audit. See `docs/VERIFICATION.md` for evidence and limits. The Arena preview is running; Vercel preview provisioning and the later domain/production launch remain intentionally outside this delivery because no matching authorized Vercel project exists.

## Follow-up: evidence-based SEO implementation

- [x] Audit rendered metadata, headings, links, schema, status, and indexing controls across all routes; record external-preview access limits honestly.
- [x] Implement descriptive branded titles, task-identifying H1s, original no-API field notes, real worked examples, and contextual internal links.
- [x] Replace repeated app schema with appropriate route types and exclude collection/404 schema.
- [x] Strengthen preview origin/environment/header safeguards; let crawlers read noindex and keep pre-launch public URLs/sitemap absent.
- [x] Verify preview and local launch-fixture exports, all-route links/anchors, no-JavaScript readability, desktop/mobile accessibility, and narrow layouts.
- [x] Update launch and verification evidence in `SEO-AUDIT.md`; keep production deployment, merge, and domain/DNS changes out of scope.
