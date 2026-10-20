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
function manejarDestino(destino) {
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

// Evento de envío del formulario
document.getElementById('formCotizacion').addEventListener('submit', function(e) {
    e.preventDefault();
    alert("¡Cotización guardada exitosamente!");
    // Aquí va tu lógica de envío (fetch, base de datos, etc.)
});