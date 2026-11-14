# SEO implementation audit

- **Reviewed:** 14 November 2026 (UTC)
- **Branch / PR:** `arena/948d630f-toolsonline` / [PR #1](https://github.com/Malik-Soban-dev/toolsonline/pull/1)
- **Scope:** all 12 tool, collection, and trust routes (including the later `/keyword-clusters/` route), plus a genuine unknown-route 404, robots, sitemap, metadata, internal links, and structured data.
- **Deployment:** local static-export preview only. No production deployment, merge, domain connection, or DNS change.

## Evidence and access limits

The running Arena preview is `https://3000-i0e60eldt0tt04pg7h0eg.e2b.app`. An unauthenticated external fetch returned **403, Missing traffic access token**, so it was not a successful public crawler audit. The app's running local upstream returned HTTP 200, including a request with the actual preview Host header. Chromium reviewed that same exported app through the upstream. No access token was requested or bypassed.

Before/after rendered audits record status, title, description, robots, canonical, Open Graph, headings, JSON-LD, main-content links, response headers, and desktop/mobile document widths. Screenshots and JSON are intentionally ignored under `artifacts/seo/{before,after}/`; this document preserves the conclusions. The baseline is implementation commit `3f85a00`.

OpenSEO's connector is unsupported in this session. No research-project data, volume, CPC, keyword difficulty, Search Console data, or ranking measurements were obtained. No sub-agent capability was exposed. Existing qualitative searches were used only to check task vocabulary—not to estimate demand, prioritize by an invented score, or copy competitor wording. Further research was stopped as requested; implementation used the audit, official guidance already found, and the source algorithms.

## What the baseline actually showed

- All 11 routes then existing returned 200, unknown routes returned 404, and each page already had one main H1. These behaviors were preserved.
- The homepage's rendered title was only **“Keyword studio”**, without the brand. The root page did not inherit the root layout's title template.
- Tool H1s included “One topic,” “Get to know your writing,” and “A small preview,” but not the task being offered.
- Most companion tools had just one main-content link, to methodology. The sidebar was doing almost all tool discovery work.
- A single generic `WebApplication` schema appeared on every route, including privacy, terms, contact, the collection, and 404.
- Route Open Graph objects replaced the layout object, dropping `og:site_name` from regular pages.
- Pre-domain canonicals were correctly absent and the sitemap was empty. However, robots.txt blocked crawlers from reading the noindex tags. The static preview had no `X-Robots-Tag` header, and origin validation accepted platform preview domains.
- No document overflow was observed at the baseline's 1440 px desktop and 390 px mobile widths. Content improvements were not used as a reason to redesign the workbench.

## Route decisions and original content

Every title below also has the explicit suffix **`· Online Tools`**. Each route has a unique factual description and complete Open Graph/Twitter title and description. No fixed character count is treated as an SEO pass/fail rule.

| Route                | Implemented title                                   | Intent/capability fit and content decision                                                                                                                                                                                                                                                                                                                                               | Structured data                 |
| -------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `/`                  | Keyword List Cleaner & Organizer                    | Organize an existing list, not obtain keyword demand. Task-identifying H1, import/clean/review instructions, deterministic deduplication example, limits, links to ideas and text analysis.                                                                                                                                                                                              | Route-specific `WebApplication` |
| `/keyword-clusters/` | Keyword Clustering & Grouping Tool — Shared Wording | Group a list that already exists by shared wording, not by demand or meaning. Task-identifying H1, adjustable shared-wording rule and minimum group size, shared-wording evidence per group, an explicit review list for ungrouped phrases, and a worked seven-phrase example. Limits state plainly that no SERP overlap, embeddings, autocomplete, volume, CPC, or difficulty are used. | Route-specific `WebApplication` |
| `/keyword-ideas/`    | Keyword Idea Generator — Template Prompts           | Brainstorm with 24 fixed English patterns. Three categories, seed guidance, an awkward-template example, validation limits, links to studio/meta helper. Explicitly not autocomplete or People Also Ask.                                                                                                                                                                                 | Route-specific `WebApplication` |
| `/text-analyzer/`    | Word Frequency Counter & Text Analyzer              | Count supplied text and adjacent two-word phrases. Top-15 list behavior, whole-token matching, frequency vs. coverage example, cross-sentence/overlap caveats. No ideal density or SEO score.                                                                                                                                                                                            | Route-specific `WebApplication` |
| `/serp-preview/`     | SERP Preview for Titles & Descriptions              | Inspect a draft introduction on two illustrative layouts. Explains URL display without fetching, approximate counters, HTML copy, and query-dependent search appearance. Links to meta helper/text analysis.                                                                                                                                                                             | Route-specific `WebApplication` |
| `/meta-helper/`      | Title & Meta Description Helper                     | Four title and three description patterns, manual revision, truthful benefits, escaped HTML export. Explicitly no AI/page reading and no automatic transfer to the separate snippet tool.                                                                                                                                                                                                | Route-specific `WebApplication` |
| `/saved/`            | My Keyword Collection                               | Browser-only personal workflow, not a public search landing page. Clear collection H1; always noindex, no canonical, excluded from sitemap.                                                                                                                                                                                                                                              | None                            |
| `/about/`            | About This Local-First SEO Workspace                | Identifies the project and actual capabilities. Adds descriptive in-copy links to all six tools and the methods/limits guide.                                                                                                                                                                                                                                                            | `AboutPage`                     |
| `/methodology/`      | How the SEO Tools Work                              | Task-identifying H1, stable section anchors, links back to the relevant tools, exact 2 MiB file limit/100-column cap, and primary-source title/snippet references.                                                                                                                                                                                                                       | `WebPage`                       |
| `/privacy/`          | Privacy Policy                                      | Clearly identifies the policy; retains accurate local-storage, hosting, and GitHub-contact disclosures. No invented operator or compliance claims.                                                                                                                                                                                                                                       | `WebPage`                       |
| `/terms/`            | Terms of Use                                        | Clearly identifies terms; retains heuristic, storage, legal-review, and no-guarantee disclosures.                                                                                                                                                                                                                                                                                        | `WebPage`                       |
| `/contact/`          | Contact & Feedback                                  | Clearly identifies the contact route and real GitHub draft workflow. No invented email delivery or support SLA.                                                                                                                                                                                                                                                                          | `ContactPage`                   |
| Unknown URL          | Page Not Found                                      | Descriptive title, genuine 404, return link, no canonical, noindex.                                                                                                                                                                                                                                                                                                                      | None                            |

The six field-note guides are server-rendered below the interactive tools, not hidden in metadata or dependent on JavaScript. Each contains three actionable steps, a worked example, limitations, two contextual next-tool links, and a deep link to the relevant method. Numerical examples come from the actual local algorithms, not search-market data. The code/HTML never serializes personal keyword input into structured data.

`lib/pages.ts` is the shared catalogue for metadata, schema facts, and the public sitemap. `PageSchema` replaces the generic root-layout application schema. Only a deliberately launched homepage adds a `WebSite` identity with its real URL; no nonexistent site-search action, ratings, reviews, FAQ rich-result markup, or fabricated modification dates were added. Schema is descriptive markup, **not a rich-result or ranking guarantee**.

The topbar now has a labelled breadcrumb navigation with a real workspace link. About and methodology links are useful in context rather than a sitewide keyword-link block. Browser tests validate every local link and fragment target.

## Dedicated keyword clustering route

A single clustering engine lives in `lib/keywords.ts`. `buildClusters()` anchors groups on recurring wording from the supplied list; `clusterKeywords()` derives the studio's per-phrase topic labels from the same pass, and `groupByCluster()` groups an already-labelled (possibly filtered) list without re-clustering it. The studio and the clustering tool therefore cannot drift apart, and no second algorithm was introduced.

Behavior, all covered by unit tests and the browser suite:

- Adjacent two-word phrases are considered before single words, and anchors that start a phrase win ties, so "Pour over" is preferred over "Over coffee".
- A word appearing in at least 85% of the list cannot anchor a group. In the clustering guide's seven-phrase example, "coffee" appears in six of seven phrases and is skipped.
- Each phrase joins its most specific matching group exactly once; anything left over goes to a "Needs review" list with the reason, rather than being forced into a group.
- Group labels use the most common surface form of your own wording, so "coffee beans" reads naturally instead of the stemmed "coffee bean".
- The UI exposes two honest controls only: "Any shared word" vs "A shared two-word phrase", and a smallest-group size of two, three, or four. Neither control adds information that is not already in the list.

The route is reachable from the sidebar toolkit, the studio's next-step link, the tool field notes, About, and the methodology section `08 · Keyword clustering`. It is a public route with its own `WebApplication` schema, so it appears in the launch sitemap; the browser-only collection remains excluded.

Targeted keyword research was reviewed internally to choose this route's wording and to see that live results mix real clustering tools with roundup and how-to pages. No volume, CPC, or difficulty figures from that research are displayed anywhere on the site, in metadata, in schema, or in exports — the page describes only what the local algorithm actually does.

## Preview safety and later indexing

| Build state                                                               | Page robots                                 | Canonical/public schema URL          | Sitemap                              |
| ------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------ | ------------------------------------ |
| No valid custom origin                                                    | `noindex, nofollow`                         | Absent                               | Empty                                |
| Valid origin, no exact `ALLOW_INDEXING=true`                              | `noindex, nofollow`                         | Absent                               | Empty                                |
| Non-production `VERCEL_ENV`, even with origin and opt-in                  | `noindex, nofollow`                         | Absent                               | Empty                                |
| Known preview hostname, placeholder, IP, malformed/non-HTTPS origin       | `noindex, nofollow`                         | Absent                               | Empty                                |
| Valid custom HTTPS origin + explicit opt-in + production/non-Vercel build | `index, follow` on the eleven public routes | Absolute, self-consistent route URLs | Exactly eleven public canonical URLs |
| Collection in any state                                                   | `noindex, nofollow`                         | Absent                               | Excluded                             |

- `SITE_URL` must be an HTTPS **origin**: no path, query, fragment, credentials, or non-default port. Known shared preview hosts, example/reserved/local domains, IPs, and malformed DNS labels fail closed. This checks configuration shape; it cannot prove ownership or DNS readiness.
- robots.txt intentionally uses **`Allow: /`**, including for the collection, so a crawler can read page-level noindex. Noindex is not a robots.txt directive, and blocking crawling is not an indexing guarantee. Existing preview access protection should remain enabled; noindex is not privacy or access control.
- `npm start` is explicitly a preview server and returns **`X-Robots-Tag: noindex, nofollow`**, including for its local launch-mode test. Do not use that command as an indexable production server.
- `vercel.json` adds a host-scoped noindex header for `*.vercel.app` / `*.e2b.app`, plus an always-noindex collection rule. The rules' shape/hostname matching are unit-tested; they have **not** been verified on a Vercel deployment because none was authorized or created.
- Public URL metadata and sitemap URLs only appear after the full build-time launch gate. No placeholder origin is shipped by default. Origin/environment changes require a rebuild.

## Guidance used, and what it does not prove

- Descriptive, concise titles and a clear visible main title support intelligible title links; Google uses several page signals. This motivated task-identifying titles/H1s, not keyword stuffing. [1](https://developers.google.com/search/docs/appearance/title-link)
- Meta descriptions should summarize the individual page. Snippets can instead use page content, vary by query, and be truncated to fit the display; no universal character cutoff was promised. [1](https://developers.google.com/search/docs/appearance/snippet)
- Crawlers must be allowed to read a page to see its noindex rule. This is the evidence for removing the contradictory crawl block while retaining/strengthening noindex. [1](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- Structured data should represent visible page content and does not guarantee a rich result. This is why the app schema is scoped to real tools and not repeated on trust/404 pages. [1](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- Vercel supports `X-Robots-Tag` headers scoped with host conditions; live behavior remains a later hosting verification requirement. [5](https://vercel.com/docs/headers/response-headers#x-robots-tag)
- Qualitative task-language examples already reviewed: keyword-list cleaning/deduplication ([1](https://kwscanner.com/tools/keyword-list-cleaner/)), word/phrase frequency ([1](https://mytoolstudio.com/tools/text/word-frequency-counter/)), and desktop/mobile snippet previews ([1](https://www.anicetool.com/serp-preview)). These pages were **not** treated as authorities for claims about density, exact rendering, demand, or rankings. Their copy, metrics, and assets were not reused.

## Verification

- **147 unit tests passed**: CSV 25, keywords 35, analysis 20, site/SEO 66 (routes/counts updated for `/keyword-clusters/`), plus clustering coverage: shared-phrase anchors, minimum size, two-word-phrase rule, ungrouped review list, intent mix, and studio-label agreement. New coverage includes preview/reserved origins, exact opt-in, non-production environments, every route's metadata, social URL consistency, route schema types, JSON-LD escaping, collection exclusion, and sitemap/robots behavior.
- **40 Chromium browser tests passed**, no retries: existing tool workflows plus the clustering workflow (grouping, rule/size controls, filter, CSV export, transfer to studio), all-route SEO assertions, local links/anchors, JavaScript-disabled instructions/navigation, real worked examples, and exclusion of personal input from schema.
- A **local fixture-domain launch build** passed all **5 SEO browser tests**: ten self-canonicals, matching Open Graph/schema URLs, absolute Open Graph/Twitter images, ten sitemap URLs, homepage WebSite, and continued collection/404 exclusion. This was an offline configuration exercise against the local server, **not a production deployment or domain connection**. The unconfigured noindex preview export was restored afterward.
- Formatting, zero-warning ESLint, TypeScript, static build, and full/production dependency audits passed. Both audits reported **0 known vulnerabilities**.
- Chromium/axe checks found **0 targeted WCAG 2.0/2.1 A/AA violations** on all 12 routes at desktop/mobile. No horizontal document overflow at **320, 390, 768, 1024, or 1440 px**. No browser page errors in all-route checks.
- Reviewed desktop/mobile screenshots of the workbench, tool headers/forms and field notes, and supporting/trust pages. The mobile studio heading was sized to avoid leaving a lone “list” line. Field notes stack on narrow layouts without displacing the tools above them.

These are local Chromium, automated accessibility, and visual checks—not a public indexing check, cross-browser/screen-reader certification, Lighthouse result, or evidence of future rankings. Previous implementation-specific performance observations are not new SEO measurements.

### Reproduce the launch-mode fixture locally

After the ordinary `npm run verify` and `npm run test:e2e` checks, with `npm start` running:

```sh
# Fixture only: these commands do not deploy or contact this hostname.
SITE_URL=https://tools.launch-fixture.net ALLOW_INDEXING=true VERCEL_ENV=production npm run build
TEST_LAUNCH_ORIGIN=https://tools.launch-fixture.net npm run test:e2e -- tests/e2e/seo.spec.ts
# Always restore the safe preview build, including if the fixture check fails.
SITE_URL= ALLOW_INDEXING=false VERCEL_ENV=preview npm run build
```

CI repeats both the ordinary preview checks and this local launch-mode fixture. It has no deployment job.

## Remaining launch requirements

See [LAUNCH.md](LAUNCH.md): authorize the correct hosting project and a real owned domain; review operator identity, policies, and private reporting; keep staging protected/noindex; approve a separate production launch; deliberately configure the origin and indexing opt-in; rebuild and check actual HTTP headers, canonicals, schema, robots, sitemap, redirects, and Search Console after launch. Nothing in this pass merges PR #1 or performs those external actions.
