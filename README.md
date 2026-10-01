# Pupit v2 · Apple

Tema Shopify Online Store 2.0 de Pupit & Co, basado en **Dawn 16.0.0** (Shopify, licencia MIT). La base conserva las funciones nativas de Shopify; la identidad y las páginas de marca se construyen con secciones Liquid propias.

## Estado

Rediseño guardado en Shopify como **Pupit v2 · Apple**, ID `206265581911`, sin publicar. La rama de revisión es `pupit-v2` en `vornicx/milo-co`. Al empezar esta revisión, **Pupit v2 · Dawn** (`206260863319`) ya era el tema publicado; se conserva y el producto continúa DRAFT.

Para revisar: Shopify → Tienda online → Temas → Pupit v2 · Apple → Vista previa. La vista previa se comprobó en el storefront real. El enlace depende de la sesión o de un enlace temporal generado por Shopify.

## Diseño

Dirección inspirada en las páginas de producto de Apple: cabecera compacta, titulares muy grandes, producto aislado, espacios amplios, controles segmentados y transiciones discretas. Conserva la crema, azul cielo, rosa, negro y punto naranja de Pupit & Co.

La portada sigue: **Todo su mundo. En tu mano.** → explorador Agua/Comida/Residuos → producto azul/rosa sobre negro → paseo junto al lago → lista de espera y pie. Cambiar el color actualiza el render, el texto y la preferencia de la lista. Los controles de funciones son radios nativos y también funcionan con teclado.

Las secciones `pupit-*` permiten editar imágenes, textos y páginas desde el editor. Se añadieron tres renders WebP transparentes; las fotos de funciones y del paseo conservan los assets del proyecto. Al seleccionar una imagen del editor, Shopify genera sus tamaños adaptables. La composición responde al ancho de `.pupit-page` mediante container queries y respeta reducción de movimiento.

## Páginas existentes

| Ruta | Plantilla |
| --- | --- |
| `/` | index |
| `/pages/dispensador` | page.dispensador |
| `/pages/productos` | page.productos |
| `/pages/nosotros` | page.nosotros |
| `/pages/paseos` | page.paseos |
| `/pages/contact` | page.contact |

## Desarrollo y validación

```sh
npm ci
npm run check
npm run build
npm run test:security
npm audit --audit-level=high
npm run package
npm run dev -- --store bs11tg-1j.myshopify.com
```

`build` genera una vista estática desde las secciones Liquid reales y comprueba seis rutas principales. Es una ayuda visual sin backend: los formularios y la compra se prueban en Shopify. `package` crea un ZIP con las siete carpetas del tema en su raíz. Los detalles de revisión están en `docs/qa.md`.

## Preventa

`settings.sales_enabled=false` oculta precios, compra y checkout en la interfaz. El producto real continúa DRAFT. El interruptor del tema no sustituye la publicación del catálogo ni los controles de Shopify.

La lista usa `{% form 'customer' %}`, correo obligatorio, preferencia de color y consentimiento obligatorio sin marcar. Shopify devuelve los estados de éxito o error. Solo se muestra si existe política de privacidad publicada; el pie enlaza únicamente políticas publicadas.

No se incluyen promesas sin comprobar sobre entrega, materiales, certificaciones, peso o stock. Ver `docs/product-source.md` y `docs/prelaunch.md`.

## Base Dawn

Origen: `Shopify/dawn`, etiqueta `v16.0.0`, commit `bc39a7d2024f1e5c14c42f855bd3552b4913e204`. La licencia se conserva en `LICENSE.md`. Las modificaciones se concentran en las secciones Pupit, el sistema CSS/JS, los ajustes, las plantillas y los controles de preventa de Dawn.
