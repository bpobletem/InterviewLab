import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let interviewId: bigint;
  try {
    interviewId = BigInt((await params).id);
    const conversation = await prisma.conversation.findUnique({
      select: {
        details: true,
      },
      where: {
        interview_id: interviewId,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(conversation.details, { status: 200 });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof TypeError) {
       console.error('El formato del ID de conversación es inválido:', error);
       return NextResponse.json(
         { error: 'El formato del ID de conversación es inválido' },
         { status: 400 }
       );
    }
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Error al obtener la conversación' },
      { status: 500 }
    );
  }
}