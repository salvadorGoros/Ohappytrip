(async function () {
  const form = document.getElementById('resetPasswordForm');
  const message = document.getElementById('resetMensaje');

  const { data: sessionData } = await window.supabaseClient.auth.getSession();
  if (!sessionData.session) {
    message.textContent = 'El enlace expiró o ya fue utilizado. Solicita otro correo de recuperación.';
    form.querySelector('button').disabled = true;
    return;
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const password = document.getElementById('nuevaPassword').value;
    const confirmation = document.getElementById('confirmarPassword').value;
    if (password !== confirmation) {
      message.textContent = 'Las contraseñas no coinciden.';
      return;
    }

    const { error } = await window.supabaseClient.auth.updateUser({ password });
    if (error) {
      message.textContent = error.message;
      return;
    }
    message.textContent = 'Contraseña actualizada. Ya puedes iniciar sesión.';
    form.reset();
    setTimeout(() => { window.location.href = 'auth.html'; }, 1500);
  });
})();
