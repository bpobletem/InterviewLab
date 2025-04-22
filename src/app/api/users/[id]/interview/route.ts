import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Get interviews para el usuario especificado
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Obtener el ID del usuario de los parámetros de la ruta
    const { id } = params;
    
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
    
    return NextResponse.json(interviews);
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviews' }, 
      { status: 500 }
    );
  }
}