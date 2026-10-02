# Pupit & Co · funcionamiento pre-launch

## Ahora

- `sales_enabled=false` en `config/settings_data.json`; el producto Shopify sigue en **borrador**. Conservar el borrador hasta pasar los gates de muestra, coste, logística y políticas. El interruptor del tema controla la interfaz, no bloquea URLs directas al checkout: la publicación de productos y las protecciones de Shopify son la barrera efectiva.
- Home y landing del dispensador enseñan una sola necesidad y un solo producto. La portada y la landing presentan una llamada a la lista junto al producto y el formulario al final. No hay popups, reseñas inventadas, precios, envíos, urgencia o stock público.
- El borrador **Pupit v2 · Apple · Fotos**, `206268891479`, contiene el catálogo de colores, la landing completa, Nosotros, Paseos, Contacto, FAQ, carrito de lanzamiento y 404. Contacto usa `{% form 'contact' %}`: nombre, correo y mensaje obligatorios, asunto seleccionable y éxito solo cuando Shopify confirma el envío. Se ha comprobado la validación del navegador sin enviar mensajes ni crear altas.
- El formulario `{% form 'customer' %}` crea un cliente en Shopify con consentimiento para email marketing. El grupo de preferencia con opción predeterminada "Me da igual" guarda la etiqueta `pupit-prelaunch, preferencia-indiferente`; las otras opciones guardan `preferencia-azul-cielo` o `preferencia-rosa`. La persona marca explícitamente la casilla de consentimiento y ve la política de privacidad. Si Shopify no tiene política publicada, el formulario se oculta. Shopify procesa y devuelve confirmación o errores aun sin JavaScript. **No usar la preview de Vercel para registrar correos:** la preview bloquea los formularios y no tiene backend Shopify.
- En **Clientes → Segmentos**, incluir tanto la etiqueta `pupit-prelaunch` como la histórica `milo-prelaunch`, con consentimiento de marketing por correo. Las nuevas altas llevan `pupit-prelaunch`; no borrar ni volver a inscribir los clientes anteriores. Crear segmentos por preferencia para comparar demanda; no usar la cifra de clics como sustituto de altas confirmadas. Verificar con una inscripción propia en la tienda publicada (consentimiento, etiqueta, confirmación y baja) y borrar el registro de prueba si se desea.

## Medición

Pupit v2 conserva los eventos nativos de Dawn y no carga SDKs de Meta ni Google desde el tema. Los eventos propios de la versión anterior (`pupit:*`) ya no forman parte de la implementación. No se han configurado píxeles ni paneles en esta revisión.

Las altas y preferencias se comprueban en Clientes de Shopify, con las etiquetas de preventa y el consentimiento correspondiente. La atribución y cualquier integración de analítica requieren una configuración independiente en Customer Events con los consentimientos adecuados.

## Paso a LIVE

1. Aprobar muestra: fugas, cierres, limpieza, materiales/trazabilidad, contenido real y fotos propias. Confirmar con EPROLO SKU, costes landed, branding, MOQ, procesamiento, envío real a España y gestión de incidencias.
2. El producto en Shopify tiene dos variantes y **2.000 unidades cargadas hoy** (1.000 por color) aunque el stock de EPROLO no está validado. Reemplazarlas por disponibilidad real y decidir regla de inventario antes de publicar. El precio Shopify de 24,90 € es provisional; la hoja de dirección plantea 29,90 € como hipótesis de trabajo, no como PVP definitivo. Cerrar PVP solo con margen y respuesta de mercado.
3. Publicar políticas de **envío, devoluciones y condiciones** en Shopify; hoy solo está publicada la política de privacidad. Revisar esa política: conserva datos de contacto de la marca anterior. Completar identidad del vendedor y datos de producto con información real. Comprobar variantes, precio, impuestos, pagos, rutas, notificaciones y devoluciones en tienda protegida.
4. Publicar el producto y asignarle plantilla `product.dispensador`; seleccionar `featured_product` en el tema y confirmar enlaces. Probar compra real de prueba y checkout móvil. Solo entonces activar `sales_enabled=true` y retirar la protección de lanzamiento cuando todo esté aprobado.
5. Para testimonios futuros, usar únicamente fotografías, textos y atribuciones reales con autorización; esta versión no incluye reseñas de ejemplo.
6. Publicar el tema revisado desde Shopify → Tienda online → Temas → **Pupit v2 · Apple · Fotos** → Publicar. El conector permite editar el borrador, pero bloquea la publicación y las escrituras al tema MAIN.

## Próximo salto de calidad

Prioridad visual: una muestra física y una sesión propia con ambos colores, detalles, escala en mano y un vídeo corto de uso. Las imágenes generadas actuales presentan la dirección visual; la muestra debe confirmar la forma y el funcionamiento antes de usarlas como evidencia comercial. Después, incorporar contenido real de paseos y opiniones verificadas cuando existan. Antes de abrir ventas, comprobar una alta de la lista, un mensaje de contacto, sus correos de recepción y una compra completa; configurar medición de altas y pedidos.

La preview local permite revisar estructura, responsive y accesibilidad. Una revisión final en el storefront Shopify es necesaria: los formularios nativos, Customer Events, variantes reales y checkout no son simulables fielmente en Vercel.
