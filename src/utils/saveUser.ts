import { supabase } from '@/lib/supabase';
import { PrismaClient } from '@prisma/client';
import { SignUpData } from '@/types/types';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

/**
 * Registra un usuario nuevo en el sistema
 * 
 * Esta función se encarga de:
 * 1. Registrar al usuario en Supabase Authentication
 * 2. Crear o actualizar el registro del usuario en la base de datos usando Prisma
 * 3. Eliminar el usuario de Supabase Auth en caso de error al guardar en la base de datos
 * 
 * @param {SignUpData} data - Datos del usuario para registro (email, contraseña, nombre, etc.)
 * @param {string} data.email - Correo electrónico del usuario
 * @param {string} data.password - Contraseña del usuario
 * @param {string} data.name - Nombre completo del usuario
 * @param {Date} data.birthday - Fecha de nacimiento
 * @param {BigInt|null} data.institution_id - ID de la institución (opcional)
 * @param {BigInt|null} data.career_id - ID de la carrera (opcional)
 * 
 * @returns {Promise<User>} El registro de usuario creado en la base de datos
 */
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