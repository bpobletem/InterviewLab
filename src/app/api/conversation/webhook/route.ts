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
      // Formateams la transcripcion para que sea legible por Gemini
      const formattedTranscript = body.data.transcript.map((entry: { role: string, message?: string, text?: string, content?: string }) => {
        const speakerLabel = entry.role === 'user' ? 'Candidato' : 'Agente';
        const messageContent = entry.message ?? ""; 
        return `${speakerLabel}: ${messageContent}`;
      }).join('\n\n'); 

      const res = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `
        Rol: Eres un evaluador de entrevistas experto.
        Tarea: Analiza la siguiente transcripción de una entrevista de trabajo. Enfócate EXCLUSIVAMENTE en las respuestas proporcionadas por el "Candidato" y refierete a el como "candidato" en todo momento. NO evalúes las intervenciones del "Agente".

        Transcripción:
        ---
        ${formattedTranscript}
        ---

        Instrucciones de Evaluación para el Candidato:
        Debes evaluar los siguientes criterios para el Candidato, asignando una nota del 1 al 10 (donde 1 es lo peor y 10 lo mejor y con 6 se "aprueba") a cada uno, junto con una breve justificación (razon). 
        10 es una respuesta excepcional que no necesita mejora, con menos de esa nota debes proporcionar si o si una razón de por qué no se le asignó la nota máxima.
        Adicionalmente, para cada criterio, sugiere cómo el Candidato podría mejorar sus respuestas, incluyendo ejemplos claros siempre y cuando tenga una nota menor a 10.
        Si no hay información suficiente en las respuestas del Candidato para evaluar un criterio específico, asigna 0 como nota y explica claramente por qué no se pudo evaluar (ej. "El Candidato no proporcionó ejemplos concretos").

        Criterios a Evaluar (solo para el Candidato):
        1.  **Claridad**: ¿El Candidato se expresa de manera comprensible, ordenada y coherente? ¿Sus respuestas son fáciles de entender?
        2.  **Profesionalismo**: ¿El Candidato utiliza un lenguaje adecuado, respetuoso y profesional en sus respuestas?
        3.  **Técnica**: ¿El Candidato demuestra conocimientos técnicos relevantes para el puesto en sus respuestas? (ej. herramientas, procesos, metodologías).
        4.  **Interés**: ¿El Candidato muestra motivación por el cargo o la empresa a través de sus respuestas? ¿Hace preguntas pertinentes (si aplica y se ve en su turno)? ¿Transmite entusiasmo?
        5.  **Ejemplos**: ¿El Candidato entrega ejemplos concretos en sus respuestas que respalden sus habilidades, experiencias o conocimientos?

        Contexto Adicional (CV del Candidato y Descripción del Puesto):
        ---
        ${body.data.conversation_initiation_client_data.conversation_config_override.agent.prompt.prompt}
        ---

        Resultado - Evaluación de Compatibilidad (Match):
        Basándote en las respuestas del Candidato en la transcripción y el "Contexto Adicional" proporcionado arriba (CV y descripción del puesto), realiza una evaluación de compatibilidad ("match").
        Evalúa qué tan bien se ajusta el candidato a los requisitos del puesto, según lo demostrado por el candidato en la entrevista. Describe un resumen general de su desempeño y por que seria un buen o mal candidato.
        El resultado de esta evaluación de compatibilidad debe ser un número del 1 al 100, representando el porcentaje de ajuste. Para que te hagas un idea sobre el porcentaje:
        - 1 a 30: "Muy Desaprobado": El candidato no se ajusta al puesto y necesita mejorar significativamente.
        - 31 a 50: "Desaprobado": El candidato se ajusta parcialmente al puesto, pero puede mejorar.
        - 51 a 70: "Aprobado": El candidato se ajusta al puesto y tiene buenas respuestas.
        - 71 a 90: "Muy Aprobado": El candidato se ajusta muy bien al puesto y tiene excelentes respuestas.
        - 91 a 100: "Excelente": El candidato se ajusta perfectamente al puesto y tiene respuestas excepcionales.
        Si la descripción del puesto en el contexto adicional no es clara o está ausente, indícalo en la razón de la evaluación de compatibilidad y asigna 0 como nota de match.
        Ten en cuenta que tanto el CV como la descripción del trabajo pueden contener errores o estar incompletos porque son campos rellenados por el candidato; analiza esta información críticamente al realizar la evaluación de compatibilidad.

        Formato de Respuesta Esperado: JSON (sigue el schema proporcionado). Cada item debe ir en su correspondiente item del schema. No olvides ninguno. SIEMPRE debes incluir una razón para cada nota, incluso si es 10. Si no puedes evaluar un criterio, asigna 0 como nota y explica por qué no se pudo evaluar PERO NUNCA olvides el formato JSON.
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