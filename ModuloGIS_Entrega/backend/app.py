import os

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request


# =========================================================
# CARGAR VARIABLES DE ENTORNO
# =========================================================

# .env está en la raíz de ModuloGIS
# y este archivo está dentro de backend/

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

load_dotenv(
    os.path.join(
        BASE_DIR,
        ".env"
    )
)


# =========================================================
# IMPORTAR FUNCIONES GIS
# =========================================================

from geocodificacion import geocodificar_direccion
from rutas import calcular_ruta


# =========================================================
# CREAR APLICACIÓN FLASK
# =========================================================

app = Flask(
    __name__,
    template_folder="../templates",
    static_folder="../static"
)


# =========================================================
# PÁGINA PRINCIPAL DEL MÓDULO GIS
# =========================================================

@app.route("/")
def inicio():

    google_maps_api_key = os.getenv(
        "GOOGLE_MAPS_API_KEY"
    )

    if not google_maps_api_key:

        return (
            "Error: no se encontró "
            "GOOGLE_MAPS_API_KEY en el archivo .env.",
            500
        )

    return render_template(
        "mapa_gis.html",
        google_maps_api_key=google_maps_api_key
    )


# =========================================================
# API: GEOCODIFICACIÓN
# =========================================================

@app.route(
    "/geocodificar",
    methods=["POST"]
)
def geocodificar():

    try:

        datos = request.get_json()

        if not datos:

            return jsonify({
                "error":
                    "No se recibieron datos."
            }), 400


        direccion = datos.get(
            "direccion",
            ""
        ).strip()


        if not direccion:

            return jsonify({
                "error":
                    "La dirección es obligatoria."
            }), 400


        resultado = (
            geocodificar_direccion(
                direccion
            )
        )


        return jsonify(
            resultado
        )


    except Exception as error:

        print(
            "Error en /geocodificar:",
            error
        )

        return jsonify({
            "error": str(error)
        }), 500


# =========================================================
# API: CÁLCULO DE RUTA
# =========================================================

@app.route(
    "/ruta",
    methods=["POST"]
)
def ruta():

    try:

        datos = request.get_json()

        if not datos:

            return jsonify({
                "error":
                    "No se recibieron datos."
            }), 400


        lat_destino = datos.get(
            "lat_destino"
        )

        lon_destino = datos.get(
            "lon_destino"
        )


        if (
            lat_destino is None
            or lon_destino is None
        ):

            return jsonify({
                "error":
                    "Faltan las coordenadas del destino."
            }), 400


        resultado = calcular_ruta(
            lat_destino,
            lon_destino
        )


        return jsonify(
            resultado
        )


    except Exception as error:

        print(
            "Error en /ruta:",
            error
        )

        return jsonify({
            "error": str(error)
        }), 500


# =========================================================
# EJECUTAR SERVIDOR
# =========================================================

if __name__ == "__main__":

    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000
    )