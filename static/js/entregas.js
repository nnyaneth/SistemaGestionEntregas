// ==========================================
// NOTIFICACIONES DEL SISTEMA
// ==========================================

function mostrarNotificacion(
    mensaje,
    titulo = "Información",
    tipo = "info"
) {

    const overlay =
        document.getElementById("notificacionSistema");

    const tituloElemento =
        document.getElementById("notificacionTitulo");

    const mensajeElemento =
        document.getElementById("notificacionMensaje");

    const icono =
        document.getElementById("notificacionIcono");

    const acciones =
        document.getElementById("notificacionAcciones");


    tituloElemento.textContent = titulo;
    mensajeElemento.textContent = mensaje;


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
// GOOGLE MAPS - ENTREGA
// ==========================================

let mapaEntrega = null;

let marcadorOrigen = null;

let marcadorDestino = null;

let lineaRuta = null;


// ==========================================
// COORDENADAS DEL LOCAL
// ==========================================

const LAT_ORIGEN =
    -10.664318012426412;

const LON_ORIGEN =
    -76.253655557701;


// ==========================================
// INICIALIZAR GOOGLE MAPS
// ==========================================

async function inicializarMapa() {

    if (mapaEntrega) {
        return;
    }


    const { Map } =
        await google.maps.importLibrary("maps");


    const { AdvancedMarkerElement } =
        await google.maps.importLibrary("marker");


    mapaEntrega =
        new Map(
            document.getElementById("mapaEntrega"),
            {

                center: {
                    lat: LAT_ORIGEN,
                    lng: LON_ORIGEN
                },

                zoom: 14,

                mapId: "DEMO_MAP_ID"

            }
        );


    // ==========================================
    // MARCADOR DEL ORIGEN
    // ==========================================

    marcadorOrigen =
        new AdvancedMarkerElement({

            map: mapaEntrega,

            position: {

                lat: LAT_ORIGEN,
                lng: LON_ORIGEN

            },

            title:
                "Origen - Jr. Hilario Cabrera 201"

        });

}


// ==========================================
// CARGAR ENTREGAS
// ==========================================

async function cargarEntregas() {

    try {

        const respuesta =
            await fetch("/entregas");


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron cargar las entregas."
            );

        }


        const entregas =
            await respuesta.json();


        const tabla =
            document.getElementById(
                "tablaEntregas"
            );


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
                            type="button"
                            onclick="eliminarEntrega(
                                ${entrega.id_entrega}
                            )"
                        >
                            Eliminar
                        </button>

                    </td>

                </tr>

            `;


            tabla.innerHTML += fila;

        });


    } catch (error) {

        console.error(
            "Error al cargar entregas:",
            error
        );

    }

}


// ==========================================
// REGISTRAR ENTREGA
// ==========================================

document
    .getElementById("formularioEntrega")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const idPedido =
                parseInt(
                    document.getElementById(
                        "id_pedido"
                    ).value
                );


            const idRepartidor =
                parseInt(
                    document.getElementById(
                        "id_repartidor"
                    ).value
                );


            // ==========================================
            // VALIDAR PEDIDO
            // ==========================================

            if (!idPedido) {

                mostrarNotificacion(
                    "Debe seleccionar un pedido antes de continuar.",
                    "Pedido requerido",
                    "warning"
                );

                return;

            }


            // ==========================================
            // VALIDAR REPARTIDOR
            // ==========================================

            if (!idRepartidor) {

                mostrarNotificacion(
                    "Debe seleccionar un repartidor antes de continuar.",
                    "Repartidor requerido",
                    "warning"
                );

                return;

            }


            // ==========================================
            // VALIDAR DIRECCIÓN
            // ==========================================

            const direccion =
                document.getElementById(
                    "direccion_destino"
                ).value.trim();


            if (!direccion) {

                mostrarNotificacion(
                    "Debe ingresar una dirección de destino.",
                    "Dirección requerida",
                    "warning"
                );

                return;

            }


            // ==========================================
            // VALIDAR COORDENADAS
            // ==========================================

            const latitud =
                parseFloat(
                    document.getElementById(
                        "latitud_destino"
                    ).value
                );


            const longitud =
                parseFloat(
                    document.getElementById(
                        "longitud_destino"
                    ).value
                );


            if (
                Number.isNaN(latitud) ||
                Number.isNaN(longitud)
            ) {

                mostrarNotificacion(
                    "Primero debes calcular la ruta del destino.",
                    "Ruta requerida",
                    "warning"
                );

                return;

            }


            // ==========================================
            // VALIDAR DISTANCIA
            // ==========================================

            const distancia =
                parseFloat(
                    document.getElementById(
                        "distancia_km"
                    ).value
                );


            const duracion =
                parseFloat(
                    document.getElementById(
                        "duracion_min"
                    ).value
                );


            if (
                Number.isNaN(distancia) ||
                Number.isNaN(duracion)
            ) {

                mostrarNotificacion(
                    "Primero debes calcular la ruta para obtener la distancia y duración.",
                    "Ruta no calculada",
                    "warning"
                );

                return;

            }


            // ==========================================
            // CREAR OBJETO DE ENTREGA
            // ==========================================

            const entrega = {

                id_pedido:
                    idPedido,

                id_repartidor:
                    idRepartidor,

                direccion_destino:
                    direccion,

                latitud_destino:
                    latitud,

                longitud_destino:
                    longitud,

                distancia_km:
                    distancia,

                duracion_min:
                    duracion

            };


            try {

                // ==========================================
                // REGISTRAR ENTREGA
                // ==========================================

                const respuesta =
                    await fetch(
                        "/entregas",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    entrega
                                )

                        }
                    );


                const resultado =
                    await respuesta.json();


                if (!respuesta.ok) {

                    mostrarNotificacion(
                        resultado.error ||
                        "No se pudo registrar la entrega.",
                        "Error",
                        "error"
                    );

                    return;

                }


                mostrarNotificacion(
                    resultado.mensaje ||
                    "La entrega fue registrada correctamente.",
                    "Entrega registrada",
                    "success"
                );


                // ==========================================
                // LIMPIAR FORMULARIO
                // ==========================================

                document
                    .getElementById(
                        "formularioEntrega"
                    )
                    .reset();


                // ==========================================
                // LIMPIAR MAPA
                // ==========================================

                limpiarDestinoMapa();


                // ==========================================
                // ACTUALIZAR INFORMACIÓN
                // ==========================================

                await cargarPedidosDisponibles();

                await cargarRepartidoresDisponibles();

                await cargarEntregas();


            } catch (error) {

                console.error(
                    "Error al registrar entrega:",
                    error
                );


                mostrarNotificacion(
                    "Ocurrió un error al registrar la entrega.",
                    "Error",
                    "error"
                );

            }

        }
    );


// ==========================================
// CARGAR REPARTIDORES DISPONIBLES
// ==========================================

async function cargarRepartidoresDisponibles() {

    try {

        const respuesta =
            await fetch(
                "/repartidores/disponibles"
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron cargar los repartidores."
            );

        }


        const repartidores =
            await respuesta.json();


        const selector =
            document.getElementById(
                "id_repartidor"
            );


        selector.innerHTML = `

            <option value="">
                Seleccione un repartidor
            </option>

        `;


        repartidores.forEach(
            repartidor => {

                const opcion =
                    document.createElement(
                        "option"
                    );


                opcion.value =
                    repartidor.id_repartidor;


                opcion.textContent =
                    repartidor.nombre;


                selector.appendChild(
                    opcion
                );

            }
        );


    } catch (error) {

        console.error(
            "Error al cargar repartidores:",
            error
        );

    }

}


// ==========================================
// CARGAR PEDIDOS DISPONIBLES
// ==========================================

async function cargarPedidosDisponibles() {

    try {

        const respuesta =
            await fetch(
                "/pedidos/disponibles"
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron cargar los pedidos."
            );

        }


        const pedidos =
            await respuesta.json();


        const selector =
            document.getElementById(
                "id_pedido"
            );


        selector.innerHTML = `

            <option value="">
                Seleccione un pedido
            </option>

        `;


        pedidos.forEach(
            pedido => {

                const opcion =
                    document.createElement(
                        "option"
                    );


                opcion.value =
                    pedido.id_pedido;


                opcion.textContent =
                    `Pedido #${pedido.id_pedido} - S/ ${Number(pedido.total).toFixed(2)} - ${pedido.estado}`;


                selector.appendChild(
                    opcion
                );

            }
        );


    } catch (error) {

        console.error(
            "Error al cargar pedidos:",
            error
        );

    }

}


// ==========================================
// SELECCIONAR PEDIDO
// ==========================================

document
    .getElementById("id_pedido")
    .addEventListener(
        "change",
        async function() {

            const idPedido =
                this.value;


            // ==========================================
            // LIMPIAR CAMPOS
            // ==========================================

            if (!idPedido) {

                limpiarDatosDestino();

                limpiarDestinoMapa();

                return;

            }


            try {

                // ==========================================
                // OBTENER PEDIDOS
                // ==========================================

                const respuesta =
                    await fetch(
                        "/pedidos/disponibles"
                    );


                if (!respuesta.ok) {

                    throw new Error(
                        "No se pudieron obtener los pedidos."
                    );

                }


                const pedidos =
                    await respuesta.json();


                const pedido =
                    pedidos.find(
                        p =>
                            p.id_pedido == idPedido
                    );


                if (!pedido) {

                    mostrarNotificacion(
                        "No se encontró el pedido seleccionado.",
                        "Pedido no encontrado",
                        "error"
                    );

                    return;

                }


                // ==========================================
                // CARGAR DIRECCIÓN
                // ==========================================

                const direccion =
                    pedido.direccion || "";


                document.getElementById(
                    "direccion_destino"
                ).value =
                    direccion;


                // ==========================================
                // VERIFICAR COORDENADAS
                // ==========================================

                if (
                    pedido.latitud === null ||
                    pedido.longitud === null
                ) {

                    mostrarNotificacion(
                        "El cliente no tiene coordenadas registradas. Puedes modificar la dirección y calcular la ruta.",
                        "Ubicación no disponible",
                        "warning"
                    );

                    return;

                }


                // ==========================================
                // GUARDAR COORDENADAS
                // ==========================================

                document.getElementById(
                    "latitud_destino"
                ).value =
                    pedido.latitud;


                document.getElementById(
                    "longitud_destino"
                ).value =
                    pedido.longitud;


                // ==========================================
                // LIMPIAR CÁLCULOS ANTERIORES
                // ==========================================

                document.getElementById(
                    "distancia_km"
                ).value = "";


                document.getElementById(
                    "duracion_min"
                ).value = "";


                const distanciaMostrada =
                    document.getElementById(
                        "distanciaMostrada"
                    );


                if (distanciaMostrada) {

                    distanciaMostrada.textContent =
                        "-";

                }


                const duracionMostrada =
                    document.getElementById(
                        "duracionMostrada"
                    );


                if (duracionMostrada) {

                    duracionMostrada.textContent =
                        "-";

                }


                // ==========================================
                // MOSTRAR DESTINO AUTOMÁTICAMENTE
                // ==========================================

                await mostrarDestinoEnMapa(
                    pedido.latitud,
                    pedido.longitud,
                    direccion
                );


                console.log(
                    "Pedido seleccionado:",
                    pedido
                );


            } catch (error) {

                console.error(
                    "Error al cargar datos del pedido:",
                    error
                );


                mostrarNotificacion(
                    "No se pudieron obtener los datos del pedido.",
                    "Error",
                    "error"
                );

            }

        }
    );


// ==========================================
// MOSTRAR DESTINO EN GOOGLE MAPS
// ==========================================

async function mostrarDestinoEnMapa(
    latitud,
    longitud,
    direccion
) {

    await inicializarMapa();


    const {
        AdvancedMarkerElement
    } =
        await google.maps.importLibrary(
            "marker"
        );


    // ==========================================
    // ELIMINAR DESTINO ANTERIOR
    // ==========================================

    if (marcadorDestino) {

        marcadorDestino.map = null;

        marcadorDestino = null;

    }


    // ==========================================
    // ELIMINAR LÍNEA ANTERIOR
    // ==========================================

    if (lineaRuta) {

        lineaRuta.setMap(null);

        lineaRuta = null;

    }


    // ==========================================
    // CREAR DESTINO
    // ==========================================

    marcadorDestino =
        new AdvancedMarkerElement({

            map: mapaEntrega,

            position: {

                lat:
                    parseFloat(latitud),

                lng:
                    parseFloat(longitud)

            },

            title:
                direccion ||
                "Destino de entrega"

        });


    // ==========================================
    // AJUSTAR MAPA
    // ==========================================

    const { LatLngBounds } =
        await google.maps.importLibrary(
            "core"
        );


    const limites =
        new LatLngBounds();


    limites.extend({

        lat:
            LAT_ORIGEN,

        lng:
            LON_ORIGEN

    });


    limites.extend({

        lat:
            parseFloat(latitud),

        lng:
            parseFloat(longitud)

    });


    mapaEntrega.fitBounds(
        limites
    );


    console.log(
        "Destino mostrado correctamente:",
        {
            latitud,
            longitud,
            direccion
        }
    );

}


// ==========================================
// CALCULAR RUTA
// ==========================================
// IMPORTANTE:
// La dirección escrita por el usuario se envía
// al backend para que OpenRouteService la
// convierta en coordenadas.
// Después OpenRouteService calcula la ruta real.
// ==========================================

async function calcularRuta() {

    const direccion =
        document.getElementById(
            "direccion_destino"
        ).value.trim();


    // ==========================================
    // VALIDAR DIRECCIÓN
    // ==========================================

    if (!direccion) {

        mostrarNotificacion(
            "Debe ingresar una dirección de destino.",
            "Dirección requerida",
            "warning"
        );

        return;

    }


    const idPedido =
        document.getElementById(
            "id_pedido"
        ).value;


    if (!idPedido) {

        mostrarNotificacion(
            "Primero debes seleccionar un pedido.",
            "Pedido requerido",
            "warning"
        );

        return;

    }


    try {

        // ==========================================
        // MOSTRAR ESTADO DE CARGA
        // ==========================================

        const estadoRuta =
            document.getElementById(
                "estadoRuta"
            );


        if (estadoRuta) {

            estadoRuta.innerHTML = `

                <i class="fa-solid fa-spinner fa-spin"></i>

                Buscando dirección y calculando ruta...

            `;

        }


        // ==========================================
        // PASO 1
        // GEOCODIFICAR DIRECCIÓN
        // ==========================================

        console.log(
            "Geocodificando dirección:",
            direccion
        );


        const respuestaGeocodificacion =
            await fetch(
                "/geocodificar",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        direccion:
                            direccion

                    })

                }
            );


        const resultadoGeocodificacion =
            await respuestaGeocodificacion.json();


        if (
            !respuestaGeocodificacion.ok
        ) {

            throw new Error(
                resultadoGeocodificacion.error ||
                "No se pudo encontrar la dirección."
            );

        }


        const latitudDestino =
            parseFloat(
                resultadoGeocodificacion.latitud
            );


        const longitudDestino =
            parseFloat(
                resultadoGeocodificacion.longitud
            );


        if (
            Number.isNaN(latitudDestino) ||
            Number.isNaN(longitudDestino)
        ) {

            throw new Error(
                "La API no devolvió coordenadas válidas."
            );

        }


        console.log(
            "Coordenadas encontradas:",
            {
                latitudDestino,
                longitudDestino
            }
        );


        // ==========================================
        // GUARDAR COORDENADAS
        // ==========================================

        document.getElementById(
            "latitud_destino"
        ).value =
            latitudDestino;


        document.getElementById(
            "longitud_destino"
        ).value =
            longitudDestino;


        // ==========================================
        // PASO 2
        // MOSTRAR DESTINO EN GOOGLE MAPS
        // ==========================================

        await mostrarDestinoEnMapa(
            latitudDestino,
            longitudDestino,
            direccion
        );


        // ==========================================
        // PASO 3
        // CALCULAR RUTA CON ORS
        // ==========================================

        console.log(
            "Calculando ruta con OpenRouteService..."
        );


        const respuestaRuta =
            await fetch(
                "/ruta",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        lat_destino:
                            latitudDestino,

                        lon_destino:
                            longitudDestino

                    })

                }
            );


        const resultadoRuta =
            await respuestaRuta.json();


        if (!respuestaRuta.ok) {

            throw new Error(
                resultadoRuta.error ||
                "No se pudo calcular la ruta."
            );

        }


        const distanciaKm =
            parseFloat(
                resultadoRuta.distancia_km
            );


        const duracionMin =
            parseFloat(
                resultadoRuta.duracion_min
            );


        if (
            Number.isNaN(distanciaKm) ||
            Number.isNaN(duracionMin)
        ) {

            throw new Error(
                "OpenRouteService no devolvió distancia o duración válidas."
            );

        }


        console.log(
            "Ruta calculada:",
            resultadoRuta
        );


        // ==========================================
        // GUARDAR DISTANCIA
        // ==========================================

        document.getElementById(
            "distancia_km"
        ).value =
            distanciaKm.toFixed(2);


        // ==========================================
        // GUARDAR DURACIÓN
        // ==========================================

        document.getElementById(
            "duracion_min"
        ).value =
            duracionMin.toFixed(2);


        // ==========================================
        // MOSTRAR DISTANCIA
        // ==========================================

        const distanciaMostrada =
            document.getElementById(
                "distanciaMostrada"
            );


        if (distanciaMostrada) {

            distanciaMostrada.textContent =
                `${distanciaKm.toFixed(2)} km`;

        }


        // ==========================================
        // MOSTRAR DURACIÓN
        // ==========================================

        const duracionMostrada =
            document.getElementById(
                "duracionMostrada"
            );


        if (duracionMostrada) {

            duracionMostrada.textContent =
                `${duracionMin.toFixed(2)} min`;

        }


        // ==========================================
        // DIBUJAR LÍNEA VISUAL
        // EN GOOGLE MAPS
        // ==========================================

        await dibujarLineaRuta(
    resultadoRuta.geometria
);


        // ==========================================
        // ESTADO FINAL
        // ==========================================

        if (estadoRuta) {

            estadoRuta.innerHTML = `

                <i class="fa-solid fa-circle-check"></i>

                Ruta calculada correctamente.

            `;

        }


        mostrarNotificacion(
            `Distancia: ${distanciaKm.toFixed(2)} km. Duración: ${duracionMin.toFixed(2)} minutos.`,
            "Ruta calculada",
            "success"
        );


    } catch (error) {

        console.error(
            "Error al calcular ruta:",
            error
        );


        const estadoRuta =
            document.getElementById(
                "estadoRuta"
            );


        if (estadoRuta) {

            estadoRuta.innerHTML = `

                <i class="fa-solid fa-circle-exclamation"></i>

                No se pudo calcular la ruta.

            `;

        }


        mostrarNotificacion(
            error.message ||
            "No se pudo calcular la ruta.",
            "Error de ruta",
            "error"
        );

    }

}


async function dibujarLineaRuta(geometria) {

    await inicializarMapa();

    // Eliminar ruta anterior
    if (lineaRuta) {
        lineaRuta.setMap(null);
        lineaRuta = null;
    }

    // Verificar geometría
    if (
        !geometria ||
        geometria.type !== "LineString" ||
        !Array.isArray(geometria.coordinates) ||
        geometria.coordinates.length === 0
    ) {
        console.error(
            "Geometría recibida:",
            geometria
        );

        throw new Error(
            "OpenRouteService no devolvió la geometría de la ruta."
        );
    }

    // ==========================================
    // CONVERTIR COORDENADAS ORS
    // [longitud, latitud]
    // A
    // {lat, lng}
    // ==========================================

    const puntosRuta =
        geometria.coordinates.map(coordenada => ({
            lat: parseFloat(coordenada[1]),
            lng: parseFloat(coordenada[0])
        }));

    console.log(
        "Puntos de la ruta:",
        puntosRuta.length
    );

    // ==========================================
    // DIBUJAR RUTA
    // ==========================================

    lineaRuta = new google.maps.Polyline({
        map: mapaEntrega,
        path: puntosRuta,
        geodesic: false,
        strokeOpacity: 0.9,
        strokeWeight: 6
    });

    // ==========================================
    // AJUSTAR MAPA A LA RUTA
    // ==========================================

    const limites =
        new google.maps.LatLngBounds();

    puntosRuta.forEach(punto => {
        limites.extend(punto);
    });

    mapaEntrega.fitBounds(limites);

    console.log(
        "✅ Ruta real dibujada sobre las calles"
    );
}

// ==========================================
// LIMPIAR DATOS DEL DESTINO
// ==========================================

function limpiarDatosDestino() {

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


    const distanciaMostrada =
        document.getElementById(
            "distanciaMostrada"
        );


    if (distanciaMostrada) {

        distanciaMostrada.textContent =
            "-";

    }


    const duracionMostrada =
        document.getElementById(
            "duracionMostrada"
        );


    if (duracionMostrada) {

        duracionMostrada.textContent =
            "-";

    }


    const estadoRuta =
        document.getElementById(
            "estadoRuta"
        );


    if (estadoRuta) {

        estadoRuta.innerHTML = "";

    }

}


// ==========================================
// LIMPIAR DESTINO DEL MAPA
// ==========================================

function limpiarDestinoMapa() {

    if (marcadorDestino) {

        marcadorDestino.map = null;

        marcadorDestino = null;

    }


    if (lineaRuta) {

        lineaRuta.setMap(null);

        lineaRuta = null;

    }


    if (mapaEntrega) {

        mapaEntrega.setCenter({

            lat:
                LAT_ORIGEN,

            lng:
                LON_ORIGEN

        });

        mapaEntrega.setZoom(14);

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


    try {

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


            limpiarDestinoMapa();


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


    } catch (error) {

        console.error(
            "Error al eliminar entrega:",
            error
        );


        mostrarNotificacion(
            "Ocurrió un error al eliminar la entrega.",
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

    try {

        const respuesta =
            await fetch(
                `/entregas/${id}/estado`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            estado:
                                estado

                        })

                }
            );


        const resultado =
            await respuesta.json();


        if (respuesta.ok) {

            mostrarNotificacion(
                resultado.mensaje ||
                "Estado actualizado correctamente.",
                "Estado actualizado",
                "success"
            );


            await cargarEntregas();

            await cargarRepartidoresDisponibles();

        }

        else {

            mostrarNotificacion(
                resultado.error ||
                "No se pudo actualizar el estado.",
                "Error",
                "error"
            );

        }


    } catch (error) {

        console.error(
            "Error al cambiar estado:",
            error
        );


        mostrarNotificacion(
            "Ocurrió un error al actualizar el estado.",
            "Error",
            "error"
        );

    }

}


// ==========================================
// CARGAR DATOS AL ABRIR LA PÁGINA
// ==========================================

cargarRepartidoresDisponibles();

cargarPedidosDisponibles();

cargarEntregas();