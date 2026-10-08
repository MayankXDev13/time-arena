import "dotenv/config";
import { loadEnv } from "./env.js";
import { createApp } from "./app.js";
import { logger } from "./logger.js";

loadEnv();

const port = Number(process.env.PORT ?? 3000);
const app = createApp();

app.listen(port, () => {
  logger.info(`@repo/api listening on http://localhost:${port}`);
});
