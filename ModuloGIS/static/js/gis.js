// ==========================================
// MÓDULO GIS - GOOGLE MAPS
// ==========================================

// ==========================================
// VARIABLES DEL MAPA
// ==========================================

let mapaEntrega = null;
let marcadorOrigen = null;
let marcadorDestino = null;
let lineaRuta = null;


// ==========================================
// COORDENADAS DEL ORIGEN
// ==========================================

const LAT_ORIGEN =
    -10.664318012426412;

const LON_ORIGEN =
    -76.253655557701;


// ==========================================
// INICIALIZAR GOOGLE MAPS
// ==========================================

async function inicializarMapa() {

    // Si el mapa ya existe,
    // no volver a crearlo.

    if (mapaEntrega) {
        return;
    }


    const { Map } =
        await google.maps.importLibrary(
            "maps"
        );


    const { AdvancedMarkerElement } =
        await google.maps.importLibrary(
            "marker"
        );


    mapaEntrega =
        new Map(
            document.getElementById(
                "mapaEntrega"
            ),
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
// MOSTRAR DESTINO EN EL MAPA
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
    // ELIMINAR RUTA ANTERIOR
    // ==========================================

    if (lineaRuta) {

        lineaRuta.setMap(null);

        lineaRuta = null;

    }


    // ==========================================
    // CREAR MARCADOR DEL DESTINO
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

    const {
        LatLngBounds
    } =
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

async function calcularRuta() {

    const campoDireccion =
        document.getElementById(
            "direccion_destino"
        );


    const direccion =
        campoDireccion.value.trim();


    // ==========================================
    // VALIDAR DIRECCIÓN
    // ==========================================

    if (!direccion) {

        mostrarEstado(
            "Debe ingresar una dirección de destino.",
            "warning"
        );

        return;

    }


    try {

        mostrarEstado(
            "Buscando dirección y calculando ruta...",
            "loading"
        );


        // ==========================================
        // PASO 1
        // GEOCODIFICAR DIRECCIÓN
        // ==========================================

        console.log(
            "Geocodificando:",
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

                    body:
                        JSON.stringify({

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


        // ==========================================
        // OBTENER COORDENADAS
        // ==========================================

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
                latitud:
                    latitudDestino,

                longitud:
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


            const latitudMostrada =
    document.getElementById("latitudMostrada");

if (latitudMostrada) {
    latitudMostrada.textContent =
        latitudDestino.toFixed(6);
}


const longitudMostrada =
    document.getElementById("longitudMostrada");

if (longitudMostrada) {
    longitudMostrada.textContent =
        longitudDestino.toFixed(6);
}

        // ==========================================
        // PASO 2
        // MOSTRAR DESTINO
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

                    body:
                        JSON.stringify({

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


        // ==========================================
        // OBTENER DISTANCIA
        // ==========================================

        const distanciaKm =
            parseFloat(
                resultadoRuta.distancia_km
            );


        // ==========================================
        // OBTENER DURACIÓN
        // ==========================================

        const duracionMin =
            parseFloat(
                resultadoRuta.duracion_min
            );


        if (
            Number.isNaN(distanciaKm) ||
            Number.isNaN(duracionMin)
        ) {

            throw new Error(
                "La ruta no devolvió distancia o duración válidas."
            );

        }


        console.log(
            "Ruta calculada:",
            resultadoRuta
        );


        // ==========================================
        // GUARDAR DISTANCIA
        // ==========================================

        const campoDistancia =
            document.getElementById(
                "distancia_km"
            );


        if (campoDistancia) {

            campoDistancia.value =
                distanciaKm.toFixed(2);

        }


        // ==========================================
        // GUARDAR DURACIÓN
        // ==========================================

        const campoDuracion =
            document.getElementById(
                "duracion_min"
            );


        if (campoDuracion) {

            campoDuracion.value =
                duracionMin.toFixed(2);

        }


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
        // PASO 4
        // DIBUJAR RUTA REAL
        // ==========================================

        await dibujarLineaRuta(
            resultadoRuta.geometria
        );


        // ==========================================
        // FINAL
        // ==========================================

        mostrarEstado(
            `Ruta calculada correctamente. Distancia: ${distanciaKm.toFixed(2)} km | Duración: ${duracionMin.toFixed(2)} min`,
            "success"
        );


        console.log(
            "✅ Módulo GIS funcionando correctamente."
        );

    }


    catch (error) {

        console.error(
            "Error al calcular ruta:",
            error
        );


        mostrarEstado(
            error.message ||
            "No se pudo calcular la ruta.",
            "error"
        );

    }

}


// ==========================================
// DIBUJAR RUTA REAL
// ==========================================

async function dibujarLineaRuta(
    geometria
) {

    await inicializarMapa();


    // ==========================================
    // ELIMINAR RUTA ANTERIOR
    // ==========================================

    if (lineaRuta) {

        lineaRuta.setMap(null);

        lineaRuta = null;

    }


    // ==========================================
    // VALIDAR GEOMETRÍA
    // ==========================================

    if (
        !geometria ||
        geometria.type !== "LineString" ||
        !Array.isArray(
            geometria.coordinates
        ) ||
        geometria.coordinates.length === 0
    ) {

        console.error(
            "Geometría recibida:",
            geometria
        );

        throw new Error(
            "OpenRouteService no devolvió una geometría válida."
        );

    }


    // ==========================================
    // CONVERTIR COORDENADAS
    //
    // ORS:
    // [longitud, latitud]
    //
    // GOOGLE MAPS:
    // {lat, lng}
    // ==========================================

    const puntosRuta =
        geometria.coordinates.map(
            coordenada => ({

                lat:
                    parseFloat(
                        coordenada[1]
                    ),

                lng:
                    parseFloat(
                        coordenada[0]
                    )

            })
        );


    console.log(
        "Cantidad de puntos de la ruta:",
        puntosRuta.length
    );


    // ==========================================
    // CREAR POLYLINE
    // ==========================================

    lineaRuta =
        new google.maps.Polyline({

            map:
                mapaEntrega,

            path:
                puntosRuta,

            geodesic:
                false,

            strokeOpacity:
                0.9,

            strokeWeight:
                6

        });


    // ==========================================
    // AJUSTAR MAPA A LA RUTA
    // ==========================================

    const limites =
        new google.maps.LatLngBounds();


    puntosRuta.forEach(
        punto => {

            limites.extend(
                punto
            );

        }
    );


    mapaEntrega.fitBounds(
        limites
    );


    console.log(
        "✅ Ruta real dibujada sobre las calles."
    );

}


// ==========================================
// MOSTRAR ESTADO
// ==========================================

function mostrarEstado(
    mensaje,
    tipo = "normal"
) {

    const estado =
        document.getElementById(
            "estadoRuta"
        );


    if (!estado) {

        console.log(
            mensaje
        );

        return;

    }


    estado.textContent =
        mensaje;


    estado.className =
        `estado-ruta ${tipo}`;

}


// ==========================================
// LIMPIAR MAPA
// ==========================================

function limpiarMapa() {

    // ==========================================
    // ELIMINAR MARCADOR DESTINO
    // ==========================================

    if (marcadorDestino) {

        marcadorDestino.map = null;

        marcadorDestino = null;

    }


    // ==========================================
    // ELIMINAR RUTA
    // ==========================================

    if (lineaRuta) {

        lineaRuta.setMap(null);

        lineaRuta = null;

    }


    // ==========================================
    // LIMPIAR CAMPOS
    // ==========================================

    const direccion =
        document.getElementById(
            "direccion_destino"
        );


    if (direccion) {

        direccion.value = "";

    }


    const latitud =
        document.getElementById(
            "latitud_destino"
        );


    if (latitud) {

        latitud.value = "";

    }


    const longitud =
        document.getElementById(
            "longitud_destino"
        );


    if (longitud) {

        longitud.value = "";

    }


    const distancia =
        document.getElementById(
            "distancia_km"
        );


    if (distancia) {

        distancia.value = "";

    }


    const duracion =
        document.getElementById(
            "duracion_min"
        );


    if (duracion) {

        duracion.value = "";

    }


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
    // REGRESAR AL ORIGEN
    // ==========================================

    if (mapaEntrega) {

        mapaEntrega.setCenter({

            lat:
                LAT_ORIGEN,

            lng:
                LON_ORIGEN

        });


        mapaEntrega.setZoom(
            14
        );

    }


    mostrarEstado(
        "Mapa limpiado.",
        "normal"
    );

    const latitudMostrada =
    document.getElementById("latitudMostrada");

if (latitudMostrada) {
    latitudMostrada.textContent = "—";
}


const longitudMostrada =
    document.getElementById("longitudMostrada");

if (longitudMostrada) {
    longitudMostrada.textContent = "—";
}

}


// ==========================================
// INICIALIZAR AL CARGAR LA PÁGINA
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        try {

            await inicializarMapa();

            console.log(
                "✅ Google Maps inicializado."
            );

        }

        catch (error) {

            console.error(
                "Error al inicializar Google Maps:",
                error
            );

            mostrarEstado(
                "No se pudo cargar Google Maps. Verifica la API Key.",
                "error"
            );

        }

    }
);