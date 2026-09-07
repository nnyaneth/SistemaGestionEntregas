// ==========================================
// CARGAR PRODUCTOS
// ==========================================

async function cargarProductos() {

    try {

        const respuesta =
            await fetch("/productos");

        const productos =
            await respuesta.json();

        if (!respuesta.ok) {

            alert(
                productos.error ||
                "Error al cargar productos"
            );

            return;
        }

        const tabla =
            document.getElementById(
                "tablaProductos"
            );

        tabla.innerHTML = "";

        productos.forEach(producto => {

            const fila = `
                <tr>

                    <td>${producto.id_producto}</td>

                    <td>${producto.nombre}</td>

                    <td>${producto.descripcion || ""}</td>

                    <td>
                        S/ ${producto.precio.toFixed(2)}
                    </td>

                    <td>${producto.stock}</td>

                    <td>

                        <button
                            type="button"
                            onclick="editarProducto(${producto.id_producto})"
                        >
                            Editar
                        </button>

                        <button
                            type="button"
                            onclick="eliminarProducto(${producto.id_producto})"
                        >
                            Eliminar
                        </button>

                    </td>

                </tr>
            `;

            tabla.innerHTML += fila;

        });

    } catch (error) {

        console.error(error);

        alert(
            "No se pudo conectar con el servidor"
        );

    }
}


// ==========================================
// REGISTRAR / ACTUALIZAR
// ==========================================

document
    .getElementById("formularioProducto")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const formulario =
            document.getElementById(
                "formularioProducto"
            );

        const id =
            formulario.getAttribute("data-id");


        const producto = {

            nombre:
                document.getElementById(
                    "nombre"
                ).value,

            descripcion:
                document.getElementById(
                    "descripcion"
                ).value,

            precio:
                parseFloat(
                    document.getElementById(
                        "precio"
                    ).value
                ),

            stock:
                parseInt(
                    document.getElementById(
                        "stock"
                    ).value
                )

        };


        let url = "/productos";

        let metodo = "POST";


        if (id) {

            url = `/productos/${id}`;

            metodo = "PUT";

        }


        try {

            const respuesta =
                await fetch(url, {

                    method: metodo,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(producto)

                });


            const resultado =
                await respuesta.json();


            alert(
                resultado.mensaje ||
                resultado.error
            );


            if (respuesta.ok) {

                formulario.reset();

                formulario.removeAttribute(
                    "data-id"
                );

                const boton =
                    formulario.querySelector(
                        "button[type='submit']"
                    );

                boton.textContent =
                    "Registrar Producto";

                cargarProductos();

            }

        } catch (error) {

            console.error(error);

            alert(
                "No se pudo conectar con el servidor"
            );

        }

    });


// ==========================================
// EDITAR PRODUCTO
// ==========================================

async function editarProducto(id) {

    try {

        const respuesta =
            await fetch(`/productos/${id}`);

        const producto =
            await respuesta.json();


        if (!respuesta.ok) {

            alert(producto.error);

            return;
        }


        document.getElementById("nombre").value =
            producto.nombre;

        document.getElementById("descripcion").value =
            producto.descripcion || "";

        document.getElementById("precio").value =
            producto.precio;

        document.getElementById("stock").value =
            producto.stock;


        const formulario =
            document.getElementById(
                "formularioProducto"
            );

        formulario.setAttribute(
            "data-id",
            id
        );


        const boton =
            formulario.querySelector(
                "button[type='submit']"
            );

        boton.textContent =
            "Guardar cambios";


        formulario.scrollIntoView({
            behavior: "smooth"
        });


    } catch (error) {

        console.error(error);

        alert(
            "No se pudo conectar con el servidor"
        );

    }

}


// ==========================================
// ELIMINAR PRODUCTO
// ==========================================

async function eliminarProducto(id) {

    const confirmar = confirm(
        "¿Está seguro de eliminar este producto?"
    );


    if (!confirmar) {

        return;

    }


    try {

        const respuesta =
            await fetch(
                `/productos/${id}`,
                {
                    method: "DELETE"
                }
            );


        const resultado =
            await respuesta.json();


        alert(
            resultado.mensaje ||
            resultado.error
        );


        if (respuesta.ok) {

            cargarProductos();

        }

    } catch (error) {

        console.error(error);

        alert(
            "No se pudo conectar con el servidor"
        );

    }

}


// ==========================================
// INICIAR
// ==========================================

cargarProductos();