import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * GET /api/institutions
 * 
 * Devuelve todas las instituciones activas en el sistema.
 * 
 * @returns {Promise<NextResponse>} Una respuesta HTTP con la lista de instituciones
 * @example
 * // Respuesta exitosa (200 OK)
 * {
 *   "institutions": [
 *     {
 *       "id": "1",
 *       "name": "Universidad Nacional",
 *       "email": "contacto@universidad.edu",
 *       "phone": "+5991234567",
 *       "is_active": true
 *     },
 *     ...
 *   ]
 * }
 */
export async function GET() {
  try {
    const institutions = await prisma.institution.findMany({
      where: {
        is_active: true
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ institutions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching institutions:', error);
    return NextResponse.json(
      { error: 'Error al obtener las instituciones' },
      { status: 500 }
    );
  }
}