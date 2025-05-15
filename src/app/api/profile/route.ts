import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Buscar el usuario en la base de datos por su authId
    const userProfile = await prisma.user.findFirst({
      where: { authId: user.id },
      include: {
        institution: true,
        career: true
      }
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'Perfil de usuario no encontrado' }, { status: 404 });
    }

    // Formatear los datos para la respuesta
    const formattedProfile = {
      id: userProfile.id.toString(),
      name: userProfile.name,
      email: userProfile.email,
      gender: userProfile.gender,
      birthday: userProfile.birthday.toISOString().split('T')[0],
      institution_id: userProfile.institution_id.toString(),
      institution_name: userProfile.institution?.name || '',
      career_id: userProfile.career_id.toString(),
      career_name: userProfile.career?.name || '',
      authId: userProfile.authId
    };

    return NextResponse.json(formattedProfile);
  } catch (error) {
    console.error('Error al obtener el perfil del usuario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}