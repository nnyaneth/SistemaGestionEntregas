
import os
import joblib
import pandas as pd

# Obtener la ubicación del archivo actual
carpeta_actual = os.path.dirname(os.path.abspath(__file__))

# Ubicación de los archivos del modelo
ruta_modelo = os.path.join(
    carpeta_actual, "modelo_ml", "modelo_demanda.joblib"
)

ruta_variables = os.path.join(
    carpeta_actual, "modelo_ml", "variables_demanda.joblib"
)

# Cargar el modelo y sus variables
modelo = joblib.load(ruta_modelo)
variables = joblib.load(ruta_variables)

# Datos de ejemplo: Hamburguesa Clásica
# Simulamos una predicción para el jueves 1 de octubre de 2026
datos = pd.DataFrame([{
    "id_producto": 1,
    "dia_semana": 3,
    "dia_mes": 1,
    "ventas_ayer": 15,
    "ventas_hace_7_dias": 13,
    "promedio_7_dias": 16.5
}])

# Organizar las columnas en el orden correcto
datos = datos[variables]

# Realizar la predicción
prediccion = modelo.predict(datos)

# Redondear a unidades enteras
unidades = max(0, round(float(prediccion[0])))

print("PREDICCIÓN DE DEMANDA")
print("----------------------------")
print("Producto: Hamburguesa Clásica")
print("Fecha: 01/10/2026")
print("Ventas del día anterior: 15")
print("Promedio de los últimos 7 días: 16.5")
print("Demanda estimada:", unidades, "unidades")