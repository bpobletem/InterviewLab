import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma'
import { SignUpData } from '@/types/types';
import { randomUUID } from 'crypto';
import { validateInstitutionEmail } from 'src/utils/validations/validateInstitutionEmail';

/**
 * Registra un usuario nuevo en el sistema
 * 
 * Esta función se encarga de:
 * 1. Verificar que el correo electrónico no esté ya registrado
 * 2. Validar el dominio del correo si se proporciona una institución
 * 3. Registrar al usuario en Supabase Authentication
 * 4. Crear o actualizar el registro del usuario en la base de datos usando Prisma
 * 5. Eliminar el usuario de Supabase Auth en caso de error al guardar en la base de datos
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
 * @throws {Error} Si el correo ya está registrado o hay otros errores
 */
export async function saveUser(data: SignUpData) {
  const supabase = await createClient();
  const { email, password, name, birthday, gender, institution_id, career_id } = data;

  // Verificar que el correo no esté ya registrado
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true }
  });

  if (existingUser) {
    throw new Error('Este correo electrónico ya está registrado');
  }

  if (!email || !password || !name || !birthday || !gender || !career_id || !institution_id) {
    throw new Error('Todos los campos son requeridos');
  }

  // Verificar el dominio del correo si institution_id está presente
  if (institution_id) {
    const { isValid, error: emailError } = await validateInstitutionEmail(
      email,
      institution_id
    );

    if (!isValid) {
      throw new Error(
        emailError || 'Dominio inválido'
      );
    }
  }

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
        gender,
        institution_id,
        career_id,
      },
      create: {
        id: randomUUID(),
        authId: authUser.id,
        email,
        name,
        birthday,
        gender,
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