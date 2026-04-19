import 'dotenv/config';

/**
 * Server-side secrets: load only from process.env (never from client bundles).
 * Rotate credentials by updating the deployment secret store / .env — no code change.
 */
export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT) || 3001,
  bridgeApiBase: process.env.BRIDGE_API_BASE ?? 'https://api.bridgedataoutput.com/api/v2/OData',
  bridgeDataset: process.env.BRIDGE_DATASET ?? 'miamire',
  /**
   * Server token for Bridge API (never log this value).
   * Opcional al arranque: si falta, `/health` sigue OK; rutas que llaman a Bridge devuelven 503 vía `bridge.service`.
   */
  bridgeServerToken: process.env.BRIDGE_SERVER_TOKEN?.trim() ?? '',
  /** Comma-separated origins, or * for development only. */
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
} as const;
