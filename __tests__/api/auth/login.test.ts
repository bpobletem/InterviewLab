// src/app/api/auth/login/__tests__/route.test.ts

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/login/route';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { checkInstitutionSubscription } from '@/utils/checkInstitutionSubscription';

// --- Mockear Dependencias ---

// Mockear Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
  },
}));

// Mockear Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Mockear la utilidad de verificación de suscripción
jest.mock('@/utils/checkInstitutionSubscription', () => ({
  checkInstitutionSubscription: jest.fn(),
}));

// --- Helpers ---

// Helper para crear un mock de NextRequest
const createMockRequest = (body: Record<string, unknown>): NextRequest => {
  const req = {
    json: jest.fn().mockResolvedValue(body),
    // Puedes añadir otros métodos/propiedades de NextRequest si los necesitas
  } as unknown as NextRequest; // Hacemos type casting
  return req;
};

// --- Tests ---

describe('POST /api/auth/login', () => {
  // Limpiar mocks antes de cada test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Tests de Validación de Entrada ---

  it('should return 400 if email is missing', async () => {
    const mockRequest = createMockRequest({ password: 'password123' });
    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Correo y contraseña son requeridos' });
    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('should return 400 if password is missing', async () => {
    const mockRequest = createMockRequest({ email: 'test@example.com' });
    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Correo y contraseña son requeridos' });
    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  // --- Test de Credenciales Inválidas (Error de Supabase) ---

  it('should return 401 if Supabase authentication fails', async () => {
    const mockRequest = createMockRequest({ email: 'test@example.com', password: 'wrongpassword' });
    const supabaseError = { message: 'Invalid login credentials', status: 400 }; // Ejemplo de error Supabase
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({ data: null, error: supabaseError });

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: 'Credenciales inválidas' });
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'wrongpassword',
    });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  // --- Test de Usuario No Encontrado en DB (Prisma) ---

  it('should return 404 if user is authenticated by Supabase but not found in Prisma DB', async () => {
    const mockRequest = createMockRequest({ email: 'test@example.com', password: 'password123' });
    const mockSupabaseUser = { id: 'user-id-123', email: 'test@example.com' };
    const mockSupabaseSession = { access_token: 'token', refresh_token: 'refresh' };

    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: mockSupabaseUser, session: mockSupabaseSession },
      error: null,
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null); // Usuario no encontrado en Prisma

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: 'Usuario no encontrado en la base de datos' });
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: mockSupabaseUser.id },
      select: { institution_id: true },
    });
    expect(checkInstitutionSubscription).not.toHaveBeenCalled();
  });

  // --- Tests de Login Exitoso ---

  it('should return 200 with user and session data if login is successful (no institution)', async () => {
    const mockRequest = createMockRequest({ email: 'test@example.com', password: 'password123' });
    const mockSupabaseUser = { id: 'user-id-123', email: 'test@example.com', /* otros campos */ };
    const mockSupabaseSession = { access_token: 'token', refresh_token: 'refresh', /* otros campos */ };
    const mockDbUser = { institution_id: null }; // Usuario sin institución

    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: mockSupabaseUser, session: mockSupabaseSession },
      error: null,
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      user: mockSupabaseUser,
      session: mockSupabaseSession,
    });
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: mockSupabaseUser.id },
      select: { institution_id: true },
    });
    // No debe llamar a checkInstitutionSubscription si no hay institution_id
    expect(checkInstitutionSubscription).not.toHaveBeenCalled();
  });

  it('should return 200 with user and session data if login is successful (with active institution)', async () => {
    const mockRequest = createMockRequest({ email: 'inst_user@example.com', password: 'password123' });
    const mockSupabaseUser = { id: 'user-id-456', email: 'inst_user@example.com' };
    const mockSupabaseSession = { access_token: 'token2', refresh_token: 'refresh2' };
    const mockDbUser = { institution_id: 'inst-id-abc' }; // Usuario CON institución
    const mockSubscriptionStatus = { isActive: true, error: null };

    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: mockSupabaseUser, session: mockSupabaseSession },
      error: null,
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);
    (checkInstitutionSubscription as jest.Mock).mockResolvedValue(mockSubscriptionStatus);

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      user: mockSupabaseUser,
      session: mockSupabaseSession,
    });
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'inst_user@example.com',
      password: 'password123',
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: mockSupabaseUser.id },
      select: { institution_id: true },
    });
    expect(checkInstitutionSubscription).toHaveBeenCalledWith(mockDbUser.institution_id);
  });

  // --- Tests de Lógica de Institución ---

  it('should return 403 if the institution subscription is not active', async () => {
    const mockRequest = createMockRequest({ email: 'inactive_inst_user@example.com', password: 'password123' });
    const mockSupabaseUser = { id: 'user-id-789', email: 'inactive_inst_user@example.com' };
    const mockSupabaseSession = { access_token: 'token3', refresh_token: 'refresh3' };
    const mockDbUser = { institution_id: 'inst-id-xyz' };
    const mockSubscriptionStatus = { isActive: false, error: null }; // Institución INACTIVA

    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: mockSupabaseUser, session: mockSupabaseSession },
      error: null,
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);
    (checkInstitutionSubscription as jest.Mock).mockResolvedValue(mockSubscriptionStatus);

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body).toEqual({ error: 'La institución no tiene una suscripción activa' });
    expect(checkInstitutionSubscription).toHaveBeenCalledWith(mockDbUser.institution_id);
  });

  it('should return 404 if checkInstitutionSubscription returns "Institución no encontrada"', async () => {
    const mockRequest = createMockRequest({ email: 'ghost_inst_user@example.com', password: 'password123' });
    const mockSupabaseUser = { id: 'user-id-101', email: 'ghost_inst_user@example.com' };
    const mockSupabaseSession = { access_token: 'token4', refresh_token: 'refresh4' };
    const mockDbUser = { institution_id: 'inst-id-ghost' };
    const mockSubscriptionStatus = { isActive: false, error: 'Institución no encontrada' }; // Error específico

    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: mockSupabaseUser, session: mockSupabaseSession },
      error: null,
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);
    (checkInstitutionSubscription as jest.Mock).mockResolvedValue(mockSubscriptionStatus);

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: 'Institución no encontrada' });
    expect(checkInstitutionSubscription).toHaveBeenCalledWith(mockDbUser.institution_id);
  });

  it('should return 500 if checkInstitutionSubscription returns a generic error', async () => {
    const mockRequest = createMockRequest({ email: 'error_inst_user@example.com', password: 'password123' });
    const mockSupabaseUser = { id: 'user-id-202', email: 'error_inst_user@example.com' };
    const mockSupabaseSession = { access_token: 'token5', refresh_token: 'refresh5' };
    const mockDbUser = { institution_id: 'inst-id-error' };
    const mockSubscriptionStatus = { isActive: false, error: 'Some internal server error' }; // Error genérico

    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: mockSupabaseUser, session: mockSupabaseSession },
      error: null,
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);
    (checkInstitutionSubscription as jest.Mock).mockResolvedValue(mockSubscriptionStatus);

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Some internal server error' });
    expect(checkInstitutionSubscription).toHaveBeenCalledWith(mockDbUser.institution_id);
  });


  // --- Test de Error Genérico (catch block) ---

  it('should return 500 if request.json() throws an error', async () => {
    const mockRequest = {
      json: jest.fn().mockRejectedValue(new Error('Failed to parse JSON')),
    } as unknown as NextRequest;

    // Mock console.error para evitar que se imprima en la salida del test
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Fallo en la autenticación' });
    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled(); // Verifica que se logueó el error

    consoleErrorSpy.mockRestore(); // Restaura console.error
  });

   it('should return 500 if supabase throws an unexpected error', async () => {
    const mockRequest = createMockRequest({ email: 'test@example.com', password: 'password123' });
    (supabase.auth.signInWithPassword as jest.Mock).mockRejectedValue(new Error('Supabase network error'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Fallo en la autenticación' });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

});