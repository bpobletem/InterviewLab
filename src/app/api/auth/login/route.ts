import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Usar la instancia singleton de Supabase
import { prisma } from '@/lib/prisma'; // Usar la instancia singleton de Prisma
import { checkInstitutionSubscription } from '@/utils/checkInstitutionSubscription';

// POST /api/auth/login - Validate login credentials
export async function POST(request: NextRequest) {
  try {
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

    // Buscar el institution_id del usuario usando Prisma
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      select: { institution_id: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado en la base de datos' },
        { status: 404 }
      );
    }

    // Si el usuario no tiene una institución asociada, no permitir el login
    if (!dbUser.institution_id) {
      return NextResponse.json(
        { error: "No hay institucion asociada" },
        { status: 400 }
      );
    }

    // Verificar si la institución está activa
    const { isActive, error: institutionError } = await checkInstitutionSubscription(
      dbUser.institution_id
    );

    if (institutionError) {
      return NextResponse.json(
        { error: institutionError },
        { status: institutionError === 'Institución no encontrada' ? 404 : 500 }
      );
    }

    if (!isActive) {
      return NextResponse.json(
        { error: 'La institución no tiene una suscripción activa' },
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