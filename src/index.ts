import { app, logApiCatalog } from './app.js';
import { env } from './config/env.js';

app.listen(env.port, () => {
  console.info(`BFF listening on port ${env.port}`);
  logApiCatalog();
});
