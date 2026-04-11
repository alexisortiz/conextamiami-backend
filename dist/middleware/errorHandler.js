import { BridgeRequestError } from '../services/bridge.service.js';
export function errorHandler(err, _req, res, _next) {
    void _next;
    if (err instanceof BridgeRequestError) {
        res.status(502).json({
            error: 'Unable to load property data. Please try again later.',
        });
        return;
    }
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('Unhandled error:', message);
    res.status(500).json({ error: 'Something went wrong' });
}
