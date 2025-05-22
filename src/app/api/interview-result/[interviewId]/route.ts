import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma'; // Asumiendo que tienes prisma configurado en '@/lib/prisma'
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: NextRequest, // Cambiado de Request a NextRequest para compatibilidad con Supabase auth
  { params }: { params: Promise<{ id: string }> }
) {
  const interviewId = (await params).id;

  if (!interviewId) {
    return NextResponse.json({ error: 'Interview ID is required' }, { status: 400 });
  }

  try {
    // Obtener el usuario autenticado
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userAuthId = authUser.id;
    const user = await prisma.user.findUnique({
      where: { authId: userAuthId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - User not found in DB' }, { status: 401 });
    }

    const interviewResult = await prisma.interviewResult.findUnique({
      where: {
        interview_id: interviewId,
      },
      include: {
        interview: { // Incluir la entrevista relacionada
          select: {
            user_id: true, // Seleccionar el user_id de la entrevista
          },
        },
      },
    });

    if (!interviewResult) {
      // Si el resultado no existe aún, podemos devolver un estado específico
      return NextResponse.json({ status: 'pending', message: 'Feedback aún no está listo.' }, { status: 202 }); // 202 Accepted indica que la solicitud ha sido aceptada para procesamiento, pero el procesamiento no ha sido completado.
    }

    if (!interviewResult.interview) {
      // Si la entrevista no existe, manejar esto según sea necesario
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    // Verificar que el usuario autenticado es el propietario de la entrevista
    if (interviewResult.interview.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden - You do not own this interview result' }, { status: 403 });
    }

    return NextResponse.json(interviewResult, { status: 200 });
  } catch (error) {
    console.error('Error fetching interview result:', error);
    return NextResponse.json({ error: 'Error al obtener el resultado de la entrevista' }, { status: 500 });
  }
}