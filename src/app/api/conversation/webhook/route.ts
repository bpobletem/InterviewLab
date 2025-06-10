import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import crypto from "crypto";
import { GeminiFeedbackResponse, PartialFeedbackResponse } from "@/types/types";
import { defaultCriterion, defaultResult } from "@/types/vars";


// Endpoint que recibe webhook de elevenlabs
// Se encarga de guardar la conversacion en la base de datos
// Datos como resumen, transcripcion, etc.

export async function POST(request: NextRequest) {
  const secret = process.env.NEXT_PUBLIC_WEBHOOK_SECRET;
  const { event, error } = await constructWebhookEvent(request, secret);
  if (error) {
    return NextResponse.json({ error: error }, { status: 401 });
  }

  try {
    // Obtener el ID de conversación de los datos
    const conversationId = event.data.conversation_id;

    if (!conversationId) {
      return NextResponse.json(
        { error: "Se necesita conversation ID" },
        { status: 400 }
      );
    }

    // Buscar la conversación en la base de datos
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversación no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar la conversación en la base de datos
    // Guardamos todos los datos recibidos en el campo details (JSON)
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        details: event.data
      },
    });

    const interview = await prisma.interview.findUnique({
      where: { id: conversation.interview_id },
      select: {
        resume: true,
        job_description: true,
      }
    });

    // Triggerear un llamado a la API de Gemini para pedirle que procese la conversacion y devuelva un feedback para mostrar al usuario.
    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
    async function main(): Promise<string> {
      // Formateams la transcripcion para que sea legible por Gemini
      const formattedTranscript = event.data.transcript.map((entry: { role: string, message?: string, text?: string, content?: string }) => {
        const speakerLabel = entry.role === 'user' ? 'Candidato' : 'Agente';
        const messageContent = entry.message ?? "";
        return `${speakerLabel}: ${messageContent}`;
      }).join('\n\n');

      const res = await ai.models.generateContent({
        model: "gemini-2.0-flash-lite",
        contents: `
        Rol: Eres un evaluador de entrevistas experto.
        Tarea: Analiza la siguiente transcripción de una entrevista de trabajo. Enfócate EXCLUSIVAMENTE en las respuestas del "Candidato" y refiérete a él como "Candidato" en todo momento. NO evalúes las intervenciones del "Agente".

        Instrucciones de Evaluación para el Candidato:
        Evalúa cada criterio asignando una nota del 1 al 10 (1=peor, 10=mejor; 6=aprobado).
        Para notas menores a 10, DEBES justificar brevemente la razón y ofrecer una sugerencia de mejora clara y concisa con un ejemplo práctico.
        Si la nota es 10, la justificación debe explicar por qué es excepcional.
        Si no hay información suficiente para evaluar un criterio, asigna 0 y explica por qué.
        Sé breve y conciso en cada justificación y sugerencia.

        Criterios a Evaluar:
        1.  **Claridad**: ¿Las respuestas del Candidato son comprensibles, ordenadas y coherentes?
        2.  **Profesionalismo**: ¿El Candidato usa lenguaje adecuado, respetuoso y profesional?
        3.  **Técnica**: ¿El Candidato demuestra conocimientos técnicos relevantes para el puesto (herramientas, procesos, metodologías)?
        4.  **Interés**: ¿El Candidato muestra motivación por el cargo/empresa? ¿Transmite entusiasmo?
        5.  **Ejemplos**: ¿El Candidato proporciona ejemplos concretos que respalden sus habilidades/experiencias?

        Transcripción:
        ---
        ${formattedTranscript}
        ---

        Contexto Adicional:
        ---
        CV: ${interview?.resume}
        Descripción del Puesto: ${interview?.job_description}
        ---

        Resultado - Evaluación de Compatibilidad (Match):
        Basado en las respuestas del Candidato, el CV y la Descripción del Puesto, evalúa el porcentaje de ajuste al puesto.
        Describe un resumen general del desempeño del Candidato y por qué sería un buen o mal candidato.
        Asigna un porcentaje del 1 al 100, usando la siguiente escala:
        - 1-30: Muy Desaprobado (no se ajusta, necesita mejorar significativamente)
        - 31-50: Desaprobado (ajuste parcial, puede mejorar)
        - 51-70: Aprobado (se ajusta, buenas respuestas)
        - 71-90: Muy Aprobado (se ajusta muy bien, excelentes respuestas)
        - 91-100: Excelente (ajuste perfecto, respuestas excepcionales)
        Si la descripción del puesto es poco clara o ausente, asigna 0% de match y explica la razón.
        Analiza críticamente CV y descripción del puesto, ya que pueden contener errores.

        Formato de Respuesta Esperado: JSON (sigue el schema proporcionado). Cada item debe ir en su correspondiente item del schema. No olvides ninguno. SIEMPRE incluye una razón y una propuesta de mejora para cada nota, *a menos que la nota sea 10 (en cuyo caso solo la razón) o 0 (en cuyo caso solo la razón)*. **Si la nota es 10, solo la razón.** **Si la nota es 0, solo la razón.**
        
        Aqui tienes un ejemplo de respuesta para un criterio:
        **
        "ejemplos": {
        "nota": 7,
        "razon": "El candidato menciona herramientas como Git y Cloudflare Workers, pero no ofrece ejemplos concretos de su aplicación o los resultados obtenidos. Por ejemplo, falta cómo aplicó Git en un proyecto específico o cómo resolvió desafíos con Cloudflare Workers. Esto dificulta evaluar su capacidad real de aplicación.", Para mejorar, el candidato debería usar la técnica STAR (Situación, Tarea, Acción, Resultado) para dar ejemplos. Por ejemplo, al hablar de Git: 'En el proyecto X, utilicé Git para gestionar ramas y resolver un conflicto crítico, lo que nos permitió lanzar la función Y a tiempo'. Siempre que sea posible, debe cuantificar sus logros (ej. 'reduje el tiempo de carga en un 20%')."
        **`,
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
    let partialData = {};

    try {
      partialData = JSON.parse(geminiResponseString);
    } catch (error) {
      console.error("Error al parsear el JSON de Gemini:", error, "Contenido:", geminiResponseString);
    }

    // Usamos la función para asegurar que el objeto esté completo
    const geminiData = fillIncompleteFeedback(partialData);

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
      { status: 200 }
    );

  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

const constructWebhookEvent = async (req: NextRequest, secret?: string) => {
  const body = await req.text();
  const allHeaders: { [key: string]: string } = {};
  req.headers.forEach((value, key) => {
    allHeaders[key] = value;
  });
  const signature_header = req.headers.get("ElevenLabs-Signature");
  if (!signature_header) {
    console.error("Missing signature header");
    return { event: null, error: "Missing signature header" };
  }
  const headers = signature_header.split(",");
  const timestamp = headers.find((e) => e.startsWith("t="))?.substring(2);
  const signature = headers.find((e) => e.startsWith("v0="));
  if (!timestamp || !signature) {
    return { event: null, error: "Invalid signature format" };
  }
  // Validate timestamp
  const reqTimestamp = Number(timestamp) * 1000;
  const tolerance = Date.now() - 30 * 60 * 1000;
  if (reqTimestamp < tolerance) {
    return { event: null, error: "Request expired" };
  }
  // Validate hash
  const message = `${timestamp}.${body}`;
  if (!secret) {
    return { event: null, error: "Webhook secret not configured" };
  }
  const digest =
    "v0=" + crypto.createHmac("sha256", secret).update(message).digest("hex");
  if (signature !== digest) {
    return { event: null, error: "Invalid signature" };
  }
  const event = JSON.parse(body);
  return { event, error: null };
};

function fillIncompleteFeedback(partialResponse: PartialFeedbackResponse | null | undefined): GeminiFeedbackResponse {
  const data = partialResponse || {};

  // Rellena cada criterio asegurando que tenga 'nota' y 'razon'
  const filledCriterios = {
    claridad: { ...defaultCriterion, ...data.criterios?.claridad },
    profesionalismo: { ...defaultCriterion, ...data.criterios?.profesionalismo },
    tecnica: { ...defaultCriterion, ...data.criterios?.tecnica },
    interes: { ...defaultCriterion, ...data.criterios?.interes },
    ejemplos: { ...defaultCriterion, ...data.criterios?.ejemplos },
  };

  // Rellena el resultado final
  const filledResultado = { ...defaultResult, ...data.resultado };

  return {
    criterios: filledCriterios,
    resultado: filledResultado,
  };
}