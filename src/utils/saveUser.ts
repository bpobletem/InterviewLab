import { supabase } from '@/lib/supabase';
import { PrismaClient } from '@prisma/client';
import { SignUpData } from '@/types/types';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export async function saveUser(data: SignUpData) {
  const { email, password, name, birthday, institution_id, career_id } = data;

  // Registrar usuario en Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    throw new Error(`Error en registro de Supabase: ${authError.message}`);
  }

  const authUser = authData.user;
  if (!authUser) {
    throw new Error('No se obtuvo el usuario autenticado');
  }

  try {
    // Guardar en la tabla public.users con Prisma
    const dbUser = await prisma.user.upsert({
      where: { authId: authUser.id },
      update: {
        email,
        name,
        birthday, 
        institution_id,
        career_id,
      },
      create: {
        id: randomUUID(),
        authId: authUser.id,
        email,
        name,
        birthday,
        institution_id,
        career_id,
      },
    });

    return dbUser;
  } catch (error) {
    console.error('Error al actualizar usuario en la base de datos:', error);
    await supabase.auth.admin.deleteUser(authUser.id);
    throw error;
  }
}