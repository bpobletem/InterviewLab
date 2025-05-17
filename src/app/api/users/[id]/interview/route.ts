import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { serializeData } from "@/utils/functions/serializeData";

// Get interviews para el usuario especificado
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Obtener el ID del usuario de los parámetros de la ruta
    const { id } = await params;
    
    // Obtener parámetros de paginación de la URL
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '6', 10); // 3 para testing
    const skip = (page - 1) * limit;
    
    // Verificar que el ID del usuario sea válido
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' }, 
        { status: 400 }
      );
    }

    // Obtener tanto el conteo y las entrevistas
    const [totalCount, interviews] = await Promise.all([
      prisma.interview.count({
        where: { user_id: id }
      }),
      prisma.interview.findMany({
        where: { user_id: id },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      })
    ]);

    const serializedInterviews = interviews.map(interview => serializeData(interview));
    
    // Incluir metadata de paginación en la respuesta
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