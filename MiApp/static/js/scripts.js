/*SECCION PARA NOTICIAS-TUTORIAS***********************************************************/
document.addEventListener('DOMContentLoaded', () => {
    const tutoriasContainer = document.getElementById('tutorias-container');
    const viewLargeButton = document.getElementById('view-large');
    const viewSmallButton = document.getElementById('view-small');
    const itemsPerPageSelect = document.getElementById('items-per-page');
    const paginationButtons = document.querySelector('.pagination-container');
    const totalTutoriasElement = document.getElementById('total-tutorias');
    const currentPageElement = document.getElementById('current-page');
    const searchInput = document.getElementById('search-input'); // Campo de búsqueda

    let tutorias = [];
    let filteredTutorias = [];
    let currentPage = 1;
    let itemsPerPage = 5;
    let currentView = 'large';

    // Función para cargar las tutorías desde el backend
    const fetchTutorias = async () => {
        try {
            const response = await fetch('/obtener_tutorias/');
            const data = await response.json();
            tutorias = data;
            filteredTutorias = tutorias; // Inicialmente, no hay filtro
            totalTutoriasElement.textContent = `Total: ${filteredTutorias.length} tutorías disponibles`;
            renderTutorias();
        } catch (error) {
            console.error('Error al cargar las tutorías:', error);
        }
    };

    // Filtrar tutorías por nombre o descripción
    const filterTutorias = (searchTerm) => {
        if (searchTerm) {
            filteredTutorias = tutorias.filter(tutoria =>
                tutoria.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tutoria.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
            );
        } else {
            filteredTutorias = tutorias; // Si no hay texto en la búsqueda, mostrar todas
        }
        totalTutoriasElement.textContent = `Total: ${filteredTutorias.length} tutorías disponibles`;
        currentPage = 1; // Reiniciar a la primera página cuando se realice un filtro
        renderTutorias();
    };

    // Resaltar coincidencias en el texto
    const highlightText = (text, searchTerm) => {
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>'); // Subraya el texto coincidente
    };

    // Renderizar las tutorías
    const renderTutorias = () => {
        tutoriasContainer.innerHTML = '';
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedTutorias = filteredTutorias.slice(start, end);

        // Calcular el número de columnas basado en la raíz cuadrada de la cantidad total de tutorías
        const columns = Math.sqrt(filteredTutorias.length);
        const columnCount = Math.ceil(columns); // Redondear hacia arriba para obtener el número entero
        tutoriasContainer.style.gridTemplateColumns = `repeat(${columnCount}, 1fr)`; // Cambiar el número de columnas en CSS

        paginatedTutorias.forEach(tutoria => {
            const title = highlightText(tutoria.titulo, searchInput.value); // Resaltar coincidencias en el título
            const description = highlightText(tutoria.descripcion, searchInput.value); // Resaltar coincidencias en la descripción

            if (currentView === 'large') {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <h3>${title}</h3>
                    <p>${description}</p>
                    <p><strong>Duración:</strong> ${tutoria.duracion} minutos</p>
                    <p><strong>Precio:</strong> ${tutoria.precio ? formatPrice(tutoria.precio) : 'Gratis'}</p>
                    <button class="btn btn-primary">Inscribirse</button>
                `;
                tutoriasContainer.appendChild(card);
            } else {
                const cardSmall = document.createElement('div');
                cardSmall.className = 'card-small';
                cardSmall.innerHTML = `
                    <h3>${title}</h3>
                    <span>${tutoria.precio ? formatPrice(tutoria.precio) : 'Gratis'}</span>
                `;
                cardSmall.addEventListener('click', () => {
                    currentView = 'large';
                    renderTutorias();
                });
                tutoriasContainer.appendChild(cardSmall);
            }
        });

        renderPagination();
    };

    // Renderizar los controles de paginación
    const renderPagination = () => {
        paginationButtons.innerHTML = '';
        const totalPages = Math.ceil(filteredTutorias.length / itemsPerPage);

        // Botón "Anterior"
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Anterior';
        prevButton.className = 'btn';
        prevButton.disabled = currentPage === 1; // Desactivar si estamos en la primera página
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--; // Decrementar página actual
                renderTutorias();
            }
        });
        paginationButtons.appendChild(prevButton);

        // Botón "Siguiente"
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Siguiente';
        nextButton.className = 'btn';
        nextButton.disabled = currentPage === totalPages; // Desactivar si estamos en la última página
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++; // Incrementar página actual
                renderTutorias();
            }
        });
        paginationButtons.appendChild(nextButton);

        // Actualizar el número de la página actual
        currentPageElement.textContent = currentPage;
    };

    // Alternar entre vistas
    viewLargeButton.addEventListener('click', () => {
        currentView = 'large';
        updateViewButtons();
        renderTutorias();
    });

    viewSmallButton.addEventListener('click', () => {
        currentView = 'small';
        updateViewButtons();
        renderTutorias();
    });

    // Actualizar el estilo de los botones de vista
    const updateViewButtons = () => {
        viewLargeButton.classList.toggle('active', currentView === 'large');
        viewSmallButton.classList.toggle('active', currentView === 'small');
    };

    // Actualizar el número de elementos por página
    itemsPerPageSelect.addEventListener('change', () => {
        itemsPerPage = parseInt(itemsPerPageSelect.value, 10); // Obtener el valor seleccionado
        currentPage = 1; // Reiniciar a la primera página
        renderTutorias();
    });

    // Formatear precios
    const formatPrice = (price) => {
        return parseFloat(price).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        });
    };

    // Buscar tutorías cuando el usuario escriba en el campo de búsqueda
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.trim();
        filterTutorias(searchTerm);
    });

    // Inicializar
    fetchTutorias();
});

// Abrir el modal al hacer clic en el botón "Solicitar Tutoría"
document.getElementById('request-tutoria-btn').addEventListener('click', () => {
    document.getElementById('requestTutoriaModal').style.display = 'block'; // Mostrar el modal
});

// Cerrar el modal al hacer clic en el botón de cerrar (x)
document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('requestTutoriaModal').style.display = 'none'; // Ocultar el modal
});

// Manejar el envío del formulario
document.getElementById('request-tutoria-form').addEventListener('submit', (e) => {
    e.preventDefault(); // Prevenir el envío del formulario

    const tutoriaName = document.getElementById('tutoria-name').value;
    const tutoriaDescription = document.getElementById('tutoria-description').value;

    if (tutoriaName && tutoriaDescription) {
        // Aquí puedes hacer algo con los datos, como enviarlos al servidor
        console.log('Nombre de tutoría:', tutoriaName);
        console.log('Descripción:', tutoriaDescription);

        // Cerrar el modal después de enviar la solicitud
        document.getElementById('requestTutoriaModal').style.display = 'none';

        // Puedes agregar un mensaje de éxito aquí
        alert('¡Solicitud enviada correctamente!');
    } else {
        alert('Por favor, completa ambos campos.');
    }
});
/*SECCION PARA NOTICIAS-TUTORIAS***********************************************************/

/*SECCION PARA LOGIN***********************************************************/

function togglePassword() {
    const passwordField = document.getElementById('password');
    const icon = document.querySelector('.password-toggle-icon');
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.textContent = '🙈'; // Cambia el icono
    } else {
        passwordField.type = 'password';
        icon.textContent = '👁️'; // Cambia el icono
    }
}




/*SECCION PARA LOGIN***********************************************************/

/*SECCION PARA POLITICAS DE SEGURIDAD***********************************************************/

document.addEventListener('DOMContentLoaded', () => {
    const acceptBtn = document.getElementById('accept-btn');
    const thankYouMessage = document.getElementById('thank-you-message');

    // Evento para mostrar el mensaje de agradecimiento
    acceptBtn.addEventListener('click', () => {
        // Mostrar mensaje de agradecimiento
        thankYouMessage.style.display = 'block';

        // Cambiar el texto y el color del botón
        acceptBtn.textContent = 'Política Aceptada';
        acceptBtn.style.backgroundColor = '#6c757d'; // Color gris para indicar que ya fue aceptado
        acceptBtn.disabled = true; // Deshabilitar el botón después de hacer clic
    });
});


/*SECCION PARA POLITICAS DE SEGURIDAD***********************************************************/


// Mostrar alerta personalizada
function showAlert(message, type = 'success') {
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert alert-${type} alert-dismissible fade show`;
    alertContainer.role = 'alert';
    alertContainer.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertContainer);

    // Eliminar automáticamente después de 5 segundos
    setTimeout(() => {
        alertContainer.remove();
    }, 5000);
}

// Efecto hover en botones
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach((button) => {
        button.addEventListener('mouseover', () => {
            button.style.transform = 'scale(1.1)';
        });

        button.addEventListener('mouseout', () => {
            button.style.transform = 'scale(1)';
        });
    });
});

// Validación de formularios
document.addEventListener('submit', (event) => {
    const form = event.target;
    if (form.tagName === 'FORM') {
        const inputs = form.querySelectorAll('input, textarea');
        let valid = true;

        inputs.forEach((input) => {
            if (!input.value.trim()) {
                valid = false;
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
            }
        });

        if (!valid) {
            event.preventDefault(); // Detener envío si no es válido
            showAlert('Por favor, completa todos los campos requeridos.', 'danger');
        }
    }
});
