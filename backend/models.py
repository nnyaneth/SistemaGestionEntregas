from extensions import db


class Cliente(db.Model):
    __tablename__ = "Clientes"

    id_cliente = db.Column(
        db.Integer,
        primary_key=True
    )

    nombre = db.Column(
        db.String(100),
        nullable=False
    )

    telefono = db.Column(
        db.String(20),
        nullable=False
    )

    correo = db.Column(
        db.String(100)
    )

    direccion = db.Column(
        db.String(200),
        nullable=False
    )

    latitud = db.Column(
        db.Numeric(10, 7)
    )

    longitud = db.Column(
        db.Numeric(10, 7)
    )
    
    
class Producto(db.Model):
    __tablename__ = "Productos"

    id_producto = db.Column(
        db.Integer,
        primary_key=True
    )

    nombre = db.Column(
        db.String(100),
        nullable=False
    )

    descripcion = db.Column(
        db.String(250)
    )

    precio = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    stock = db.Column(
        db.Integer,
        nullable=False
    )
    
class Pedido(db.Model):
    __tablename__ = "Pedidos"

    id_pedido = db.Column(
        db.Integer,
        primary_key=True
    )

    id_cliente = db.Column(
        db.Integer,
        db.ForeignKey("Clientes.id_cliente"),
        nullable=False
    )

    fecha = db.Column(
    db.DateTime,
    nullable=False,
    server_default=db.func.getdate()
)

    total = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    estado = db.Column(
        db.String(30),
        nullable=False
    )


class DetallePedido(db.Model):
    __tablename__ = "Detalle_Pedido"

    id_detalle = db.Column(
        db.Integer,
        primary_key=True
    )

    id_pedido = db.Column(
        db.Integer,
        db.ForeignKey("Pedidos.id_pedido"),
        nullable=False
    )

    id_producto = db.Column(
        db.Integer,
        db.ForeignKey("Productos.id_producto"),
        nullable=False
    )

    cantidad = db.Column(
        db.Integer,
        nullable=False
    )

    precio = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    subtotal = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )
    
class Repartidor(db.Model):
    __tablename__ = "Repartidores"

    id_repartidor = db.Column(
        db.Integer,
        primary_key=True
    )

    nombre = db.Column(
        db.String(100),
        nullable=False
    )

    telefono = db.Column(
        db.String(20),
        nullable=False
    )

    estado = db.Column(
        db.String(20),
        nullable=False
    )
    
class Entrega(db.Model):
    __tablename__ = "Entregas"

    id_entrega = db.Column(
        db.Integer,
        primary_key=True
    )

    id_pedido = db.Column(
        db.Integer,
        nullable=False
    )

    id_repartidor = db.Column(
        db.Integer,
        nullable=False
    )

    direccion_destino = db.Column(
        db.String(200),
        nullable=False
    )

    latitud_destino = db.Column(
        db.Numeric(10, 7)
    )

    longitud_destino = db.Column(
        db.Numeric(10, 7)
    )

    distancia_km = db.Column(
        db.Numeric(10, 2)
    )

    duracion_min = db.Column(
        db.Integer
    )

    estado = db.Column(
        db.String(30),
        nullable=False
    )

    fecha_asignacion = db.Column(
        db.DateTime
    )

    fecha_entrega = db.Column(
        db.DateTime
    )