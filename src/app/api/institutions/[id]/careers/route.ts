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
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let institutionId: bigint;
  try {
    // Intentamos convertir el ID de la URL a BigInt.
    // Si params.id no es un número entero válido (ej: "abc", "1.5"), esto lanzará un error.
    institutionId = BigInt((await params).id);
  } catch (error) {
    console.error('Invalid institution ID format:', error);
    return NextResponse.json(
      { error: 'El formato del ID de institución es inválido' },
      { status: 400 }
    );
  }

  try {
    // Verificar si la institución existe y está activa
    const institution = await prisma.institution.findUnique({
      where: {
        id: institutionId,
        is_active: true,
      },
      select: { id: true },
    });

    // Si no se encuentra la institución, devolvemos 404
    if (!institution) {
      return NextResponse.json(
        { error: 'Institución no encontrada o inactiva' },
        { status: 404 }
      );
    }

    // Obtener todas las carreras de la institución
    const careersFromDb = await prisma.career.findMany({
      where: {
        institution_id: institutionId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const careersForJson = careersFromDb.map((career) => ({
      id: career.id.toString(),         // Convertir ID de carrera a string
      name: career.name,
    }));

    return NextResponse.json({ careers: careersForJson }, { status: 200 });

  } catch (error) {
    // Error general del servidor (ej: problema de conexión con la BD)
    console.error('Error fetching careers for institution:', institutionId, error);
    return NextResponse.json(
      { error: 'Error interno al obtener las carreras' },
      { status: 500 }
    );
  }
}