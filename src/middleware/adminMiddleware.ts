import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

/**
 * Middleware para verificar si un usuario es administrador de una institución
 * 
 * @param request - La solicitud HTTP entrante
 * @returns NextResponse con status 200 si el usuario es administrador, o un error si no lo es
 */
export async function adminMiddleware(request: NextRequest): Promise<NextResponse> {
  try {
    // Crear cliente de Supabase
    const supabase = await createClient();

    // Verificar si el usuario está autenticado
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Buscar si el email del usuario existe en la tabla institutions
    const institution = await prisma.institution.findFirst({
      where: { email: user.email },
      select: { id: true, is_active: true }
    });

    // Si no se encuentra la institución, el usuario no es administrador
    if (!institution) {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden acceder a esta ruta' },
        { status: 403 }
      );
    }

    // Verificar si la institución está activa
    if (!institution.is_active) {
      return NextResponse.json(
        { error: 'La institución no tiene una suscripción activa' },
        { status: 403 }
      );
    }

    // Si llegamos aquí, el usuario es un administrador válido
    // Pasar el ID de la institución en los headers directamente
    const headers = new Headers(request.headers);
    headers.set('x-institution-id', institution.id.toString());

    // Devolver respuesta exitosa con el ID de la institución en los headers
    return NextResponse.json(
      { success: true, institution_id: institution.id.toString() },
      { 
        status: 200,
        headers
      }
    );
  } catch (error) {
    console.error('Error en adminMiddleware:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}