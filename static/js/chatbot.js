
function formatearMensajeChatbot(texto) {

    const fragmento = document.createDocumentFragment();

    const partes = texto.split(/(\*\*[\s\S]+?\*\*)/g);

    partes.forEach(function (parte) {

        if (parte.startsWith("**") && parte.endsWith("**")) {

            const negrita = document.createElement("strong");

            negrita.textContent = parte.slice(2, -2);

            fragmento.appendChild(negrita);

        } else {

            fragmento.appendChild(
                document.createTextNode(parte)
            );

        }

    });

    return fragmento;
}

document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // ELEMENTOS DEL CHATBOT
    // ==========================================

    const botonChatbot = document.getElementById("boton-chatbot");
    const ventanaChatbot = document.getElementById("ventana-chatbot");
    const cerrarChatbot = document.getElementById("cerrar-chatbot");

    const formulario = document.getElementById("formulario-chatbot");
    const pregunta = document.getElementById("pregunta-chatbot");
    const mensajes = document.getElementById("mensajes-chatbot");
    const botonEnviar = document.getElementById("enviar-chatbot");

    if (!botonChatbot || !ventanaChatbot || !cerrarChatbot ||
        !formulario || !pregunta || !mensajes || !botonEnviar) {
        return;
    }
// ==========================================
// HISTORIAL DE CONVERSACIÓN
// ==========================================

const historialChatbot = [];
    // ==========================================
    // ABRIR CHATBOT
    // ==========================================

    botonChatbot.addEventListener("click", function () {

        ventanaChatbot.classList.toggle("abierto");

        if (ventanaChatbot.classList.contains("abierto")) {
            pregunta.focus();
        }

    });

    // ==========================================
    // CERRAR CHATBOT
    // ==========================================

    cerrarChatbot.addEventListener("click", function () {

        ventanaChatbot.classList.remove("abierto");

    });

    // ==========================================
    // MOSTRAR MENSAJES
    // ==========================================

    function agregarMensaje(texto, tipo) {

        const mensaje = document.createElement("div");

        mensaje.className = tipo === "usuario"
            ? "mensaje-usuario"
            : "mensaje-bot";

        mensaje.textContent = texto;

        mensajes.appendChild(mensaje);

        mensajes.scrollTop = mensajes.scrollHeight;

        return mensaje;
    }

    // ==========================================
    // ENVIAR PREGUNTA A FLASK
    // ==========================================

    formulario.addEventListener("submit", async function (evento) {

        evento.preventDefault();

        const texto = pregunta.value.trim();

        if (!texto) {
            return;
        }

        agregarMensaje(texto, "usuario");

        pregunta.value = "";
        pregunta.disabled = true;
        botonEnviar.disabled = true;

        const esperando = agregarMensaje(
            "Escribiendo respuesta...",
            "bot"
        );

        try {

            const respuesta = await fetch("/chatbot", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
    pregunta: texto,
    historial: historialChatbot
})

            });

            const resultado = await respuesta.json();

            if (!respuesta.ok) {

                throw new Error(
                    resultado.error ||
                    "No se pudo obtener una respuesta."
                );

            }

            const textoRespuesta =
    resultado.respuesta ||
    "El asistente no devolvió una respuesta.";

esperando.replaceChildren(
    formatearMensajeChatbot(textoRespuesta)
);

// Guardar la conversación
if (resultado.respuesta) {

    historialChatbot.push({
        role: "user",
        content: texto
    });

    historialChatbot.push({
        role: "assistant",
        content: textoRespuesta
    });

}
        } catch (error) {

            console.error("Error del chatbot:", error);

            esperando.textContent =
                "No se pudo conectar con el asistente. Inténtalo nuevamente.";

        } finally {

            pregunta.disabled = false;
            botonEnviar.disabled = false;

            mensajes.scrollTop = mensajes.scrollHeight;

            if (ventanaChatbot.classList.contains("abierto")) {
                pregunta.focus();
            }

        }

    });

});