# Oh Happy Trip

## Cuentas y cotizaciones

El proyecto incluye un flujo de cuentas y cotizaciones en `auth.html`, `cotizar.html` y
`admin.html`. En esta versión estática los datos se guardan en `localStorage` del
navegador mediante `app.js`; el esquema para una base de datos del servidor está en
`database.sql`.

La cuenta de administración inicial es:

- Usuario: `AndreaLugo`
- Contraseña: `Disney2027`

Los clientes pueden crear una cuenta, iniciar sesión, guardar varias cotizaciones y
consultar el estado y los mensajes enviados por administración. Andrea puede revisar,
editar el estado, escribir mensajes y borrar cotizaciones desde `admin.html`.

Desde el panel de administración también se puede elegir Inicio, Disney, Universal,
Cruceros, Playas o Certificado en **Editar páginas informativas**. Ahí se pueden
actualizar textos e imágenes; los cambios se guardan en el navegador y se aplican al
abrir cada página.

Para producción, el esquema SQL debe ejecutarse en un servidor y las operaciones de
autenticación y cotizaciones deben exponerse mediante una API; `localStorage` es una
persistencia local apropiada únicamente para esta versión frontend/demo.
