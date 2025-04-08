import { PrismaClient } from '@prisma/client';

// Inicializar Prisma
const prisma = new PrismaClient();

// Interfaz para el resultado de la verificación
interface InstitutionCheckResult {
  isActive: boolean;
  error?: string;
}

/**
 * Verifica si una institución está activa.
 * @param institutionId - El ID de la institución a verificar.
 * @returns Un objeto con `isActive` (true si la institución está activa) y un `error` opcional.
*/
export async function checkInstitutionSubscription(institutionId: bigint): Promise<InstitutionCheckResult> {
  try {
    // Buscar la institución en la base de datos
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
      select: { is_active: true },
    });

    // Si la institución no existe, devolver un error
    if (!institution) {
      return { isActive: false, error: 'Institución no encontrada' };
    }

    // Devolver el estado de is_active
    return { isActive: institution.is_active };
  } catch (error) {
    console.error('Error checking institution status:', error);
    return { isActive: false, error: 'Failed to check institution status' };
  } finally {
    await prisma.$disconnect();
  }
}