export const API_SERVICES = [
    {
        method: 'GET',
        path: '/health',
        description: 'Comprobación de disponibilidad del servicio',
    },
    {
        method: 'GET',
        path: '/api',
        description: 'Listado de endpoints y servicios disponibles',
    },
    {
        method: 'GET',
        path: '/api/properties',
        description: 'Listado paginado de propiedades con filtros',
        query: ['city', 'minPrice', 'maxPrice', 'minBeds', 'minBaths', 'propertyType', 'listingStatus', 'priceSort', 'page', 'limit'],
    },
    {
        method: 'GET',
        path: '/api/properties/:listingId',
        description: 'Detalle de una propiedad por ID de listado',
    },
    {
        method: 'POST',
        path: '/api/contact',
        description: 'Envío del formulario de contacto (JSON: name, email, message; opcional listingId)',
    },
];
