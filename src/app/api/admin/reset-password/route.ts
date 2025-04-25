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
    // Verificar que el usuario es un administrador usando el middleware
    const middlewareResponse = await adminMiddleware(request);
    
    // Si el middleware devuelve un error, retornarlo
    if (middlewareResponse.status !== 200) {
      return middlewareResponse;
    }
    
    // Obtener la nueva contraseña del cuerpo de la solicitud
    const { newPassword } = await request.json();
    
    // Validar que se proporcionó una contraseña
    if (!newPassword) {
      return NextResponse.json(
        { error: 'La nueva contraseña es requerida' },
        { status: 400 }
      );
    }
    
    // Crear cliente de Supabase
    const supabase = await createClient();
    
    // Obtener el usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }
    
    // Actualizar la contraseña del usuario
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      return NextResponse.json(
        { error: `Error al actualizar la contraseña: ${error.message}` },
        { status: 500 }
      );
    }
    
    // Devolver respuesta exitosa
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