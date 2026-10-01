# Revisión Pupit v2 · Apple

Revisión del 1 de octubre de 2026. Tema Shopify `206265581911`, Dawn 16.0.0, UNPUBLISHED. El tema `206260863319` ya estaba MAIN al iniciar el rediseño y no se modificó. El producto `11186449023319` continúa DRAFT.

## Verificación automática

- Validador oficial de Liquid: archivos del rediseño sin errores.
- Shopify Theme Check: cero errores; siete advertencias heredadas de Dawn.
- Build y comprobaciones de seis rutas: éxito.
- Cinco pruebas de preventa: formulario nativo, consentimiento/preferencia, éxito/error, escapado, compra condicionada y políticas del pie.
- JavaScript propio: sintaxis correcta.
- Paquete: siete carpetas Shopify en la raíz, 391 archivos.

## Revisión del storefront

Chrome mediante Browser/CUA, Shopify real, ventana de 1363 × 936 px. Capturas con `getScreenshot`; concepto y capturas inspeccionados con `view_image` durante la misma revisión.

- Portada: un H1, copy exacto, producto dúo completo y CTAs legibles. Ancla Descúbrelo a funciones.
- Agua/Comida/Residuos: cambia cifra, título, fotografía y fondo. Flecha izquierda del teclado pasa de Residuos a Comida.
- Azul/Rosa: cambia el render y el texto; Rosa selecciona `pupit-prelaunch, preferencia-rosa` en el formulario. CTA del producto lleva a la lista.
- Correo inválido bloqueado por el navegador. Dirección de ejemplo válida sin consentimiento también bloqueada; no se creó un cliente.
- Menú estrecho: abre como diálogo nativo y cierra con Escape.
- Sin desbordamiento horizontal: documento 1348 px dentro de ventana 1363 px; contenedor estrecho 390/390 px.
- Sin errores propios de Pupit observados en consola. Los errores visibles procedían del complemento del navegador.
- La plantilla temporal de Paseos y el estilo de ancho fijo se restauraron. Paseos vuelve a su H1 propio y al ancho normal.

## Comparación visual

Concepto de portada: `generated_images/exec-e5992cfb-10ba-4447-99b5-03fc86d17f52.png`, 1536 × 1024. Captura Shopify: `pupit-apple-desktop-qa.jpg`, ventana 1363 × 936. No se pudo igualar la ventana al tamaño del concepto: este navegador no ofrece redimensionado. Se revisó el ancho disponible.

Concepto estrecho: `exec-6acc051a-78a6-4051-8bcc-c286d9c351fb.png`. La composición de 390 px se renderizó mediante el mismo contenedor responsive en una plantilla temporal del borrador. Esto prueba layout e interacciones a 390 px, no un dispositivo móvil físico.

| Punto | Evidencia de concepto y render | Ajuste o desviación intencionada |
| --- | --- | --- |
| Copy de portada | Todo su mundo. / En tu mano.; descripción, navegación y dos CTAs iguales | Sin copy añadido, eliminado, renombrado o reordenado; diff de portada correcto. |
| Tipografía | Sans negra, peso 700, dos líneas centradas | 88,97 px de H1 en ancho 1348; 43,68 px en 390. Fuente del sistema, sin fuente rasterizada. |
| Paleta y halos | Crema, azul/rosa laterales, negro y punto naranja | Fondo del contenedor fijado a crema para que la plantilla de QA no lo alterase. Halos CSS bajo producto transparente. |
| Encuadre del dúo | Ambos productos completos, correa y bases visibles | Se corrigió el tamaño circular del picture con posición absoluta y altura del escenario. |
| Funciones | Gran cifra, superficie azul/rosa, foto derecha y selector segmentado | Tres paneles nativos. En móvil se apilan; se conservaron las fotografías del proyecto en lugar de reproducir fotos generadas del concepto. |
| Colores | Capítulo negro, render aislado, nombre grande, muestras y CTA claro | Cambio azul/rosa real con transición. Render transparente, sin caja ni texto sobre la imagen. |
| Paseo | Titular centrado, foto ancha y esquinas redondeadas | Fotografía existente del golden retriever; el recorte responde al ancho. |
| Lista y pie | Dos columnas sobre crema, input redondeado, botón negro y punto naranja | Formulario Shopify real, preferencias y consentimiento. Se conserva la estructura de enlaces existentes y solo Privacidad está publicada. |
| Iconos | Chevrón fino, menú de dos líneas y cierre | Tamaño y trazo unificados; foco visible y estado seleccionado comprobados. |
| Composición estrecha | Titular en dos líneas, CTAs apilados, dúo completo y siguiente capítulo | Corregida altura del escenario y comprobado ancho 390 sin overflow. No se simula una captura de teléfono físico. |

Implementación verificada fielmente contra la dirección de los conceptos: jerarquía, composición, paleta, tratamiento del producto, controles y secuencia. No quedan recortes, solapamientos o controles inertes materiales en los anchos revisados. Las diferencias intencionadas son la fuente nativa, las fotografías conservadas, los enlaces legales disponibles y el tamaño de ventana de revisión.

## Límites concretos

No se verificó una alta completa ni recepción de correo; los estados de servidor se prueban con fixtures. No se verificaron checkout, pagos, pedidos ni rendimiento en dispositivos físicos. La reducción de movimiento está implementada en CSS/JS, sin cambiar preferencias del sistema del usuario. El producto permanece DRAFT y la venta desactivada.
