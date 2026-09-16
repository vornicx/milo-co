# Milo & Co

Tema nativo Shopify Online Store 2.0 para Milo & Co: una marca de objetos para paseos, escapadas y vida cotidiana con perros. El dispensador 3 en 1 es el **Objeto 01**, no la definición completa de la marca.

## Estado

Diseño en fase de aprobación. Shopify todavía no está conectado y la venta permanece desactivada por defecto.

La vista previa pública de Vercel sirve únicamente para revisar diseño y estructura. No procesa pagos, no emula inventario y está excluida de indexación.

### Sistema actual

- Un único sistema visual: `assets/milo-system.css`.
- Home de marca, índice de productos, landing editorial del dispensador, paseos y Nuestra idea.
- Diseño móvil tratado como composición propia.
- Fotografías principales del producto almacenadas como assets AVIF reales, no data URI.
- Producto destacado configurable para el futuro editor de Shopify.
- Formularios y carrito basados en primitivas nativas de Shopify.
- Venta oculta mientras `sales_enabled=false`.
- Sin reseñas, descuentos, certificaciones, stock, precio o disponibilidad inventados.

## Archic Production Gate

Milo & Co sigue el gate de producción Archic.

En cada push a `main` y en cada pull request, GitHub Actions ejecuta:

```sh
npm ci
npm run check
npm run build
npm audit --audit-level=high
```

`npm run build` genera la preview y ejecuta además `scripts/validate-preview.mjs`, que bloquea la build ante problemas estructurales, accesibilidad básica o presupuestos de rendimiento.

Ver `docs/qa.md` para el estado del gate y lo que sigue pendiente hasta disponer de una tienda Shopify real.

## Desarrollo

```sh
npm ci
npm run check
npm run build
npm run dev -- --store tu-tienda.myshopify.com
```

No subir contraseñas, tokens, claves privadas ni archivos `.env` al repositorio.

## Conectar a Shopify

Cuando el diseño esté aprobado:

1. Conectar `vornicx/milo-co` rama `main` desde **Tienda online → Temas → Conectar desde GitHub**.
2. Mantener la tienda protegida con contraseña durante configuración y pruebas.
3. Crear el producto real con variantes, precio, inventario, peso y fotografías definitivas.
4. Asignar las páginas `productos`, `dispensador`, `paseos` y `nosotros` a sus plantillas.
5. Configurar pagos, mercados, IVA, envíos y políticas.
6. Activar `sales_enabled` únicamente dentro de una tienda protegida para las pruebas.
7. Probar variante disponible, agotada, cantidad, carrito, checkout, pedido, cancelación y reembolso.
8. Publicar solo después de completar el gate de Shopify.

El interruptor `sales_enabled` **no es un mecanismo de seguridad**. El control de lanzamiento real debe hacerse con las herramientas nativas de Shopify.

## Estructura de marca

La dirección de Milo & Co está documentada en:

- `docs/brand.md`
- `docs/photography-system.md`
- `docs/qa.md`

Regla de producto: cada nueva ficha debe poder convivir con una colección de veinte productos sin requerir rediseñar la marca.
