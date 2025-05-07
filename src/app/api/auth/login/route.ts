import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'; // Importar la función para crear el cliente de Supabase
import { prisma } from '@/lib/prisma'; // Usar la instancia singleton de Prisma
import { checkInstitutionSubscription } from '@/utils/validations/checkInstitutionSubscription';

// POST /api/auth/login - Validate login credentials
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { email, password } = await request.json();

    // Validar que se proporcionen email y contraseña
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Correo y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Autenticar al usuario con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Obtener el usuario autenticado
    const user = data.user;

    // Verificar si el email del usuario existe en la tabla institutions (admin check)
    const adminInstitution = await prisma.institution.findFirst({
      where: { email: user.email },
      select: { id: true }
    });

    if (adminInstitution) {
      // Si es un admin, invalidar la sesión y devolver error
      await supabase.auth.signOut(); 
      return NextResponse.json(
        { error: 'Los administradores deben iniciar sesión a través del portal de administración.' },
        { status: 403 }
      );
    }

    // Buscar el institution_id del usuario usando Prisma (para estudiantes)
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      select: { institution_id: true },
    });

    if (!dbUser) {
      // Invalidar sesión si el usuario no se encuentra en la BD (aunque Supabase lo autenticó)
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: 'Usuario no encontrado en la base de datos local.' },
        { status: 404 }
      );
    }

    // Si el usuario no tiene una institución asociada, no permitir el login
    if (!dbUser.institution_id) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "El usuario no tiene una institución asociada." },
        { status: 400 }
      );
    }

    // Verificar si la institución está activa
    const { isActive, error: institutionError } = await checkInstitutionSubscription(
      dbUser.institution_id
    );

    if (institutionError) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: institutionError },
        { status: institutionError === 'Institución no encontrada' ? 404 : 500 }
      );
    }

    if (!isActive) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: 'La institución no tiene una suscripción activa.' },
        { status: 403 }
      );
    }

    // Devolver el usuario y la sesión con status 200 explícito
    return NextResponse.json(
      {
        user: data.user,
        session: data.session,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    return NextResponse.json(
      { error: 'Fallo en la autenticación' },
      { status: 500 }
    );
  }
}