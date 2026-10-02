# Pupit & Co · páginas Apple

Dirección aplicada el 2 de octubre de 2026 al borrador **Pupit v2 · Apple · Fotos**, `206268891479`. Se mantiene el branding de Pupit: crema, negro, azul cielo, rosa y punto naranja. Tipografía del sistema, grandes titulares, fotografía dominante, espacios abiertos, líneas finas y controles nativos. Sin precios, reseñas, plazos ni prestaciones inventadas.

## Conceptos e implementación

Se generaron e inspeccionaron seis conceptos de página antes de implementar las secciones nuevas. Los PNG son referencias de composición de la conversación; la web usa texto, controles y fondos programados. Se generaron por separado los dos nuevos assets de fotografía y se convirtieron a WebP; no se extrajeron trozos de los conceptos.

| Página o bloque | Concepto seleccionado | Implementación y captura nativa |
| --- | --- | --- |
| Dispensador | `exec-79500cb5-633b-4b2d-933c-73f4a2e87243.png`, 1505 × 1045 | Dúo izquierda; copy, CTAs y métricas derecha. `pupit-v2-native-desktop.jpg` |
| Productos | `exec-59783d9e-0f10-4e93-8323-76f30abfcce0.png`, 1183 × 1329 | Dos paneles pastel y elección de color. `pupit-productos-desktop.jpg` |
| Nosotros | `pupit-nosotros-concept.png`, 1073 × 1466 | Titular centrado, lago, relato y tres valores. `pupit-nosotros-desktop.jpg` |
| Paseos | `exec-72fa27ca-da75-452d-b9a8-6f929b86c342.png`, 1073 × 1466 | Foto editorial, preparación en tres pasos y puente de producto. `pupit-paseos-desktop.jpg` |
| Contacto | `exec-03ffa20c-ded7-4820-96a9-91220db19b9b.png`, 1374 × 1145 | Copy izquierda, formulario nativo derecha y FAQ. `pupit-contact-desktop.jpg` |
| Ficha técnica / FAQ | `exec-d61048de-d504-4ad4-9de9-bf8391fac15c.png`, 1321 × 1191 | Tabla abierta, producto azul, FAQ con líneas y lista existente. `pupit-details-desktop.jpg` |

## Comparación inspeccionada

Chrome/Browser CUA en Shopify real: ventana 1363 × 936, captura 1348 × 926. El navegador no permite igualar el viewport a los conceptos. Se inspeccionaron las capturas con `view_image`; en la pasada final se reabrieron el concepto de Dispensador y la captura final. Los archivos de evidencia tienen esos nombres en el workspace de la revisión. La dirección visual queda implementada con las diferencias explícitas siguientes; no se afirma igualdad de píxel ni una prueba en un dispositivo móvil físico.

| Punto de comparación | Resultado inspeccionado | Ajuste o desviación intencionada |
| --- | --- | --- |
| Composición | Dúo a la izquierda y hero a la derecha; encabezados editoriales centrados en las demás páginas | Dispensador se apila a 390 px con copy primero y foto después. |
| Jerarquía tipográfica | Titulares negros grandes, saltos de línea y cuerpo ligero | Fuente nativa y peso 700; la rasterización del concepto es más pesada. Tamaños adaptados al ancho disponible. |
| Paleta y fondos | Crema, azul/rosa pastel, negro y punto naranja | Se corrigió el borde rectangular del halo del hero usando gradientes `closest-side`, con desvanecido completo. |
| Producto y encuadre | Dispensadores completos, correas, bases y detalles legibles en hero y catálogo | Nuevo dúo transparente; halos CSS independientes. Nueva foto de Paseos con perro y producto conservados a 390 px. |
| Métricas y datos | 400 ml, 150 ml, tres compartimentos; ficha con medidas e inclusiones | Datos contrastados con la fuente de producto. No se publican peso contradictorio ni certificaciones sin comprobar. |
| CTAs y controles | Píldora negra, enlace secundario y selección de color/función operativos | Flechas finas heredadas del sistema de Pupit. Formularios y radios siguen siendo nativos. |
| Navegación | Cinco páginas y Avísame en escritorio; las mismas rutas en el diálogo móvil | Cabecera y pie preservan páginas configurables. Ningún enlace social ficticio del concepto se publica. |
| Contacto | Hablemos, texto, enlaces y campos de Shopify en dos columnas | Se omite el collage decorativo y los iconos sociales que el concepto introdujo sin contenido real. FAQ usa líneas abiertas, no tarjetas. |
| Continuidad del dispensador | Funciones, colores, ficha, FAQ y lista de espera | El siguiente capítulo conserva la composición de funciones ya aceptada en la portada, con titular a la izquierda y texto de apoyo a la derecha; el concepto lo centraba. |
| Responsive | Ocho rutas revisadas a 390 px, un H1 y sin desbordamiento | Se probó el contenedor real con CSS temporal de QA; retirado y cotejado con Shopify al terminar. Cabecera de 768 px también revisada. |

## Diff de copy de los heros

| Página | H1 y descripción implementados |
| --- | --- |
| Dispensador | **Un pequeño / gran paseo.** · Agua, comida y un espacio para los residuos. Nuestro dispensador 3 en 1, en azul cielo y rosa. |
| Productos | **Un dispensador. / Dos formas de llevarlo.** · El mismo 3 en 1. Elige el color que va contigo. |
| Nosotros | **La vida, en / buena compañía.** · Creemos en los paseos de todos los días. En salir con lo esencial y volver con algo más. |
| Paseos | **La mejor parte / es salir juntos.** · La vuelta de siempre. El camino por descubrir. Y todas las pausas entre medias. |
| Contacto | **Hablemos.** · Sobre Pupit, el dispensador o ese próximo paseo. Estamos al otro lado. |

H1 y descripción mantienen la redacción, jerarquía y orden de los conceptos. El hero de Dispensador conserva **Avísame del lanzamiento**, **Explora los detalles**, y las métricas **400 ml / Agua**, **150 ml / Comida**, **3 / Compartimentos**. No se añade un eyebrow, badge ni claim. Los saltos automáticos del navegador varían con el ancho. El inicio del capítulo siguiente conserva el texto de apoyo que ya usaba la portada; es una desviación intencionada del concepto aislado del hero.

## Verificación funcional y límites

Probados enlaces entre páginas, anclas de funciones y lista, color Rosa del producto, elección Azul cielo/Rosa desde el catálogo, FAQ con teclado, campos obligatorios de Contacto y menú con Escape. El consentimiento de marketing permanece obligatorio y sin marcar. Estados de éxito/error y escapado verificados con siete pruebas de Liquid; build de ocho rutas, Theme Check y validador de los 25 archivos actualizados pasan.

No se envió correo ni se creó un cliente. Recepción de mensajes, alta real, bajas, checkout, pagos, pedidos y dispositivos físicos requieren la prueba de lanzamiento. La plantilla comercial se mantiene preparada para el producto DRAFT y los controles de compra siguen condicionados a `sales_enabled`. Pendientes de negocio en `docs/prelaunch.md`.
