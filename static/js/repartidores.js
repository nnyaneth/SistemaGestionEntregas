// ==========================================
// CARGAR REPARTIDORES
// ==========================================
async function cargarRepartidores() {
    try {
        const respuesta = await fetch("/repartidores");
        const repartidores = await respuesta.json();

        if (!respuesta.ok) {
            alert(repartidores.error || "Error al cargar repartidores");
            return;
        }

        const tabla = document.getElementById("tabla-repartidores");
        tabla.innerHTML = "";

        if (repartidores.length === 0) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No hay repartidores registrados.</td>
                </tr>
            `;
            return;
        }

        repartidores.forEach(repartidor => {
            let claseEstado = (repartidor.estado === "Disponible") ? "estado-disponible" : "estado-ocupado";

            const fila = `
                <tr>
                    <td>${repartidor.id_repartidor}</td>
                    <td><strong>${repartidor.nombre}</strong></td>
                    <td>${repartidor.telefono}</td>
                    <td>
                        <span class="estado-repartidor ${claseEstado}">
                            <span class="punto-estado"></span>
                            ${repartidor.estado}
                        </span>
                    </td>
                    <td class="text-center">
                        <div class="acciones-contenedor">
                            <button type="button" class="btn-accion btn-editar" title="Editar" onclick="editarRepartidor(${repartidor.id_repartidor})">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button type="button" class="btn-accion btn-eliminar" title="Eliminar" onclick="abrirModalEliminar(${repartidor.id_repartidor})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;

            tabla.innerHTML += fila;
        });

    } catch (error) {
        console.error(error);
        alert("No se pudo conectar con el servidor");
    }
}


// ==========================================
// REGISTRAR / ACTUALIZAR REPARTIDOR
// ==========================================
async function registrarRepartidor(event) {
    event.preventDefault();

    const formulario = event.target;
    const id = formulario.getAttribute("data-id");

    const repartidor = {
        nombre: document.getElementById("nombre").value.trim(),
        telefono: document.getElementById("telefono").value.trim()
    };

    let url = "/repartidores";
    let metodo = "POST";

    if (id) {
        url = `/repartidores/${id}`;
        metodo = "PUT";
    }

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(repartidor)
        });

        const resultado = await respuesta.json();

        alert(resultado.mensaje || resultado.error);

        if (respuesta.ok) {
            formulario.reset();
            formulario.removeAttribute("data-id");

            const boton = formulario.querySelector("button[type='submit']");
            boton.innerHTML = `<i class="bi bi-plus-lg"></i> Registrar repartidor`;

            cargarRepartidores();
        }

    } catch (error) {
        console.error(error);
        alert("No se pudo conectar con el servidor");
    }
}


// ==========================================
// EDITAR REPARTIDOR
// ==========================================
async function editarRepartidor(id) {
    try {
        const respuesta = await fetch(`/repartidores/${id}`);
        const repartidor = await respuesta.json();

        if (!respuesta.ok) {
            alert(repartidor.error);
            return;
        }

        document.getElementById("nombre").value = repartidor.nombre;
        document.getElementById("telefono").value = repartidor.telefono;

        const formulario = document.querySelector(".form-body");
        formulario.setAttribute("data-id", id);

        const boton = formulario.querySelector("button[type='submit']");
        boton.innerHTML = `<i class="bi bi-check-lg"></i> Guardar cambios`;

        formulario.scrollIntoView({ behavior: "smooth" });

    } catch (error) {
        console.error(error);
        alert("No se pudo conectar con el servidor");
    }
}


// ==========================================
// ELIMINAR REPARTIDOR (CON MODAL)
// ==========================================
let repartidorAEliminarId = null;

function abrirModalEliminar(id) {
    repartidorAEliminarId = id;
    document.getElementById("modal-eliminar").style.display = "flex";
}

function cerrarModalEliminar() {
    repartidorAEliminarId = null;
    document.getElementById("modal-eliminar").style.display = "none";
}

document.getElementById("btn-confirmar-eliminar").addEventListener("click", async () => {
    if (!repartidorAEliminarId) return;

    try {
        const respuesta = await fetch(`/repartidores/${repartidorAEliminarId}`, {
            method: "DELETE"
        });

        const resultado = await respuesta.json();

        alert(resultado.mensaje || resultado.error);

        if (respuesta.ok) {
            cerrarModalEliminar();
            cargarRepartidores();
        }

    } catch (error) {
        console.error(error);
        alert("No se pudo conectar con el servidor");
    }
});


// ==========================================
// INICIAR
// ==========================================
cargarRepartidores();