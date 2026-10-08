const REQUIRED = ["DATABASE_URL", "BETTER_AUTH_SECRET"] as const;

export function loadEnv(env: NodeJS.ProcessEnv = process.env): void {
  const missing = REQUIRED.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(
      `apps/api missing required env: ${missing.join(", ")}. Copy apps/api/.env.example to apps/api/.env and fill real values.`,
    );
  }
}
