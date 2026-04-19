import { loadBridgeTokenFromSsm } from './config/ssm.js';
await loadBridgeTokenFromSsm();
const [{ default: serverless }, { app, logApiCatalog }] = await Promise.all([
    import('serverless-http'),
    import('./app.js'),
]);
const serverlessHandler = serverless(app);
let loggedCatalog = false;
export function handler(event, context) {
    if (!loggedCatalog) {
        logApiCatalog();
        loggedCatalog = true;
    }
    return serverlessHandler(event, context);
}
