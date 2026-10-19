# China Tiesiju Civil Engineering Group Co. Ltd. Sucursal del Perú – sitio web

Nueva web de **China Tiesiju Civil Engineering Group Co. Ltd. Sucursal del Perú**, construida a partir del contenido de https://ctceperu.com.

## Estructura
```
index.html            Página única (one-page) con todas las secciones
assets/css/styles.css Estilos
assets/js/main.js     Animaciones e interacciones
assets/img/           Imágenes (logo y 3 fotos originales + fotos Unsplash)
```

## Ver en local
```bash
python -m http.server 5510
```
Abrir http://localhost:5510

## Efectos incluidos
Preloader con progreso real · scroll suave (Lenis) · slider hero con Ken Burns · líneas topográficas animadas que reaccionan al mouse · títulos con revelado palabra por palabra · cursor personalizado · botones magnéticos · tarjetas con inclinación 3D · contadores animados · parallax · marquee · sección de scroll horizontal fijada (escritorio) · mapa con arcos animados · proceso con imagen sticky y línea de progreso · galería con lightbox · formulario con etiquetas flotantes y validación · menú móvil con revelado circular · respeta `prefers-reduced-motion`.

Librerías por CDN: GSAP 3.12.5 + ScrollTrigger, Lenis 1.1.13.

## Pendiente (datos que el sitio original no tenía)
- **Correo y teléfono**: el sitio original tiene un correo de plantilla inválido y el teléfono vacío. Añadirlos en la sección Contacto de `index.html`.
- **Dirección de la oficina**: buscar `TODO: dirección` en `index.html`.
- **Envío del formulario**: definir `CONTACT_ENDPOINT` al inicio de `assets/js/main.js` (por ejemplo, Formspree o un backend propio). Hoy solo simula el envío.
- **Proyectos reales en Perú**: el sitio original no los lista. Si se dispone de fotos y datos, conviene reemplazar las fotos genéricas.

## Créditos de imágenes
Logo y fotos `carretera-montana`, `ladera-obra`, `topografia-lidar`: sitio original ctceperu.com.
Resto: [Unsplash](https://unsplash.com) (licencia Unsplash, uso comercial gratuito).
