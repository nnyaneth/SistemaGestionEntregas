FROM python:3.10-slim

# Instalar dependencias del sistema y el driver ODBC 17 para SQL Server
RUN apt-get update && apt-get install -y \
    curl \
    gnupg2 \
    unixodbc-dev \
    && curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg \
    && curl -fsSL https://packages.microsoft.com/config/debian/12/prod.list | tee /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql17 \
    && rm -rf /var/lib/apt/lists/*

# Definir la raíz del proyecto
WORKDIR /app

# Instalar librerías de Python desde la raíz
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el código del proyecto
COPY . .

# Cambiar la carpeta de trabajo directamente a backend
WORKDIR /app/backend

# Ejecutar gunicorn directamente sobre app.py
CMD ["gunicorn", "app:app"]