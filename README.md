# Oh Happy Trip

## Cuentas y cotizaciones

El proyecto incluye un flujo de cuentas y cotizaciones en `auth.html`, `cotizar.html` y
`admin.html`. Los usuarios y las cotizaciones se guardan en Supabase mediante
`app.js`; las tablas, políticas RLS y el trigger de perfiles están en `database.sql`.

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

Configura la URL y la clave **Publishable** del proyecto en `supabase-config.js`.
Nunca uses una clave `Secret` en el navegador. El editor de páginas informativas
continúa guardando sus cambios en `localStorage`, porque esos cambios son específicos
del navegador hasta que se agregue una tabla de contenido compartido.

Las cuentas de clientes usan internamente el correo
`usuario@ohhappytrip.local` para autenticarse; el cliente sigue iniciando sesión con
su nombre de usuario y contraseña.
