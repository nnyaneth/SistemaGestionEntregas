import os
import requests


ORS_API_KEY = os.getenv("ORS_API_KEY")

# ==========================================
# UBICACIÓN FIJA DEL LOCAL
# ==========================================

LAT_ORIGEN = -10.664318012426412
LON_ORIGEN = -76.253655557701


# ==========================================
# CALCULAR RUTA CON OPENROUTESERVICE
# ==========================================

def calcular_ruta(lat_destino, lon_destino):

    url = "https://api.openrouteservice.org/v2/directions/driving-car"

    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json"
    }

    datos = {
        "coordinates": [
            [LON_ORIGEN, LAT_ORIGEN],
            [float(lon_destino), float(lat_destino)]
        ]
    }

    respuesta = requests.post(
        url,
        json=datos,
        headers=headers
    )

    if respuesta.status_code != 200:
        raise Exception(
            f"Error OpenRouteService: {respuesta.text}"
        )

    resultado = respuesta.json()

    ruta = resultado["routes"][0]

    distancia_km = ruta["summary"]["distance"] / 1000

    duracion_min = ruta["summary"]["duration"] / 60

    return {
        "distancia_km": round(distancia_km, 2),
        "duracion_min": round(duracion_min),
        "geometria": resultado["routes"][0]["geometry"]
    }