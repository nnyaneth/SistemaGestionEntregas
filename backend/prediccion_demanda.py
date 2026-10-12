
import os
import joblib
import pandas as pd

# Ubicación de los archivos del modelo
CARPETA_ACTUAL = os.path.dirname(
    os.path.abspath(__file__)
)

RUTA_MODELO = os.path.join(
    CARPETA_ACTUAL,
    "modelo_ml",
    "modelo_demanda.joblib"
)

RUTA_VARIABLES = os.path.join(
    CARPETA_ACTUAL,
    "modelo_ml",
    "variables_demanda.joblib"
)

# Cargar el modelo entrenado
modelo = joblib.load(RUTA_MODELO)

# Cargar las variables
variables = joblib.load(RUTA_VARIABLES)


def predecir_demanda(
    id_producto,
    dia_semana,
    dia_mes,
    ventas_ayer,
    ventas_hace_7_dias,
    promedio_7_dias
):
    # Preparar los datos de entrada
    datos = pd.DataFrame([{
        "id_producto": id_producto,
        "dia_semana": dia_semana,
        "dia_mes": dia_mes,
        "ventas_ayer": ventas_ayer,
        "ventas_hace_7_dias": ventas_hace_7_dias,
        "promedio_7_dias": promedio_7_dias
    }])

    # Ordenar las columnas
    datos = datos[variables]

    # Realizar la predicción
    resultado = modelo.predict(datos)

    # Devolver unidades enteras
    unidades = max(0, round(float(resultado[0])))

    return unidades