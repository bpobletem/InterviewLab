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
    console.log(body.data.transcript);
    async function main(): Promise<string> {
      // ---- START: New formatting logic ----
      const formattedTranscript = body.data.transcript.map((entry: { role: string, message?: string, text?: string, content?: string }) => {
        const speakerLabel = entry.role === 'user' ? 'Usuario' : 'Agente';
        // Prioritize 'message', then 'text', then 'content'. Default to empty string if none exist.
        const messageContent = entry.message ?? entry.text ?? entry.content ?? ""; 
        return `${speakerLabel}: ${messageContent}`;
      }).join('\n\n'); // Use double newline for better separation
      // ---- END: New formatting logic ----

      const res = await ai.models.generateContent({
        model: "gemini-2.0-flash-lite",
        contents: `
        Rol: Eres un evaluador de entrevistas experto.
        Tarea: Analiza la siguiente transcripción de una entrevista de trabajo. Enfócate EXCLUSIVAMENTE en las respuestas proporcionadas por el "Usuario". NO evalúes las intervenciones del "Agente".

        Transcripción:
        ---
        ${formattedTranscript}
        ---

        Instrucciones de Evaluación para el Usuario:
        Debes evaluar los siguientes criterios para el Usuario, asignando una nota del 1 al 10 (donde 1 es lo peor y 10 lo mejor) a cada uno, junto con una breve justificación (razon).
        Si no hay información suficiente en las respuestas del Usuario para evaluar un criterio específico, asigna 0 como nota y explica claramente por qué no se pudo evaluar (ej. "El usuario no proporcionó ejemplos concretos").
        Adicionalmente, para cada criterio, sugiere cómo el Usuario podría mejorar sus respuestas, incluyendo ejemplos claros si es posible.

        Criterios a Evaluar (solo para el Usuario):
        1.  **Claridad**: ¿El Usuario se expresa de manera comprensible, ordenada y coherente? ¿Sus respuestas son fáciles de entender?
        2.  **Profesionalismo**: ¿El Usuario utiliza un lenguaje adecuado, respetuoso y profesional en sus respuestas?
        3.  **Técnica**: ¿El Usuario demuestra conocimientos técnicos relevantes para el puesto en sus respuestas? (ej. herramientas, procesos, metodologías).
        4.  **Interés**: ¿El Usuario muestra motivación por el cargo o la empresa a través de sus respuestas? ¿Hace preguntas pertinentes (si aplica y se ve en su turno)? ¿Transmite entusiasmo?
        5.  **Ejemplos**: ¿El Usuario entrega ejemplos concretos en sus respuestas que respalden sus habilidades, experiencias o conocimientos?

        Contexto Adicional (CV del Candidato y Descripción del Puesto):
        ---
        ${body.data.conversation_initiation_client_data.conversation_config_override.agent.prompt.prompt}
        ---

        Evaluación de Compatibilidad (Match):
        Basándote en las respuestas del Usuario en la transcripción y el "Contexto Adicional" proporcionado arriba (CV y descripción del puesto), realiza una evaluación de compatibilidad ("match").
        Evalúa qué tan bien se ajusta el candidato a los requisitos del puesto, según lo demostrado por el Usuario en la entrevista.
        El resultado de esta evaluación de compatibilidad debe ser un número del 1 al 100, representando el porcentaje de ajuste.
        Si la descripción del puesto en el contexto adicional no es clara o está ausente, indícalo en la razón de la evaluación de compatibilidad y asigna 0 como nota de match.
        Ten en cuenta que tanto el CV como la descripción del trabajo pueden contener errores o estar incompletos porque son campos rellenados por el usuario; analiza esta información críticamente al realizar la evaluación de compatibilidad.

        Formato de Respuesta Esperado: JSON (sigue el schema proporcionado). Cada item debe ir en su correspondiente item del schema. No olvides ninguno.
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
      console.log(res.text);
      return res.text;
    }
    const geminiResponseString = await main();
    const geminiData: GeminiFeedbackResponse = JSON.parse(geminiResponseString);
    
    // Guardar en la base de datos el feedback (actualizar si ya existe)
    await prisma.interviewResult.upsert({
      where: { interview_id: conversation.interview_id },
      update: {
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
      },
      create: {
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