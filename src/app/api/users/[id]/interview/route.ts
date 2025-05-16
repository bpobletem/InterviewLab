import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { serializeData } from "@/utils/functions/serializeData";

// Get interviews para el usuario especificado
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Obtener el ID del usuario de los parámetros de la ruta
    const { id } = await params;
    
    // Verificar que el ID del usuario sea válido
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' }, 
        { status: 400 }
      );
    }

    // Obtener las entrevistas del usuario
    const interviews = await prisma.interview.findMany({
      where: {
        user_id: id
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    const serializedInterviews = interviews.map(interview => serializeData(interview));
    
    return NextResponse.json(serializedInterviews, { status: 200 });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviews' }, 
      { status: 500 }
    );
  }
}