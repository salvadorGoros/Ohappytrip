(function () {
  const user = OhHappyTripDB.currentUser();
  if (!user || user.role !== 'admin') {
    window.location.href = 'auth.html';
    return;
  }

  const list = document.getElementById('listaAdmin');
  const editor = document.getElementById('editarAdmin');
  const message = document.getElementById('adminMensaje');
  const accountsList = document.getElementById('listaCuentas');
  const statusLabels = {
    pendiente: 'Pendiente',
    en_revision: 'En revisión',
    lista: 'Lista para el cliente'
  };
  let selectedId = null;

  function normalizedStatus(status) {
    if (status === 'revisada') return 'en_revision';
    if (status === 'check') return 'lista';
    return statusLabels[status] ? status : 'pendiente';
  }

  function quotes() {
    return OhHappyTripDB.read().quotes;
  }

  function renderList() {
    const data = quotes();
    const users = OhHappyTripDB.read().users;
    list.innerHTML = '';
    editor.classList.add('oculto');
    list.classList.remove('oculto');
    if (!data.length) {
      list.innerHTML = '<div class="estado-vacio">Todavía no hay cotizaciones registradas.</div>';
      return;
    }
    data.forEach((quote, index) => {
      const currentStatus = normalizedStatus(quote.status);
      const client = users.find(item => item.id === quote.userId);
      const photo = client && client.profileImage
        ? `<img class="avatar-mini" src="${escapeHtml(client.profileImage)}" alt="">`
        : `<span class="avatar-mini avatar-inicial">${escapeHtml((quote.clientName || '?').charAt(0).toUpperCase())}</span>`;
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'cotizacion-resumen';
      item.dataset.quoteId = quote.id;
      item.innerHTML = `
        <span class="cotizacion-resumen-numero">${index + 1}</span>
        <span class="cotizacion-resumen-datos">
          ${photo}<strong>${escapeHtml(quote.clientName)}</strong>
          <small>${escapeHtml(quote.destino)} · ${escapeHtml(quote.fechaInicio)} a ${escapeHtml(quote.fechaFin)}</small>
        </span>
        <span class="estado estado-${currentStatus}">${statusLabels[currentStatus]}</span>
        <span class="cotizacion-resumen-flecha">›</span>`;
      list.appendChild(item);
    });
  }

  function renderEditor(id) {
    const data = quotes();
    const users = OhHappyTripDB.read().users;
    const quote = data.find(item => item.id === id);
    if (!quote) {
      renderList();
      return;
    }
    selectedId = id;
    const currentStatus = normalizedStatus(quote.status);
    list.classList.add('oculto');
    editor.classList.remove('oculto');
    editor.innerHTML = `
      <div class="editor-cabecera">
        <button class="btn-navegacion" data-back type="button">← Todas las cotizaciones</button>
        <span class="editor-contador">Cotización ${data.indexOf(quote) + 1} de ${data.length}</span>
      </div>
      <div class="cotizacion-card editor-card">
        <div class="cotizacion-card-cabecera">
          <div class="cliente-editor"><span class="avatar-mini">${quote.userId && users.find(item => item.id === quote.userId) && users.find(item => item.id === quote.userId).profileImage ? `<img src="${escapeHtml(users.find(item => item.id === quote.userId).profileImage)}" alt="">` : escapeHtml((quote.clientName || '?').charAt(0).toUpperCase())}</span><div><h2>${escapeHtml(quote.clientName)}</h2><small>${escapeHtml(quote.clientUsername)}</small></div></div>
          <span class="estado estado-${currentStatus}">${statusLabels[currentStatus]}</span>
        </div>
        <label>Destino
          <input data-destino value="${escapeHtml(quote.destino)}">
        </label>
        <div class="fila-form">
          <label>Inicio
            <input type="date" data-inicio value="${escapeHtml(quote.fechaInicio)}">
          </label>
          <label>Fin
            <input type="date" data-fin value="${escapeHtml(quote.fechaFin)}">
          </label>
        </div>
        <p>${quote.adultos} adulto(s), ${quote.ninos} menor(es) · ${escapeHtml(quote.paisSalida)}</p>
        <label>Especificaciones
          <textarea data-especificaciones rows="3">${escapeHtml(quote.especificaciones || '')}</textarea>
        </label>
        <label>Estado
          <select data-status>
            <option value="pendiente" ${currentStatus === 'pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="en_revision" ${currentStatus === 'en_revision' ? 'selected' : ''}>En revisión</option>
            <option value="lista" ${currentStatus === 'lista' ? 'selected' : ''}>Lista para el cliente</option>
          </select>
        </label>
        <label>Mensaje para el cliente
          <textarea data-message rows="3" placeholder="Escribe una actualización...">${escapeHtml(quote.adminMessage || '')}</textarea>
        </label>
        <div class="panel-acciones">
          <button class="btn-guardar btn-pequeno" data-save type="button">Guardar cambios</button>
          <button class="btn-peligro" data-delete type="button">Borrar</button>
        </div>
      </div>
      <div class="editor-paginacion">
        <button class="btn-navegacion" data-previous type="button" ${data.indexOf(quote) === 0 ? 'disabled' : ''}>← Anterior</button>
        <button class="btn-navegacion" data-next type="button" ${data.indexOf(quote) === data.length - 1 ? 'disabled' : ''}>Siguiente →</button>
      </div>`;
    configurarFechas(editor.querySelector('[data-inicio]'), editor.querySelector('[data-fin]'));
  }

  list.addEventListener('click', event => {
    const button = event.target.closest('[data-quote-id]');
    if (button) renderEditor(button.dataset.quoteId);
  });

  editor.addEventListener('click', event => {
    const data = quotes();
    const index = data.findIndex(item => item.id === selectedId);
    if (event.target.closest('[data-back]')) {
      renderList();
      return;
    }
    if (event.target.closest('[data-previous]') && index > 0) renderEditor(data[index - 1].id);
    if (event.target.closest('[data-next]') && index < data.length - 1) renderEditor(data[index + 1].id);
    if (event.target.closest('[data-delete]') && window.confirm('¿Quieres borrar esta cotización?')) {
      OhHappyTripDB.deleteQuote(selectedId);
      message.textContent = 'Cotización borrada.';
      renderList();
    }
    if (event.target.closest('[data-save]')) saveQuote();
  });

  function saveQuote() {
    const destino = editor.querySelector('[data-destino]').value.trim();
    const fechaInicio = editor.querySelector('[data-inicio]').value;
    const fechaFin = editor.querySelector('[data-fin]').value;
    if (!destino || !fechaInicio || !fechaFin || fechaInicio < fechaLocalDeHoy() || fechaFin < fechaInicio) {
      message.textContent = 'Revisa destino y fechas: no pueden ser pasadas y el fin debe ser posterior al inicio.';
      return;
    }
    OhHappyTripDB.updateQuote(selectedId, {
      status: editor.querySelector('[data-status]').value,
      adminMessage: editor.querySelector('[data-message]').value.trim(),
      destino,
      fechaInicio,
      fechaFin,
      especificaciones: editor.querySelector('[data-especificaciones]').value.trim()
    });
    message.textContent = 'Cotización actualizada.';
    renderEditor(selectedId);
  }

  function configurarFechas(fechaInicio, fechaFin) {
    const hoy = fechaLocalDeHoy();
    fechaInicio.min = hoy;
    fechaFin.min = fechaInicio.value >= hoy ? fechaInicio.value : hoy;
    fechaInicio.addEventListener('change', () => {
      fechaFin.min = fechaInicio.value || hoy;
      if (fechaFin.value && fechaFin.value < fechaFin.min) fechaFin.value = '';
    });
  }

  function fechaLocalDeHoy() {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  }

  document.getElementById('paginaSiguiente').addEventListener('click', () => window.history.forward());
  document.getElementById('cerrarSesion').addEventListener('click', OhHappyTripDB.logout);
  configurarNavegacion(document.getElementById('paginaSiguiente'));
  renderList();
  renderAccounts();

  function renderAccounts() {
    const clients = OhHappyTripDB.read().users.filter(item => item.role === 'client');
    accountsList.innerHTML = clients.length ? clients.map(client => `
      <div class="cuenta-admin-fila">
        <div class="cliente-editor">
          <span class="avatar-mini">${client.profileImage ? `<img src="${escapeHtml(client.profileImage)}" alt="">` : escapeHtml(client.name.charAt(0).toUpperCase())}</span>
          <div><strong>${escapeHtml(client.name)}</strong><small>${escapeHtml(client.username)}</small></div>
        </div>
        <button class="btn-peligro btn-pequeno" data-delete-user="${client.id}" type="button">Eliminar cuenta</button>
      </div>
    `).join('') : '<p class="editor-contador">No hay cuentas de clientes.</p>';
  }

  accountsList.addEventListener('click', event => {
    const button = event.target.closest('[data-delete-user]');
    if (!button || !window.confirm('¿Eliminar esta cuenta y sus cotizaciones?')) return;
    try {
      OhHappyTripDB.deleteUser(button.dataset.deleteUser);
      message.textContent = 'Cuenta eliminada.';
      renderList();
      renderAccounts();
    } catch (error) {
      message.textContent = error.message;
    }
  });

  function configurarNavegacion(forwardButton) {
    const update = () => {
      const navigation = window.navigation;
      forwardButton.classList.toggle('oculto', !navigation || !navigation.canGoForward);
    };
    update();
    if (window.navigation) window.navigation.addEventListener('navigate', update);
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[character]));
  }
})();
