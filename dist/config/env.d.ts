import 'dotenv/config';
/**
 * Server-side secrets: load only from process.env (never from client bundles).
 * Rotate credentials by updating the deployment secret store / .env — no code change.
 */
export declare const env: {
    readonly nodeEnv: string;
    readonly port: number;
    readonly bridgeApiBase: string;
    readonly bridgeDataset: string;
    /**
     * Server token for Bridge API (never log this value).
     * Opcional al arranque: si falta, `/health` sigue OK; rutas que llaman a Bridge devuelven 503 vía `bridge.service`.
     */
    readonly bridgeServerToken: string;
    /** Comma-separated origins, or * for development only. */
    readonly corsOrigin: string;
    /** Orígenes permitidos para `/api` cuando accessControlEnabled (p. ej. https://conextamiami.com). */
    readonly allowedOrigins: string[];
    /** Activo en producción/Lambda si allowedOrigins no está vacío. */
    readonly accessControlEnabled: boolean;
    /**
     * Clave compartida opcional (misma en Lambda y VITE_PUBLIC_API_KEY). Mitiga abuso casual;
     * no es secreto frente a quien inspecciona el bundle del frontend.
     */
    readonly publicClientKey: string;
};
