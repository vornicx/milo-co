# Revisión Pupit v2

Revisión del 1 de octubre de 2026. Tema Shopify `206260863319`, Dawn 16.0.0, guardado como UNPUBLISHED.

## Verificación automática

- Validación Liquid de los 388 archivos del tema: éxito.
- Shopify Theme Check: sin errores; siete advertencias heredadas de Dawn.
- Build de la vista estática y comprobaciones de seis rutas: éxito.
- Cinco pruebas de preventa: formulario nativo, consentimiento/preferencia, éxito/error, escapado, compra condicionada y políticas del pie.
- JavaScript propio: comprobación de sintaxis.
- Auditoría de dependencias: cero vulnerabilidades notificadas.

## Revisión en Shopify

Navegador Chrome, ventana de 1363 × 936 px. Revisión de la portada real, anclas, selector y formulario; no se enviaron altas de clientes.

- Titular en dos líneas, fondo crema correcto y fotografía sin capa de color.
- CTA de portada lleva al dispensador.
- Rosa selecciona `pupit-prelaunch, preferencia-rosa` en la lista.
- Correo inválido bloqueado por validación del navegador.
- Consentimiento sin marcar bloquea el envío.
- La pestaña y las etiquetas de marca muestran Pupit & Co; se retiró el título heredado Milo de la portada del borrador.
- Sin desbordamiento horizontal en la ventana revisada.
- Dispensador, Nuestra idea y Contacto renderizados en Shopify con un H1. La FAQ de lanzamiento abre sin prometer una fecha; ambas fotos del dispensador cargan. El correo de contacto también exige una dirección antes del envío.
- Sin errores de consola de los assets Pupit; apareció un error ajeno del complemento del navegador.

## Comparación con los conceptos visuales

| Punto | Resultado |
| --- | --- |
| Estructura | Anuncio, cabecera, foto dominante, producto, beneficios, lista y pie en el orden previsto. |
| Tipografía | Sans negra, títulos con peso y dos líneas en la portada. |
| Colores | Crema, azul claro, rosa en el selector, negro y punto naranja. |
| Producto | Composición abierta de fotografía y texto, dos colores y CTA de espera. |
| Formulario | Banda azul, correo subrayado, botón negro, preferencia y consentimiento visible. |
| Fotografías | Assets reales existentes; el recorte difiere de los bocetos generados para conservar la fotografía original. |
| Legal | Solo Privacidad, porque términos y devoluciones aún no están publicados en la tienda. |

## Límites concretos

La CSS incluye composiciones a 749 y 1100 px y reducción de movimiento. No se pudo capturar una ventana móvil real en este navegador: no expone redimensionado y Shopify rechaza la página dentro de un iframe. La plantilla temporal de revisión fue restaurada. La revisión visual y del menú en móvil debe completarse en el editor de Shopify o en un teléfono.

No se verificó una alta completa ni la llegada del correo, para no crear registros de prueba. Los estados de servidor se probaron con fixtures. Tampoco se verificó checkout, pagos, pedidos ni rendimiento en dispositivos físicos. El producto permanece DRAFT y no se ha activado la venta.
