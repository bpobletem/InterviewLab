import { GET, POST } from '@/app/api/users/route';
import { prisma } from '@/lib/prisma';
import { saveUser } from '@/utils/saveUser';
import { NextRequest } from 'next/server';

jest.mock('@/utils/saveUser');

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn()
    }
  }
}));

describe('GET /api/users', () => {
  it('debería devolver una lista de usuarios cuando todo está correcto', async () => {
    const mockUsers = [
      { id: 1, name: 'Juan', email: 'juan@example.com' },
      { id: 2, name: 'Ana', email: 'ana@example.com' },
    ];

    (prisma.user.findMany as jest.Mock).mockResolvedValueOnce(mockUsers);

    const res = await GET();

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(mockUsers);
  });

  it('debería devolver un error si ocurre una excepción', async () => {
    (prisma.user.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const res = await GET();

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Failed to fetch users');
  });
});

describe('POST /api/users', () => {
  const validUser = {
    email: 'test@example.com',
    password: 'securepassword',
    name: 'Test User',
    birthday: '1990-01-01',
    institution_id: '1',
    career_id: '2',
  };

  it('debería crear el usuario si los datos son válidos', async () => {
    (saveUser as jest.Mock).mockResolvedValueOnce({
      id: 1,
      ...validUser,
    });

    const req = {
      json: async () => validUser,
    } as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.text();
    expect(data).toContain(validUser.email);
  });

  it('debería devolver un error si falta algún campo obligatorio', async () => {
    const invalidUser = {
      email: 'incompleto@example.com',
      // falta password, name, etc.
    };

    (saveUser as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Datos incompletos');
    });

    const req = {
      json: async () => invalidUser,
    } as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Failed to save user');
  });
});
