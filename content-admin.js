(function () {
  const pages = [
    { file: 'index.html', label: 'Inicio' },
    { file: 'disney.html', label: 'Disney' },
    { file: 'universal.html', label: 'Universal' },
    { file: 'cruceros.html', label: 'Cruceros' },
    { file: 'playas.html', label: 'Playas' },
    { file: 'certificate.html', label: 'Certificado' }
  ];
  const select = document.getElementById('contenidoPagina');
  const editor = document.getElementById('contenidoEditor');
  const notice = document.getElementById('contenidoMensaje');

  pages.forEach(page => {
    const option = document.createElement('option');
    option.value = page.file;
    option.textContent = page.label;
    select.appendChild(option);
  });
  select.addEventListener('change', loadPage);
  loadPage();

  async function loadPage() {
    editor.innerHTML = '<p class="editor-contador">Cargando contenido...</p>';
    try {
      const response = await fetch(select.value);
      if (!response.ok) throw new Error('No se pudo cargar la página.');
      const html = await response.text();
      const documentToScan = new DOMParser().parseFromString(html, 'text/html');
      renderFields(select.value, OhHappyTripContent.collect(documentToScan));
    } catch (error) {
      editor.textContent = error.message;
    }
  }

  function renderFields(page, fields) {
    const saved = OhHappyTripContent.read()[page] || {};
    editor.innerHTML = '';
    if (!fields.length) {
      editor.innerHTML = '<p class="editor-contador">No hay contenido editable en esta página.</p>';
      return;
    }
    fields.forEach((field, index) => {
      const current = saved[index] || field;
      const card = document.createElement('div');
      card.className = 'contenido-campo';
      const label = document.createElement('label');
      label.textContent = field.type === 'image' ? `Imagen ${index + 1}` : `Texto ${index + 1}`;
      const input = field.type === 'image' ? document.createElement('input') : document.createElement('textarea');
      input.dataset.index = index;
      input.value = current.value;
      if (field.type === 'image') {
        input.type = 'url';
        input.placeholder = 'URL de imagen';
      } else {
        input.rows = 3;
      }
      card.append(label, input);
      if (field.type === 'image') {
        const file = document.createElement('input');
        file.type = 'file';
        file.accept = 'image/png,image/jpeg,image/webp,image/gif';
        file.addEventListener('change', () => {
          const selected = file.files[0];
          if (!selected) return;
          if (selected.size > 2 * 1024 * 1024) {
            notice.textContent = 'Cada imagen debe pesar menos de 2 MB.';
            file.value = '';
            return;
          }
          const reader = new FileReader();
          reader.onload = () => { input.value = reader.result; };
          reader.readAsDataURL(selected);
        });
        card.appendChild(file);
        const alt = document.createElement('input');
        alt.type = 'text';
        alt.placeholder = 'Texto alternativo (accesibilidad)';
        alt.value = current.alt || field.alt || '';
        alt.dataset.alt = index;
        card.appendChild(alt);
      }
      editor.appendChild(card);
    });
    const save = document.createElement('button');
    save.className = 'btn-guardar';
    save.type = 'button';
    save.textContent = 'Guardar cambios de esta página';
    save.addEventListener('click', () => savePage(page, fields));
    editor.appendChild(save);
  }

  function savePage(page, fields) {
    const data = OhHappyTripContent.read();
    data[page] = {};
    editor.querySelectorAll('[data-index]').forEach(input => {
      const index = Number(input.dataset.index);
      data[page][index] = {
        ...fields[index],
        value: input.value,
        alt: editor.querySelector(`[data-alt="${index}"]`)?.value || fields[index].alt || ''
      };
    });
    OhHappyTripContent.write(data);
    notice.textContent = 'Contenido guardado. Abre la página para ver los cambios.';
  }
})();
