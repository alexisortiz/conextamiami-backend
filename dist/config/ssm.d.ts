/**
 * En Lambda, el token de Bridge se guarda en SSM (SecureString) y se lee en frío.
 * En local, usa `BRIDGE_SERVER_TOKEN` en `.env` y no definas `BRIDGE_SERVER_TOKEN_SSM_PARAM`.
 * Si SSM falla, no abortamos el arranque: `/health` responde y las rutas Bridge devuelven 503.
 */
export declare function loadBridgeTokenFromSsm(): Promise<void>;
