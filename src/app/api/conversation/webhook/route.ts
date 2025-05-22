import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiFeedbackResponse } from "@/types/types";


// Endpoint que recibe webhook de elevenlabs
// Se encarga de guardar la conversacion en la base de datos
// Datos como resumen, transcripcion, etc.

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*', // O el origen específico que hará las solicitudes
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400' // 24 horas
    }
  });
}

export async function POST(request: Request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  try {
    // Parsear el cuerpo de la solicitud
    const body = await request.json();

    // Verificar el tipo de evento
    if (body.type !== "post_call_transcription") {
      console.log(`Tipo de evento no soportado: ${body.type}`);
      return NextResponse.json(
        { message: "Evento recibido pero no procesado" },
        { status: 200, headers }
      );
    }

    // Verificar que existan los datos
    if (!body.data) {
      return NextResponse.json(
        { error: "Formato incorrecto, se esperaba campo 'data'" },
        { status: 400, headers }
      );
    }

    // Obtener el ID de conversación de los datos
    const conversationId = body.data.conversation_id;

    if (!conversationId) {
      return NextResponse.json(
        { error: "Se necesita conversation ID" },
        { status: 400, headers }
      );
    }

    // Buscar la conversación en la base de datos
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      console.log(`Conversación no encontrada con ID: ${conversationId}`);
      return NextResponse.json(
        { error: "Conversación no encontrada" },
        { status: 404, headers }
      );
    }

    // Actualizar la conversación en la base de datos
    // Guardamos todos los datos recibidos en el campo details (JSON)
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        details: body
      },
    });

    // Triggerear un llamado a la API de Gemini para pedirle que procese la conversacion y devuelva un feedback para mostrar al usuario.
    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

    async function main(): Promise<string> {
      const res = await ai.models.generateContent({
        model: "gemini-2.0-flash-lite",
        contents: `
        Esta es la transcripción de una simulación de entrevista de trabajo. Tu tarea es analizar exclusivamente las respuestas del usuario (NO las del agente).
          Debes evaluar los siguientes criterios, asignando una nota del 1 al 10 (donde 1 es lo peor y 10 lo mejor) a cada uno, junto con una breve justificación. Si no hay información suficiente para evaluar un criterio, asigna 0 como nota y da una razón clara del por qué no se pudo evaluar.
          Ademas, debes sugerir como podria mejorar sus respuestas con ejemplos claros para cada criterio para mejorar su rendimiento.
          Criterios:
          1. **Claridad**: Evalúa si el usuario se expresa de manera comprensible, ordenada y coherente. ¿Sus respuestas son fáciles de entender?
          2. **Profesionalismo**: Evalúa si el usuario utiliza un lenguaje adecuado, respetuoso y profesional. ¿Se comunica de forma apropiada para un contexto laboral?
          3. **Técnica**: Evalúa si el usuario demuestra conocimientos técnicos relevantes para el puesto. ¿Menciona herramientas, procesos, metodologías, etc.?
          4. **Interés**: Evalúa si el usuario muestra motivación por el cargo o la empresa. ¿Hace preguntas? ¿Transmite entusiasmo?
          5. **Ejemplos**: Evalúa si el usuario entrega ejemplos concretos que respalden sus habilidades, experiencias o conocimientos. ¿Explica con claridad sus logros o situaciones pasadas?
          A continuación, recibirás la transcripción de la entrevista:
          ${body.data.transcription}
          Luego de evaluar los criterios anteriores, realiza una evaluación de compatibilidad (“match”) entre el perfil del usuario y el puesto de trabajo, usando el siguiente contexto, que contiene tanto el CV parseado como la descripción del trabajo:
          ${body.data.conversation_initiation_client_data.conversation_config_override.agent.prompt.prompt}
          Evalúa qué tan bien se ajusta el candidato a los requisitos del puesto. Si no hay una descripción clara del puesto, indícalo y asigna 0 como match. El resultado debe ser un numero del 1 al 100 porque indicara porcentaje de ajuste.
          Ten en cuenta que tanto el CV como la descripción del trabajo pueden contener errores o estar incompletos porque son campos que rellena el usuario, por lo que analizarlos bien es de suma importancia.
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            "type": Type.OBJECT,
            "properties": {
              "criterios": {
                "type": Type.OBJECT,
                "properties": {
                  "tecnica": {
                    "type": Type.OBJECT,
                    "properties": {
                      "nota": {
                        "type": Type.INTEGER
                      },
                      "razon": {
                        "type": Type.STRING
                      }
                    }
                  },
                  "interes": {
                    "type": Type.OBJECT,
                    "properties": {
                      "nota": {
                        "type": Type.INTEGER
                      },
                      "razon": {
                        "type": Type.STRING
                      }
                    }
                  },
                  "claridad": {
                    "type": Type.OBJECT,
                    "properties": {
                      "nota": {
                        "type": Type.INTEGER
                      },
                      "razon": {
                        "type": Type.STRING
                      }
                    }
                  },
                  "ejemplos": {
                    "type": Type.OBJECT,
                    "properties": {
                      "nota": {
                        "type": Type.INTEGER
                      },
                      "razon": {
                        "type": Type.STRING
                      }
                    }
                  },
                  "profesionalismo": {
                    "type": Type.OBJECT,
                    "properties": {
                      "nota": {
                        "type": Type.INTEGER
                      },
                      "razon": {
                        "type": Type.STRING
                      }
                    }
                  }
                }
              },
              "resultado": {
                "type": Type.OBJECT,
                "properties": {
                  "nota": {
                    "type": Type.INTEGER
                  },
                  "razon": {
                    "type": Type.STRING
                  }
                }
              }
            }
          },
        }
      });
      if (res.text === undefined) {
        throw new Error("La respuesta de la API de Gemini no contiene texto.");
      }
      return res.text;
    }
    const geminiResponseString = await main();
    const geminiData: GeminiFeedbackResponse = JSON.parse(geminiResponseString);
    
    // Guardar en la base de datos el feedback
    await prisma.interviewResult.create({
      data: {
        interview_id: conversation.interview_id,
        claridadRazon: geminiData.criterios.claridad.razon,
        claridadNota: geminiData.criterios.claridad.nota,
        profesionalismoRazon: geminiData.criterios.profesionalismo.razon,
        profesionalismoNota: geminiData.criterios.profesionalismo.nota,
        tecnicaRazon: geminiData.criterios.tecnica.razon,
        tecnicaNota: geminiData.criterios.tecnica.nota,
        interesRazon: geminiData.criterios.interes.razon,
        interesNota: geminiData.criterios.interes.nota,
        ejemplosRazon: geminiData.criterios.ejemplos.razon,
        ejemplosNota: geminiData.criterios.ejemplos.nota,
        resultadoRazon: geminiData.resultado.razon,
        resultadoNota: geminiData.resultado.nota,
      }
    });

    // Cuando devuelva el feedback debemos hacer un redirect a otra pagina que lo muestre.


    return NextResponse.json(
      { message: "Conversation updated successfully" },
      { status: 200, headers }
    );

  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500, headers }
    );
  }
}