import { prisma } from '@/lib/prisma';


// Interfaz para el resultado de la verificación
interface EmailRestrictionResult {
  isValid: boolean;
  error?: string;
}

/**
 * Verifica si el correo del usuario coincide con los dominios permitidos de su institución.
 * @param email - El correo del usuario.
 * @param institutionId - El ID de la institución.
 * @returns Un objeto con `isValid` (true si el correo es válido) y un `error` opcional.
*/
export async function validateInstitutionEmail(
  email: string,
  institutionId: bigint
): Promise<EmailRestrictionResult> {
  try {
    // Validar que se proporcionen email e institutionId
    if (!email || !institutionId) {
      return { isValid: false, error: 'Email y institution ID requeridos' };
    }

    // Extraer el dominio del correo
    const emailDomain = email.substring(email.lastIndexOf('@')).toLowerCase();
    if (!emailDomain) {
      return { isValid: false, error: 'Formato incorrecto' };
    }

    // Buscar los dominios permitidos para la institución
    const allowedDomains = await prisma.institutionEmailDomain.findMany({
      where: { institution_id: institutionId },
      select: { email_domain: true },
    });

    // Si no hay dominios configurados para la institución no permitir el registro
    if (allowedDomains.length === 0) {
      return { isValid: false, error: 'Email incorrecto' };
    }

    // Verificar si el dominio del correo coincide con alguno de los permitidos
    const isValidDomain = allowedDomains.some(
      (domain) => domain.email_domain.toLowerCase() === emailDomain
    );

    if (!isValidDomain) {
      return {
        isValid: false,
        error: `Dominio inválido`,
      };
    }

    return { isValid: true };
  } catch (error) {
    console.error('Error restricting email by institution:', error);
    return { isValid: false, error: 'Failed to verify email domain' };
  }
}