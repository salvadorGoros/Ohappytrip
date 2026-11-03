// Función para aumentar o disminuir los contadores
function actualizarContador(id, operacion) {
    let input = document.getElementById(id);
    let valorActual = parseInt(input.value) || 0;
    let min = parseInt(input.min) || 0; // Toma el valor mínimo permitido (Ej: Adultos min 1, Niños min 0)
    
    if (operacion === 'incrementar') {
        input.value = valorActual + 1;
    } else if (operacion === 'decrementar' && valorActual > min) {
        input.value = valorActual - 1;
    }

    // MAGIA: Si el contador que se modificó fue el de niños, dibujamos las edades
    if (id === 'ninos') {
        generarCamposEdades(parseInt(input.value));
    }
}

// Función que crea los inputs de edades dinámicamente
function generarCamposEdades(cantidad) {
    const contenedor = document.getElementById('contenedor_edades_ninos');
    contenedor.innerHTML = ''; // Limpiar los campos anteriores

    for (let i = 1; i <= cantidad; i++) {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.flexDirection = 'column';

        const label = document.createElement('label');
        label.innerText = `Edad niño ${i}`;
        label.style.fontSize = '0.85rem';
        label.style.color = '#00e5ff'; // Color turquesa para que combine

        const input = document.createElement('input');
        input.type = 'number';
        input.name = `edad_nino_${i}`;
        input.min = '1';
        input.max = '17';
        input.placeholder = 'Ej. 8';
        input.required = true;
        
        // Estilos para que combine con el formulario oscuro
        input.style.background = 'rgba(0, 0, 0, 0.4)';
        input.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        input.style.color = 'white';
        input.style.padding = '8px 10px';
        input.style.borderRadius = '8px';
        input.style.marginTop = '5px';
        input.style.outline = 'none';
        
        // REGLA ESTRICTA: Bloquear puntos, comas, signos y letras para forzar solo números enteros
        input.oninput = function() {
            this.value = this.value.replace(/[^0-9]/g, ''); // Elimina cualquier cosa que no sea dígito
        };

        // Efecto focus para que brille igual que los demás inputs
        input.onfocus = function() {
            this.style.borderColor = '#00e5ff';
            this.style.boxShadow = '0 0 10px rgba(0, 229, 255, 0.3)';
        };
        input.onblur = function() {
            this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            this.style.boxShadow = 'none';
        };

        div.appendChild(label);
        div.appendChild(input);
        contenedor.appendChild(div);
    }
}

// Función para mostrar las opciones según el destino
async function manejarDestino(destino) {
    if (destino === 'orlando' || destino === 'california') {
        const confirmado = await solicitarDocumentos();
        if (!confirmado) {
            alert('No puedes continuar con este destino sin visa y pasaporte vigentes para todas las personas viajeras.');
            document.getElementById('destino').value = '';
            destino = '';
        }
    }

    function solicitarDocumentos() {
        const modal = document.getElementById('documentosModal');
        const aceptar = document.getElementById('documentosSi');
        const rechazar = document.getElementById('documentosNo');
        modal.classList.remove('oculto');
        aceptar.focus();
        return new Promise(resolve => {
            const cerrar = resultado => {
                modal.classList.add('oculto');
                aceptar.removeEventListener('click', aceptarHandler);
                rechazar.removeEventListener('click', rechazarHandler);
                resolve(resultado);
            };
            const aceptarHandler = () => cerrar(true);
            const rechazarHandler = () => cerrar(false);
            aceptar.addEventListener('click', aceptarHandler);
            rechazar.addEventListener('click', rechazarHandler);
        });
    }

    // 1. Ocultar absolutamente todas las sub-opciones
    document.querySelectorAll('.sub-opcion').forEach(elemento => {
        elemento.classList.add('oculto');
    });
    
    // 2. Ocultar todas las opciones de hospedaje
    document.getElementById('seccion_hospedaje').classList.add('oculto');
    document.getElementById('hospedaje_parques').classList.add('oculto');
    document.getElementById('hospedaje_playas').classList.add('oculto');
    
    if (!destino) return; // Si no hay nada, terminar
    
    // 3. Mostrar la sub-sección correcta
    let subMenuId = 'sub_' + destino;
    let subMenu = document.getElementById(subMenuId);
    if (subMenu) {
        subMenu.classList.remove('oculto');
    }

    // 4. Mostrar el hospedaje correcto (Los cruceros ya incluyen hospedaje, se omite)
    if (destino === 'orlando' || destino === 'california') {
        document.getElementById('seccion_hospedaje').classList.remove('oculto');
        document.getElementById('hospedaje_parques').classList.remove('oculto');
    } else if (destino === 'playas') {
        document.getElementById('seccion_hospedaje').classList.remove('oculto');
        document.getElementById('hospedaje_playas').classList.remove('oculto');
    }
}

(function () {
    const user = OhHappyTripDB.currentUser();
    const form = document.getElementById('formCotizacion');
    const sessionBar = document.getElementById('sesionCliente');
    const quotesSection = document.getElementById('misCotizaciones');
    const list = document.getElementById('listaCliente');
    const newQuoteButton = document.getElementById('nuevaCotizacion');
    const clienteAvanzar = document.getElementById('clienteAvanzar');
    const statusLabels = {
        pendiente: 'Pendiente',
        en_revision: 'En revisión',
        lista: 'Lista para el cliente',
        revisada: 'En revisión',
        check: 'Lista para el cliente'
    };

    if (!user || user.role !== 'client') {
        window.location.href = user && user.role === 'admin' ? 'admin.html' : 'auth.html';
        return;
    }

    sessionBar.innerHTML = `Hola, <strong>${escapeHtml(user.name)}</strong> · <button id="cerrarSesionCotizar" type="button">Cerrar sesión</button>`;
    document.getElementById('cerrarSesionCotizar').addEventListener('click', OhHappyTripDB.logout);
    document.getElementById('nombre').value = user.name;
    document.getElementById('nombre').readOnly = true;
    form.classList.add('oculto');
    configurarFechas(document.getElementById('fechaInicio'), document.getElementById('fechaFin'));
    configurarNavegacion(clienteAvanzar);
    renderQuotes();

    form.addEventListener('submit', event => {
        event.preventDefault();
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        const values = new FormData(form);
        const quote = {
            id: crypto.randomUUID(),
            userId: user.id,
            clientName: user.name,
            clientUsername: user.username,
            paisSalida: values.get('paisSalida'),
            adultos: Number(values.get('adultos')),
            ninos: Number(values.get('ninos')),
            edades: Array.from({ length: Number(values.get('ninos')) }, (_, index) => values.get(`edad_nino_${index + 1}`)).filter(Boolean),
            destino: values.get('destino'),
            parques: values.getAll('parques'),
            cruceros: values.getAll('cruceros'),
            playaEspecifica: values.get('playaEspecifica'),
            hospedaje: values.get('hospedaje'),
            fechaInicio: values.get('fechaInicio'),
            fechaFin: values.get('fechaFin'),
            especificaciones: values.get('especificaciones'),
            status: 'pendiente',
            adminMessage: '',
            createdAt: new Date().toISOString()
        };
        OhHappyTripDB.addQuote(quote);
        form.reset();
        document.querySelectorAll('.sub-opcion').forEach(element => element.classList.add('oculto'));
        document.getElementById('seccion_hospedaje').classList.add('oculto');
        renderQuotes();
        form.classList.add('oculto');
        alert('¡Cotización guardada en tu perfil!');
    });

    newQuoteButton.addEventListener('click', () => {
        form.classList.remove('oculto');
        form.scrollIntoView({ behavior: 'smooth' });
    });

    function configurarNavegacion(forwardButton) {
        const update = () => {
            const navigation = window.navigation;
            forwardButton.classList.toggle('oculto', !navigation || !navigation.canGoForward);
        };
        update();
        if (window.navigation) window.navigation.addEventListener('navigate', update);
    }

    function renderQuotes() {
        const quotes = OhHappyTripDB.read().quotes.filter(quote => quote.userId === user.id);
        list.innerHTML = quotes.length ? quotes.map(quote => `
            <article class="cotizacion-card">
              <div class="cotizacion-card-cabecera">
                <h3>${escapeHtml(quote.destino)}</h3>
                <span class="estado estado-${quote.status}">${statusLabels[quote.status] || 'Pendiente'}</span>
              </div>
              <p><strong>Fechas:</strong> ${escapeHtml(quote.fechaInicio)} a ${escapeHtml(quote.fechaFin)}</p>
              <p><strong>Viajeros:</strong> ${quote.adultos} adulto(s), ${quote.ninos} menor(es)</p>
              ${quote.adminMessage ? `<p class="mensaje-admin"><strong>Mensaje de Oh Happy Trip:</strong><br>${escapeHtml(quote.adminMessage)}</p>` : '<p class="mensaje-pendiente">Aún no hay mensajes del equipo.</p>'}
            </article>
        `).join('') : '<div class="estado-vacio">Aún no tienes cotizaciones. Usa el botón + para crear la primera.</div>';
    }

    function configurarFechas(fechaInicio, fechaFin) {
        const hoy = fechaLocalDeHoy();
        fechaInicio.min = hoy;
        fechaFin.min = hoy;
        fechaInicio.addEventListener('change', () => {
            fechaFin.min = fechaInicio.value || hoy;
            if (fechaFin.value && fechaFin.value < fechaFin.min) {
                fechaFin.value = '';
            }
            fechaFin.setCustomValidity('');
        });
        fechaFin.addEventListener('change', () => {
            fechaFin.setCustomValidity(fechaFin.value && fechaInicio.value && fechaFin.value < fechaInicio.value
                ? 'La fecha de fin no puede ser anterior a la fecha de inicio.'
                : '');
        });
    }

    function fechaLocalDeHoy() {
        const hoy = new Date();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        return `${hoy.getFullYear()}-${mes}-${dia}`;
    }

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, character => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        }[character]));
    }
})();