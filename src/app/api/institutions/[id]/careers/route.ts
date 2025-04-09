import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/institutions/[id]/careers
 * 
 * Devuelve todas las carreras asociadas a una institución específica.
 * 
 * @param {Object} params - Parámetros de la URL
 * @param {string} params.id - ID de la institución
 * @returns {Promise<NextResponse>} Una respuesta HTTP con la lista de carreras
 * @example
 * // Respuesta exitosa (200 OK)
 * {
 *   "careers": [
 *     {
 *       "id": "1",
 *       "name": "Ingeniería Informática",
 *       "area": {
 *         "id": "1",
 *         "name": "Tecnología"
 *       }
 *     },
 *     ...
 *   ]
 * }
 * 
 * // Respuesta de error (404 Not Found)
 * {
 *   "error": "Institución no encontrada"
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const institutionId = BigInt(params.id);

    // Verificar si la institución existe y está activa
    const institution = await prisma.institution.findUnique({
      where: {
        id: institutionId,
        is_active: true
      },
      select: { id: true }
    });

    if (!institution) {
      return NextResponse.json(
        { error: 'Institución no encontrada o inactiva' },
        { status: 404 }
      );
    }

    // Obtener todas las carreras de la institución
    const careers = await prisma.career.findMany({
      where: {
        institution_id: institutionId
      },
      select: {
        id: true,
        area: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    return NextResponse.json({ careers }, { status: 200 });
  } catch (error) {
    console.error('Error fetching careers:', error);
    
    // Manejar el caso de ID inválido
    if (error instanceof Error && error.message.includes('BigInt')) {
      return NextResponse.json(
        { error: 'ID de institución inválido' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error al obtener las carreras' },
      { status: 500 }
    );
  }
}