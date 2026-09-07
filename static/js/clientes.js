// ==========================================
// CARGAR CLIENTES
// ==========================================

async function cargarClientes() {

    try {

        const respuesta = await fetch("/clientes");

        const clientes = await respuesta.json();

        if (!respuesta.ok) {

            console.error("Error al obtener clientes:", clientes);

            alert(clientes.error || "Error al cargar clientes");

            return;
        }

        const tabla = document.getElementById("tablaClientes");

        tabla.innerHTML = "";

        clientes.forEach(cliente => {

            const fila = `
                <tr>
                    <td>${cliente.id_cliente}</td>
                    <td>${cliente.nombre}</td>
                    <td>${cliente.telefono}</td>
                    <td>${cliente.correo || ""}</td>
                    <td>${cliente.direccion}</td>

                    <td>
                        <button
                            type="button"
                            onclick="editarCliente(${cliente.id_cliente})"
                        >
                            Editar
                        </button>

                        <button
                            type="button"
                            onclick="eliminarCliente(${cliente.id_cliente})"
                        >
                            Eliminar
                        </button>
                    </td>
                </tr>
            `;

            tabla.innerHTML += fila;

        });

    } catch (error) {

        console.error("Error:", error);

        alert("No se pudo conectar con el servidor");

    }

}


// ==========================================
// REGISTRAR / ACTUALIZAR CLIENTE
// ==========================================

document
    .getElementById("formularioCliente")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const formulario =
            document.getElementById("formularioCliente");

        const id =
            formulario.getAttribute("data-id");


        const cliente = {

            nombre:
                document.getElementById("nombre").value,

            telefono:
                document.getElementById("telefono").value,

            correo:
                document.getElementById("correo").value,

            direccion:
                document.getElementById("direccion").value,

            latitud:
                document.getElementById("latitud").value
                    ? parseFloat(
                        document.getElementById("latitud").value
                    )
                    : null,

            longitud:
                document.getElementById("longitud").value
                    ? parseFloat(
                        document.getElementById("longitud").value
                    )
                    : null
        };


        let url = "/clientes";

        let metodo = "POST";


        // Si existe ID → estamos editando

        if (id) {

            url = `/clientes/${id}`;

            metodo = "PUT";

        }


        try {

            const respuesta = await fetch(url, {

                method: metodo,

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(cliente)

            });


            const resultado =
                await respuesta.json();


            alert(
                resultado.mensaje ||
                resultado.error
            );


            if (respuesta.ok) {

                formulario.reset();

                formulario.removeAttribute("data-id");

                cargarClientes();

            }

        } catch (error) {

            console.error("Error:", error);

            alert(
                "No se pudo conectar con el servidor"
            );

        }

    });


// ==========================================
// EDITAR CLIENTE
// ==========================================

async function editarCliente(id) {

    try {

        const respuesta =
            await fetch(`/clientes/${id}`);


        const cliente =
            await respuesta.json();


        if (!respuesta.ok) {

            alert(
                cliente.error ||
                "No se pudo obtener el cliente"
            );

            return;
        }


        document.getElementById("nombre").value =
            cliente.nombre;

        document.getElementById("telefono").value =
            cliente.telefono;

        document.getElementById("correo").value =
            cliente.correo || "";

        document.getElementById("direccion").value =
            cliente.direccion;

        document.getElementById("latitud").value =
            cliente.latitud ?? "";

        document.getElementById("longitud").value =
            cliente.longitud ?? "";


        document
            .getElementById("formularioCliente")
            .setAttribute("data-id", id);


        // Cambiar el texto del botón

        const boton =
            document.querySelector(
                "#formularioCliente .boton"
            );


        if (boton) {

            boton.textContent =
                "Guardar cambios";

        }


        // Llevar al usuario hacia el formulario

        document
            .getElementById("formularioCliente")
            .scrollIntoView({
                behavior: "smooth"
            });


    } catch (error) {

        console.error("Error:", error);

        alert(
            "No se pudo conectar con el servidor"
        );

    }

}

// ==========================================
// ELIMINAR CLIENTE
// ==========================================

async function eliminarCliente(id) {

    const confirmar = confirm(
        "¿Está seguro de eliminar este cliente?"
    );

    if (!confirmar) {
        return;
    }

    try {

        const respuesta = await fetch(
            `/clientes/${id}`,
            {
                method: "DELETE"
            }
        );

        const resultado =
            await respuesta.json();

        alert(
            resultado.mensaje ||
            resultado.error
        );

        if (respuesta.ok) {

            cargarClientes();

        }

    } catch (error) {

        console.error("Error:", error);

        alert(
            "No se pudo conectar con el servidor"
        );

    }

}


// ==========================================
// CARGAR CLIENTES AL INICIAR
// ==========================================

cargarClientes();