# Análisis de `conextamiami-backend`

A continuación se detalla el resultado del análisis del proyecto `conextamiami-backend`, identificando errores potenciales, problemas de rendimiento, vulnerabilidades de diseño y recomendaciones para optimizar el servicio.

## 🔴 Hallazgos Críticos y Errores

1. **Problema N+1 en la consulta de listado (`fetchPropertiesByCity`)**
   - **Archivo:** `src/services/bridge.service.ts`
   - **Descripción:** Actualmente, al obtener un listado de propiedades, se realiza 1 llamada para traer la lista y luego un `Promise.all` con un `map` que ejecuta **N llamadas adicionales** (una por cada propiedad) para obtener los detalles de `Media` de las imágenes.
   - **Impacto:** Degrada drásticamente el rendimiento del API, incrementa la latencia (espera a que terminen N peticiones paralelas) y puede provocar *Rate Limiting* o bloqueos por parte del proveedor externo (Bridge API).

2. **Inconsistencia de límites de paginación**
   - **Archivos:** `src/modules/properties/properties.controller.ts` y `src/services/bridge.service.ts`
   - **Descripción:** El controlador solicita un límite de 50 propiedades (`fetchPropertiesByCity(city, 50)`), pero dentro del servicio se fuerza un número que nunca excede 20: `Math.min(Math.max(top, 1), 20)`.
   - **Impacto:** El frontend o cliente jamás recibirá más de 20 resultados aunque pida más, generando confusión u ocultando listados de forma arbitraria.

3. **Pérdida de Stack Trace en el manejo de Errores**
   - **Archivo:** `src/middleware/errorHandler.ts`
   - **Descripción:** El middleware extrae solo el mensaje del error (`err.message`) en caso de errores no manejados, y hace un `console.error('Unhandled error:', message)`.
   - **Impacto:** Esto oculta el *stack trace*, lo cual hace que sea casi imposible rastrear en qué lugar específico del código ocurrió la falla original durante un entorno de producción.

4. **Variables de Entorno Cargadas Tarde**
   - **Archivos:** `src/index.ts` y `src/config/env.ts`
   - **Descripción:** `env.ts` carga `dotenv/config` para leer el archivo `.env`. Sin embargo, `env.ts` se importa en la línea 5 de `index.ts`, *después* de que librerías como `express` o `express-rate-limit` ya han sido importadas.
   - **Impacto:** Si alguna librería dependiera de variables de entorno al inicializarse a nivel de módulo, no las encontrará disponibles. Las variables de entorno deberían cargarse antes que cualquier otra dependencia.

## 🟡 Puntos de Mejora y Riesgos Medios

1. **Validación de Datos en Formularios de Contacto**
   - **Archivo:** `src/modules/contact/contact.controller.ts`
   - **Descripción:** La validación se hace a mano comprobando el tipo (`typeof email !== 'string'`) y la longitud. No se valida el formato real del correo electrónico ni existe saneamiento contra inyecciones comunes en bases de datos o envío masivo.
   - **Impacto:** Correos inválidos o basura pueden pasar y llegar al proveedor de correo, consumiendo cuotas o impactando métricas de rebote.

2. **Configuración de CORS Abusiva en Desarrollo**
   - **Archivo:** `src/index.ts`
   - **Descripción:** Usar `cors({ origin: true })` cuando la variable es `*` hace que se refleje el origen del usuario solicitante, lo cual admite peticiones con credenciales desde literalmente cualquier sitio web.

3. **Invisibilidad de fallos en llamadas Externas**
   - **Archivo:** `src/services/bridge.service.ts`
   - **Descripción:** La función `fetchJson` tira un error genérico 503 ("Upstream data source error") cuando el origen (Bridge API) responde con errores (estado no OK), sin registrar en los logs ni el *cuerpo* ni el motivo original del posible fallo 4xx. Esto dificulta diagnosticar por qué falló la llamada a Bridge.

4. **Ausencia de directivas de seguridad web básicas**
   - **Archivo:** `src/index.ts`
   - **Descripción:** La aplicación en Express no utiliza encabezados de seguridad modernos, que previenen clickjacking y XSS.

---

## ⚡ Recomendaciones para Optimizar el Servicio

1. **Optimizar llamadas REST (Eliminar N+1 via OData)**
   - **Acción:** En lugar de hacer llamadas de detalle por cada elemento de la lista en `fetchPropertiesByCity`, puedes refactorizar la petición OData para que Bridge devuelva la información de "Media" en un solo viaje agregando el parámetro `$expand=Media` en la query directa.
   - **Avance esperado:** Las peticiones al Bridge API pasarán de ser `1 + 20` a sólo **1** petición.

2. **Implementar una Librería de Validación (Zod / Joi)**
   - **Acción:** Integrar `Zod` para validar el endpoint de contacto (`/api/contact`) y para pre-validar las variables de entorno al inicializar en el server (asegurando el formato correcto durante el arranque). 
   - **Avance esperado:** Código más limpio en controladores y errores robustos a nivel sistema desde el levantamiento del contenedor.

3. **Mejorar los Logs y Manejo de Errores**
   - **Acción:** Modificar el `errorHandler.ts` para que pase el objeto `err` completo a `console.error` (conservando así el Stack Trace completo), o aún mejor, implementar un logger como `pino` o `winston` que provea niveles y serialización de errores.
   - **Acción Adicional:** Registrar en logs `res.statusText` en fallos dentro de la función `fetchJson` para trazabilidad de la respuesta que arroja Bridge OData.

4. **Integrar Helmet a la aplicación**
   - **Acción:** Hacer un `npm install helmet` e importarlo para preconfigurar los headers de respuesta e incrementar la seguridad antes de llevar la plataforma a producción.

5. **Resolución de Límites y Orden en el listado**
   - **Acción:** Sincronizar los parámetros. Si el frontal necesita paginación, modificar `fetchPropertiesByCity(city, top, skip)` para proveer un `$top` y `$skip` parametrizado por request real para habilitar paginación completa en lugar de limitar hardcoded los resultados a 20 de manera inflexible.

6. **Refinar Carga de Environment**
   - **Acción:** Utilizar el flag nativo de Node.js `>=20` para variables de entorno usando `node --env-file=.env dist/index.js` en lugar de hacerlo manual a ras de código, o garantizar que `import 'dotenv/config'` sea la primera línea absoluta del entry point.
