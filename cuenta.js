(function () {
  const user = OhHappyTripDB.currentUser();
  if (!user) {
    window.location.href = 'auth.html';
    return;
  }
  const form = document.getElementById('cuentaForm');
  const aviso = document.getElementById('cuentaAviso');
  const preview = document.getElementById('fotoPreview');
  const initial = document.getElementById('fotoInicial');
  let photo = user.profileImage || '';

  document.getElementById('cuentaNombre').value = user.name;
  document.getElementById('cuentaUsuario').value = user.username;
  renderPhoto();

  document.getElementById('fotoPerfil').addEventListener('change', event => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      aviso.textContent = 'La foto debe pesar menos de 2 MB.';
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      photo = reader.result;
      renderPhoto();
    };
    reader.readAsDataURL(file);
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    try {
      const changes = {
        name: document.getElementById('cuentaNombre').value.trim(),
        profileImage: photo
      };
      const password = document.getElementById('cuentaPassword').value;
      if (password) changes.passwordHash = await OhHappyTripDB.hash(password);
      if (!changes.name) throw new Error('Escribe un nombre válido.');
      OhHappyTripDB.updateUser(user.id, changes);
      aviso.textContent = 'Tus datos se actualizaron correctamente.';
    } catch (error) {
      aviso.textContent = error.message;
    }
  });

  document.getElementById('cerrarCuenta').addEventListener('click', OhHappyTripDB.logout);

  function renderPhoto() {
    preview.classList.toggle('oculto', !photo);
    initial.classList.toggle('oculto', Boolean(photo));
    preview.src = photo;
    initial.textContent = user.name.charAt(0).toUpperCase();
  }
})();
