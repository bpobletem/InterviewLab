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
  let institutionId: bigint;

  try {
    // Intentamos convertir el ID de la URL a BigInt.
    // Si params.id no es un número entero válido (ej: "abc", "1.5"), esto lanzará un error.
    institutionId = await BigInt(params.id);
  } catch (error) {
    console.error('Invalid institution ID format:', params.id, error);
    return NextResponse.json(
      { error: 'El formato del ID de institución es inválido' },
      { status: 400 }
    );
  }

  try {
    // Verificar si la institución existe y está activa
    // Seleccionamos solo 'id' porque solo necesitamos saber si existe.
    const institution = await prisma.institution.findUnique({
      where: {
        id: institutionId,
        is_active: true,
      },
      select: { id: true }, // Solo necesitamos confirmar existencia
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
        area: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc', // Cambiado a ordenar por nombre como ejemplo
      },
    });

    const careersForJson = careersFromDb.map((career) => ({
      id: career.id.toString(),        // Convertir ID de carrera a string
      name: career.name,              // Mantener el nombre
      area: {
        id: career.area.id.toString(), // Convertir ID de área a string
        name: career.area.name,        // Mantener nombre de área
      },
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