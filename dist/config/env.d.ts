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
    /** Server token for Bridge API (never log this value). */
    readonly bridgeServerToken: string;
    /** Comma-separated origins, or * for development only. */
    readonly corsOrigin: string;
};
