import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Lista de rutas públicas que no requieren autenticación
  const publicRoutes = ['/', '/login', '/register', '/auth/confirm', '/auth/reset-password', '/auth/callback', '/admin/login', '/terms', '/privacy', '/recuperar-password', '/reset-password', '/reset-password/confirma'];

  // Comprobar si la URL actual es una ruta pública
  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route + '/')
  );

  // Si es una ruta pública, permitir el acceso sin verificar la sesión
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Verificar si es una ruta de admin dashboard
  if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
    // Crear cliente de Supabase
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          },
        },
      }
    )

    // Verificar si el usuario está autenticado
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Redirigir a login si no hay usuario
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Verificar si el usuario es administrador llamando al endpoint de validación
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/admin/validate`, {
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        },
      })

      if (!response.ok) {
        // Si no es administrador, redirigir a la página principal
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error('Error validando administrador:', error)
      // En caso de error, redirigir a la página principal
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
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