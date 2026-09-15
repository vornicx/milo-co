# Verificación — 15 septiembre 2026

## Realizado
- Shopify Theme Check sobre las plantillas, secciones y snippets.
- Render local Liquid de portada, carrito vacío y 404.
- JavaScript de selección de variante: actualización de precio y bloqueo de variante agotada; revisión estática y sintaxis.
- Precio, stock e IDs proceden de Shopify, no del cliente.
- Formularios POST nativos; no tokens privados, servicios de pago propios, base de datos, sesiones propias ni procesamiento de tarjetas.
- Políticas de tienda solo se enlazan cuando existen. No se inventan identidad fiscal, plazos ni reseñas.

## Bloqueos
- El navegador rechazó el acceso al preview local por política de URL. No se intentó sortear la restricción. Sin capturas de implementación ni inspección desktop/móvil en navegador.
- Sin tienda Shopify conectada: pendiente verificar ejecución real de Liquid, edición de tema, variantes, carrito, formularios de contacto, contraseña y checkout de prueba.
- Fotos reales inaccesibles desde el entorno. Sin imagen inventada del producto; deben cargarse antes del lanzamiento.

## Comparación de diseño: intención, no aprobación visual
1. Copy: se conserva titular, descripción, CTA, producto y capacidades. Se eliminan slogans extra del generador.
2. Tipografía: Georgia editorial y Arial en controles, wordmark serif en minúsculas.
3. Paleta: crema #F5F2E9, bosque #193E32 y naranja #D66A38.
4. Composición: hero a dos columnas, capacidades y compra con divisoria, FAQ y pie bosque. Foto de hero separada con marco arqueado en vez del degradado del concepto.
5. Móvil: una columna, navegación en segunda fila, capacidades compactas y botones táctiles; pendiente comprobar overflow y legibilidad con navegador.
6. Imágenes: foto editorial independiente; no textos rasterizados como interfaz ni producto inventado. Galería conectada a medios de Shopify.

No se declara equivalencia visual 10/10. Las diferencias deliberadas están documentadas en brand.md y las verificaciones bloqueadas deben completarse en Shopify.
