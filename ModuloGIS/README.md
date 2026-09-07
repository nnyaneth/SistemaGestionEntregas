# Módulo GIS — Sistema de Gestión de Entregas

## 1. Descripción

El módulo GIS (Sistema de Información Geográfica) permite gestionar y visualizar las rutas de entrega dentro del Sistema de Gestión de Entregas.

El módulo permite:

* Ingresar una dirección de destino.
* Obtener las coordenadas geográficas (latitud y longitud).
* Calcular una ruta real desde el punto de origen hasta el destino.
* Obtener la distancia de la ruta en kilómetros.
* Obtener el tiempo estimado de conducción.
* Considerar un tiempo adicional para la entrega.
* Visualizar el origen, destino y ruta sobre Google Maps.

## 2. Tecnologías utilizadas

* Python
* Flask
* HTML5
* CSS3
* JavaScript
* Google Maps JavaScript API
* OpenRouteService
* API de geocodificación de OpenRouteService
* API de rutas de OpenRouteService

## 3. Estructura del módulo

```text
ModuloGIS/
├── backend/
│   ├── app.py
│   ├── geocodificacion.py
│   └── rutas.py
├── static/
│   ├── css/
│   │   └── gis.css
│   └── js/
│       └── gis.js
├── templates/
│   └── mapa_gis.html
├── .env
├── .env.example
├── README.md
└── requirements-gis.txt
```

## 4. Requisitos

Se necesita tener instalado:

* Python 3
* Una cuenta/proyecto de Google Cloud con Google Maps JavaScript API habilitada.
* Una cuenta de OpenRouteService con una API Key.

## 5. Instalación

### Paso 1: Abrir la carpeta

Abrir una terminal dentro de la carpeta:

```text
ModuloGIS
```

### Paso 2: Crear un entorno virtual

Ejecutar:

```bash
python -m venv venv
```

### Paso 3: Activar el entorno virtual

En Windows PowerShell:

```powershell
venv\Scripts\Activate.ps1
```

### Paso 4: Instalar las dependencias

Ejecutar:

```bash
pip install -r requirements-gis.txt
```

## 6. Configuración de las API

Crear un archivo llamado:

```text
.env
```

en la carpeta principal de `ModuloGIS`.

Utilizar como referencia el archivo:

```text
.env.example
```

El archivo `.env` debe contener:

```env
ORS_API_KEY=TU_CLAVE_DE_OPENROUTESERVICE
GOOGLE_MAPS_API_KEY=TU_CLAVE_DE_GOOGLE_MAPS
```

No compartir públicamente este archivo, ya que contiene las claves de las API.

## 7. Ejecución

Desde la carpeta `ModuloGIS`, ejecutar:

```bash
python backend/app.py
```

El servidor se iniciará en:

```text
http://127.0.0.1:5000/
```

Abrir esa dirección en el navegador.

## 8. Funcionamiento

El flujo del módulo es:

```text
Dirección de destino
        ↓
Geocodificación
        ↓
Latitud y longitud
        ↓
Cálculo de ruta
        ↓
Distancia y duración
        ↓
Google Maps
        ↓
Visualización de la ruta
```

OpenRouteService se utiliza para obtener las coordenadas y calcular la ruta.

Google Maps JavaScript API se utiliza para mostrar el mapa, los marcadores y la ruta en la interfaz.

## 9. Punto de origen

El módulo utiliza como punto de origen:

```text
Jr. Hilario Cabrera 201, Cerro de Pasco 19001
```

Coordenadas:

```text
Latitud: -10.664318012426412
Longitud: -76.253655557701
```

## 10. Tiempo estimado de entrega

El tiempo proporcionado por OpenRouteService corresponde al tiempo estimado de conducción según la ruta.

Adicionalmente, el módulo considera 5 minutos como tiempo de servicio de entrega.

Por ello:

```text
Tiempo total estimado =
Tiempo de conducción + 5 minutos
```

Este tiempo adicional representa una estimación para la operación de entrega y no corresponde a tráfico en tiempo real.

## 11. Endpoints principales

### Geocodificación

```text
POST /geocodificar
```

Recibe una dirección y devuelve:

```json
{
    "latitud": -10.68363,
    "longitud": -76.25615
}
```

### Cálculo de ruta

```text
POST /ruta
```

Recibe las coordenadas del destino y devuelve información de la ruta, incluyendo:

* Distancia.
* Tiempo de conducción.
* Tiempo adicional de entrega.
* Tiempo total estimado.
* Geometría de la ruta.

## 12. Seguridad

Las claves de las API se almacenan en el archivo `.env`.

El archivo `.env` no debe compartirse ni subirse a repositorios públicos.

Para compartir el proyecto se debe utilizar:

```text
.env.example
```

## 13. Integración con el sistema principal

Este módulo fue desarrollado de manera independiente para facilitar su integración con el Sistema de Gestión de Entregas.

Posteriormente puede integrarse en el módulo de Entregas para utilizar la dirección del pedido como destino y mostrar automáticamente la ruta correspondiente.

La información generada por el módulo GIS puede ser utilizada para registrar:

* Coordenadas del destino.
* Distancia de entrega.
* Duración estimada.
* Ruta de entrega.
* Información geográfica asociada a la entrega.
