import { loadBridgeTokenFromSsm } from './config/ssm.js';

await loadBridgeTokenFromSsm();

const [{ default: serverless }, { app, logApiCatalog }] = await Promise.all([
  import('serverless-http'),
  import('./app.js'),
]);

const serverlessHandler = serverless(app);

let loggedCatalog = false;

export function handler(
  event: Parameters<typeof serverlessHandler>[0],
  context: Parameters<typeof serverlessHandler>[1],
) {
  if (!loggedCatalog) {
    logApiCatalog();
    loggedCatalog = true;
  }
  return serverlessHandler(event, context);
}
