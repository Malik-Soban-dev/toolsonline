# Online Tools

**A little less noise. A lot more direction.**

An original, local-first SEO workbench. Practical keyword and page-copy tools without a visitor-facing API, accounts, a paywall, or fabricated search metrics.

## What works

- **Keyword studio:** whitespace/Unicode normalization, optional lowercase and punctuation cleanup, case-insensitive deduplication, rule-based English intent, lexical topic groups, search, filtering, sorting, selection, pagination, and bookmarks.
- **CSV workflow:** local CSV/TSV/TXT import, delimiter detection, quoted/multiline fields, explicit keyword-column and header mapping, meaningful validation errors, and spreadsheet-safe exports. Imported metrics are deliberately ignored.
- **Keyword clustering:** dedicated grouping of a pasted or imported list by the words and two-word phrases the phrases share. Adjustable shared-wording rule and minimum group size, the shared wording behind every group, an honest review list for what does not group, and copy/save/export/transfer actions.
- **Keyword ideas:** 24 transparent English templates across questions, comparisons, and long-tail prompts. Filter, select, save, export, or add ideas to the studio.
- **Text analyzer:** live Unicode-aware token counts, repeated terms/adjacent phrases, exact focus-phrase matching, descriptive density/coverage, reading-time estimates, and CSV frequency export.
- **SERP preview:** editable search-style desktop/mobile layouts, URL display validation (no fetching), approximate length/width guides, and escaped HTML tags.
- **Title & meta helper:** fixed-template drafts, manual editing, character guides, HTML copy/download.
- **Collection:** session-based bookmarks, search, removal, and export. Browser persistence is opt-in, reversible, and explicitly not cloud sync.
- **Trust pages:** about, methodology, privacy, terms, and a contact draft that opens the real GitHub issue tracker. It does not pretend to send email.

**Not provided:** search volume, CPC, keyword difficulty, verified search intent, live rankings, autocomplete data, SERP overlap, semantic embeddings, external AI, or ranking guarantees. The existing OpenSEO research project is not used as an end-user data API.

## Run locally

Node **22.12+ (LTS)** and npm are required. No API keys or environment variables are needed.

```sh
npm ci
npm run dev
# http://localhost:3000 — binds to 0.0.0.0 for preview environments
```

For the actual production-optimized static output:

```sh
npm run build
npm start
```

`npm start` serves `out/` with real 404 responses, correct content types, relative assets, and no host/origin restriction. It is a preview server, not a database or application API. The static export is deployable to Vercel or another static host. If you use another host, replicate the security headers and serve `404.html` with HTTP 404.

## Verify

```sh
npm run verify       # formatting, ESLint, TypeScript, unit tests, static build
npm run test:e2e     # integration, desktop/mobile axe audits, privacy/network checks
npm run format      # apply the repository formatter
```

The browser-test runner uses the npm-packaged Chromium binary and its bundled Linux libraries, avoiding a separate browser CDN download. On Linux, `tar` must be available. For a locally installed Chrome, set `CHROMIUM_PATH=/path/to/chrome`. Playwright starts the static preview if one isn't already listening; run the build first. `TEST_BASE_URL` can point at an existing preview instead.

GitHub Actions runs these checks on pushes and pull requests; a workflow file being present is not a claim that a remote run has occurred. See [verification evidence](docs/VERIFICATION.md) for checks actually run in this workspace.

## Privacy architecture

Tool input stays in browser memory. With explicit opt-in, studio input, preferences, and collection are stored under `online-tools.workspace.v1` in localStorage. Companion-tool drafts are not persisted. There are no app cookies, analytics scripts, remote fonts, API requests, or user accounts. Hosting/preview infrastructure still handles ordinary web requests and may log request metadata.

No secrets are needed. Do not add service-role keys, provider credentials, or confidential datasets to this repository. See the in-app privacy policy for the complete current behavior.

## SEO and the later domain

All 12 routes have descriptive titles, task-identifying headings, and route-specific metadata. The six tools include server-rendered practical guides, worked examples, limits, and contextual next-tool links. Structured data describes the actual tool or trust page, not the same app on every route. See the evidence and route decisions in [the SEO audit](docs/SEO-AUDIT.md).

Until a separately approved custom-domain launch, pages are `noindex, nofollow`, the sitemap is empty, and canonicals/public schema URLs are omitted. `robots.txt` allows crawling so crawlers can read the noindex tags—it is not an access-control mechanism. Keep preview protection enabled. `npm start` adds an always-noindex preview HTTP header; `vercel.json` also scopes noindex headers to known preview hosts. The browser-only collection always stays noindex, has no canonical/schema, and is excluded from the sitemap.

After a separately approved production launch:

1. Set `SITE_URL` to the owned, connected **HTTPS origin** only—no path, query, fragment, credentials, or non-default port. Placeholder, reserved/local, IP, and known platform-preview origins are rejected.
2. Review legal identity/contact details, copy, policies, and accessibility.
3. Deliberately set `ALLOW_INDEXING=true` for production only.
4. Rebuild and confirm all eleven public canonicals, route-specific schema, social-card URLs, actual response headers, robots, and sitemap. `npm start` remains a noindex evaluation server, not a production server.

Non-production Vercel builds remain noindex even if `ALLOW_INDEXING` is accidentally set there; public URL metadata is omitted until the full launch gate passes. Domain or environment changes require a new build because this app is static. `.env.example` documents the only optional settings. See the [launch checklist](docs/LAUNCH.md).

## Vercel status

The connector is enabled, but filtered discovery found no matching Online Tools project. No unrelated project was changed. No Vercel project, production deployment, domain, DNS entry, database, or auth service was created. The connector cannot supply the controls required to bootstrap a first deployment.

An existing, authorized Online Tools project is needed for a connector-based preview. Once it exists and is linked, a Vercel CLI deployment **without `--prod`** is another preview-only path. Do not import or deploy `main` to production just to get a preview. `vercel.json` is prepared for Next.js static export and supplies security headers without blocking iframe-based Arena previews.

## Repository map

```text
app/                  Static routes, metadata, robots, sitemap, base styling
components/           Workspace UI, shared state, dialogs, and tool interfaces
lib/                  Pure CSV, keyword, text, snippet, and site-metadata functions
styles/               Companion-tool styling
public/               Original vector identity, social image, and touch icon
scripts/              Static preview server and browser-test runner
tests/unit/           Algorithm, security, bounds, and metadata tests
tests/e2e/            Real workflow, responsive, accessibility, and privacy tests
docs/                 Plan, SEO audit, launch checklist, and verification evidence
.github/workflows/    CI checks (no deployment jobs)
```

Design and copy are original. Fonts (Manrope and Instrument Serif) are bundled locally through Fontsource; icons use Lucide. No reference-site brand, copy, or assets are included. Font and icon licenses are preserved in `public/third-party-notices.txt`.

### Build-tool dependency notes

Vitest is on the patched 5.x line. A scoped `minimatch@11.0.8` override for the TypeScript ESLint parser fixes GHSA-g3hv-75wg-m249 without downgrading Next.js. Remove it once the upstream parser requires a patched range. ESLint 9 is pinned because the current Next.js lint plugins do not yet declare ESLint 10 support; npm may print an ESLint 9 end-of-support notice during installation. This is build tooling, not shipped client code.
