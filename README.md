# Oh-Happy-trip

Sitio web estático de Oh Happy Trip, construido con HTML, CSS y JavaScript. No requiere compilación ni dependencias.

## Publicación en GitHub Pages

El flujo [`deploy-pages.yml`](./.github/workflows/deploy-pages.yml) publica el sitio automáticamente al hacer push a `main`; también se puede ejecutar manualmente desde la pestaña **Actions**.

Para habilitar la publicación la primera vez:

1. En el repositorio, abre **Settings → Pages**.
2. En **Build and deployment**, selecciona **GitHub Actions** como origen.
3. Espera a que termine correctamente el flujo **Deploy to GitHub Pages** en **Actions**.

Después del primer despliegue, el sitio estará disponible en:

<https://salvadorlugo.github.io/Ohappytrip/>

## Desarrollo local

Abre `index.html` en un navegador o inicia un servidor estático desde la raíz del repositorio, por ejemplo con `python -m http.server 8000`, y visita <http://localhost:8000>.

El formulario de cotización es solo del lado del navegador: no guarda ni envía datos a un servidor.
