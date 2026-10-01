# Imágenes Pupit v2 · Apple

La portada y el capítulo de colores usan renders generados para esta dirección visual. Los conceptos de página solo guían composición; los textos, controles, fondos y formularios se construyen en Liquid/CSS. No se usa una captura completa como página.

| Bloque | Asset de respaldo | Tratamiento |
| --- | --- | --- |
| Portada | `pupit-hero-duo.webp` | Dúo rosa/azul, transparencia real, contain, halos CSS |
| Azul cielo | `pupit-blue-render.webp` | Render transparente, fondo negro |
| Rosa | `pupit-pink-render.webp` | Render transparente, fondo negro |
| Agua | `dispensador-detalle.webp` | Fotografía de detalle existente |
| Comida | `pupit-food-use.avif` | Fotografía existente con comida visible |
| Residuos | `pupit-waste-use.avif` | Fotografía existente del compartimento inferior |
| Paseo | `paseo.jpg` | Fotografía existente junto al lago |

Los renders mantienen la silueta del dispensador, el bebedero ovalado, tapa blanca, botón de tres líneas, compartimento transparente y correa gris. No se añadió marca impresa. Son imágenes de presentación generadas, no una prueba fotográfica de la muestra ni de materiales.

Los WebP transparentes suman aproximadamente 299 KB. La portada carga de forma prioritaria y el resto usa carga diferida. El producto se encuadra completo; la fotografía de paseo se adapta al contenedor. `pupit-media` usa `image_tag` con tamaños adaptables para imágenes seleccionadas en el editor.

Referencias de composición generadas: portada `exec-e5992cfb-10ba-4447-99b5-03fc86d17f52.png`, funciones `exec-1626b41c-e7fd-4c71-8dcb-8dcd63eb6745.png`, colores `exec-282707e4-6580-4a5b-ad7d-041cc7f405b0.png`, paseo `exec-9c711e40-5ee9-4245-ab50-07ed95fccda8.png`, lista/pie `exec-4b03199d-8d1d-417c-b71b-c29b381a158e.png` y móvil `exec-6acc051a-78a6-4051-8bcc-c286d9c351fb.png`.
