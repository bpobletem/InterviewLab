import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

    // Aqui debemos triggerear un llamado a la API de Gemini para pedirle que procese la conversacion y devuelva un feedback para mostrar al usuario.
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