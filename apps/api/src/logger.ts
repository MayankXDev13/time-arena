import pino from "pino";

export function createLogger(env: NodeJS.ProcessEnv = process.env): pino.Logger {
  const isProduction = env.NODE_ENV === "production";
  return pino({
    name: "api",
    level: env.LOG_LEVEL ?? "info",
    redact: {
      paths: ["req.headers.authorization", "req.headers.cookie", 'res.headers["set-cookie"]'],
      remove: true,
    },
    ...(isProduction
      ? {}
      : {
          transport: {
            target: "pino-pretty",
            options: { colorize: true, singleLine: true },
          },
        }),
  });
}

export const logger = createLogger();
