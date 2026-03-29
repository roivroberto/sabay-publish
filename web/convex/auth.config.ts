import type { AuthConfig } from "convex/server";

const issuer = process.env.CLERK_JWT_ISSUER_DOMAIN;

if (!issuer) {
  throw new Error(
    "CLERK_JWT_ISSUER_DOMAIN must be set in the Convex deployment environment.",
  );
}

export default {
  providers: [
    {
      domain: issuer,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
