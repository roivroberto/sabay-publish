import { execFileSync } from "node:child_process";
import { config as loadDotenv } from "dotenv";

loadDotenv({ path: ".env.local" });
loadDotenv({ path: ".env", override: false });

const useProductionDeployment = process.argv.includes("--prod");
const requiredVariables = ["CLERK_JWT_ISSUER_DOMAIN", "CLERK_WEBHOOK_SECRET"];
const optionalVariables = [
  "DEMO_WRITER_EMAILS",
  "DEMO_EDITOR_EMAILS",
  "GOOGLE_CLOUD_PROJECT",
  "GCP_TRANSLATION_LOCATION",
  "GCP_TRANSLATION_GLOSSARY_NAME",
  "GOOGLE_SERVICE_ACCOUNT_JSON",
  "GOOGLE_APPLICATION_CREDENTIALS_JSON",
];

const envEntries = [...requiredVariables, ...optionalVariables]
  .map((name) => [name, process.env[name]?.trim() ?? ""])
  .filter(([, value]) => value);

const missingRequiredVariables = requiredVariables.filter(
  (name) => !process.env[name]?.trim(),
);

if (missingRequiredVariables.length > 0) {
  console.error(
    `Missing required Convex env values in .env.local: ${missingRequiredVariables.join(", ")}`,
  );
  process.exit(1);
}

for (const [name, value] of envEntries) {
  execFileSync(
    "pnpm",
    [
      "exec",
      "convex",
      "env",
      "set",
      ...(useProductionDeployment ? ["--prod"] : []),
      name,
      value,
    ],
    {
      stdio: "inherit",
    },
  );
}

const deploymentLabel = useProductionDeployment ? "prod" : "dev";

console.log(
  `Synced ${envEntries.length} variable(s) to the Convex ${deploymentLabel} deployment.`,
);
