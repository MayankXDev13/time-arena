import "dotenv/config";
import { loadEnv } from "./env.js";
import { createApp } from "./app.js";

loadEnv();

const port = Number(process.env.PORT ?? 3000);
const app = createApp();

app.listen(port, () => {
  console.log(`@repo/api listening on http://localhost:${port}`);
});
