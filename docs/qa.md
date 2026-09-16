# Verificación — 16 septiembre 2026

## Cambios preparados
- Cuatro fotografías aportadas por el propietario, convertidas a WebP; portada, galería de uso/detalle y composición de colores.
- Conservación de crema/bosque, tipografía editorial y composición sencilla. Ajustes de miniaturas, carrito móvil y movimiento reducido.
- Producto global configurable en Shopify para navegación y página del dispensador. Estados de lanzamiento condicionados a venta y producto configurados.
- Formulario nativo de producto con errores de Shopify, precio/stock por variante, reglas de cantidad y fotografía por variante.
- Carrito nativo con descuentos globales y estado fiscal. El checkout permanece alojado en Shopify.
- CSP restrictiva, bloqueo de marcos y permisos del navegador en la vista previa Vercel. Esta CSP NO se aplica al tema Shopify, donde bloquearía scripts de plataforma.

## Comprobado
- Compilación de las seis páginas de vista previa: correcta.
- Shopify Theme Check: 42 archivos, sin incidencias.
- Auditoría npm completa, incluidas dependencias de desarrollo: cero vulnerabilidades notificadas en esta ejecución.
- Tres pruebas automatizadas: cantidad/precio, variante agotada y límite obsoleto, texto no interpretado como HTML.
- Sintaxis JavaScript y diff: correctos.

## Pendiente, sin declarar verificado
- El navegador bloqueó la vista previa local con ERR_BLOCKED_BY_CLIENT. No se ha comprobado visualmente esta versión en móvil/escritorio.
- La versión pública consultada sigue siendo la anterior: publicación bloqueada por revisión automática a la espera de autorización explícita.
- Sin acceso a una tienda Shopify: pendientes render nativo, persistencia de carrito, stock concurrente, envío, descuentos, contacto y pedido de prueba hasta confirmación.
- El interruptor sales_enabled es presentación, no un control de seguridad: proteger la tienda con la contraseña nativa antes del lanzamiento.
- No se garantiza ausencia de vulnerabilidades; auditoría de dependencias y revisión de tema no equivalen a una prueba de penetración.

## Fase actual: diseño sin conexión
- Shopify se conectará cuando el propietario apruebe el diseño. No se solicita acceso ni se activa la venta en esta fase.
- Carrito oculto en navegación con ventas desactivadas; nueva página Nuestra idea, enlazada desde portada y pie.
- Verificados los enlaces y recursos locales de las seis páginas generadas; todas contienen un único H1.

## Configuración para continuar en Shopify
1. Conectar el repositorio/tema en Tienda online y seleccionar el producto en Ajustes del tema → Venta → Dispensador de la tienda.
2. Crear variantes con sus precios, imágenes e inventario real; configurar pagos, mercados, impuestos, envío y políticas desde Shopify.
3. Asignar las páginas del dispensador y paseos en Ajustes del tema → Navegación.
4. Activar venta para probar en una tienda protegida; verificar añadir, cambiar cantidad, eliminar, agotado y un pedido con pasarela de prueba.
5. Publicar la tienda únicamente tras completar esas pruebas. Vercel sigue siendo una vista previa sin cobros.
