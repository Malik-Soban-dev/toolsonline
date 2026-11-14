# Later launch checklist

The current delivery is an evaluation preview. Production launch and domain connection are intentionally **not** performed.

## Before a Vercel preview

- [ ] Authorize an existing, correctly scoped Online Tools Vercel project. Current connector searches for `tool` and `online` returned no matches.
- [ ] Confirm Node 22+, `npm ci`, `npm run build`, and the Next.js framework preset. The app uses static export.
- [ ] Keep automatic production deployments disabled while evaluating. Do not deploy `main` to production as a shortcut.
- [ ] Ensure the current Arena branch is the source when using Git; never deploy another branch without a separate session.
- [ ] For the connector, omit the deployment target (`null`) for a preview. It must not be the literal `preview` string. First-deployment projectSettings and auto-detection confirmation are not exposed; if required, use the dashboard/CLI with explicit approval instead of bypassing that limitation.
- [ ] For an already linked Vercel CLI project, `vercel deploy` without `--prod` creates a preview. This command has not been run here.
- [ ] Verify the generated preview URL, its expected deployment protection, noindex metadata, and real interactions. Do not disable account protection without approval.

## Before a separately approved public production launch

- [ ] Confirm the site's operator/legal identity, public support email or private reporting channel, and any jurisdiction-specific policies. Current terms/privacy accurately describe this MVP but are not legal advice.
- [ ] Choose and explicitly authorize the actual domain. Do not invent a canonical origin.
- [ ] Connect and verify the domain only after approval; do not change unrelated DNS or projects.
- [ ] Set server build-time `SITE_URL=https://YOUR-OWNED-ORIGIN` and opt into `ALLOW_INDEXING=true` in production only.
- [ ] Rebuild. Check route-specific title/description/canonical, WebApplication JSON-LD, absolute social image, `robots.txt`, and `sitemap.xml`. The collection stays excluded/noindex.
- [ ] Confirm no analytics/API calls have been added without a privacy-policy update and an explicit product decision.
- [ ] Re-run `npm ci`, `npm run verify`, and `npm run test:e2e`. Review desktop, tablet, narrow mobile, keyboard, reduced motion, and screen-reader behavior.
- [ ] Test exports in the spreadsheet applications the audience uses; apostrophe formula protection can affect exact raw round trips.
- [ ] Confirm HTTPS, static asset caching, real 404s, headers, and preview embedding. Do not add X-Frame-Options or frame-ancestors restrictions that break authorized previews.
- [ ] Confirm accessibility and performance on real devices and browsers. Automated Chromium/axe checks are useful but not a complete accessibility certification.
- [ ] If a genuine keyword provider is added later, keep its credentials server-side, disclose provenance/freshness/cost, review rate limits, and never replace missing data with fabricated numbers.

## Data services

Supabase, auth, billing, external AI, email delivery, and OpenSEO access are **not** prerequisites. Provisioning them now would add unnecessary cost, secrets, and privacy obligations. The current site works without all of them.
