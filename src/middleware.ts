import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Lista de rutas públicas que no requieren autenticación
  const publicRoutes = ['/', '/login', '/register', '/auth/confirm', '/auth/reset-password', '/auth/callback'];

  // Comprobar si la URL actual es una ruta pública
  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route + '/')
  );

  // Si es una ruta pública, permitir el acceso sin verificar la sesión
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Para rutas privadas, verificar la sesión
  return await updateSession(request);
}

// Apply the middleware to all routes except static files and api routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}