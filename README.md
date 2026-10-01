# Pupit v2 · Dawn

Tema Shopify Online Store 2.0 de Pupit & Co, basado en **Dawn 16.0.0** (Shopify, licencia MIT). La base conserva las funciones nativas de Shopify; la identidad y las páginas de marca se construyen con secciones Liquid propias.

## Estado

Tema importado en la tienda Pupit & Co con el nombre **Pupit v2 · Dawn**, ID `206260863319`, como borrador sin publicar. La rama de revisión es `pupit-v2` en `vornicx/milo-co`. El tema publicado anterior y el producto en estado DRAFT se conservan.

Para revisar: Shopify → Tienda online → Temas → Pupit v2 · Dawn → Vista previa. El enlace de vista previa depende de la sesión o de un enlace temporal generado por Shopify.

## Diseño

Crema, azul cielo, rosa y negro, con el punto naranja de la marca. Tipografía Arial/Helvetica, fotografías grandes, titulares breves y bloques abiertos. La portada muestra el contexto del paseo, después el dispensador, sus tres funciones y una lista de espera.

Las secciones `pupit-*` permiten editar imágenes, textos y páginas desde el editor. Las fotografías tienen un asset de respaldo; al seleccionar una imagen del editor, Shopify genera sus tamaños adaptables.

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
