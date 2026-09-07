// ==========================================
// NOTIFICACIONES DEL SISTEMA
// ==========================================

function mostrarNotificacion(
    mensaje,
    titulo = "Información",
    tipo = "info"
) {

    const overlay =
        document.getElementById(
            "notificacionSistema"
        );

    const tituloElemento =
        document.getElementById(
            "notificacionTitulo"
        );

    const mensajeElemento =
        document.getElementById(
            "notificacionMensaje"
        );

    const icono =
        document.getElementById(
            "notificacionIcono"
        );

    const acciones =
        document.getElementById(
            "notificacionAcciones"
        );


    tituloElemento.textContent =
        titulo;

    mensajeElemento.textContent =
        mensaje;


    if (tipo === "error") {

        icono.innerHTML =
            '<i class="fa-solid fa-circle-exclamation"></i>';

    }

    else if (tipo === "success") {

        icono.innerHTML =
            '<i class="fa-solid fa-circle-check"></i>';

    }

    else if (tipo === "warning") {

        icono.innerHTML =
            '<i class="fa-solid fa-triangle-exclamation"></i>';

    }

    else {

        icono.innerHTML =
            '<i class="fa-solid fa-circle-info"></i>';

    }


    acciones.innerHTML = `

        <button
            type="button"
            class="boton boton-principal"
            onclick="cerrarNotificacion()"
        >
            Aceptar
        </button>

    `;


    overlay.classList.add("activa");

}


function cerrarNotificacion() {

    document
        .getElementById("notificacionSistema")
        .classList.remove("activa");

}

// ==========================================
// MAPA DE ENTREGA
// ==========================================

let mapaEntrega = null;
let marcadorOrigen = null;
let marcadorDestino = null;
let lineaRuta = null;


// Coordenadas FIJAS del local
const LAT_ORIGEN = -10.664318012426412;
const LON_ORIGEN = -76.253655557701;


// ==========================================
// INICIALIZAR MAPA
// ==========================================

function inicializarMapa() {

    if (mapaEntrega) {
        return;
    }

    mapaEntrega = L.map("mapaEntrega").setView(
        [LAT_ORIGEN, LON_ORIGEN],
        14
    );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                '&copy; OpenStreetMap contributors'
        }
    ).addTo(mapaEntrega);


    marcadorOrigen = L.marker([
        LAT_ORIGEN,
        LON_ORIGEN
    ])
    .addTo(mapaEntrega)
    .bindPopup(
        "<b>Origen</b><br>Jr. Hilario Cabrera 201"
    );
}

// ==========================================
// NOTIFICACIONES DEL SISTEMA
// ==========================================

function mostrarNotificacion(
    mensaje,
    titulo = "Información",
    tipo = "info"
) {

    const overlay =
        document.getElementById(
            "notificacionSistema"
        );

    const tituloElemento =
        document.getElementById(
            "notificacionTitulo"
        );

    const mensajeElemento =
        document.getElementById(
            "notificacionMensaje"
        );

    const icono =
        document.getElementById(
            "notificacionIcono"
        );


    tituloElemento.textContent =
        titulo;

    mensajeElemento.textContent =
        mensaje;


    if (tipo === "error") {

        icono.innerHTML =
            '<i class="fa-solid fa-circle-exclamation"></i>';

    }

    else if (tipo === "success") {

        icono.innerHTML =
            '<i class="fa-solid fa-circle-check"></i>';

    }

    else if (tipo === "warning") {

        icono.innerHTML =
            '<i class="fa-solid fa-triangle-exclamation"></i>';

    }

    else {

        icono.innerHTML =
            '<i class="fa-solid fa-circle-info"></i>';

    }


    overlay.classList.add("activa");

}


function cerrarNotificacion() {

    document
        .getElementById("notificacionSistema")
        .classList.remove("activa");

}

// ==========================================
// CARGAR ENTREGAS
// ==========================================

async function cargarEntregas() {

    const respuesta = await fetch("/entregas");

    const entregas = await respuesta.json();

    const tabla =
        document.getElementById("tablaEntregas");

    tabla.innerHTML = "";


    entregas.forEach(entrega => {

        const fila = `

            <tr>

                <td>
                    ${entrega.id_entrega}
                </td>

                <td>
                    ${entrega.id_pedido}
                </td>

                <td>
                    ${entrega.id_repartidor}
                </td>

                <td>
                    ${entrega.direccion_destino}
                </td>

                <td>
                    ${entrega.distancia_km ?? "-"} km
                </td>

                <td>
                    ${entrega.duracion_min ?? "-"} min
                </td>

                <td>

                    <select
                        onchange="cambiarEstadoEntrega(
                            ${entrega.id_entrega},
                            this.value
                        )"
                    >

                        <option
                            value="Pendiente"
                            ${entrega.estado === "Pendiente" ? "selected" : ""}
                        >
                            Pendiente
                        </option>

                        <option
                            value="En camino"
                            ${entrega.estado === "En camino" ? "selected" : ""}
                        >
                            En camino
                        </option>

                        <option
                            value="Entregado"
                            ${entrega.estado === "Entregado" ? "selected" : ""}
                        >
                            Entregado
                        </option>

                    </select>

                </td>

                <td>

                    <button
                        onclick="eliminarEntrega(${entrega.id_entrega})"
                    >
                        Eliminar
                    </button>

                </td>

            </tr>

        `;

        tabla.innerHTML += fila;

    });

}


// ==========================================
// REGISTRAR ENTREGA
// ==========================================

document
    .getElementById("formularioEntrega")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const entrega = {

            id_pedido:
                parseInt(
                    document.getElementById("id_pedido").value
                ),

            id_repartidor:
                parseInt(
                    document.getElementById("id_repartidor").value
                ),

            direccion_destino:
                document.getElementById(
                    "direccion_destino"
                ).value,

            latitud_destino:
                document.getElementById(
                    "latitud_destino"
                ).value
                    ? parseFloat(
                        document.getElementById(
                            "latitud_destino"
                        ).value
                    )
                    : null,

            longitud_destino:
                document.getElementById(
                    "longitud_destino"
                ).value
                    ? parseFloat(
                        document.getElementById(
                            "longitud_destino"
                        ).value
                    )
                    : null,

            distancia_km:
                document.getElementById(
                    "distancia_km"
                ).value
                    ? parseFloat(
                        document.getElementById(
                            "distancia_km"
                        ).value
                    )
                    : null,

            duracion_min:
                document.getElementById(
                    "duracion_min"
                ).value
                    ? parseFloat(
                        document.getElementById(
                            "duracion_min"
                        ).value
                    )
                    : null

        };


        // ==========================================
        // VALIDAR PEDIDO Y REPARTIDOR
        // ==========================================

        if (!entrega.id_pedido) {

            mostrarNotificacion(
    "Debe seleccionar un pedido antes de continuar.",
    "Pedido requerido",
    "warning"
);

        }


        if (!entrega.id_repartidor) {

            mostrarNotificacion(
    "Debe seleccionar un repartidor antes de continuar.",
    "Repartidor requerido",
    "warning"
);

        }


        // ==========================================
        // REGISTRAR ENTREGA
        // ==========================================

        const respuesta = await fetch("/entregas", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(entrega)

        });


        const resultado =
            await respuesta.json();


        alert(
            resultado.mensaje ||
            resultado.error
        );


        if (respuesta.ok) {

            document
                .getElementById("formularioEntrega")
                .reset();

            await cargarPedidosDisponibles();

            await cargarRepartidoresDisponibles();

            await cargarEntregas();

        }

    });


// ==========================================
// CARGAR REPARTIDORES DISPONIBLES
// ==========================================

async function cargarRepartidoresDisponibles() {

    const respuesta =
        await fetch("/repartidores/disponibles");

    const repartidores =
        await respuesta.json();

    const selector =
        document.getElementById("id_repartidor");

    selector.innerHTML = `
        <option value="">
            Seleccione un repartidor
        </option>
    `;


    repartidores.forEach(repartidor => {

        const opcion =
            document.createElement("option");

        opcion.value =
            repartidor.id_repartidor;

        opcion.textContent =
            repartidor.nombre;

        selector.appendChild(opcion);

    });

}


// ==========================================
// CARGAR PEDIDOS DISPONIBLES
// ==========================================

async function cargarPedidosDisponibles() {

    const respuesta =
        await fetch("/pedidos/disponibles");

    const pedidos =
        await respuesta.json();

    const selector =
        document.getElementById("id_pedido");

    selector.innerHTML = `
        <option value="">
            Seleccione un pedido
        </option>
    `;


    pedidos.forEach(pedido => {

        const opcion =
            document.createElement("option");

        opcion.value =
            pedido.id_pedido;

        opcion.textContent =
            `Pedido #${pedido.id_pedido} - S/ ${pedido.total.toFixed(2)} - ${pedido.estado}`;

        selector.appendChild(opcion);

    });

}


// ==========================================
// CARGAR DATOS DEL CLIENTE
// AL SELECCIONAR PEDIDO
// ==========================================

document
    .getElementById("id_pedido")
    .addEventListener("change", async function () {

        const idPedido = this.value;

        // ==========================================
        // LIMPIAR CAMPOS
        // ==========================================

        if (!idPedido) {

            document.getElementById(
                "direccion_destino"
            ).value = "";

            document.getElementById(
                "latitud_destino"
            ).value = "";

            document.getElementById(
                "longitud_destino"
            ).value = "";

            document.getElementById(
                "distancia_km"
            ).value = "";

            document.getElementById(
                "duracion_min"
            ).value = "";

            return;
        }


        try {

            // ==========================================
            // OBTENER PEDIDOS DISPONIBLES
            // ==========================================

            const respuesta =
                await fetch("/pedidos/disponibles");

            const pedidos =
                await respuesta.json();


            const pedido =
                pedidos.find(
                    p => p.id_pedido == idPedido
                );


            if (!pedido) {

                alert("No se encontró el pedido");

                return;
            }


            // ==========================================
            // MOSTRAR DIRECCIÓN DEL CLIENTE
            // ==========================================

            const direccion =
                pedido.direccion || "";


            document.getElementById(
                "direccion_destino"
            ).value = direccion;


            if (!direccion) {

                mostrarNotificacion(
    "El cliente seleccionado no tiene una dirección registrada.",
    "Dirección no disponible",
    "warning"
);

                return;
            }


            // ==========================================
            // GEOCODIFICAR DIRECCIÓN
            // ==========================================

            const respuestaGeo =
                await fetch("/geocodificar", {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        direccion: direccion

                    })

                });


            const resultadoGeo =
                await respuestaGeo.json();


            // ==========================================
            // VERIFICAR GEOCODIFICACIÓN
            // ==========================================

            if (!respuestaGeo.ok) {

                mostrarNotificacion(
    resultadoGeo.error ||
    "No se pudo encontrar la dirección.",
    "Ubicación no encontrada",
    "error"
);

                return;
            }


            // ==========================================
            // COORDENADAS OBTENIDAS AUTOMÁTICAMENTE
            // ==========================================

            const latitud =
                resultadoGeo.latitud;

            const longitud =
                resultadoGeo.longitud;


            document.getElementById(
                "latitud_destino"
            ).value = latitud;


            document.getElementById(
                "longitud_destino"
            ).value = longitud;


        }


        catch (error) {

            console.error(
                "Error al obtener ubicación:",
                error
            );

            alert(
                "No se pudo obtener la ubicación del destino"
            );

        }

    });

// ==========================================
// GEOCODIFICAR Y CALCULAR RUTA DESDE DIRECCIÓN
// ==========================================

async function calcularRutaDesdeDireccion() {

    const direccion =
        document.getElementById(
            "direccion_destino"
        ).value.trim();


    if (!direccion) {

        alert("Ingrese una dirección de destino");

        return;

    }


    try {

        // ==========================================
        // GEOCODIFICAR DIRECCIÓN
        // ==========================================

        const respuestaGeo =
            await fetch("/geocodificar", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    direccion: direccion
                })

            });


        const resultadoGeo =
            await respuestaGeo.json();


        if (!respuestaGeo.ok) {

            alert(
                resultadoGeo.error ||
                "No se encontró la dirección"
            );

            return;

        }


        // ==========================================
        // GUARDAR COORDENADAS
        // ==========================================

        document.getElementById(
            "latitud_destino"
        ).value =
            resultadoGeo.latitud;


        document.getElementById(
            "longitud_destino"
        ).value =
            resultadoGeo.longitud;


        // ==========================================
        // CALCULAR RUTA
        // ==========================================

        await calcularRuta();


    } catch (error) {

        console.error(
            "Error:",
            error
        );

        alert(
            "No se pudo obtener la ubicación"
        );

    }

}


// ==========================================
// MOSTRAR RUTA EN EL MAPA
// ==========================================

function mostrarRutaEnMapa(geometria) {

    if (!geometria) {

        console.error(
            "No se recibió geometría de la ruta"
        );

        return;

    }


    if (lineaRuta) {

        mapaEntrega.removeLayer(
            lineaRuta
        );

    }


    const coordenadas =
        polyline.decode(geometria);


    lineaRuta =
        L.polyline(
            coordenadas,
            {
                weight: 5
            }
        ).addTo(mapaEntrega);


    mapaEntrega.fitBounds(
        lineaRuta.getBounds(),
        {
            padding: [30, 30]
        }
    );

}

// ==========================================
// CALCULAR RUTA MEDIANTE LA API
// ==========================================

async function calcularRuta() {

    const latitudDestino =
        document.getElementById(
            "latitud_destino"
        ).value;


    const longitudDestino =
        document.getElementById(
            "longitud_destino"
        ).value;


    // ==========================================
    // VALIDAR COORDENADAS
    // ==========================================

    if (
        !latitudDestino ||
        !longitudDestino
    ) {

        document.getElementById(
            "distancia_km"
        ).value = "";

        document.getElementById(
            "duracion_min"
        ).value = "";

        return;

    }


    try {

        // ==========================================
        // ORIGEN DE PRUEBA
        // ==========================================
        // Por ahora utilizamos estas coordenadas
        // como punto de origen.
        //
        // Después podemos reemplazarlas por
        // la ubicación real del repartidor.

        const datosRuta = {

            lat_destino:
                parseFloat(
                    latitudDestino
                ),

            lon_destino:
                parseFloat(
                    longitudDestino
                )

        };

        // ==========================================
        // CONSULTAR API /ruta
        // ==========================================

        const respuesta =
            await fetch("/ruta", {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(
                        datosRuta
                    )

            });


        const resultado =
            await respuesta.json();

            // ==========================================
// MOSTRAR DESTINO EN EL MAPA
// ==========================================

        inicializarMapa();


        // Eliminar marcador anterior
        if (marcadorDestino) {

            mapaEntrega.removeLayer(
                marcadorDestino
            );

        }


        // Eliminar ruta anterior
        if (lineaRuta) {

            mapaEntrega.removeLayer(
                lineaRuta
            );

        }


        // Crear marcador del destino
        marcadorDestino = L.marker([
            parseFloat(latitudDestino),
            parseFloat(longitudDestino)
        ])
        .addTo(mapaEntrega)
        .bindPopup(
            "<b>Destino</b><br>" +
            document.getElementById(
                "direccion_destino"
            ).value
        )
        .openPopup();


        // Ajustar mapa para mostrar origen y destino
        const puntos = L.latLngBounds([

            [
                LAT_ORIGEN,
                LON_ORIGEN
            ],

            [
                parseFloat(latitudDestino),
                parseFloat(longitudDestino)
            ]

        ]);


        mapaEntrega.fitBounds(
            puntos,
            {
                padding: [30, 30]
            }
        );

        // ==========================================
        // VERIFICAR ERROR
        // ==========================================

        if (!respuesta.ok) {

            console.error(
                "Error al calcular ruta:",
                resultado
            );

            mostrarNotificacion(
    resultado.error ||
    "No se pudo calcular la ruta.",
    "Error de ruta",
    "error"
);

            return;

        }


/// ==========================================
// MOSTRAR RESULTADO
// ==========================================

document.getElementById(
    "distancia_km"
).value =
    resultado.distancia_km;


document.getElementById(
    "duracion_min"
).value =
    resultado.duracion_min;


// Mostrar distancia en pantalla
document.getElementById(
    "distanciaMostrada"
).textContent =
    resultado.distancia_km + " km";


// Mostrar duración en pantalla
document.getElementById(
    "duracionMostrada"
).textContent =
    resultado.duracion_min + " min";


// ==========================================
// MOSTRAR RUTA EN EL MAPA
// ==========================================

mostrarRutaEnMapa(
    resultado.geometria
);


// ==========================================
// ACTUALIZAR ESTADO
// ==========================================

document.getElementById(
    "estadoRuta"
).innerHTML = `
    <i class="fa-solid fa-circle-check"></i>
    Ruta calculada correctamente.
`;

    } catch (error) {

    console.error(
        "Error al calcular la ruta:",
        error
    );

    alert(
        "Ocurrió un error al calcular la ruta. Revisa la consola."
    );

}

}

// ==========================================
// ELIMINAR ENTREGA
// ==========================================

async function eliminarEntrega(id) {

    mostrarConfirmacionEliminar(id);

}


// ==========================================
// CONFIRMAR ELIMINACIÓN
// ==========================================

function mostrarConfirmacionEliminar(id) {

    const overlay =
        document.getElementById(
            "notificacionSistema"
        );

    const titulo =
        document.getElementById(
            "notificacionTitulo"
        );

    const mensaje =
        document.getElementById(
            "notificacionMensaje"
        );

    const icono =
        document.getElementById(
            "notificacionIcono"
        );

    const acciones =
        document.getElementById(
            "notificacionAcciones"
        );


    titulo.textContent =
        "Eliminar entrega";

    mensaje.textContent =
        "¿Está seguro de eliminar esta entrega? Esta acción no se puede deshacer.";

    icono.innerHTML =
        '<i class="fa-solid fa-trash"></i>';


    acciones.innerHTML = `

        <button
            type="button"
            class="boton-cancelar"
            onclick="cerrarNotificacion()"
        >
            Cancelar
        </button>

        <button
            type="button"
            class="boton-eliminar"
            onclick="confirmarEliminacion(${id})"
        >
            Eliminar
        </button>

    `;


    overlay.classList.add("activa");

}


// ==========================================
// EJECUTAR ELIMINACIÓN
// ==========================================

async function confirmarEliminacion(id) {

    cerrarNotificacion();


    const respuesta =
        await fetch(
            `/entregas/${id}`,
            {
                method: "DELETE"
            }
        );


    const resultado =
        await respuesta.json();


    if (respuesta.ok) {

        mostrarNotificacion(
            resultado.mensaje ||
            "La entrega fue eliminada correctamente.",
            "Entrega eliminada",
            "success"
        );


        document
            .getElementById(
                "formularioEntrega"
            )
            .reset();


        await cargarPedidosDisponibles();

        await cargarRepartidoresDisponibles();

        await cargarEntregas();

    }

    else {

        mostrarNotificacion(
            resultado.error ||
            "No se pudo eliminar la entrega.",
            "Error",
            "error"
        );

    }

}


// ==========================================
// CAMBIAR ESTADO DE ENTREGA
// ==========================================

async function cambiarEstadoEntrega(
    id,
    estado
) {

    const respuesta =
        await fetch(
            `/entregas/${id}/estado`,
            {

                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    estado: estado

                })

            }
        );


    const resultado =
        await respuesta.json();


    alert(
        resultado.mensaje ||
        resultado.error
    );


    if (respuesta.ok) {

        await cargarEntregas();

        await cargarRepartidoresDisponibles();

    }

}


// ==========================================
// CARGAR DATOS AL ABRIR LA PÁGINA
// ==========================================

cargarRepartidoresDisponibles();

cargarPedidosDisponibles();

cargarEntregas();