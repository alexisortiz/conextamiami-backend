const MAX_BODY_LOG_CHARS = 4000;
function stringifyForLog(body) {
    if (body === undefined || body === null) {
        return String(body);
    }
    if (typeof body === 'string') {
        return body;
    }
    try {
        return JSON.stringify(body);
    }
    catch {
        return '[unserializable body]';
    }
}
/**
 * Registra cada petición y el cuerpo enviado (truncado si es muy largo).
 * Intercepta `res.send` para cubrir `res.json` y respuestas como las del rate limiter.
 */
export function requestLogger(req, res, next) {
    const started = Date.now();
    const originalSend = res.send.bind(res);
    res.send = function logSendBody(body) {
        const ms = Date.now() - started;
        let text;
        if (Buffer.isBuffer(body)) {
            text = `[cuerpo binario ${body.length} bytes]`;
        }
        else {
            const raw = stringifyForLog(body);
            text =
                raw.length > MAX_BODY_LOG_CHARS
                    ? `${raw.slice(0, MAX_BODY_LOG_CHARS)}… (truncado, ${raw.length} caracteres)`
                    : raw;
        }
        console.info(`[http] ${req.method} ${req.originalUrl} → ${res.statusCode} ${ms}ms | ${text}`);
        return originalSend(body);
    };
    next();
}
