import { NextRequest, NextResponse } from 'next/server'; 
import { createClient } from '@/utils/supabase/server';
import { adminMiddleware } from '@/middleware/adminMiddleware';

/**
 * POST /api/admin/reset-password - Actualizar la contraseña del administrador
 * 
 * Este endpoint está protegido por el adminMiddleware y permite a un administrador
 * actualizar su propia contraseña utilizando Supabase Authentication.
 */
export async function POST(request: NextRequest) {
  try {
    //  Leer el body al inicio (solo se puede leer una vez)
    const body = await request.json();
    const { newPassword } = body;

    //  Validar que se proporcionó una contraseña
    if (!newPassword) {
      return NextResponse.json(
        { error: 'La nueva contraseña es requerida' },
        { status: 400 }
      );
    }

    //  Verificar que el usuario es administrador
    const middlewareResponse = await adminMiddleware(request);
    if (middlewareResponse.status !== 200) {
      return middlewareResponse;
    }

    //  Crear cliente de Supabase
    const supabase = await createClient();

    //  Obtener el usuario actual
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    //  Actualizar la contraseña del usuario
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return NextResponse.json(
        { error: `Error al actualizar la contraseña: ${error.message}` },
        { status: 500 }
      );
    }

    //  Contraseña actualizada exitosamente
    return NextResponse.json(
      { message: 'Contraseña actualizada correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al actualizar la contraseña:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}