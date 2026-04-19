import 'dotenv/config';
function normalizeOriginList(raw) {
    if (!raw?.trim() || raw.trim() === '*')
        return [];
    return raw
        .split(',')
        .map((o) => o.trim().replace(/\/$/, ''))
        .filter(Boolean);
}
/**
 * Lista explícita en ALLOWED_ORIGINS; si no existe, usa CORS_ORIGIN cuando no sea `*`.
 */
function resolveAllowedOrigins() {
    const explicit = process.env.ALLOWED_ORIGINS?.trim();
    if (explicit)
        return normalizeOriginList(explicit);
    const cors = process.env.CORS_ORIGIN?.trim() ?? '';
    if (!cors || cors === '*')
        return [];
    return normalizeOriginList(cors);
}
const allowedOrigins = resolveAllowedOrigins();
const accessControlEnabled = allowedOrigins.length > 0 &&
    (process.env.NODE_ENV === 'production' || !!process.env.AWS_LAMBDA_FUNCTION_NAME);
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
    /** Orígenes permitidos para `/api` cuando accessControlEnabled (p. ej. https://conextamiami.com). */
    allowedOrigins,
    /** Activo en producción/Lambda si allowedOrigins no está vacío. */
    accessControlEnabled,
    /**
     * Clave compartida opcional (misma en Lambda y VITE_PUBLIC_API_KEY). Mitiga abuso casual;
     * no es secreto frente a quien inspecciona el bundle del frontend.
     */
    publicClientKey: process.env.PUBLIC_CLIENT_API_KEY?.trim() ?? '',
};
