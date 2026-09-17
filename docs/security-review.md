# Revisión de seguridad — 17 septiembre 2026

## Correcciones en el tema

- Escapado del título en el índice de productos para que una importación no pueda introducir etiquetas HTML o scripts a través del título.
- Política de referrer explícita: los enlaces a otros orígenes no reciben la ruta ni la consulta de la página actual.
- El enlace de contacto reconoce tanto `contact` como `contacto`, manteniendo prioridad para la página configurada. La tienda ya tiene configurado `contact`.
- Pruebas de regresión para títulos maliciosos, valores del formulario y resolución del contacto, incorporadas al workflow de calidad.
- Retirada de la cotización de proveedor de la versión actual de la documentación pública. Sigue en el historial: este cambio no borra copias anteriores.

## Pendiente en Shopify: datos personales publicados

La política de privacidad contiene un correo personal y una dirección postal completa. No se reproducen aquí. Las cinco páginas de contenido de Shopify tienen el cuerpo vacío. El tema publicado coincide con el repositorio salvo los ajustes guardados en el editor.

La conexión puede leer políticas, pero la mutación `shopPolicyUpdate` devuelve `Access denied` por falta de `write_legal_policies`. No se ha guardado ninguna modificación de la política. El administrador web también bloqueó el acceso con una verificación de conexión.

Mitigación temporal preparada: sustituir únicamente el último párrafo de Contacto por:

> Para consultas sobre esta política de privacidad o para ejercer sus derechos de protección de datos, puede escribirnos a través de nuestro formulario de contacto.

Enlazar «formulario de contacto» a `https://miloandcompany.es/pages/contact`.

Esta mitigación no completa los datos legales del comercio. Se necesitan identidad y datos de contacto comerciales válidos. El artículo 10 de la LSSI exige determinada información pública del prestador: https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758#a10 . No sustituirlos por datos inventados. El correo de contacto de Shopify también sigue siendo personal: debe cambiarse a un buzón comercial existente y operativo, sin confundirlo con las credenciales de acceso.

No ocultar la política con CSS o JavaScript ni quitar solo su enlace: seguiría accesible por URL y en las políticas del checkout.

## Pendiente: terceros y repositorio

- El HTML público carga un píxel de PagePilot configurado con `privacyPurposes: []`, `share_all_events` y estado `unrestricted`, con destino de analítica `stats.pagepilot.ai`. Es un riesgo a revisar en Eventos de clientes y permisos de la aplicación; no demuestra por sí solo una filtración de datos de clientes. No se ha desconectado ni desinstalado la aplicación.
- El repositorio es público. Sus referencias de proveedor e historial son accesibles. Valorar hacerlo privado comprobando las integraciones de Shopify y Vercel. La cotización retirada sigue recuperable en commits anteriores.

## Validación y límites

- `npm audit --audit-level=high`: cero vulnerabilidades conocidas en las dependencias instaladas.
- `npm run test:security`: tres pruebas superadas. El formulario se renderiza con un adaptador local; no se enviaron mensajes reales.
- `npm run build`: compilación y validación de estructura correctas.
- `npm run check`: cero errores; dos advertencias anteriores de variables no utilizadas en `dispenser-how.liquid`.
- Revisión de 299 blobs de texto históricos con patrones de claves privadas, tokens privados de Shopify/GitHub/Stripe, claves AWS y correos personales: sin coincidencias. Es una búsqueda acotada, no una garantía de ausencia de secretos.
- Portada, cinco páginas y carrito consultados públicamente: sin el correo personal ni la dirección identificados en su contenido principal y pie. La política sigue expuesta y requiere el cambio indicado.
- No se probaron pagos, cuentas de terceros, pedidos ni acceso a datos de otros clientes. No se certifica la seguridad de aplicaciones instaladas ni de la infraestructura de Shopify.
