# Módulo GIS — Sistema de Gestión de Entregas

## 1. ¿Qué es este módulo?

El módulo GIS (Sistema de Información Geográfica) permite calcular y visualizar rutas de entrega a partir de una dirección de destino.

El usuario ingresa una dirección y el sistema:

1. Busca la ubicación geográfica.
2. Obtiene su latitud y longitud.
3. Calcula una ruta real desde el punto de origen.
4. Obtiene la distancia y el tiempo estimado.
5. Muestra el origen, destino y recorrido en Google Maps.

El módulo fue desarrollado de forma independiente para facilitar su posterior integración con el sistema principal de gestión de entregas.

---

## 2. Funcionalidades

* Ingreso de dirección de destino.
* Geocodificación de direcciones.
* Obtención de coordenadas geográficas.
* Cálculo de rutas reales por calles.
* Cálculo de distancia en kilómetros.
* Cálculo de tiempo estimado de conducción.
* Consideración de tiempo adicional para realizar la entrega.
* Visualización de origen y destino.
* Visualización de la ruta sobre Google Maps.
* Mensajes de estado y manejo de errores.

---

## 3. Tecnologías utilizadas

### Backend

* Python
* Flask
* Requests
* Python-dotenv

### Frontend

* HTML5
* CSS3
* JavaScript

### APIs

* Google Maps JavaScript API
* OpenRouteService

---

## 4. ¿Cómo funciona?

El funcionamiento del módulo sigue el siguiente flujo:

```text
Usuario
   │
   ▼
Ingresa dirección de destino
   │
   ▼
Flask
   │
   ▼
OpenRouteService
   │
   ├── Geocodificación
   │       ↓
   │   Latitud y longitud
   │
   └── Cálculo de ruta
           ↓
      Distancia y duración
           │
           ▼
      Google Maps
           │
           ▼
   Ruta visualizada en el mapa
```

### Distribución de las APIs

**OpenRouteService** se utiliza para:

* Geocodificar la dirección.
* Obtener latitud y longitud.
* Calcular la ruta.
* Obtener distancia.
* Obtener duración.
* Obtener la geometría de la ruta.

**Google Maps JavaScript API** se utiliza para:

* Mostrar el mapa.
* Mostrar los marcadores.
* Visualizar la ruta calculada.

---

# 5. Requisitos

Antes de ejecutar el proyecto se necesita:

* Windows.
* Python 3 instalado.
* Una API Key de OpenRouteService.
* Una API Key de Google Maps.
* Conexión a Internet.

---

# 6. Instalación

## Paso 1 — Abrir el proyecto

Extraer la carpeta `ModuloGIS_Entrega` y abrir una terminal dentro de ella.

La estructura debe comenzar así:

```text
ModuloGIS_Entrega/
├── backend/
├── static/
├── templates/
├── README.md
├── .env.example
└── requirements-gis.txt
```

---

## Paso 2 — Crear un entorno virtual

Ejecutar:

```bash
python -m venv venv
```

---

## Paso 3 — Activar el entorno virtual

En Windows PowerShell:

```powershell
venv\Scripts\Activate.ps1
```

Si aparece `(venv)` al inicio de la terminal, el entorno virtual está activo.

---

## Paso 4 — Instalar las dependencias

Ejecutar:

```bash
pip install -r requirements-gis.txt
```

Las dependencias principales son:

```text
Flask
requests
python-dotenv
```

---

# 7. Configuración de las API Keys

En la carpeta principal existe:

```text
.env.example
```

Este archivo sirve como plantilla.

Crear una copia del archivo y nombrarla:

```text
.env
```

Dentro de `.env` colocar las claves correspondientes:

```env
ORS_API_KEY=TU_CLAVE_DE_OPENROUTESERVICE
GOOGLE_MAPS_API_KEY=TU_CLAVE_DE_GOOGLE_MAPS
```

### Importante

Las claves son privadas.

El archivo:

```text
.env
```

**no debe compartirse ni subirse a repositorios públicos.**

El archivo:

```text
.env.example
```

sí puede compartirse porque solamente contiene los nombres de las variables.

---

# 8. Ejecución

Desde la carpeta principal del proyecto ejecutar:

```bash
python backend/app.py
```

Si todo está correctamente configurado, Flask iniciará el servidor.

Abrir en el navegador:

```text
http://127.0.0.1:5000/
```

También puede utilizarse:

```text
http://localhost:5000/
```

---

# 9. Uso del módulo

Una vez abierta la página:

### 1. Revisar el punto de origen

El origen establecido actualmente es:

```text
Jr. Hilario Cabrera 201, Cerro de Pasco 19001
```

Coordenadas:

```text
Latitud: -10.664318012426412
Longitud: -76.253655557701
```

### 2. Ingresar el destino

Escribir una dirección en el campo correspondiente.

Por ejemplo:

```text
Plaza Daniel Alcides Carrion, Cerro de Pasco, Pasco, Peru
```

### 3. Calcular la ruta

Presionar:

```text
Calcular ruta
```

El sistema realizará automáticamente:

```text
Dirección
   ↓
Geocodificación
   ↓
Coordenadas
   ↓
Ruta
   ↓
Distancia + tiempo
   ↓
Visualización en Google Maps
```

### 4. Revisar los resultados

La interfaz muestra:

* Distancia.
* Tiempo estimado.
* Latitud.
* Longitud.
* Ruta sobre el mapa.

---

# 10. Tiempo estimado de entrega

OpenRouteService proporciona el tiempo estimado de conducción correspondiente a la ruta calculada.

Además, el sistema agrega **5 minutos** como tiempo estimado para realizar la entrega.

Por lo tanto:

```text
Tiempo total estimado =
Tiempo de conducción + 5 minutos
```

Este tiempo adicional es una estimación operativa para el proceso de entrega.

No representa tráfico en tiempo real.

---

# 11. Endpoints del backend

## Geocodificación

```text
POST /geocodificar
```

Recibe una dirección y devuelve sus coordenadas.

Ejemplo de respuesta:

```json
{
    "latitud": -10.68363,
    "longitud": -76.25615
}
```

---

## Cálculo de ruta

```text
POST /ruta
```

Recibe las coordenadas del destino.

Devuelve:

* Distancia.
* Tiempo de conducción.
* Tiempo adicional de entrega.
* Tiempo total estimado.
* Geometría de la ruta.

---

# 12. Estructura del proyecto

```text
ModuloGIS_Entrega/
│
├── backend/
│   ├── app.py
│   ├── geocodificacion.py
│   └── rutas.py
│
├── static/
│   ├── css/
│   │   └── gis.css
│   └── js/
│       └── gis.js
│
├── templates/
│   └── mapa_gis.html
│
├── .env.example
├── .gitignore
├── README.md
└── requirements-gis.txt
```

### Descripción de los archivos

**`app.py`**
Inicia Flask y define los endpoints principales.

**`geocodificacion.py`**
Se encarga de convertir una dirección en coordenadas geográficas.

**`rutas.py`**
Calcula la ruta y obtiene distancia, duración y geometría.

**`gis.js`**
Controla la interacción del usuario, las solicitudes al backend y la visualización del mapa.

**`gis.css`**
Contiene los estilos visuales del módulo.

**`mapa_gis.html`**
Contiene la interfaz principal del módulo GIS.

**`requirements-gis.txt`**
Contiene las dependencias necesarias para ejecutar el backend.

**`.env.example`**
Plantilla para configurar las API Keys.

---

# 13. Seguridad

Las API Keys se manejan mediante variables de entorno.

El archivo `.env` se excluye del proyecto mediante `.gitignore`.

No colocar las claves directamente dentro del código fuente.

Para compartir el proyecto utilizar únicamente:

```text
.env.example
```

---

# 14. Integración con el sistema principal

El módulo se encuentra separado del resto del Sistema de Gestión de Entregas para facilitar su integración.

La integración prevista es dentro del módulo de **Entregas**.

El flujo final puede ser:

```text
Pedido
   ↓
Entrega
   ↓
Dirección del cliente
   ↓
Módulo GIS
   ↓
Geocodificación
   ↓
Ruta
   ↓
Distancia y duración
   ↓
Información de la entrega
```

De esta manera, la dirección registrada para una entrega puede utilizarse como destino para calcular y visualizar automáticamente su recorrido.

---

# 15. Solución de problemas

### El mapa no carga

Verificar que:

* La API Key de Google Maps sea correcta.
* Google Maps JavaScript API esté habilitada.
* La restricción de sitios web permita:

```text
http://localhost:5000/*
http://127.0.0.1:5000/*
```

---

### Error relacionado con `ORS_API_KEY`

Verificar que exista el archivo:

```text
.env
```

y que contenga:

```env
ORS_API_KEY=TU_CLAVE
```

---

### No se encuentra la dirección

Comprobar que la dirección esté escrita correctamente e incluya, de ser posible:

```text
Calle + ciudad + región + país
```

---

### El servidor no inicia

Verificar que las dependencias estén instaladas:

```bash
pip install -r requirements-gis.txt
```

Luego ejecutar nuevamente:

```bash
python backend/app.py
```

---

# 16. Resultado esperado

Al ejecutar correctamente el módulo, el usuario podrá ingresar una dirección y visualizar:

```text
✓ Dirección encontrada
✓ Coordenadas obtenidas
✓ Ruta calculada
✓ Distancia calculada
✓ Tiempo estimado
✓ Ruta dibujada sobre Google Maps
```

El módulo está preparado para ser integrado posteriormente al Sistema de Gestión de Entregas.