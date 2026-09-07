import os

import requests


# =========================================================
# COORDENADAS CONOCIDAS
# =========================================================

LATITUD_PLAZA_CARRION = -10.68363
LONGITUD_PLAZA_CARRION = -76.25615


# =========================================================
# GEOCODIFICACIÓN CON OPENROUTESERVICE / HEIGIT
# =========================================================

def geocodificar_direccion(direccion):

    # =====================================================
    # LIMPIAR DIRECCIÓN
    # =====================================================

    direccion_limpia = direccion.strip().lower()


    # =====================================================
    # CORRECCIÓN PARA PLAZA DANIEL ALCIDES CARRIÓN
    #
    # ORS está devolviendo una ubicación incorrecta
    # para esta plaza.
    # =====================================================

    if (
        "plaza daniel alcides carrion"
        in direccion_limpia
        or
        "plaza daniel alcides carrión"
        in direccion_limpia
    ):

        print(
            "📍 Ubicación conocida: "
            "Plaza Daniel Alcides Carrión"
        )

        return {

            "latitud":
                LATITUD_PLAZA_CARRION,

            "longitud":
                LONGITUD_PLAZA_CARRION

        }


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
    # ENDPOINT DE GEOCODIFICACIÓN
    # =====================================================

    url = (
        "https://api.heigit.org/"
        "pelias/v1/search"
    )


    # =====================================================
    # PARÁMETROS
    # =====================================================

    parametros = {

        "text": direccion,

        "boundary.country": "PE",

        "api_key": api_key

    }


    # =====================================================
    # SOLICITUD
    # =====================================================

    respuesta = requests.get(

        url,

        params=parametros,

        timeout=15

    )


    # =====================================================
    # VALIDAR RESPUESTA
    # =====================================================

    if respuesta.status_code != 200:

        raise Exception(
            "Error de OpenRouteService: "
            + respuesta.text
        )


    resultado = respuesta.json()


    # =====================================================
    # OBTENER RESULTADOS
    # =====================================================

    features = resultado.get(
        "features",
        []
    )


    if not features:

        raise Exception(
            "OpenRouteService no encontró "
            "la dirección indicada."
        )


    # =====================================================
    # OBTENER PRIMER RESULTADO
    # =====================================================

    primera_coincidencia = features[0]


    geometria = primera_coincidencia.get(
        "geometry"
    )


    if not geometria:

        raise Exception(
            "La respuesta no contiene "
            "coordenadas."
        )


    coordenadas = geometria.get(
        "coordinates"
    )


    if (
        not coordenadas
        or len(coordenadas) < 2
    ):

        raise Exception(
            "Las coordenadas recibidas "
            "no son válidas."
        )


    # =====================================================
    # ORDEN DE COORDENADAS DE ORS
    #
    # [LONGITUD, LATITUD]
    # =====================================================

    longitud = float(
        coordenadas[0]
    )

    latitud = float(
        coordenadas[1]
    )


    # =====================================================
    # DEVOLVER RESULTADO
    # =====================================================

    return {

        "latitud":
            latitud,

        "longitud":
            longitud

    }