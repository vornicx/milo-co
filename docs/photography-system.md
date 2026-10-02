# Imágenes Pupit v2 · Apple

La portada, el capítulo de colores y las tres funciones usan renders generados para esta dirección visual. Los conceptos de página solo guían composición; los textos, controles, fondos y formularios se construyen en Liquid/CSS. No se usa una captura completa como página.

| Bloque | Asset de respaldo | Tratamiento |
| --- | --- | --- |
| Portada | `pupit-hero-duo.webp` | Dúo rosa/azul, transparencia real, contain, halos CSS |
| Azul cielo | `pupit-blue-render.webp` | Render transparente, fondo negro |
| Rosa | `pupit-pink-render.webp` | Render transparente, fondo negro |
| Agua | `pupit-water-studio-v2.webp` | Bebedero azul cielo con agua, luz suave sobre azul/crema |
| Comida | `pupit-food-studio-v2.webp` | Compartimento superior rosa con comida, fondo rosa/crema |
| Residuos | `pupit-waste-studio-v2.webp` | Módulo inferior azul con bolsa rosa, fondo crema |
| Paseo | `paseo.jpg` | Fotografía existente junto al lago |

Los renders mantienen la silueta del dispensador, el bebedero ovalado, tapa blanca, botón de tres líneas, compartimento transparente y correa gris. No se añadió marca impresa. Son imágenes de presentación generadas, no una prueba fotográfica de la muestra ni de materiales.

Los WebP transparentes suman aproximadamente 299 KB. Los tres nuevos detalles de estudio son WebP opacos de 1536 × 1024 px, calidad 91, y suman 126.730 bytes (unos 124 KiB). Solo se convirtió el formato; no se alteró la composición con herramientas de edición. La portada carga de forma prioritaria y el resto usa carga diferida. El producto se encuadra completo en portada y colores. Las funciones muestran detalles: bebedero o comida completos y botón, o base y bolsa; el resto del cuerpo puede salir del encuadre. Residuos usa `object-position: 25% center` para conservar la bolsa en el contenedor estrecho. La fotografía de paseo se adapta al contenedor. `pupit-media` usa `image_tag` con tamaños adaptables para imágenes seleccionadas en el editor.

Referencias de composición generadas: portada `exec-e5992cfb-10ba-4447-99b5-03fc86d17f52.png`, funciones `exec-1626b41c-e7fd-4c71-8dcb-8dcd63eb6745.png`, colores `exec-282707e4-6580-4a5b-ad7d-041cc7f405b0.png`, paseo `exec-9c711e40-5ee9-4245-ab50-07ed95fccda8.png`, lista/pie `exec-4b03199d-8d1d-417c-b71b-c29b381a158e.png` y móvil `exec-6acc051a-78a6-4051-8bcc-c286d9c351fb.png`.

## Serie de estudio de las funciones

Generada con la herramienta integrada `image_gen`, a partir de las referencias locales del producto y de los renders de color del proyecto. Los tres assets se guardan en la copia del tema **Pupit v2 · Apple · Fotos**, ID `206268891479`. La versión Apple original ya estaba publicada al iniciar esta revisión.

| Función | Archivo final del proyecto | Original generado seleccionado |
| --- | --- | --- |
| Agua | `/workspace/scratch/67d70525e52e/pupit-current/assets/pupit-water-studio-v2.webp` | `/workspace/scratch/67d70525e52e/generated_images/exec-dea46f32-671a-4f7f-9549-665a5929016f.png` |
| Comida | `/workspace/scratch/67d70525e52e/pupit-current/assets/pupit-food-studio-v2.webp` | `/workspace/scratch/67d70525e52e/generated_images/exec-07eae9f2-54c7-47f8-86c4-cc2965e594a4.png` |
| Residuos | `/workspace/scratch/67d70525e52e/pupit-current/assets/pupit-waste-studio-v2.webp` | `/workspace/scratch/67d70525e52e/generated_images/exec-318d7946-d28d-4297-8006-5e61681ec83b.png` |

La forma, tapa blanca, botón de tres líneas, depósitos transparentes, uniones y correa gris se contrastaron visualmente con las referencias. No se añadieron logotipos ni prestaciones. El color de la bolsa es ilustrativo. Los textos, capacidades y controles de la sección se mantienen.

## Prompts utilizados

### Agua: primera generación

Referencias: `assets/dispensador-detalle.webp` y `assets/pupit-blue-render.webp`; primera imagen azul de estudio.

```text
Use case: product-mockup. Create ONE finished premium studio product photograph for the WATER panel of Pupit & Co's Apple-inspired product website. Input image 1 is a product-identity reference for the upper drinking trough and three-line oval button; input image 2 is the same product's complete silhouette. These are references, not layouts to reproduce. Photograph the SAME sky-blue portable dog dispenser, preserving its exact elongated oval open drinking trough, white upper cap, recessed oval button with exactly three horizontal ridges, transparent screw-on middle reservoir, pastel blue housing and grey braided wrist loop. A crisp three-quarter macro view tilted about 15 degrees, showing the full oval trough, its rim and shallow clear water with a restrained natural meniscus and tiny ripples, plus button and upper half of reservoir. Keep the product recognizable and optically believable. Minimal seamless studio backdrop pale sky-blue #DCEEF5 with a subtle warm cream falloff. Soft large daylight softbox from upper left, gentle grounded shadow, refined transparent-plastic refraction, fine satin surface texture, sharp edges. Premium Apple product-page photography, calm and precise, natural photographic realism rather than shiny cartoon CGI. Square 1:1 composition; subject centered within the middle 75% of the frame so both wide and square website crops retain the complete drinking trough and button. The bottom reservoir may exit the frame, but the bowl must remain complete with generous headroom. No UI, no typography, no logo, no watermark, no extra props, no dog, no people, no dramatic splash, no extra spout, no redesign, no invented controls or metal parts.
```

### Agua: encuadre final

Referencias: Primera imagen de agua `exec-d8109ef9-aa91-4637-8e98-c8d920d0e29c.png`, objetivo de edición; imagen final de Comida, referencia de serie.

```text
Use case: precise-object-edit. Edit the first reference, the approved sky-blue Pupit dispenser water studio photo. Change ONLY framing: recompose it to landscape 3:2, slightly zoomed out so the complete oval drinking trough, its white cap, top hanging eyelet, three-line button, and grey wrist strap all sit safely in the image with clear headroom and side breathing space. Preserve the product geometry, blue color, water meniscus and small ripples, materials, surface grain, reflections, and upper-left diffused studio light exactly. The upper part should fill roughly the central 60% of image width; do not magnify it. Preserve pale sky-blue and warm cream seamless background. Bottom transparent reservoir may extend below frame, but all water-function parts must be fully visible. Image 2 is the approved FOOD photo for this same series: use the same landscape dimensions, camera distance and gentle pastel background treatment, while keeping this WATER product blue and containing only clear water in its oval upper area. One finished photo only. No UI, no typography, no logos, no watermark, no extra props, no new chambers, no redesigned controls. Output landscape 1536 by 1024 composition.
```

### Comida

Referencias: `assets/pupit-food-original.jpg`, identidad; `assets/pupit-pink-render.webp`, variante; primera imagen de agua, luz y fondo.

```text
Use case: product-mockup. Create ONE photorealistic premium studio product photograph for the FOOD panel of Pupit & Co's Apple-inspired website. Input image 1 is the reference for the exact product and how food is arranged in the upper clear compartment; input image 2 is the approved same-product shape in pastel pink; input image 3 is the lighting and backdrop style of this new studio series. Preserve the actual elongated oval upper compartment, white cap, single oval button with exactly three horizontal ridges, transparent cylindrical middle water reservoir, screw seams, pastel housing and grey braided wrist strap. Use the PINK product variant. The upper clear food area contains realistic small dry dog kibble exactly as shown in image 1; do not invent a new chamber or mechanical opening. Create a refined three-quarter close detail, nearly upright with a very slight diagonal, showing the complete oval head, white cap, button and part of the clear water reservoir. Pale blush seamless studio background #F1DDE3 with soft cream falloff. Match image 3's upper-left diffused daylight, soft grounded shadows and controlled transparent-plastic reflections. Macro photo realism, fine satin surface grain, natural brown kibble texture, very crisp details, accessible premium Apple product photography. A few small kibble pieces on the smooth cream surface are permitted, no other props. Landscape 3:2 composition. IMPORTANT crop safety: the complete food compartment including top cap and the full button must fit inside the central 60% of the width and central 75% of the height, with generous headroom and breathing space. This is an image-only photographic asset to fill a rounded website panel, also center-cropped to near-square on mobile. No text, no label, no logo, no watermark, no UI, no outdoor garden, no picnic cloth, no collar, no dog or person, no floating exploded parts, no redesigned product or extra buttons.
```

### Residuos

Referencias: `assets/pupit-waste-original.jpg`, base y abertura; `assets/pupit-blue-render.webp`, cuerpo; imagen final de Agua, luz y fondo.

```text
Use case: product-mockup. Create ONE premium photorealistic studio detail photograph for the lower compartment panel of Pupit & Co's Apple-inspired product website. Image 1 is a strict physical identity reference for the SAME sky-blue dispenser's circular lower end cap and single existing round opening with a bag emerging from it. Preserve its physical design exactly; do not invent a different container or opening. Image 2 shows the same product's body geometry; image 3 supplies the lighting style of the new studio photo series. Focus the camera on the pastel sky-blue lower module and the adjacent transparent water reservoir. The dispenser rests diagonally on a smooth warm cream surface, lower end cap toward camera, reservoir receding gently toward upper right. Show ONE short length of unprinted matte pale blush pink bag emerging from the existing round opening, softly folded in a natural realistic way. Preserve the circular lower cap outline, seams, dimensions and recognizable sky-blue finish; the water reservoir is clear with a restrained real waterline. Premium macro product photography, crisp soft plastic surface grain, controlled reflections, natural bag film texture, soft daylight from upper left, gentle elongated grounded shadow. Seamless neutral cream #E8E6DF backdrop with warm off-white falloff, matching the airy controlled light and calm finish of image 3. Landscape 3:2. Keep the COMPLETE lower cap, circular opening and complete visible bag in the central 60% of the frame width and central 75% height so a near-square mobile crop preserves the function. Allow the upper part of the dispenser to recede toward background; no requirement to show the whole product. No garden, wood table, leash or collar props, cloth, bones printed on bags, people, dog, text, logo, watermark, UI, exploded view, garbage or additional holes. One finished image-only photograph, precise and realistic.
```
