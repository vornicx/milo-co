# Milo & Co

Tema nativo Shopify Online Store 2.0, en español, para una tienda centrada en el dispensador de paseo 3 en 1. Código y marca propios; Shopify gestiona catálogo, inventario, carrito, checkout y pedidos.

## Estado

Primera versión implementada. No conectada a una tienda Shopify ni publicada. No se ha ejecutado una compra de prueba. La venta está desactivada por defecto y la portada muestra «Próximamente» hasta que se configure.

- Portada editorial, identidad crema / bosque / naranja y fotografía de ambiente generada.
- Explicación de capacidades, producto destacado configurable, página de producto con galería y variantes.
- Formularios nativos de añadir al carrito; precio y disponibilidad actualizados al elegir variante.
- Carrito con cantidades, eliminación, actualización y acceso al checkout.
- Preguntas frecuentes, páginas informativas, contacto nativo, 404 y contraseña.
- CSS adaptable, navegación de teclado, foco visible y reduced-motion.
- No reseñas, descuentos, precios ni certificaciones inventadas.

Las fotografías del dispensador están pendientes de carga. Los enlaces del proveedor no pudieron descargarse en el entorno de desarrollo. La foto del perro es editorial generada, no una representación del producto. La galería usa las imágenes reales que se carguen en el producto Shopify. No se ha confirmado la personalización física del producto o embalaje.

## Conectar a Shopify

1. En **Tienda online → Temas → Añadir tema → Conectar desde GitHub**, seleccionar `vornicx/milo-co`, rama `main`. Instalar/autorizar la integración oficial si Shopify lo pide.
2. Mantener el tema sin publicar y la tienda protegida con contraseña durante la preparación.
3. Crear el producto en Shopify con título, descripción, fotos reales, precio, inventario, peso confirmado y variantes azul cielo, verde, rosa y azul marino. No hay importación automática a Teemdrop implementada.
4. En el editor de la portada, sección **Featured Product**, elegir ese producto. Editar la portada desde **Hero**.
5. Crear una página de contacto con la plantilla `page.contact` y seleccionarla en el pie. Configurar las políticas reales en Shopify; el tema solo muestra las que tengan contenido.
6. Configurar pagos, mercados, impuestos y envíos; verificar coste final y plazo total, incluyendo preparación. Realizar una compra de prueba en Shopify y comprobar variantes, stock, carrito y devolución/cancelación del pedido de prueba.
7. Activar **Configuración del tema → Venta → Activar venta en el tema** cuando los datos sean definitivos. Publicar solo tras comprobar la tienda real.

La opción del tema no es un control de acceso: para evitar compras antes del lanzamiento, usar contraseña de tienda y mantener el producto fuera de los canales de venta correspondientes.

Documentación oficial: https://shopify.dev/docs/storefronts/themes/tools/github

## Desarrollo

```sh
npm ci
npm run check
npm run dev -- --store tu-tienda.myshopify.com
```

La autenticación se realiza mediante Shopify CLI; no se necesitan claves privadas en el tema. No subir contraseñas, tokens ni archivos `.env` al repositorio.

```sh
node scripts/preview.mjs
npm run package
```

`preview.mjs` renderiza la portada, carrito vacío y 404 desde las secciones Liquid con datos locales de desarrollo. No emula Shopify ni valida sus formularios. El ZIP de `package` solo incluye directorios de tema, listo para carga manual.

## Validación y pendientes

Ver `docs/qa.md`. La inspección visual en navegador quedó bloqueada por la política de acceso del navegador al preview local. No se afirma fidelidad visual comprobada ni checkout validado. Ejecutar estas comprobaciones con Shopify antes de publicar.

Identidad: `docs/brand.md`. Fuente y discrepancias del producto: `docs/product-source.md`.
