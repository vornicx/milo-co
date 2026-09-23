# Archic Gate — Milo & Co

Última revisión: 23 septiembre 2026.

## Hard gate activo

Milo & Co se trata como un producto de producción, aunque Shopify todavía no esté conectado. Ningún cambio importante se considera listo solo porque compile o se vea bien.

### Diseño
- Un único sistema visual cargado: `assets/milo-system.css`.
- Home, índice de productos, landing del dispensador, páginas editoriales, carrito, contacto y producto nativo comparten tokens y componentes.
- Mobile tiene composición propia, no un simple apilado de desktop.
- Sin copy de relleno, reseñas, descuentos, precio, certificaciones o disponibilidad inventados.

### Accesibilidad
- Un H1 por página de preview.
- Skip link funcional.
- Tratamiento global `:focus-visible`.
- `prefers-reduced-motion`.
- Todas las imágenes renderizadas en la preview deben incluir atributo `alt`.
- Controles de galería con nombre accesible y estado `aria-pressed`.

### Rendimiento
- Las fotografías principales del producto son assets AVIF cacheables; no data URI dentro del HTML.
- Gate automático: ninguna página estática puede superar 254 KiB de HTML.
- CSS principal: presupuesto máximo 90 KiB.
- Fotografías de producto incluidas en el gate: máximo 600 KiB por asset.

### Seguridad / plataforma
- Vercel es solo preview y no procesa pagos ni datos de Shopify.
- CSP de preview: scripts, estilos, imágenes y conexiones limitados a origen propio; formularios bloqueados.
- HSTS, frame blocking, nosniff, permissions policy, COOP y noindex activos en preview.
- La CSP de Vercel NO debe copiarse sin revisión a Shopify, porque puede interferir con scripts y checkout de plataforma.
- `sales_enabled` es solo presentación. El control real de lanzamiento debe ser contraseña/canales de venta de Shopify.
- El producto conectado está en borrador. La lista de espera depende del storefront Shopify y de su política de privacidad publicada; no funciona en la preview estática de Vercel.
- El único instrumento de medición de microinteracciones integrado es `Shopify.analytics.publish`; requiere conectar un pixel compatible y verificar consentimiento antes de dar por medidos los clics. Ver `docs/prelaunch.md`.

### Datos y ecommerce
Pendiente hasta conectar Shopify:
- variantes e inventario reales;
- precio final;
- IVA/mercados;
- envío España/UE;
- persistencia de carrito;
- estados de agotado;
- concurrencia de stock;
- checkout y pasarela de prueba;
- pedido, cancelación y reembolso de prueba.

No publicar la tienda hasta completar estos checks en Shopify.

## Gate automático del repositorio

`npm run build` genera la preview y ejecuta `scripts/validate-preview.mjs`.

Valida:
1. render sin Liquid residual;
2. exactamente un H1 por página;
3. idioma y viewport;
4. contrato del skip link;
5. IDs duplicados;
6. imágenes con `alt`;
7. ausencia de data URI;
8. presupuesto de HTML;
9. presencia de focus-visible y reduced-motion;
10. presupuesto de CSS;
11. existencia y tamaño de los assets principales.

Para la revisión completa con Shopify CLI:

```sh
npm ci
npm run check
npm run build
```

## No declarado como verificado

- Checkout real.
- Autenticación/pagos de Shopify.
- Core Web Vitals de una tienda Shopify publicada.
- Navegadores/dispositivos físicos fuera de las capturas revisadas.
- Ausencia absoluta de vulnerabilidades.
