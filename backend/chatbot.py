
import os
from pathlib import Path

from dotenv import load_dotenv
from groq import Groq

# Cargar las variables del proyecto
ruta_env = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(ruta_env)

clave_api = os.getenv("GROQ_API_KEY")

cliente = Groq(api_key=clave_api) if clave_api else None


def responder_chatbot(pregunta, historial=None):

    if cliente is None:
        raise RuntimeError("No se configuró la clave API de Groq.")

    instrucciones = (
        "Eres el asistente inteligente de un Sistema de Gestión "
        "de Entregas de comida rápida ubicado en Cerro de Pasco, Perú. "
        "Tus usuarios son administradores y trabajadores encargados "
        "de gestionar productos, ventas, pedidos, repartidores y entregas. "
        "Responde en español con explicaciones claras, naturales y prácticas. "
        "Puedes recomendar estrategias para mejorar las ventas, "
        "organizar entregas, gestionar productos y optimizar operaciones. "
        "No eres un chatbot de atención al cliente. "
        "No inventes datos actuales del sistema, ventas, pedidos o inventarios. "
        "Si necesitas información que no tienes, solicítala. "
        "No afirmes haber realizado cambios en el sistema. "
        "Evita respuestas demasiado extensas salvo que el usuario "
        "solicite explicaciones detalladas."
        "Responde de manera breve, directa y ordenada. "
        "Para consultas de cantidades, precios, estados o inventario, "
        "responde normalmente en una o dos oraciones. "
        "Si el usuario solicita una lista, muestra solo los datos relevantes. "
        "No repitas la pregunta ni agregues conclusiones innecesarias. "
        "Solo proporciona explicaciones extensas cuando el usuario las solicite. "
    )

    mensajes = [
        {
            "role": "system",
            "content": instrucciones
        }
    ]

    # Incorporar los mensajes anteriores
    if historial:
        for mensaje in historial[-10:]:
            if (
                isinstance(mensaje, dict)
                and mensaje.get("role") in ("user", "assistant")
                and isinstance(mensaje.get("content"), str)
            ):
                mensajes.append({
                    "role": mensaje["role"],
                    "content": mensaje["content"][:4000]
                })

    # Agregar la pregunta actual
    mensajes.append({
        "role": "user",
        "content": pregunta
    })

    respuesta = cliente.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=mensajes,
        temperature=0.5,
        max_completion_tokens=500
    )

    return respuesta.choices[0].message.content