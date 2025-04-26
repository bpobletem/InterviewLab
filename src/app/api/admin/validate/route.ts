import { NextRequest, NextResponse } from 'next/server';
import { adminMiddleware } from '@/middleware/adminMiddleware';

/**
 * GET /api/admin/validate - Validar si un usuario es administrador
 * 
 * Este endpoint utiliza el adminMiddleware para verificar si el usuario
 * autenticado es un administrador válido (su email existe en la tabla institutions)
 */
export async function GET(request: NextRequest) {
  try {
    // Utilizar el middleware de administrador para validar
    const middlewareResponse = await adminMiddleware(request);
    
    // Devolver la respuesta del middleware
    return middlewareResponse;
  } catch (error) {
    console.error('Error en la validación de administrador:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}