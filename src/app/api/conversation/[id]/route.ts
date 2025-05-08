import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let interviewId: bigint;
  try {
    // Obtenemos usuario actual
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado. Debe iniciar sesión para acceder a este recurso.' },
        { status: 401 }
      );
    }

    // Buscar el usuario en la base de datos
    const dbUser = await prisma.user.findUnique({
      where: {
        authId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'No autorizado. Debe iniciar sesión para acceder a este recurso.' },
        { status: 401 }
      );
    }
    
    interviewId = BigInt((await params).id);

    const interview = await prisma.interview.findUnique({
      where: {
        id: interviewId,
      },
      select: {
        user_id: true,
      },
    });
    
    if (!interview) {
      return NextResponse.json(
        { error: 'Conversación no encontrada' },
        { status: 404 }
      );
    }
    
    // Verificar si el usuario es el propietario de la conversación/entrevista
    if (interview.user_id !== dbUser.id) {
      return NextResponse.json(
        { error: 'No autorizado. No tienes permiso para acceder a este recurso.' },
        { status: 403 }
      );
    }

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