import os
import requests


# ==========================================
# UBICACIÓN FIJA DEL LOCAL
# ==========================================

LAT_ORIGEN = -10.664318012426412
LON_ORIGEN = -76.253655557701


# ==========================================
# DECODIFICAR POLYLINE DE OPENROUTESERVICE
# ==========================================

def decodificar_polyline(polyline):

    coordenadas = []

    index = 0
    lat = 0
    lon = 0

    while index < len(polyline):

        # Latitud
        resultado = 0
        desplazamiento = 0

        while True:
            b = ord(polyline[index]) - 63
            index += 1

            resultado |= (b & 0x1f) << desplazamiento
            desplazamiento += 5

            if b < 0x20:
                break

        delta_lat = (
            -(resultado >> 1)
            if resultado & 1
            else resultado >> 1
        )

        lat += delta_lat

        # Longitud
        resultado = 0
        desplazamiento = 0

        while True:
            b = ord(polyline[index]) - 63
            index += 1

            resultado |= (b & 0x1f) << desplazamiento
            desplazamiento += 5

            if b < 0x20:
                break

        delta_lon = (
            -(resultado >> 1)
            if resultado & 1
            else resultado >> 1
        )

        lon += delta_lon

        coordenadas.append([
            lon / 100000.0,
            lat / 100000.0
        ])

    return coordenadas


# ==========================================
# CALCULAR RUTA
# ==========================================

def calcular_ruta(lat_destino, lon_destino):

    api_key = os.getenv("ORS_API_KEY")

    if not api_key:
        raise Exception(
            "No se encontró ORS_API_KEY en las variables de entorno."
        )

    url = (
        "https://api.openrouteservice.org/"
        "v2/directions/driving-car"
    )

    headers = {
        "Authorization": api_key,
        "Content-Type": "application/json"
    }

    datos = {
        "coordinates": [
            [LON_ORIGEN, LAT_ORIGEN],
            [float(lon_destino), float(lat_destino)]
        ]
    }

    print("==========================================")
    print("CALCULANDO RUTA ORS")
    print("ORIGEN:", LON_ORIGEN, LAT_ORIGEN)
    print(
        "DESTINO:",
        float(lon_destino),
        float(lat_destino)
    )
    print("==========================================")

    respuesta = requests.post(
        url,
        json=datos,
        headers=headers,
        timeout=30
    )

    print("STATUS ORS:", respuesta.status_code)

    if respuesta.status_code != 200:
        print("RESPUESTA ORS:", respuesta.text)

        raise Exception(
            f"Error OpenRouteService: {respuesta.text}"
        )

    resultado = respuesta.json()

    # ==========================================
    # OBTENER RUTA
    # ==========================================

    rutas = resultado.get("routes", [])

    if not rutas:
        raise Exception(
            "OpenRouteService no devolvió una ruta."
        )

    ruta = rutas[0]

    # ==========================================
    # DISTANCIA Y DURACIÓN
    # ==========================================

    resumen = ruta.get("summary", {})

    distancia_km = (
        resumen.get("distance", 0) / 1000
    )

    duracion_min = (
        resumen.get("duration", 0) / 60
    )

    # ==========================================
    # GEOMETRÍA
    # ==========================================

    geometria_codificada = ruta.get("geometry")

    if not geometria_codificada:
        raise Exception(
            "OpenRouteService no devolvió la geometría."
        )

    # Decodificar la ruta
    coordenadas = decodificar_polyline(
        geometria_codificada
    )

    if not coordenadas:
        raise Exception(
            "No se pudieron decodificar los puntos de la ruta."
        )

    print("==========================================")
    print("RUTA ENCONTRADA")
    print("Distancia:", distancia_km, "km")
    print("Duración:", duracion_min, "min")
    print(
        "Puntos de ruta:",
        len(coordenadas)
    )
    print("==========================================")

    # ==========================================
    # DEVOLVER DATOS AL JAVASCRIPT
    # ==========================================

    return {
        "distancia_km": round(distancia_km, 2),
        "duracion_min": round(duracion_min, 2),
        "geometria": {
            "type": "LineString",
            "coordinates": coordenadas
        }
    }