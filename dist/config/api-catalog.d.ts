/** Rutas expuestas por el BFF (documentación y GET /api). */
export type ApiServiceEntry = {
    method: string;
    path: string;
    description: string;
    query?: string[];
};
export declare const API_SERVICES: ApiServiceEntry[];
