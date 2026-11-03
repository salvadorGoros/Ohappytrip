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
    const username = document.getElementById('loginUsuario').value.trim();
    const passwordHash = await OhHappyTripDB.hash(document.getElementById('loginPassword').value);
    const user = OhHappyTripDB.read().users.find(item =>
      item.username.toLowerCase() === username.toLowerCase() && item.passwordHash === passwordHash
    );
    if (!user) {
      loginError.textContent = 'Usuario o contraseña incorrectos.';
      return;
    }
    OhHappyTripDB.setSession(user);
    window.location.href = user.role === 'admin' ? 'admin.html' : 'cuenta.html';
  });

  registroForm.addEventListener('submit', async event => {
    event.preventDefault();
    registroMensaje.textContent = '';
    const username = document.getElementById('registroUsuario').value.trim();
    try {
      OhHappyTripDB.addUser({
        id: crypto.randomUUID(),
        name: document.getElementById('registroNombre').value.trim(),
        username,
        passwordHash: await OhHappyTripDB.hash(document.getElementById('registroPassword').value),
        role: 'client',
        createdAt: new Date().toISOString()
      });
      const newUser = OhHappyTripDB.read().users.find(item => item.username === username);
      OhHappyTripDB.setSession(newUser);
      window.location.href = 'cotizar.html';
    } catch (error) {
      registroMensaje.textContent = error.message;
    }
  });
})();
