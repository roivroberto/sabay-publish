# Sabay Publish MVP

Next.js + Convex + Clerk prototype for bilingual English/Filipino publishing.

## Local setup

1. Install dependencies from `web/`:
   `pnpm install`
2. Copy the environment template:
   `cp .env.example .env.local`
3. Fill the required Clerk and Next.js runtime variables in `.env.local`.
4. Sync the Convex-side variables from `.env.local` into the configured Convex
   dev deployment before starting the backend:
   `pnpm convex:sync-env`
5. Start the app in two terminals:
   `pnpm convex:dev`
   `pnpm dev`

### Minimum local env

Required to boot the app locally:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_JWT_ISSUER_DOMAIN`
- `CLERK_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

Written automatically by `pnpm convex:dev` during local development:

- `CONVEX_DEPLOYMENT`
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CONVEX_SITE_URL`

Only required when you want real Google Cloud translation outside the mocked E2E flow:

- `GOOGLE_APPLICATION_CREDENTIALS` for a local file path, or
- `GOOGLE_SERVICE_ACCOUNT_JSON` for the raw service-account JSON
- `GOOGLE_CLOUD_PROJECT`
- `GCP_TRANSLATION_LOCATION`
- `GCP_TRANSLATION_GLOSSARY_NAME`

### Local reproducibility

The current repo state is reproducible locally from `web/` with:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm test:e2e`

`pnpm test:e2e` starts Convex and Next automatically, uses mocked translation,
and passed locally on March 29, 2026. It expects `http://localhost:3000` to be
free.

For Playwright auth, keep these available in `.env.local`:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

If Clerk bot protection blocks Playwright in your environment, also set:

- `CLERK_TESTING_TOKEN`

Optional local test overrides:

- `E2E_WRITER_EMAIL`
- `E2E_EDITOR_EMAIL`
- `E2E_TRANSLATION_PREFIX`

## Verification

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm test:e2e`

## Deployment

- Hosting target: Vercel project `paraluman-web`
- GitHub repo connection: `roivroberto/paraluman`
- Vercel root directory: `web`
- Production branch: `main`
- Custom domain: `https://paraluman.rvco.dev`
- Convex project: `paraluman`
- Convex deployments: dev `grateful-tortoise-98`, prod `reliable-reindeer-345`
- Clerk webhook endpoint: `https://paraluman.rvco.dev/api/webhooks/clerk`

### Current domain wiring

- Vercel project domain: `paraluman.rvco.dev`
- Cloudflare DNS record: `A paraluman.rvco.dev -> 76.76.21.21`

### Production config notes

- Set `NEXT_PUBLIC_SITE_URL=https://paraluman.rvco.dev` in Vercel.
- Set `NEXT_PUBLIC_CONVEX_URL=https://reliable-reindeer-345.convex.cloud` in Vercel.
- Keep the matching Clerk, Convex, and Google Cloud runtime secrets configured in the hosted environments.
- Use a single Convex project for this app, with separate dev and prod deployments.
- Vercel production should use `CONVEX_DEPLOYMENT=prod:reliable-reindeer-345` and `NEXT_PUBLIC_CONVEX_URL=https://reliable-reindeer-345.convex.cloud`.
- Convex prod should use the hosted Google credential value in `GOOGLE_SERVICE_ACCOUNT_JSON` instead of a local file path.
- Variables read from `web/convex/*`, including `CLERK_JWT_ISSUER_DOMAIN` and `CLERK_WEBHOOK_SECRET`, must be set in Convex itself with `pnpm convex:sync-env --prod` or in the Convex dashboard.
- Setting `NEXT_PUBLIC_SITE_URL` only in Convex does not configure Next.js metadata. That value must exist in Vercel because the Next.js app builds and serves the canonical URLs.
- Vercel hosts the Next.js app in `web/`. Convex remains a separate hosted backend and needs its own environment values.
- If editors publish remote hero images, add their hostnames to `ALLOWED_IMAGE_HOSTS` in Vercel to keep `next/image` optimization enabled. Unlisted hosts now fall back to a plain `<img>` so the public page still renders.
- The app now redirects `/login/create`, `/login/sign-up`, and `/login/signup` back to `/login?mode=signup-disabled` as a product-level safeguard. Keep Clerk sign-up disabled as well when your plan supports that restriction.

## Environment

Required variables are documented in [`.env.example`](./.env.example).

For hosted Convex deployments, set `GOOGLE_SERVICE_ACCOUNT_JSON` to the full
service-account JSON contents. The runtime also accepts
`GOOGLE_APPLICATION_CREDENTIALS_JSON` as a backward-compatible alias. Local
development can continue using `GOOGLE_APPLICATION_CREDENTIALS` with a
filesystem path.

`.env.local` is not enough for variables consumed by files under `convex/`.
After changing `CLERK_JWT_ISSUER_DOMAIN`, `CLERK_WEBHOOK_SECRET`, demo role
emails, or hosted Google Cloud values locally, run `pnpm convex:sync-env`
again for the dev deployment.

Clerk production should point its webhook to
`https://paraluman.rvco.dev/api/webhooks/clerk` and use the matching
`CLERK_WEBHOOK_SECRET` configured in both Vercel and Convex production.

Optional:

- `ALLOWED_IMAGE_HOSTS` for remote article image domains
- `CLERK_TESTING_TOKEN`, `E2E_WRITER_EMAIL`, `E2E_EDITOR_EMAIL`, and `E2E_TRANSLATION_PREFIX` for local Playwright runs
