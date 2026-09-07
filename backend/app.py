import os

from dotenv import load_dotenv

load_dotenv()

from flask import Flask, jsonify, request, render_template
from datetime import datetime
from sqlalchemy import text
from urllib.parse import quote_plus

from extensions import db
from models import Cliente, Producto, Pedido, DetallePedido, Repartidor, Entrega
from rutas import calcular_ruta

import requests

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "templates"),
    static_folder=os.path.join(BASE_DIR, "static")
)

# ==========================================
# CONEXIÓN CON SQL SERVER
# ==========================================

conexion_sql = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=sql8020.site4now.net;"
    "DATABASE=db_ace096_sistemagestionentr;"
    "UID=db_ace096_sistemagestionentr_admin;"
    "PWD=Jasper@2017;"
)

app.config["SQLALCHEMY_DATABASE_URI"] = (
    "mssql+pyodbc:///?odbc_connect="
    + quote_plus(conexion_sql)
)

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False


# Inicializar SQLAlchemy
db.init_app(app)


# ==========================================
# RUTA PRINCIPAL
# ==========================================

@app.route("/")
def inicio():
    return render_template("index.html")

@app.route("/clientes-pagina")
def pagina_clientes():
    return render_template("clientes.html")

@app.route("/productos-pagina")
def pagina_productos():
    return render_template("productos.html")

@app.route("/pedidos-pagina")
def pagina_pedidos():
    return render_template("pedidos.html")

@app.route("/entregas-pagina")
def pagina_entregas():
    return render_template("entregas.html")
# ==========================================
# PRUEBA DE CONEXIÓN
# ==========================================

@app.route("/prueba-db")
def prueba_db():
    try:
        resultado = db.session.execute(
            text("SELECT DB_NAME() AS base_datos")
        ).fetchone()

        return f"Conexión exitosa. Base de datos: {resultado[0]}"

    except Exception as e:
        return f"Error de conexión: {str(e)}"


# ==========================================
# OBTENER CLIENTES
# ==========================================

@app.route("/clientes", methods=["GET"])
def obtener_clientes():
    try:
        clientes = Cliente.query.all()

        lista_clientes = []

        for cliente in clientes:
            lista_clientes.append({
                "id_cliente": cliente.id_cliente,
                "nombre": cliente.nombre,
                "telefono": cliente.telefono,
                "correo": cliente.correo,
                "direccion": cliente.direccion,
                "latitud": float(cliente.latitud)
                    if cliente.latitud else None,
                "longitud": float(cliente.longitud)
                    if cliente.longitud else None
            })

        return jsonify(lista_clientes)

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


@app.route("/clientes", methods=["POST"])
def crear_cliente():
    try:
        datos = request.get_json()

        nuevo_cliente = Cliente(
            nombre=datos["nombre"],
            telefono=datos["telefono"],
            correo=datos.get("correo"),
            direccion=datos["direccion"],
            latitud=datos.get("latitud"),
            longitud=datos.get("longitud")
        )

        db.session.add(nuevo_cliente)
        db.session.commit()

        return jsonify({
            "mensaje": "Cliente registrado correctamente",
            "id_cliente": nuevo_cliente.id_cliente
        }), 201

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "error": str(e)
        }), 500

@app.route("/clientes/<int:id>", methods=["GET"])
def obtener_cliente(id):

    cliente = Cliente.query.get(id)

    if not cliente:
        return jsonify({
            "error": "Cliente no encontrado"
        }), 404

    return jsonify({
        "id_cliente": cliente.id_cliente,
        "nombre": cliente.nombre,
        "telefono": cliente.telefono,
        "correo": cliente.correo,
        "direccion": cliente.direccion,
        "latitud": cliente.latitud,
        "longitud": cliente.longitud
    })


@app.route("/clientes/<int:id>", methods=["PUT"])
def actualizar_cliente(id):

    cliente = Cliente.query.get(id)

    if not cliente:
        return jsonify({
            "error": "Cliente no encontrado"
        }), 404

    datos = request.get_json()

    cliente.nombre = datos.get("nombre")
    cliente.telefono = datos.get("telefono")
    cliente.correo = datos.get("correo")
    cliente.direccion = datos.get("direccion")
    cliente.latitud = datos.get("latitud")
    cliente.longitud = datos.get("longitud")

    db.session.commit()

    return jsonify({
        "mensaje": "Cliente actualizado correctamente"
    })
    
# ==========================================
# ELIMINAR CLIENTE
# ==========================================

@app.route("/clientes/<int:id>", methods=["DELETE"])
def eliminar_cliente(id):

    cliente = Cliente.query.get(id)

    if not cliente:

        return jsonify({
            "error": "Cliente no encontrado"
        }), 404

    db.session.delete(cliente)

    db.session.commit()

    return jsonify({
        "mensaje": "Cliente eliminado correctamente"
    })
    
    
    
# ==========================================
# OBTENER PRODUCTOS
# ==========================================

@app.route("/productos", methods=["GET"])
def obtener_productos():

    try:

        productos = Producto.query.all()

        lista_productos = []

        for producto in productos:

            lista_productos.append({
                "id_producto": producto.id_producto,
                "nombre": producto.nombre,
                "descripcion": producto.descripcion,
                "precio": float(producto.precio),
                "stock": producto.stock
            })

        return jsonify(lista_productos)

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

# ==========================================
# CREAR PRODUCTO
# ==========================================

@app.route("/productos", methods=["POST"])
def crear_producto():

    try:

        datos = request.get_json()

        nuevo_producto = Producto(
            nombre=datos["nombre"],
            descripcion=datos.get("descripcion"),
            precio=datos["precio"],
            stock=datos["stock"]
        )

        db.session.add(nuevo_producto)

        db.session.commit()

        return jsonify({
            "mensaje": "Producto registrado correctamente",
            "id_producto": nuevo_producto.id_producto
        }), 201

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "error": str(e)
        }), 500
        
        
# ==========================================
# OBTENER PRODUCTO POR ID
# ==========================================

@app.route("/productos/<int:id>", methods=["GET"])
def obtener_producto(id):

    producto = Producto.query.get(id)

    if not producto:

        return jsonify({
            "error": "Producto no encontrado"
        }), 404

    return jsonify({
        "id_producto": producto.id_producto,
        "nombre": producto.nombre,
        "descripcion": producto.descripcion,
        "precio": float(producto.precio),
        "stock": producto.stock
    })
    
# ==========================================
# ACTUALIZAR PRODUCTO
# ==========================================

@app.route("/productos/<int:id>", methods=["PUT"])
def actualizar_producto(id):

    producto = Producto.query.get(id)

    if not producto:

        return jsonify({
            "error": "Producto no encontrado"
        }), 404

    datos = request.get_json()

    producto.nombre = datos.get("nombre")
    producto.descripcion = datos.get("descripcion")
    producto.precio = datos.get("precio")
    producto.stock = datos.get("stock")

    db.session.commit()

    return jsonify({
        "mensaje": "Producto actualizado correctamente"
    })
    
# ==========================================
# ELIMINAR PRODUCTO
# ==========================================

@app.route("/productos/<int:id>", methods=["DELETE"])
def eliminar_producto(id):

    producto = Producto.query.get(id)

    if not producto:

        return jsonify({
            "error": "Producto no encontrado"
        }), 404

    db.session.delete(producto)

    db.session.commit()

    return jsonify({
        "mensaje": "Producto eliminado correctamente"
    })
    
    
# ==========================================
# OBTENER PEDIDOS
# ==========================================

@app.route("/pedidos", methods=["GET"])
def obtener_pedidos():

    try:

        pedidos = Pedido.query.all()

        lista_pedidos = []

        for pedido in pedidos:

            lista_pedidos.append({
                "id_pedido": pedido.id_pedido,
                "id_cliente": pedido.id_cliente,
                "fecha": pedido.fecha,
                "total": float(pedido.total),
                "estado": pedido.estado
            })

        return jsonify(lista_pedidos)

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500
        
        
# ==========================================
# OBTENER DETALLES DE UN PEDIDO
# ==========================================

@app.route("/pedidos/<int:id_pedido>/detalles", methods=["GET"])
def obtener_detalles_pedido(id_pedido):

    try:

        detalles = DetallePedido.query.filter_by(
            id_pedido=id_pedido
        ).all()

        lista_detalles = []

        for detalle in detalles:

            producto = Producto.query.get(
                detalle.id_producto
            )

            lista_detalles.append({
                "id_detalle": detalle.id_detalle,
                "id_pedido": detalle.id_pedido,
                "id_producto": detalle.id_producto,
                "producto": producto.nombre if producto else "",
                "cantidad": detalle.cantidad,
                "precio": float(detalle.precio),
                "subtotal": float(detalle.subtotal)
            })

        return jsonify(lista_detalles)

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500
        
# ==========================================
# CREAR PEDIDO
# ==========================================

@app.route("/pedidos", methods=["POST"])
def crear_pedido():

    try:

        datos = request.get_json()

        id_cliente = datos["id_cliente"]
        detalles = datos["detalles"]

        # ------------------------------------------
        # VALIDAR CLIENTE
        # ------------------------------------------

        cliente = Cliente.query.get(id_cliente)

        if not cliente:

            return jsonify({
                "error": "Cliente no encontrado"
            }), 404


        # ------------------------------------------
        # VALIDAR QUE HAYA PRODUCTOS
        # ------------------------------------------

        if not detalles:

            return jsonify({
                "error": "El pedido debe tener al menos un producto"
            }), 400


        total = 0


        # ------------------------------------------
        # CREAR PEDIDO
        # ------------------------------------------

        nuevo_pedido = Pedido(
            id_cliente=id_cliente,
            total=0,
            estado="Pendiente"
        )

        db.session.add(nuevo_pedido)

        db.session.flush()


        # ------------------------------------------
        # CREAR DETALLES
        # ------------------------------------------

        for detalle in detalles:

            producto = Producto.query.get(
                detalle["id_producto"]
            )

            if not producto:

                raise Exception(
                    f"Producto {detalle['id_producto']} no encontrado"
                )


            cantidad = int(
                detalle["cantidad"]
            )


            if cantidad < 1:

                raise Exception(
                    "La cantidad debe ser mayor que cero"
                )


            precio = float(
                producto.precio
            )


            subtotal = cantidad * precio


            total += subtotal


            nuevo_detalle = DetallePedido(

                id_pedido=nuevo_pedido.id_pedido,

                id_producto=producto.id_producto,

                cantidad=cantidad,

                precio=precio,

                subtotal=subtotal

            )


            db.session.add(nuevo_detalle)


        # ------------------------------------------
        # ACTUALIZAR TOTAL
        # ------------------------------------------

        nuevo_pedido.total = total


        # ------------------------------------------
        # GUARDAR TODO
        # ------------------------------------------

        db.session.commit()


        return jsonify({

            "mensaje": "Pedido registrado correctamente",

            "id_pedido":
                nuevo_pedido.id_pedido,

            "total":
                float(nuevo_pedido.total)

        }), 201


    except Exception as e:

        db.session.rollback()

        return jsonify({

            "error": str(e)

        }), 500
        
        
# ==========================================
# OBTENER REPARTIDORES
# ==========================================

@app.route("/repartidores", methods=["GET"])
def obtener_repartidores():

    try:

        repartidores = Repartidor.query.all()

        lista_repartidores = []

        for repartidor in repartidores:

            lista_repartidores.append({

                "id_repartidor":
                    repartidor.id_repartidor,

                "nombre":
                    repartidor.nombre,

                "telefono":
                    repartidor.telefono,

                "estado":
                    repartidor.estado

            })

        return jsonify(lista_repartidores)

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500
        
# ==========================================
# CREAR REPARTIDOR
# ==========================================

@app.route("/repartidores", methods=["POST"])
def crear_repartidor():

    try:

        datos = request.get_json()

        nuevo_repartidor = Repartidor(

            nombre=datos["nombre"],

            telefono=datos["telefono"],

            estado=datos.get(
                "estado",
                "Disponible"
            )

        )

        db.session.add(nuevo_repartidor)

        db.session.commit()

        return jsonify({

            "mensaje":
                "Repartidor registrado correctamente",

            "id_repartidor":
                nuevo_repartidor.id_repartidor

        }), 201

    except Exception as e:

        db.session.rollback()

        return jsonify({

            "error": str(e)

        }), 500
        
# ==========================================
# OBTENER ENTREGAS
# ==========================================
@app.route("/entregas", methods=["GET"])
def obtener_entregas():

    try:

        entregas = Entrega.query.all()

        lista_entregas = []

        for entrega in entregas:

            lista_entregas.append({

                "id_entrega": entrega.id_entrega,
                "id_pedido": entrega.id_pedido,
                "id_repartidor": entrega.id_repartidor,
                "direccion_destino": entrega.direccion_destino,

                "latitud_destino":
                    float(entrega.latitud_destino)
                    if entrega.latitud_destino else None,

                "longitud_destino":
                    float(entrega.longitud_destino)
                    if entrega.longitud_destino else None,

                "distancia_km":
                    float(entrega.distancia_km)
                    if entrega.distancia_km else None,

                "duracion_min": entrega.duracion_min,
                "estado": entrega.estado,

                "fecha_asignacion":
                    entrega.fecha_asignacion,

                "fecha_entrega":
                    entrega.fecha_entrega
            })

        return jsonify(lista_entregas)

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500
        
@app.route("/entregas", methods=["POST"])
def crear_entrega():

    try:

        datos = request.get_json()

        pedido_id = datos["id_pedido"]

        # ==========================================
        # VERIFICAR SI EL PEDIDO YA TIENE ENTREGA
        # ==========================================

        entrega_existente = Entrega.query.filter_by(
            id_pedido=pedido_id
        ).first()

        if entrega_existente:

            return jsonify({
                "error": "Este pedido ya tiene una entrega asignada"
            }), 400


        # ==========================================
        # VERIFICAR SI EL REPARTIDOR ESTÁ OCUPADO
        # ==========================================

        repartidor_id = datos["id_repartidor"]

        entrega_repartidor = Entrega.query.filter(
            Entrega.id_repartidor == repartidor_id,
            Entrega.estado.in_(["Pendiente", "En camino"])
        ).first()

        if entrega_repartidor:

            return jsonify({
                "error": "Este repartidor ya tiene una entrega activa"
            }), 400


        # ==========================================
        # CREAR ENTREGA
        # ==========================================

        nueva_entrega = Entrega(

            id_pedido=datos["id_pedido"],

            id_repartidor=datos["id_repartidor"],

            direccion_destino=datos["direccion_destino"],

            latitud_destino=datos.get("latitud_destino"),

            longitud_destino=datos.get("longitud_destino"),

            distancia_km=datos.get("distancia_km"),

            duracion_min=datos.get("duracion_min"),

            estado=datos.get(
                "estado",
                "Pendiente"
            ),

            fecha_asignacion=datetime.now()

        )

        db.session.add(nueva_entrega)
        
        repartidor = Repartidor.query.get(
            datos["id_repartidor"]
        )

        if repartidor:
            repartidor.estado = "Ocupado"

        db.session.commit()

        return jsonify({

            "mensaje": "Entrega registrada correctamente",

            "id_entrega":
                nueva_entrega.id_entrega

        }), 201


    except Exception as e:

        db.session.rollback()

        return jsonify({

            "error": str(e)

        }), 500
        
@app.route("/repartidores/disponibles", methods=["GET"])
def obtener_repartidores_disponibles():

    try:

        repartidores = Repartidor.query.filter_by(
            estado="Disponible"
        ).all()

        lista_repartidores = []

        for repartidor in repartidores:

            # Verificar si tiene una entrega activa
            entrega_activa = Entrega.query.filter(
                Entrega.id_repartidor == repartidor.id_repartidor,
                Entrega.estado.in_(["Pendiente", "En camino"])
            ).first()

            # Si tiene una entrega activa, no mostrarlo
            if entrega_activa:
                continue

            lista_repartidores.append({

                "id_repartidor":
                    repartidor.id_repartidor,

                "nombre":
                    repartidor.nombre,

                "telefono":
                    repartidor.telefono,

                "estado":
                    repartidor.estado

            })

        return jsonify(lista_repartidores)

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500
        
        
        
@app.route("/pedidos/disponibles", methods=["GET"])
def obtener_pedidos_disponibles():

    try:

        pedidos = Pedido.query.filter(
            Pedido.estado != "Entregado"
        ).all()

        lista_pedidos = []

        for pedido in pedidos:

            entrega_existente = Entrega.query.filter_by(
                id_pedido=pedido.id_pedido
            ).first()

            if entrega_existente:
                continue

            cliente = Cliente.query.get(
                pedido.id_cliente
            )

            lista_pedidos.append({

                "id_pedido": pedido.id_pedido,

                "id_cliente": pedido.id_cliente,

                "cliente": cliente.nombre
                    if cliente
                    else "Cliente no encontrado",
                    
                "direccion": cliente.direccion
                    if cliente
                    else "",

                "latitud": float(cliente.latitud)
                    if cliente and cliente.latitud
                    else None,

                "longitud": float(cliente.longitud)
                    if cliente and cliente.longitud
                    else None,

                "fecha": pedido.fecha,

                "total": float(pedido.total),

                "estado": pedido.estado

            })

        return jsonify(lista_pedidos)

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500
        
        
@app.route("/entregas/<int:id>", methods=["DELETE"])
def eliminar_entrega(id):

    try:

        entrega = Entrega.query.get(id)

        if not entrega:

            return jsonify({
                "error": "Entrega no encontrada"
            }), 404

        # ==========================================
        # LIBERAR AL REPARTIDOR
        # ==========================================

        repartidor = Repartidor.query.get(
            entrega.id_repartidor
        )

        if repartidor:
            repartidor.estado = "Disponible"

        # ==========================================
        # ELIMINAR ENTREGA
        # ==========================================

        db.session.delete(entrega)

        db.session.commit()

        return jsonify({
            "mensaje": "Entrega eliminada correctamente"
        })

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "error": str(e)
        }), 500

        
@app.route("/entregas/<int:id>/estado", methods=["PUT"])
def actualizar_estado_entrega(id):

    try:

        entrega = Entrega.query.get(id)

        if not entrega:

            return jsonify({
                "error": "Entrega no encontrada"
            }), 404

        datos = request.get_json()

        nuevo_estado = datos.get("estado")

        estados_validos = [
            "Pendiente",
            "En camino",
            "Entregado"
        ]

        if nuevo_estado not in estados_validos:

            return jsonify({
                "error": "Estado no válido"
            }), 400

        entrega.estado = nuevo_estado

        # Si la entrega pasa a Entregado
        if nuevo_estado == "Entregado":

            entrega.fecha_entrega = datetime.now()

            repartidor = Repartidor.query.get(
                entrega.id_repartidor
            )

            if repartidor:
                repartidor.estado = "Disponible"

        # Si la entrega pasa a En camino
        elif nuevo_estado == "En camino":

            repartidor = Repartidor.query.get(
                entrega.id_repartidor
            )

            if repartidor:
                repartidor.estado = "Ocupado"

        db.session.commit()

        return jsonify({
            "mensaje": "Estado de entrega actualizado correctamente"
        })

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "error": str(e)
        }), 500
        
# ==========================================
# CALCULAR RUTA CON OPENROUTESERVICE
# ==========================================

# ==========================================
# CALCULAR RUTA
# ==========================================

@app.route("/ruta", methods=["POST"])
def calcular_ruta_api():

    try:

        datos = request.get_json()

        lat_destino = datos["lat_destino"]
        lon_destino = datos["lon_destino"]

        resultado = calcular_ruta(
            lat_destino,
            lon_destino
        )

        return jsonify(resultado)

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500
        
        


@app.route("/geocodificar", methods=["POST"])
def geocodificar_direccion():

    try:

        # ==========================================
        # RECIBIR DIRECCIÓN
        # ==========================================

        datos = request.get_json()

        direccion = datos.get(
            "direccion",
            ""
        ).strip()

        if not direccion:
            return jsonify({
                "error": "La dirección es obligatoria."
            }), 400


        # ==========================================
        # API KEY
        # ==========================================

        api_key = os.getenv("ORS_API_KEY")

        if not api_key:
            return jsonify({
                "error":
                    "No se encontró ORS_API_KEY "
                    "en las variables de entorno."
            }), 500


        # ==========================================
        # NORMALIZAR TEXTO
        # ==========================================

        direccion_original = direccion

        direccion_busqueda = (
            direccion
            .replace("  ", " ")
            .strip()
        )

        direccion_minuscula = (
            direccion_busqueda
            .lower()
            .replace(",", " ")
        )


        # ==========================================
        # LUGAR ESPECÍFICO:
        # PLAZA DANIEL ALCIDES CARRIÓN
        # ==========================================

        palabras_plaza = [
            "plaza daniel alcides carrion",
            "plaza daniel alcides carrrion",
            "plaza daniel a carrion",
            "plaza daniel a. carrion",
            "plaza d. alcides carrion"
        ]

        es_plaza_daniel = any(
            palabra in direccion_minuscula
            for palabra in palabras_plaza
        )


        if es_plaza_daniel:

            # Coordenadas verificadas de la plaza
            latitud = -10.68363
            longitud = -76.25615

            print(
                "=========================================="
            )
            print(
                "DESTINO ESPECIAL DETECTADO"
            )
            print(
                "Plaza Daniel Alcides Carrión"
            )
            print(
                "Latitud:",
                latitud
            )
            print(
                "Longitud:",
                longitud
            )
            print(
                "=========================================="
            )

            return jsonify({
                "latitud": latitud,
                "longitud": longitud,
                "direccion":
                    "Plaza Daniel Alcides Carrión, "
                    "Cerro de Pasco, Pasco, Perú"
            })


        # ==========================================
        # PREPARAR BÚSQUEDA
        # ==========================================

        # Si el usuario no escribió Cerro de Pasco,
        # lo agregamos para evitar resultados
        # de otras ciudades.

        if (
            "cerro de pasco"
            not in direccion_minuscula
        ):

            direccion_busqueda = (
                direccion_busqueda
                + ", Cerro de Pasco, Pasco, Peru"
            )

        else:

            # Nos aseguramos de incluir Perú
            if "peru" not in direccion_minuscula:
                direccion_busqueda = (
                    direccion_busqueda
                    + ", Peru"
                )


        # ==========================================
        # OPENROUTESERVICE / PELIAS
        # ==========================================

        url = (
            "https://api.heigit.org/"
            "pelias/v1/search"
        )


        parametros = {

            "text":
                direccion_busqueda,

            "boundary.country":
                "PE",

            # Centro aproximado de Cerro de Pasco
            "focus.point.lat":
                "-10.6864",

            "focus.point.lon":
                "-76.2625",

            "api_key":
                api_key
        }


        print(
            "=========================================="
        )

        print(
            "GEOCODIFICANDO DIRECCIÓN"
        )

        print(
            "Original:",
            direccion_original
        )

        print(
            "Búsqueda:",
            direccion_busqueda
        )

        print(
            "=========================================="
        )


        respuesta = requests.get(
            url,
            params=parametros,
            timeout=15
        )


        # ==========================================
        # ERROR API
        # ==========================================

        if respuesta.status_code != 200:

            print(
                "ERROR ORS:",
                respuesta.text
            )

            return jsonify({
                "error":
                    "Error de OpenRouteService: "
                    + respuesta.text
            }), respuesta.status_code


        resultado = respuesta.json()


        features = resultado.get(
            "features",
            []
        )


        # ==========================================
        # SIN RESULTADOS
        # ==========================================

        if not features:

            return jsonify({
                "error":
                    "No se encontró la dirección "
                    "en Cerro de Pasco."
            }), 404


        # ==========================================
        # BUSCAR EL MEJOR RESULTADO
        # ==========================================

        mejor_resultado = None
        mejor_puntaje = -999999


        for feature in features:

            propiedades = feature.get(
                "properties",
                {}
            )

            coordenadas = feature.get(
                "geometry",
                {}
            ).get(
                "coordinates",
                []
            )


            if len(coordenadas) < 2:
                continue


            longitud = float(
                coordenadas[0]
            )

            latitud = float(
                coordenadas[1]
            )


            # --------------------------------------
            # INFORMACIÓN DEL RESULTADO
            # --------------------------------------

            label = str(
                propiedades.get(
                    "label",
                    ""
                )
            ).lower()

            localidad = str(
                propiedades.get(
                    "locality",
                    ""
                )
            ).lower()

            distrito = str(
                propiedades.get(
                    "localadmin",
                    ""
                )
            ).lower()

            region = str(
                propiedades.get(
                    "region",
                    ""
                )
            ).lower()

            layer = str(
                propiedades.get(
                    "layer",
                    ""
                )
            ).lower()


            # --------------------------------------
            # PUNTAJE
            # --------------------------------------

            puntaje = 0


            # Cerro de Pasco
            if "cerro de pasco" in label:
                puntaje += 100

            if "cerro de pasco" in localidad:
                puntaje += 100

            if "cerro de pasco" in distrito:
                puntaje += 50


            # Pasco
            if "pasco" in label:
                puntaje += 20

            if "pasco" in region:
                puntaje += 20


            # Priorizar direcciones
            if layer == "address":
                puntaje += 50

            elif layer == "street":
                puntaje += 30

            elif layer == "venue":
                puntaje += 40

            elif layer == "locality":
                puntaje += 10


            # --------------------------------------
            # DISTANCIA APROXIMADA A CERRO DE PASCO
            # --------------------------------------

            lat_centro = -10.6864
            lon_centro = -76.2625


            diferencia_lat = (
                latitud - lat_centro
            )

            diferencia_lon = (
                longitud - lon_centro
            )


            distancia_aprox = (
                (
                    diferencia_lat ** 2
                    +
                    diferencia_lon ** 2
                )
                ** 0.5
            )


            # Penalizar resultados demasiado alejados
            if distancia_aprox > 0.10:
                puntaje -= 1000

            elif distancia_aprox > 0.05:
                puntaje -= 500

            elif distancia_aprox > 0.02:
                puntaje -= 100


            # --------------------------------------
            # COMPARAR
            # --------------------------------------

            if puntaje > mejor_puntaje:

                mejor_puntaje = puntaje

                mejor_resultado = {
                    "latitud":
                        latitud,

                    "longitud":
                        longitud,

                    "label":
                        propiedades.get(
                            "label",
                            direccion_original
                        ),

                    "puntaje":
                        puntaje,

                    "layer":
                        layer
                }


        # ==========================================
        # NINGÚN RESULTADO VÁLIDO
        # ==========================================

        if mejor_resultado is None:

            return jsonify({
                "error":
                    "No se encontró una ubicación "
                    "válida en Cerro de Pasco."
            }), 404


        # ==========================================
        # MOSTRAR RESULTADO
        # ==========================================

        print(
            "=========================================="
        )

        print(
            "MEJOR RESULTADO"
        )

        print(
            "Dirección:",
            mejor_resultado["label"]
        )

        print(
            "Latitud:",
            mejor_resultado["latitud"]
        )

        print(
            "Longitud:",
            mejor_resultado["longitud"]
        )

        print(
            "Tipo:",
            mejor_resultado["layer"]
        )

        print(
            "Puntaje:",
            mejor_resultado["puntaje"]
        )

        print(
            "=========================================="
        )


        # ==========================================
        # RESPUESTA
        # ==========================================

        return jsonify({

            "latitud":
                mejor_resultado["latitud"],

            "longitud":
                mejor_resultado["longitud"],

            "direccion":
                mejor_resultado["label"],

            "precision":
                mejor_resultado["layer"]
        })


    except Exception as e:

        print(
            "ERROR EN GEOCODIFICACIÓN:",
            str(e)
        )

        return jsonify({
            "error": str(e)
        }), 500

# ==========================================
# EJECUTAR SERVIDOR
# ==========================================

if __name__ == "__main__":
    app.run(debug=True)
    
    
    