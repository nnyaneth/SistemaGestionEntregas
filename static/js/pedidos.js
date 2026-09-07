let productosDisponibles = [];

let detallesPedido = [];


// ==========================================
// CARGAR CLIENTES
// ==========================================

async function cargarClientes() {

    const respuesta = await fetch("/clientes");

    const clientes = await respuesta.json();

    const select = document.getElementById("cliente");

    clientes.forEach(cliente => {

        const opcion = document.createElement("option");

        opcion.value = cliente.id_cliente;

        opcion.textContent = cliente.nombre;

        select.appendChild(opcion);

    });
}


// ==========================================
// CARGAR PRODUCTOS
// ==========================================

async function cargarProductos() {

    const respuesta = await fetch("/productos");

    const productos = await respuesta.json();

    productosDisponibles = productos;

    const select = document.getElementById("producto");

    productos.forEach(producto => {

        const opcion = document.createElement("option");

        opcion.value = producto.id_producto;

        opcion.textContent =
            `${producto.nombre} - S/ ${producto.precio}`;

        select.appendChild(opcion);

    });
}


// ==========================================
// AGREGAR PRODUCTO AL PEDIDO
// ==========================================

document
    .getElementById("btnAgregarProducto")
    .addEventListener("click", function() {

        const idProducto =
            parseInt(
                document.getElementById("producto").value
            );

        const cantidad =
            parseInt(
                document.getElementById("cantidad").value
            );


        if (!idProducto) {

            alert("Seleccione un producto");

            return;
        }


        if (!cantidad || cantidad < 1) {

            alert("Ingrese una cantidad válida");

            return;
        }


        const producto =
            productosDisponibles.find(
                p => p.id_producto === idProducto
            );


        if (!producto) {

            alert("Producto no encontrado");

            return;
        }


        const detalleExistente =
            detallesPedido.find(
                d => d.id_producto === idProducto
            );


        if (detalleExistente) {

            detalleExistente.cantidad += cantidad;

            detalleExistente.subtotal =
                detalleExistente.cantidad *
                detalleExistente.precio;

        } else {

            detallesPedido.push({

                id_producto: producto.id_producto,

                producto: producto.nombre,

                cantidad: cantidad,

                precio: producto.precio,

                subtotal:
                    cantidad * producto.precio

            });

        }


        mostrarDetalles();

    });


// ==========================================
// MOSTRAR DETALLES
// ==========================================

function mostrarDetalles() {

    const tabla =
        document.getElementById("detallePedido");

    tabla.innerHTML = "";


    let total = 0;


    detallesPedido.forEach((detalle, indice) => {

        total += detalle.subtotal;


        const fila = `

            <tr>

                <td>
                    ${detalle.producto}
                </td>

                <td>
                    ${detalle.cantidad}
                </td>

                <td>
                    S/ ${detalle.precio.toFixed(2)}
                </td>

                <td>
                    S/ ${detalle.subtotal.toFixed(2)}
                </td>

                <td>

                    <button
                        type="button"
                        onclick="eliminarProducto(${indice})"
                    >
                        Eliminar
                    </button>

                </td>

            </tr>

        `;


        tabla.innerHTML += fila;

    });


    document.getElementById("totalPedido")
        .textContent = total.toFixed(2);

}


// ==========================================
// ELIMINAR PRODUCTO
// ==========================================

function eliminarProducto(indice) {

    detallesPedido.splice(indice, 1);

    mostrarDetalles();

}


// ==========================================
// INICIAR
// ==========================================

cargarClientes();

cargarProductos();

// ==========================================
// REGISTRAR PEDIDO
// ==========================================

document
    .getElementById("formularioPedido")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const idCliente =
            parseInt(
                document.getElementById("cliente").value
            );


        if (!idCliente) {

            alert("Seleccione un cliente");

            return;
        }


        if (detallesPedido.length === 0) {

            alert("Agregue al menos un producto");

            return;
        }


        const datosPedido = {

            id_cliente: idCliente,

            detalles: detallesPedido.map(detalle => ({

                id_producto: detalle.id_producto,

                cantidad: detalle.cantidad

            }))

        };


        const respuesta = await fetch("/pedidos", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(datosPedido)

        });


        const resultado =
            await respuesta.json();


        if (!respuesta.ok) {

            alert(
                resultado.error ||
                "Error al registrar el pedido"
            );

            return;
        }


        alert(
            `${resultado.mensaje}\n` +
            `Pedido #${resultado.id_pedido}\n` +
            `Total: S/ ${resultado.total.toFixed(2)}`
        );


        // Limpiar formulario

        document
            .getElementById("formularioPedido")
            .reset();


        detallesPedido = [];

        mostrarDetalles();


        // Actualizar tabla de pedidos

        cargarPedidos();

    });

// ==========================================
// CARGAR PEDIDOS
// ==========================================

async function cargarPedidos() {

    const respuesta =
        await fetch("/pedidos");

    const pedidos =
        await respuesta.json();


    const tabla =
        document.getElementById("tablaPedidos");


    tabla.innerHTML = "";


    pedidos.forEach(pedido => {

        const fila = `

            <tr>

                <td>
                    ${pedido.id_pedido}
                </td>

                <td>
                    ${pedido.id_cliente}
                </td>

                <td>
                    ${new Date(
                        pedido.fecha
                    ).toLocaleString()}
                </td>

                <td>
                    S/ ${pedido.total.toFixed(2)}
                </td>

                <td>
                    ${pedido.estado}
                </td>

            </tr>

        `;


        tabla.innerHTML += fila;

    });

}

cargarPedidos();