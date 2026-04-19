import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
/**
 * En Lambda, el token de Bridge se guarda en SSM (SecureString) y se lee en frío.
 * En local, usa `BRIDGE_SERVER_TOKEN` en `.env` y no definas `BRIDGE_SERVER_TOKEN_SSM_PARAM`.
 * Si SSM falla, no abortamos el arranque: `/health` responde y las rutas Bridge devuelven 503.
 */
export async function loadBridgeTokenFromSsm() {
    const paramName = process.env.BRIDGE_SERVER_TOKEN_SSM_PARAM?.trim();
    if (!paramName)
        return;
    if (process.env.BRIDGE_SERVER_TOKEN?.trim())
        return;
    const region = process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION;
    const client = new SSMClient(region ? { region } : {});
    try {
        const out = await client.send(new GetParameterCommand({ Name: paramName, WithDecryption: true }));
        const value = out.Parameter?.Value?.trim();
        if (value) {
            process.env.BRIDGE_SERVER_TOKEN = value;
        }
        else {
            console.error(`SSM parameter empty: ${paramName}`);
        }
    }
    catch (err) {
        console.error(`Could not load BRIDGE_SERVER_TOKEN from SSM (${paramName}). ` +
            'Create it with ./scripts/put-bridge-token-ssm.sh or set BRIDGE_SERVER_TOKEN.', err);
    }
}
