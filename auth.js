(function () {
  const loginForm = document.getElementById('loginForm');
  const registroForm = document.getElementById('registroForm');
  const loginError = document.getElementById('loginError');
  const registroMensaje = document.getElementById('registroMensaje');
  const mostrarRegistro = document.getElementById('mostrarRegistro');
  const cancelarRegistro = document.getElementById('cancelarRegistro');
  const separadorRegistro = document.getElementById('separadorRegistro');

  mostrarRegistro.addEventListener('click', () => {
    loginForm.classList.add('oculto');
    mostrarRegistro.classList.add('oculto');
    separadorRegistro.classList.remove('oculto');
    registroForm.classList.remove('oculto');
  });
  cancelarRegistro.addEventListener('click', () => {
    registroForm.classList.add('oculto');
    separadorRegistro.classList.add('oculto');
    loginForm.classList.remove('oculto');
    mostrarRegistro.classList.remove('oculto');
    registroMensaje.textContent = '';
  });

  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    loginError.textContent = '';
    try {
      const user = await OhHappyTripDB.login(
        document.getElementById('loginUsuario').value.trim(),
        document.getElementById('loginPassword').value
      );
      window.location.href = user.role === 'admin' ? 'admin.html' : 'cuenta.html';
    } catch (error) {
      loginError.textContent = error.message;
    }
  });

  registroForm.addEventListener('submit', async event => {
    event.preventDefault();
    registroMensaje.textContent = '';
    try {
      const user = await OhHappyTripDB.register(
        document.getElementById('registroNombre').value.trim(),
        document.getElementById('registroUsuario').value.trim(),
        document.getElementById('registroPassword').value
      );
      window.location.href = user.role === 'admin' ? 'admin.html' : 'cotizar.html';
    } catch (error) {
      registroMensaje.textContent = error.message;
    }
  });
})();
