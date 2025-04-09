import { GET } from '@/app/api/institutions/route'; // Ajusta la ruta según tu estructura
import { prisma } from '@/lib/prisma';

// Mockeamos el módulo de Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    institution: {
      findMany: jest.fn(), // Mockeamos el método findMany
    },
  },
}));

// Mockeamos NextResponse.json
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => data,
      status: options?.status || 200,
      data, // Add this for testing
      options, // Add this for testing
    })),
  },
}));

describe('GET /api/institutions', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Limpiamos los mocks antes de cada test
  });

  it('devuelve la lista de instituciones activas correctamente', async () => {
    // Datos simulados que Prisma debería devolver
    const mockInstitutions = [
      { id: '1', name: 'Universidad Nacional' },
      { id: '2', name: 'Instituto Técnico' },
    ];

    // Configuramos el mock de Prisma para que devuelva los datos simulados
    (prisma.institution.findMany as jest.Mock).mockResolvedValue(mockInstitutions);

    // Ejecutamos el endpoint
    const response = await GET();
    const responseData = await response.json();

    // Verificamos que la respuesta sea correcta
    expect(responseData).toEqual({ institutions: mockInstitutions });
    expect(response.status).toBe(200);

    // Verificamos que Prisma fue llamado con los parámetros correctos
    expect(prisma.institution.findMany).toHaveBeenCalledWith({
      where: { is_active: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  });

  it('devuelve un error 500 si falla la consulta a Prisma', async () => {
    // Simulamos un error en Prisma
    const mockError = new Error('Database error');
    (prisma.institution.findMany as jest.Mock).mockRejectedValue(mockError);

    // Espiamos console.error antes de ejecutar el endpoint
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Ejecutamos el endpoint
    const response = await GET();
    const responseData = await response.json();

    // Verificamos que la respuesta sea un error
    expect(responseData).toEqual({ error: 'Error al obtener las instituciones' });
    expect(response.status).toBe(500);

    // Verificamos que console.error fue llamado con los argumentos correctos
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching institutions:', mockError);
  });
});