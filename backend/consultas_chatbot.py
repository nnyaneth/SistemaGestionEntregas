from sqlalchemy import func
from datetime import datetime, timedelta
# ==========================================
# CONSULTAS DEL CHATBOT
# ==========================================
from extensions import db
from models import Entrega, Producto, Pedido, Repartidor, DetallePedido


# ==========================================
# CONSULTAR RESUMEN DE ENTREGAS
# ==========================================

def consultar_resumen_entregas():

    # Total de entregas registradas
    total = Entrega.query.count()

    # Entregas pendientes
    pendientes = Entrega.query.filter_by(
        estado="Pendiente"
    ).count()

    # Entregas en camino
    en_camino = Entrega.query.filter_by(
        estado="En camino"
    ).count()

    # Entregas completadas
    entregadas = Entrega.query.filter_by(
        estado="Entregado"
    ).count()

    # Preparar los resultados
    resumen = {
        "total_entregas": total,
        "pendientes": pendientes,
        "en_camino": en_camino,
        "entregadas": entregadas
    }

    return resumen


# ==========================================
# CONSULTAR INVENTARIO DE PRODUCTOS
# ==========================================

def consultar_productos():

    productos = Producto.query.order_by(
        Producto.nombre.asc()
    ).all()

    inventario = []

    for producto in productos:

        inventario.append({
            "id_producto": producto.id_producto,
            "nombre": producto.nombre,
            "precio": float(producto.precio),
            "stock": producto.stock
        })

    return {
        "total_productos": len(inventario),
        "productos": inventario
    }


# ==========================================
# CONSULTAR PEDIDOS
# ==========================================

def consultar_pedidos():

    pedidos = Pedido.query.all()

    estados = {}

    for pedido in pedidos:
        estado = pedido.estado
        estados[estado] = estados.get(estado, 0) + 1

    return {
        "total_pedidos": len(pedidos),
        "estados": estados
    }


# ==========================================
# CONSULTAR REPARTIDORES
# ==========================================

def consultar_repartidores():

    repartidores = Repartidor.query.order_by(
        Repartidor.nombre.asc()
    ).all()

    lista = []

    for repartidor in repartidores:
        lista.append({
            "nombre": repartidor.nombre,
            "estado": repartidor.estado
        })

    return {
        "total_repartidores": len(lista),
        "repartidores": lista
    }
    

# ==========================================
# CONSULTAR VENTAS
# ==========================================

def consultar_ventas():

    hoy = datetime.now().date()
    inicio_hoy = datetime.combine(hoy, datetime.min.time())
    inicio_manana = inicio_hoy + timedelta(days=1)

    # Total de ventas registradas
    total_ventas = db.session.query(
        func.coalesce(func.sum(Pedido.total), 0)
    ).scalar()

    # Ventas realizadas hoy
    ventas_hoy = db.session.query(
        func.coalesce(func.sum(Pedido.total), 0)
    ).filter(
        Pedido.fecha >= inicio_hoy,
        Pedido.fecha < inicio_manana
    ).scalar()

    # Cantidad de pedidos de hoy
    pedidos_hoy = Pedido.query.filter(
        Pedido.fecha >= inicio_hoy,
        Pedido.fecha < inicio_manana
    ).count()

    return {
        "ventas_totales": float(total_ventas),
        "ventas_hoy": float(ventas_hoy),
        "pedidos_hoy": pedidos_hoy
    }



# ==========================================
# BUSCAR PEDIDO CON SUS PRODUCTOS
# ==========================================

def buscar_pedido(id_pedido):

    pedido = Pedido.query.filter_by(
        id_pedido=id_pedido
    ).first()

    if not pedido:
        return None

    detalles = DetallePedido.query.filter_by(
        id_pedido=id_pedido
    ).all()

    productos = []

    for detalle in detalles:

        producto = Producto.query.filter_by(
            id_producto=detalle.id_producto
        ).first()

        productos.append({
            "nombre": producto.nombre if producto else "Producto no encontrado",
            "cantidad": detalle.cantidad,
            "precio": float(detalle.precio),
            "subtotal": float(detalle.subtotal)
        })

    return {
        "id_pedido": pedido.id_pedido,
        "fecha": str(pedido.fecha),
        "total": float(pedido.total),
        "estado": pedido.estado,
        "productos": productos
    }




# ==========================================
# BUSCAR ENTREGA CON REPARTIDOR
# ==========================================

def buscar_entrega(id_entrega):

    entrega = Entrega.query.filter_by(
        id_entrega=id_entrega
    ).first()

    if not entrega:
        return None

    repartidor = Repartidor.query.filter_by(
        id_repartidor=entrega.id_repartidor
    ).first()

    return {
        "id_entrega": entrega.id_entrega,
        "id_pedido": entrega.id_pedido,
        "id_repartidor": entrega.id_repartidor,
        "nombre_repartidor": (
            repartidor.nombre if repartidor else "No encontrado"
        ),
        "estado": entrega.estado,
        "distancia_km": (
            float(entrega.distancia_km)
            if entrega.distancia_km is not None
            else None
        ),
        "duracion_min": entrega.duracion_min,
        "fecha_asignacion": str(entrega.fecha_asignacion),
        "fecha_entrega": str(entrega.fecha_entrega)
    }
