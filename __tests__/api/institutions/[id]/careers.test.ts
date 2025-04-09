import { GET } from '@/app/api/institutions/[id]/careers/route'; // Ajusta la ruta según tu estructura
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mockeamos Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    institution: {
      findUnique: jest.fn(),
    },
    career: {
      findMany: jest.fn(),
    },
  },
}));

// Mockeamos NextResponse
jest.mock('next/server', () => ({
  NextRequest: class {},
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: async () => data,
      status: options?.status || 200,
    })),
  },
}));

describe('GET /api/institutions/[id]/careers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devuelve todas las carreras de una institución activa correctamente', async () => {
    // Datos simulados
    const institutionId = '1';
    const mockInstitution = { id: BigInt(institutionId) };
    const mockCareers = [
      { id: '1', area: { id: '1', name: 'Tecnología' } },
      { id: '2', area: { id: '2', name: 'Ciencias' } },
    ];

    // Mockeamos las consultas de Prisma
    (prisma.institution.findUnique as jest.Mock).mockResolvedValue(mockInstitution);
    (prisma.career.findMany as jest.Mock).mockResolvedValue(mockCareers);

    // Simulamos los parámetros de la solicitud
    const request = {} as NextRequest;
    const params = { id: institutionId };

    // Ejecutamos el endpoint
    const response = await GET(request, { params });
    const responseData = await response.json();

    // Verificamos la respuesta
    expect(responseData).toEqual({ careers: mockCareers });
    expect(response.status).toBe(200);

    // Verificamos las llamadas a Prisma
    expect(prisma.institution.findUnique).toHaveBeenCalledWith({
      where: { id: BigInt(institutionId), is_active: true },
      select: { id: true },
    });
    expect(prisma.career.findMany).toHaveBeenCalledWith({
      where: { institution_id: BigInt(institutionId) },
      select: {
        id: true,
        area: { select: { id: true, name: true } },
      },
      orderBy: { id: 'asc' },
    });
  });

  it('devuelve status 404 si la institución no existe o está inactiva', async () => {
    // Datos simulados
    const institutionId = '999';

    // Mockeamos que la institución no existe
    (prisma.institution.findUnique as jest.Mock).mockResolvedValue(null);

    // Simulamos los parámetros de la solicitud
    const request = {} as NextRequest;
    const params = { id: institutionId };

    // Ejecutamos el endpoint
    const response = await GET(request, { params });
    const responseData = await response.json();

    // Verificamos la respuesta
    expect(responseData).toEqual({ error: 'Institución no encontrada o inactiva' });
    expect(response.status).toBe(404);

    // Verificamos que se llamó a Prisma correctamente
    expect(prisma.institution.findUnique).toHaveBeenCalledWith({
      where: { id: BigInt(institutionId), is_active: true },
      select: { id: true },
    });
    // Verificamos que no se llamó a findMany porque la institución no existe
    expect(prisma.career.findMany).not.toHaveBeenCalled();
  });

  it('devuelve status 400 si el ID es inválido', async () => {
    const request = {} as NextRequest;
    const params = { id: 'invalid-id' };
  
    const response = await GET(request, { params });
    const responseData = await response.json();
  
    expect(responseData).toEqual({ error: 'ID de institución inválido' });
    expect(response.status).toBe(400);
  });
});