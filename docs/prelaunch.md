# Milo & Co · funcionamiento pre-launch

## Ahora

- `sales_enabled=false` en `config/settings_data.json`; el producto Shopify sigue en **borrador**. Conservar el borrador hasta pasar los gates de muestra, coste, logística y políticas. El interruptor del tema controla la interfaz, no bloquea URLs directas al checkout: la publicación de productos y las protecciones de Shopify son la barrera efectiva.
- Home y landing del dispensador enseñan una sola necesidad y un solo producto. La página de producto y la landing ofrecen el formulario cerca de la cabecera y al final. No hay popups, reseñas inventadas, precios, envíos, urgencia o stock público.
- El formulario `{% form 'customer' %}` crea un cliente en Shopify con consentimiento para email marketing. El radio obligatorio con opción predeterminada "Me da igual" guarda la etiqueta `milo-prelaunch, preferencia-indiferente`; las otras opciones guardan `preferencia-azul-cielo` o `preferencia-rosa`. La persona marca explícitamente la casilla de consentimiento y ve la política de privacidad. Si Shopify no tiene política publicada, el formulario se oculta. Shopify procesa y devuelve confirmación o errores aun sin JavaScript. **No usar la preview de Vercel para registrar correos:** la preview bloquea los formularios y no tiene backend Shopify.
- En **Clientes → Segmentos**, filtrar por etiqueta `milo-prelaunch` y consentimiento de marketing por correo. Crear segmentos por preferencia para comparar demanda; no usar la cifra de clics como sustituto de altas confirmadas. Verificar con una inscripción propia en la tienda publicada (consentimiento, etiqueta, confirmación y baja) y borrar el registro de prueba si se desea.

## Eventos preparados

El tema usa `Shopify.analytics.publish` para eventos propios sin identificadores ni emails. Un pixel de Shopify con consentimientos correctos puede suscribirse a ellos. Antes de configurar el pixel, **estos clics no se guardan en un panel**.

| Evento | Disparador | Campos |
| --- | --- | --- |
| `milo:product_landing_view` | Carga de la ficha/landing del dispensador | `path` |
| `milo:product_click` | CTA de home, índice y guía hacia producto | `placement`, `guide` si procede, `path` |
| `milo:cta_click` | CTA del hero y CTA móvil | `placement`, `path` |
| `milo:faq_open` | Apertura de una respuesta FAQ | `question`, `path` |
| `milo:waitlist_success` | Confirmación devuelta por Shopify tras alta | `placement` |

Shopify Analytics aporta sesiones, páginas y origen de tráfico cuando esté configurado; la atribución de artículos y eventos propios requiere conexión de Customer Events/pixel y comprobación de consentimiento. Los leads y preferencias viven en Clientes de Shopify, no en el navegador. El evento de éxito se emite en la página confirmada, por lo que una recarga puede repetirlo; para la cifra fiable de altas usar los registros de Shopify filtrados por etiqueta.

### Configurar medición

1. Comprobar en **Configuración → Privacidad del cliente** los mercados y la gestión de consentimiento/cookies. La tienda ya tiene política de privacidad; revisar que describe la lista de espera y el tratamiento real.
2. Configurar Google & YouTube/GA4 mediante la integración oficial de Shopify y comprobar en tiempo real `page_view`, `view_item` en un producto publicado y fuente/medio. Un producto en borrador no dará `view_item`; la landing editorial usa `milo:product_landing_view`.
3. Si interesa medir microinteracciones en GA4, añadir un **pixel personalizado de Shopify** que traduzca estos `milo:*` a eventos GA4, usando la opción de consentimiento requerida. Evitar un segundo GA4 duplicado desde el tema.
4. Configurar Meta solo al pasar el gate de publicidad, mediante la app Meta/Shopify y verificación de dominio, píxel y consentimiento. No hay ID ficticio ni SDK de Meta/Google cargado por este tema.
5. Usar UTM en enlaces de contenido y creadores cuando proceda; Shopify/GA4 mostrarán canal y fuente. Comprobar los eventos en el depurador del pixel y en el navegador tras aceptar/rechazar consentimiento.

## Paso a LIVE

1. Aprobar muestra: fugas, cierres, limpieza, materiales/trazabilidad, contenido real y fotos propias. Confirmar con EPROLO SKU, costes landed, branding, MOQ, procesamiento, envío real a España y gestión de incidencias.
2. El producto en Shopify tiene dos variantes y **2.000 unidades cargadas hoy** (1.000 por color) aunque el stock de EPROLO no está validado. Reemplazarlas por disponibilidad real y decidir regla de inventario antes de publicar. El precio Shopify de 24,90 € es provisional; la hoja de dirección plantea 29,90 € como hipótesis de trabajo, no como PVP definitivo. Cerrar PVP solo con margen y respuesta de mercado.
3. Publicar políticas de **envío y devoluciones** en Shopify; hoy solo está publicada la política de privacidad. Completar identidad del vendedor y datos exigibles de producto. Comprobar variantes, precio, impuestos, pagos, rutas, notificaciones y devoluciones en tienda protegida.
4. Publicar el producto y asignarle plantilla `product.dispensador`; seleccionar `featured_product` en el tema y confirmar enlaces. Probar compra real de prueba y checkout móvil. Solo entonces activar `sales_enabled=true` y retirar la protección de lanzamiento cuando todo esté aprobado.
5. Para testimonios futuros: añadir bloques reales a la sección **Experiencias reales** (oculta y desactivada por defecto), con foto/texto/atribución autorizados, y activarla después de verificar su procedencia.

La preview local permite revisar estructura, responsive y accesibilidad. Una revisión final en el storefront Shopify es necesaria: los formularios nativos, Customer Events, variantes reales y checkout no son simulables fielmente en Vercel.
