# Opiniones propias de Pupit & Co

La identidad pública y los orígenes previstos corresponden a Pupit & Co y `pupitandcompany.com`. Los identificadores de tablas existentes (`milo_reviews`, `milo_review_limits` y `milo_review_audit`) se conservan para mantener la compatibilidad con los datos anteriores. No hace falta volver a crear la base de datos para cambiar la marca.

## Estado — 28 de septiembre de 2026

Implementación propia, sin Judge.me. Incluye sección Shopify, API, almacenamiento de archivos privados y panel de moderación. Las plantillas `product`, `product.dispensador` y `page.dispensador` incluyen la sección y la landing enlaza a `#opiniones`.

**Todavía no está activada en producción.** No se han creado ni conectado la base de datos o el bucket. `api_url` permanece vacío, el formulario no permite enviar y la API devuelve 503 si faltan sus variables. El código está preparado para desplegarse desde este repositorio. La venta sigue desactivada.

## Funciones

- Puntuación de 1 a 5 estrellas, nombre público o alias, título opcional y experiencia escrita.
- Hasta cuatro archivos: JPG, PNG o WebP de hasta 5 MiB cada uno y un vídeo MP4, WebM o MOV de hasta 25 MiB; 30 MiB en total. La reproducción de MOV depende del navegador y del códec; MP4 es preferible. No hay transcodificación.
- Vista previa y eliminación de archivos seleccionados; reintento de subidas fallidas sin perder el formulario mientras siga abierta la página.
- Listado con media, distribución de estrellas, filtros por puntuación y archivos, ordenación y paginación de doce opiniones.
- Todas las opiniones enviadas quedan pendientes de revisión. El panel permite publicar, rechazar y retirar, y exige motivo para retirar o rechazar. El historial de decisiones queda registrado.
- Sin testimonios de ejemplo, opiniones importadas, email público, correos automáticos ni etiqueta «Compra verificada»: esta versión no consulta pedidos.

## Arquitectura y acceso

`sections/product-reviews.liquid` → `api/reviews.mjs` (Vercel, Node) → PostgreSQL + bucket S3 privado.

Las fotos y vídeos se suben directamente al bucket mediante un formulario POST firmado (modo predeterminado) o una URL PUT firmada (proveedores compatibles). Ambos duran 60 segundos y vinculan la ruta aleatoria, el tamaño exacto y el tipo de archivo. En PUT, la firma incluye `Content-Length` y `Content-Type`; el navegador calcula la longitud del cuerpo `File`. Al finalizar, el servidor contrasta tamaño, MIME y firma del archivo; copia el objeto validado a una ruta privada nueva mediante copia condicional vinculada a su ETag. Reutilizar el formulario firmado de subida no puede reemplazar el archivo revisado. La opinión se confirma solamente después de guardar el estado `pending` en PostgreSQL.

Los archivos pendientes solo reciben enlaces en el panel autenticado. Los aprobados reciben enlaces firmados de lectura que caducan a los cinco minutos. Retirar una opinión elimina su entrada pública inmediatamente; los enlaces ya emitidos pueden seguir funcionando hasta que caduquen. Las firmas no son un antivirus ni una eliminación de metadatos: el moderador debe revisar contenido, datos personales y permisos antes de publicar.

Los textos se muestran con `textContent`, sin interpretar HTML. Las consultas usan parámetros y ordenaciones predefinidas. Las tablas tienen RLS habilitado y no conceden acceso a `PUBLIC`. Solo la API posee credenciales de base de datos y almacenamiento.

El panel `/reviews-admin` utiliza una clave aleatoria enviada en `Authorization`, mantenida únicamente en memoria, con cierre tras quince minutos sin interacción. No es una cuenta Shopify ni un sistema multiusuario: el registro no identifica distintos moderadores. La clave se rota desde las variables de Vercel. No se guarda en código, URL, localStorage ni cookies. Usar un gestor de contraseñas.

## Conexión pendiente

1. Preparar una base de datos PostgreSQL **dedicada a Pupit & Co** y un bucket S3 privado. No reutilizar bases de otros negocios. Elegir ubicación y presupuesto antes de contratar servicios; esta implementación no garantiza alojamiento gratuito.
2. Configurar las variables de `.env.example` en el servidor. Usar conexión PostgreSQL con TLS y certificados verificados. El usuario de servidor/migración debe ser propietario de las tablas (o disponer de una política/rol de servidor equivalente); nunca entregar estas credenciales a Shopify o al navegador. Para Vercel con conexiones limitadas, usar la URL del pool del proveedor.
3. Generar `REVIEWS_ADMIN_SECRET` y `REVIEWS_HASH_SECRET` independientes, con al menos 32 bytes aleatorios cada uno. No pegarlos en el repositorio ni en una conversación. Configurar secretos distintos para pruebas y producción.
4. Ejecutar `npm run reviews:migrate` con las variables privadas disponibles. El script usa una transacción y puede repetirse. La migración no importa opiniones.
5. Mantener bloqueado el acceso público al bucket y desactivar ACL públicas. La credencial de la API necesita `s3:GetObject`, `s3:PutObject` y `s3:DeleteObject` sobre `staging/*` y `reviews/*`. El mantenimiento necesita además `s3:ListBucket` para esos prefijos. No conceder administración del bucket. Usar HTTPS y cifrado del proveedor.
6. Configurar CORS del bucket para `POST` o `PUT` según el modo elegido, `GET` y `HEAD` desde los orígenes exactos de la tienda y el panel, con cabeceras `Content-Type` y exposición opcional de `ETag`. No usar `*`. Añadir una regla de ciclo de vida que elimine **solo `staging/`** después de un día; nunca aplicar esa expiración a `reviews/`. Para un proveedor compatible, comprobar el modo de subida elegido y COPY condicional antes de activarlo. Ver la preparación específica de Supabase a continuación.
7. Desplegar la API y el panel. `vercel.json` limita la función a 30 segundos. `REVIEWS_ALLOWED_ORIGINS` debe incluir los orígenes reales completos sin barra final. El dominio público elegido para la API debe aceptar visitas de clientes; conservar la protección de los despliegues de prueba. No enviar datos de producción a vistas previas.
8. Autorizar el identificador real del producto en `REVIEWS_PRODUCTS`. En Shopify, abrir **Opiniones de clientes → Dirección HTTPS de la API** en las tres plantillas y poner `https://<dominio-api>/api/reviews`. La ficha usa el handle de su producto; la landing usa el producto seleccionado, el destacado o el identificador configurado cuando el producto está en borrador.
9. Revisar el texto de privacidad para la publicación de nombre/alias, opinión, imágenes y vídeos y el canal de solicitud de retirada. El formulario requiere permiso para publicar y recuerda no compartir datos personales. No solicita email.
10. Completar la prueba real siguiente antes de anunciar que las opiniones están disponibles. Publicar el tema no requiere abrir la venta.

## Preparación para Supabase

La cuenta conectada encontrada es **vornicx-7872's projects**, actualmente en plan Free. Esto no confirma el precio ni la disponibilidad de un proyecto nuevo. La herramienta exige que el propietario elija la organización y confirme el coste antes de crearlo. No se ha creado ningún proyecto ni cambiado el plan.

Para un proyecto dedicado `pupit-co-opiniones`:

- Usar PostgreSQL y un bucket privado del mismo proyecto, preferentemente en una región europea, con límite de objeto de 25 MiB y lista de MIME permitidos. No crear políticas públicas sobre `storage.objects` ni sobre las tablas de opiniones.
- Configurar `REVIEWS_S3_UPLOAD_METHOD=put`. Copiar endpoint, región y credenciales S3 desde los ajustes de ese proyecto; las claves solo se guardan en el servidor. No usar el secreto `service_role` como token de sesión en enlaces firmados que vayan a entregarse a clientes.
- Supabase documenta PUT firmado, lectura por rango y copia con `x-amz-copy-source-if-match`. No asumir compatibilidad con formularios POST de AWS. El SDK está configurado para no añadir checksums opcionales que el proveedor no admite.
- Supabase no implementa las operaciones S3 `PutBucketCors` y `PutBucketLifecycleConfiguration`. Comprobar el comportamiento de CORS de su servicio y los ajustes que proporcione su consola; la API de opiniones mantiene su propia lista de orígenes. Usar la tarea diaria de limpieza del proyecto para eliminar los archivos temporales caducados.
- Antes de activar, probar con su almacenamiento real tanto una foto como un vídeo, rechazo por tamaño o tipo alterado, copia condicional, lectura privada y retirada. Las pruebas locales de firma y formulario ya cubren el modo PUT, pero no demuestran el comportamiento de un proyecto aún inexistente.

Referencias: [compatibilidad S3 de Supabase](https://supabase.com/docs/guides/storage/s3/compatibility), [autenticación S3](https://supabase.com/docs/guides/storage/s3/authentication) y [cabeceras firmadas en AWS SDK](https://github.com/aws/aws-sdk-js-v3/tree/main/packages/s3-request-presigner).

## Moderación y mantenimiento

Entrar en `https://<dominio-api>/reviews-admin` con la clave privada. Revisar las pestañas Pendientes, Publicadas y Retiradas. Publicar también críticas y puntuaciones bajas; el formulario explica que la puntuación no es criterio de rechazo. Los motivos de rechazo son privados.

Se conservan los contenidos enviados, rechazados y el historial hasta que se gestione su eliminación. Para una solicitud de borrado, localizar la referencia, retirar la opinión, eliminar sus objetos privados y borrar la fila correspondiente mediante una operación administrativa con copia de seguridad y confirmación del propietario; el historial asociado se elimina en cascada. Las copias de seguridad requieren su propia política de retención.

`npm run reviews:cleanup` simula la limpieza de borradores incompletos de más de dos días, incluidos sus archivos, y de todos los objetos de `staging/` con más de dos días aunque su opinión ya se haya enviado. `npm run reviews:cleanup -- --apply` la ejecuta y elimina contadores caducados. Programar esta tarea diaria con credenciales privadas después de comprobar la simulación; no hay un cron activado en esta entrega. Las opiniones pendientes, publicadas y rechazadas no se eliminan con este script. Los objetos finales huérfanos de un fallo justo antes de completar el borrador se eliminan junto con el borrador caducado.

Límites iniciales: tres borradores por IP/día, cincuenta por tienda/día, 200 MiB declarados por tienda/día, treinta renovaciones de subida/hora y veinte finalizaciones/hora por IP. Los contadores persisten en PostgreSQL. Las IP se usan mediante HMAC para los contadores, no se guardan en las opiniones. Diez intentos administrativos fallidos cada diez minutos por IP. Estos límites y el honeypot reducen abuso, pero no garantizan un techo absoluto de costes; un formulario firmado puede reutilizarse durante sus 60 segundos. Configurar límites y alertas del proveedor antes de abrir el servicio.

## Verificación

Pruebas locales: `npm run test:reviews` ejecuta PostgreSQL embebido (PGlite) con las consultas reales y un transporte de objetos simulado; valida firmas de archivos reales, política de subida, estado pendiente, autenticación, idempotencia, límites, filtros, retirada y DOM del formulario/panel. `npm run check`, `npm run build`, `node --test tests/*.test.mjs` y `npm audit --audit-level=high` completan las comprobaciones del tema.

Estas pruebas no sustituyen la comprobación en Shopify y S3 reales:

- En un entorno de pruebas separado, enviar una opinión claramente identificada como prueba con una foto y un MP4; verla pendiente únicamente en el panel.
- Aprobarla, comprobarla desde una segunda sesión sin acceso administrativo y retirarla; eliminar los datos de prueba antes de abrir al público.
- Probar archivo inválido, vídeo demasiado grande, fallo de conexión y reintento; nunca debe mostrarse éxito si no se guardó la opinión.
- Probar teclado, móvil/escritorio, filtros, paginación, reproducción y apertura de imágenes; comprobar CORS y caducidad de firmas.
- Confirmar que las ventas siguen desactivadas y que la lista de espera funciona.
