import os

import requests


# =========================================================
# CONFIGURACIÓN DEL PUNTO DE ORIGEN
# =========================================================

LAT_ORIGEN = -10.664318012426412
LON_ORIGEN = -76.253655557701


# =========================================================
# TIEMPO ADICIONAL DE ENTREGA
#
# Representa un margen aproximado para:
# - detener el vehículo
# - estacionamiento
# - bajar el pedido
# - entregar el pedido
#
# Este tiempo NO modifica la ruta ni la distancia.
# =========================================================

TIEMPO_ENTREGA_MIN = 5


# =========================================================
# CÁLCULO DE RUTA
# =========================================================

def calcular_ruta(
    lat_destino,
    lon_destino
):

    # =====================================================
    # OBTENER API KEY
    # =====================================================

    api_key = os.getenv(
        "ORS_API_KEY"
    )

    if not api_key:

        raise Exception(
            "No se encontró ORS_API_KEY "
            "en el archivo .env."
        )


    # =====================================================
    # CONVERTIR COORDENADAS
    # =====================================================

    try:

        lat_destino = float(
            lat_destino
        )

        lon_destino = float(
            lon_destino
        )

    except (TypeError, ValueError):

        raise Exception(
            "Las coordenadas del destino "
            "no son válidas."
        )


    # =====================================================
    # ENDPOINT DE OPENROUTESERVICE
    #
    # Se utiliza GeoJSON para obtener directamente
    # la geometría de la ruta.
    # =====================================================

    url = (
        "https://api.openrouteservice.org/"
        "v2/directions/driving-car/geojson"
    )


    # =====================================================
    # CABECERAS
    # =====================================================

    headers = {

        "Authorization": api_key,

        "Content-Type":
            "application/json"

    }


    # =====================================================
    # DATOS DE LA RUTA
    #
    # ORS utiliza:
    # [LONGITUD, LATITUD]
    # =====================================================

    datos = {

        "coordinates": [

            [
                LON_ORIGEN,
                LAT_ORIGEN
            ],

            [
                lon_destino,
                lat_destino
            ]

        ]

    }


    # =====================================================
    # SOLICITUD A OPENROUTESERVICE
    # =====================================================

    respuesta = requests.post(

        url,

        json=datos,

        headers=headers,

        timeout=30

    )


    # =====================================================
    # VALIDAR RESPUESTA
    # =====================================================

    if respuesta.status_code != 200:

        raise Exception(
            "Error de OpenRouteService: "
            + respuesta.text
        )


    # =====================================================
    # CONVERTIR RESPUESTA A JSON
    # =====================================================

    resultado = respuesta.json()


    # =====================================================
    # OBTENER RUTA
    # =====================================================

    features = resultado.get(
        "features",
        []
    )


    if not features:

        raise Exception(
            "OpenRouteService no devolvió "
            "ninguna ruta."
        )


    ruta = features[0]


    # =====================================================
    # OBTENER PROPIEDADES
    # =====================================================

    propiedades = ruta.get(
        "properties",
        {}
    )


    resumen = propiedades.get(
        "summary",
        {}
    )


    # =====================================================
    # OBTENER DISTANCIA
    #
    # ORS devuelve la distancia en metros.
    # =====================================================

    distancia_metros = resumen.get(
        "distance"
    )


    if distancia_metros is None:

        raise Exception(
            "La respuesta no contiene "
            "la distancia de la ruta."
        )


    distancia_km = (

        float(distancia_metros)
        / 1000

    )


    # =====================================================
    # OBTENER DURACIÓN
    #
    # ORS devuelve la duración en segundos.
    # =====================================================

    duracion_segundos = resumen.get(
        "duration"
    )


    if duracion_segundos is None:

        raise Exception(
            "La respuesta no contiene "
            "la duración de la ruta."
        )


    # =====================================================
    # CONVERTIR DURACIÓN A MINUTOS
    # =====================================================

    duracion_conduccion_min = (

        float(duracion_segundos)
        / 60

    )


    # =====================================================
    # TIEMPO TOTAL ESTIMADO DE ENTREGA
    #
    # Tiempo de conducción
    # +
    # tiempo aproximado de entrega
    # =====================================================

    duracion_total_min = (

        duracion_conduccion_min
        + TIEMPO_ENTREGA_MIN

    )


    # =====================================================
    # OBTENER GEOMETRÍA
    # =====================================================

    geometria = ruta.get(
        "geometry"
    )


    if not geometria:

        raise Exception(
            "OpenRouteService no devolvió "
            "la geometría de la ruta."
        )


    # =====================================================
    # VALIDAR TIPO DE GEOMETRÍA
    # =====================================================

    if geometria.get(
        "type"
    ) != "LineString":

        raise Exception(
            "La geometría recibida "
            "no es un LineString válido."
        )


    # =====================================================
    # VALIDAR COORDENADAS DE LA RUTA
    # =====================================================

    coordenadas = geometria.get(
        "coordinates",
        []
    )


    if not coordenadas:

        raise Exception(
            "La ruta no contiene "
            "coordenadas."
        )


    # =====================================================
    # MOSTRAR INFORMACIÓN EN CONSOLA
    # =====================================================

    print(
        "🚚 Ruta calculada correctamente."
    )

    print(
        f"📏 Distancia: "
        f"{distancia_km:.2f} km"
    )

    print(
        f"🚗 Tiempo de conducción: "
        f"{duracion_conduccion_min:.2f} min"
    )

    print(
        f"📦 Tiempo de entrega: "
        f"{TIEMPO_ENTREGA_MIN:.2f} min"
    )

    print(
        f"⏱️ Tiempo total estimado: "
        f"{duracion_total_min:.2f} min"
    )

    print(
        f"🗺️ Puntos de la ruta: "
        f"{len(coordenadas)}"
    )


    # =====================================================
    # DEVOLVER RESULTADO
    # =====================================================

    return {

        "distancia_km":
            round(
                distancia_km,
                2
            ),

        "duracion_min":
            round(
                duracion_total_min,
                2
            ),

        "duracion_conduccion_min":
            round(
                duracion_conduccion_min,
                2
            ),

        "tiempo_entrega_min":
            TIEMPO_ENTREGA_MIN,

        "geometria":
            geometria

    }