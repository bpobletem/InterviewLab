import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST /api/conversation (este endpoint se encarga de guardar la conversacion en la base de datos)
// primero se guarda el id de la conversacion y el id de la entrevista
// luego los datos llegan desde un webhook de elevenlabs en cuanto termina la conversacion
// ver endpoint /api/conversation/webhook

export async function POST(request: Request) {
  const { conversationId, interviewId } = await request.json();

  if (!conversationId || !interviewId) {
    return NextResponse.json({ error: "Se necesita conversation ID y interview ID" }, { status: 400 });
  }

  try {
    // Verificar si ya existe una conversación para esta entrevista
    const existingConversation = await prisma.conversation.findUnique({
      where: { interview_id: interviewId },
    });

    if (existingConversation) {
      // Actualizar la conversación existente
      await prisma.conversation.update({
        where: { interview_id: interviewId },
        data: { id: conversationId },
      });

      return NextResponse.json({ message: "Conversación actualizada" }, { status: 200 });
    }

    // Crear una nueva conversación si no existe
    await prisma.conversation.create({
      data: {
        id: conversationId,
        interview_id: interviewId,
      },
    });

    return NextResponse.json({ message: "Conversación guardada" }, { status: 200 });
  } catch (error) {
    console.error("Error saving conversation:", error);
    return NextResponse.json({ error: "Error al guardar la conversación" }, { status: 500 });
  }
}