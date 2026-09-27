# Opiniones de clientes

## Estado — 27 de septiembre de 2026

La sección `product-reviews` está incluida en las plantillas `product`, `product.dispensador` y `page.dispensador`. La página del dispensador enlaza a `#opiniones` desde su navegación. El diseño hereda la tipografía, colores y espaciado del tema.

La consulta al administrador confirmó que Judge.me **no estaba instalado**. Por eso `judgeme_enabled` permanece desactivado y la sección muestra un mensaje de preparación, sin puntuación, testimonios, formulario ni confirmación ficticia. La subida y publicación de opiniones **todavía no están operativas**.

La venta sigue desactivada. Instalar opiniones no requiere abrir el checkout.

## Activación en Shopify

1. Instalar [Judge.me](https://apps.shopify.com/judgeme) en Milo&Co y elegir **Forever Free**, sin iniciar la prueba del plan de pago. Revisar los permisos solicitados antes de aceptar. El plan gratuito incluye opiniones de producto con fotos y vídeos.
2. En **Tienda online → Temas → milo-co/main → Editar tema → Inserciones de aplicaciones**, activar Judge.me y guardar. El tema utiliza el cargador oficial de la aplicación; no incorpora claves ni carga scripts adicionales por su cuenta.
3. En Judge.me, configurar el idioma español, la escala de cinco estrellas y el formulario con texto, fotos y vídeos. Mantener visibles las opiniones independientemente de su puntuación; moderar spam, contenido ajeno al producto o datos personales. Mostrar «Compra verificada» solamente cuando la aplicación haya comprobado el pedido. No importar opiniones ajenas ni añadir testimonios de ejemplo. No activar envíos de solicitudes por correo sin autorización del propietario.
4. En cada una de las tres plantillas, abrir **Opiniones de clientes → Conectar Judge.me**. En una ficha, se utiliza siempre el producto de esa ficha. Para `page.dispensador`, seleccionar el dispensador real en **Producto para páginas** o en **Producto destacado** de los ajustes generales. Debe estar disponible en el canal Tienda online para que Shopify resuelva el objeto; la decisión de publicar el catálogo es independiente de instalar la app.
5. Guardar y comprobar la tienda Shopify real. La vista previa estática de Vercel solo muestra el diseño y no recibe opiniones ni archivos.

La sección también admite un bloque de aplicación `@app`. En una ficha de producto se puede usar el bloque oficial Review Widget **dentro de esta sección** en lugar de la conexión Liquid. Cuando hay un bloque de aplicación, el tema no añade el widget Liquid: así no aparecen dos formularios. No añadir otra sección de opiniones automática fuera de esta sección. Para la landing de páginas, la conexión Liquid utiliza explícitamente el producto seleccionado.

## Comprobación tras activar

- Confirmar que aparece «Escribir una opinión», en castellano, y que no hay duplicados.
- En un entorno de prueba, enviar una opinión de prueba identificada como tal con una imagen y un vídeo, verificar su registro en Judge.me y retirarla antes de publicar contenido de clientes.
- Verificar los archivos, texto y estrellas desde una segunda sesión. Comprobar que el email no se muestra en el listado público y que la etiqueta de compra verificada no se asigna a una opinión no comprobada.
- Revisar selección de estrellas, validación, error de envío, formatos y límites de archivos, filtros disponibles y apertura de imágenes/vídeos en escritorio y móvil. Probar teclado.
- Confirmar que la lista de espera funciona y `sales_enabled` sigue desactivado.

Las comprobaciones locales de Liquid, estructura y producto asociado no sustituyen esta prueba de envío real. No se ha enviado ninguna opinión ni archivo al proveedor.

## Referencias del proveedor

- [Planes de Judge.me](https://judge.me/pricing).
- [Código Liquid oficial del Review Widget](https://judge.me/help/en/articles/12058208-liquid-code-for-judge-me-widgets).
- [Instalación y app embed](https://judge.me/help/en/articles/11424925-adding-the-review-widget-on-your-product-page).

Los campos `judgeme` pertenecen a Judge.me y los administra esa aplicación. Este tema solo los lee; no crea definiciones ni escribe opiniones en metafields.
