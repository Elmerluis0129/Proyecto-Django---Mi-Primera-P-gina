document.addEventListener('DOMContentLoaded', () => {
    const tutoriasContainer = document.getElementById('tutorias-container');
    const viewLargeButton = document.getElementById('view-large');
    const viewSmallButton = document.getElementById('view-small');
    const itemsPerPageSelect = document.getElementById('items-per-page');
    const paginationButtons = document.querySelector('.pagination-container');
    const totalTutoriasElement = document.getElementById('total-tutorias');
    const currentPageElement = document.getElementById('current-page');
    const searchInput = document.getElementById('search-input'); // Campo de búsqueda
    const requestTutoriaBtn = document.getElementById('request-tutoria-btn'); // Botón para abrir el modal
    const requestTutoriaModalElement = document.getElementById('solicitarTutoriaModal'); // Modal
    const formSolicitarTutoria = document.getElementById('form-solicitar-tutoria'); // Formulario

    let tutorias = [];
    let filteredTutorias = [];
    let currentPage = 1;
    let itemsPerPage = 5;
    let currentView = 'large';
    let expandedTutoriaId = null; // Almacena el ID de la tutoría en "Vista Grande"

    // Función para cargar las tutorías desde el backend
    const fetchTutorias = async () => {
        try {
            const response = await fetch('/obtener_tutorias/');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            tutorias = data;
            filteredTutorias = tutorias;
            totalTutoriasElement.textContent = `Total: ${filteredTutorias.length} tutorías disponibles`; // Actualiza el total
            renderTutorias();
        } catch (error) {
            console.error('Error al cargar las tutorías:', error);
        }
    };

    // Resaltar coincidencias en el texto
    const highlightText = (text, searchTerm) => {
        const regex = new RegExp(`(${searchTerm})`, 'gi'); // Utilizamos una expresión regular que no distinga entre mayúsculas y minúsculas
        return text.replace(regex, '<span class="highlight">$1</span>'); // Subraya el texto coincidente
    };

    // Función para calcular las columnas basadas en la raíz cuadrada
    const calculateColumns = (totalItems) => {
        const columns = Math.ceil(Math.sqrt(totalItems)); // Calcula la raíz cuadrada y redondea hacia arriba
        return columns;
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
        renderTutorias(searchTerm); // Pasamos el término de búsqueda a la función render
    };

    // Renderizar las tutorías y resaltar las coincidencias
    const renderTutorias = (searchTerm) => {
        tutoriasContainer.innerHTML = ''; // Limpiar contenedor
        const columns = calculateColumns(filteredTutorias.length); // Calcula el número de columnas
        tutoriasContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`; // Define el número de columnas en CSS Grid

        const paginatedTutorias = filteredTutorias.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );

        paginatedTutorias.forEach(tutoria => {
            const title = highlightText(tutoria.titulo, searchTerm); // Resaltar coincidencias en el título
            const description = highlightText(tutoria.descripcion, searchTerm); // Resaltar coincidencias en la descripción

            if (currentView === 'small' && expandedTutoriaId !== tutoria.id) {
                const cardSmall = document.createElement('div');
                cardSmall.className = 'card-small';
                cardSmall.innerHTML = `
                    <h3>${title}</h3>
                    <p><strong>Precio:</strong> ${tutoria.precio || 'Gratis'}</p>
                `;
                cardSmall.addEventListener('click', () => {
                    expandedTutoriaId = tutoria.id;
                    renderTutorias();
                });
                tutoriasContainer.appendChild(cardSmall);
            } else {
                const cardLarge = document.createElement('div');
                cardLarge.className = 'card';
                cardLarge.innerHTML = `
                    <h3>${title}</h3>
                    <p>${description}</p>
                    <p><strong>Duración:</strong> ${tutoria.duracion_con_unidad || 'No disponible'}</p>
                    <p><strong>Precio:</strong> ${tutoria.precio || 'Gratis'}</p>
                `;
                cardLarge.addEventListener('click', () => {
                    expandedTutoriaId = null;
                    renderTutorias();
                });
                tutoriasContainer.appendChild(cardLarge);
            }
        });

        renderPagination(); // Actualizar paginación
    };

    const updateViewButtons = () => {
        viewLargeButton.classList.toggle('active', currentView === 'large');
        viewSmallButton.classList.toggle('active', currentView === 'small');
    };

    // Alternar entre vistas
    viewLargeButton.addEventListener('click', () => {
        currentView = 'large';
        updateViewButtons(); // Actualizar los estilos de los botones
        renderTutorias();    // Renderizar las tutorías en vista grande
    });

    viewSmallButton.addEventListener('click', () => {
        currentView = 'small';
        updateViewButtons(); // Actualizar los estilos de los botones
        renderTutorias();    // Renderizar las tutorías en vista pequeña
    });

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

    // Función para abrir el modal
    const openModal = () => {
        requestTutoriaModalElement.style.display = 'block'; // Mostrar el modal
    };

    // Función para cerrar el modal
    const closeModal = () => {
        requestTutoriaModalElement.style.display = 'none'; // Ocultar el modal
    };

    // Lógica del botón de solicitud de tutoría
    if (requestTutoriaBtn) {
        requestTutoriaBtn.addEventListener('click', openModal); // Al hacer clic, abre el modal
    }

    // Lógica del botón de cierre del modal
    const closeModalBtn = document.getElementById('close-modal'); // Botón de cierre
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal); // Al hacer clic, cierra el modal
    }

    // Lógica del formulario de solicitud de tutoría
    if (formSolicitarTutoria) {
        formSolicitarTutoria.addEventListener('submit', (event) => {
            event.preventDefault();

            const nombreTutoria = document.getElementById('nombre-tutoria').value.trim();
            const descripcionTutoria = document.getElementById('descripcion-tutoria').value.trim();
            const horarioDisponible = document.getElementById('horario-disponible').value;

            if (!nombreTutoria || !descripcionTutoria || !horarioDisponible) {
                alert('Por favor, completa todos los campos.');
                return;
            }

            alert('¡Solicitud enviada correctamente!');
            formSolicitarTutoria.reset(); // Limpiar el formulario
            closeModal(); // Cerrar el modal
        });
    }

    // Inicializar
    fetchTutorias();

    // Buscar tutorías cuando el usuario escriba en el campo de búsqueda
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.trim();
        filterTutorias(searchTerm);
    });
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
