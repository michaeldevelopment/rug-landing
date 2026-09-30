# RUG · Laboratorio Estratégico — landing

Landing one-page de RUG. Sitio **estático**: HTML, CSS y JavaScript. Sin build, sin
framework, sin backend.

## Cómo correrlo

Hace falta un servidor HTTP — los ES modules y el importmap no funcionan con `file://`.

```bash
cd RUG-landing
python -m http.server 8000
```

- **http://localhost:8000/** — la landing (`index.html`, antes `index-v6.html`)
- **http://localhost:8000/index-v5.html** — versión anterior, sin la transición
- Añade `?debug` para el panel de stats y `?calidad=alto|medio|bajo` para forzar nivel

Debe servirse desde la **raíz**: las páginas referencian `./elementos-3d/`, `./vendor/`
y `./assets/`.

## Estructura

```
index.html                 La landing: hero, transición, módulos 3D y cierre
index-v5.html              Versión previa, como referencia
.nojekyll                  Desactiva Jekyll en GitHub Pages
elementos-3d/
  rug-servicios.js         Sección 3D: escena, materiales, shaders y scroll
  rug-servicios.css        Estilos de la sección
vendor/three-0.176.0/      three.js alojado aquí, no desde un CDN
assets/fonts/              Space Grotesk e IBM Plex Mono, subseteadas
_headers                   Cabeceras de caché (Netlify / Cloudflare Pages)
```

`elementos-3d/` lo comparten ambas páginas. `index.html` activa el modo transición al
montar (`mountRugServicios(el, { transicion: { activa: true } })`); v5 no, y por eso
conserva su comportamiento.

## Despliegue en GitHub Pages

Settings → Pages → Deploy from a branch → `main` / `(root)`.

Todas las rutas son relativas, así que funciona igual en `usuario.github.io/REPO/` que en
un dominio propio. `.nojekyll` evita que Jekyll procese el sitio.

**`_headers` no tiene efecto en GitHub Pages** — es formato de Netlify / Cloudflare Pages.
GitHub sirve con su propio `Cache-Control` (unos 10 minutos) y no deja configurarlo, así
que el cacheado inmutable de `/vendor` y `/assets` solo aplica si mueves el hosting. El
`?v=N` sí sigue haciendo su trabajo.

## Decisiones que conviene conocer

- **three.js está vendorizado.** La versión va en el nombre de la carpeta, así que
  `/vendor` y `/assets` se cachean un año. Publicar otra versión significa otra ruta.
- **Las fuentes son propias**, subseteadas a los caracteres que usa la página. Evita dos
  orígenes de terceros en la ruta crítica.
- **`?v=N` es cache busting manual.** Al tocar `rug-servicios.js` o `.css` hay que subir
  ese número en el HTML, o los visitantes recurrentes seguirán con la copia en caché.
- **Sin WebGL hay fallback**: cuatro tarjetas estáticas ya presentes en el HTML, y
  three.js ni se descarga.

## Pendiente

- **El vídeo del hero pesa 7.3 MB y tiene un solo keyframe** en sus 4 segundos, así que
  cada seek del scroll obliga a decodificar desde el frame 0. Es la causa del scrub
  pesado. Re-encodearlo all-intra (`ffmpeg -g 1`) y a menor resolución es la mayor
  mejora de rendimiento pendiente.
- El contenido tarda en aparecer porque su entrada espera a que el vídeo tenga datos.
  Hay una red de seguridad a los 5 s que lo revela igualmente (importa sobre todo si
  se abre en una pestaña de segundo plano, donde Chrome aplaza la carga de medios).
- **Copy provisional** en las secciones de sistema, testimonios y contacto; marcado con
  comentarios en el HTML.
- **El enlace de WhatsApp** apunta a un número de marcador.

Contexto de marca y del sistema visual: `CLAUDE.md`.
Especificación de la experiencia 3D: `RUG-especificacion-experiencia-3D.md`.
