# Paraluman

Repository for the Paraluman bilingual publishing prototype.

## Structure

- `web/`: Next.js + Convex + Clerk MVP implementation for Sabay Publish
- `assets/branding/`: logo and brand assets

## Local quickstart

Run the application from [`web/`](./web):

1. `cd web`
2. `pnpm install`
3. `cp .env.example .env.local`
4. `pnpm convex:sync-env`
5. `pnpm convex:dev`
6. `pnpm dev`

## Deployment

Deployment and environment details live in [`web/README.md`](./web/README.md).

## Current Contents

- [`web/`](./web): application code for the bilingual publishing workflow prototype
- [`assets/branding/paraluman-logo.avif`](assets/branding/paraluman-logo.avif): logo asset
