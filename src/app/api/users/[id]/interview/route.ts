import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { serializeData } from "@/utils/functions/serializeData";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Obtener el usuario autenticado
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    // Obtener el usuario de la base de datos usando el authId
    const dbUser = await prisma.user.findUnique({
      where: { authId: authUser.id },
      select: { id: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'Usuario no encontrado en la base de datos' }, { status: 404 });
    }
    
    // Verificar que el ID del parámetro coincida con el usuario autenticado
    const requestedId = (await params).id;
    
    // Solo permitir acceso si el ID solicitado es el del usuario o si es admin
    if (requestedId !== dbUser.id.toString()) {
      return NextResponse.json({ error: 'No autorizado para acceder a estos datos' }, { status: 403 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '6', 10);
    const requestType = searchParams.get('type');
    const isStatsRequest = requestType === 'stats';
    
    // Para solicitudes de estadísticas, limitar a las 10 entrevistas más recientes
    const actualLimit = isStatsRequest ? 10 : limit;
    const skip = (page - 1) * (isStatsRequest ? 0 : limit); // No saltar para estadísticas
    
    if (!requestedId) {
      return NextResponse.json(
        { error: 'User ID is required' }, 
        { status: 400 }
      );
    }

    // Obtener IDs de entrevistas que tienen resultados
    const interviewsWithResults = await prisma.interviewResult.findMany({
      select: { interview_id: true }
    }).then(results => results.map(r => r.interview_id));
    
    // Contar y obtener solo entrevistas que tienen resultados
    const [totalCount, interviews] = await Promise.all([
      prisma.interview.count({
        where: { 
          user_id: requestedId,
          id: { in: interviewsWithResults }
        }
      }),
      prisma.interview.findMany({
        where: { 
          user_id: requestedId,
          id: { in: interviewsWithResults }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: actualLimit
      })
    ]);

    const serializedInterviews = interviews.map(interview => serializeData(interview));
    
    return NextResponse.json({
      data: serializedInterviews,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviews' }, 
      { status: 500 }
    );
  }
}