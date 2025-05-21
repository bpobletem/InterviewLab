import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveUser } from '@/utils/functions/saveUser';

// GET /api/users - Get all users
export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password, name, birthday, gender, institution_id, career_id } = body;

  try {
    const user = await saveUser({
      email,
      password,
      name,
      birthday: new Date(birthday), // Asegúrate de que sea un Date
      gender,
      institution_id: BigInt(institution_id),
      career_id: BigInt(career_id),
    });

    // Convierte los BigInt a string para poder serializarlos correctamente
    const safeUser = {
      ...user,
      id: user.id?.toString?.(),               // Por si id es BigInt
      institution_id: user.institution_id?.toString?.(),
      career_id: user.career_id?.toString?.(),
    };

    return new Response(JSON.stringify({ user: safeUser }), { status: 201 });
  } catch (error) {
    console.error('Error saving user:', error);
    
    // Verificar si es un error de correo duplicado
    if (error instanceof Error) {
      if (error.message.includes('correo electrónico ya está registrado') || 
          error.message.toLowerCase().includes('email') || 
          error.message.toLowerCase().includes('correo')) {
        return NextResponse.json(
          { 
            message: 'Este correo electrónico ya está registrado. Por favor utiliza otro.',
            code: 'P2002' 
          },
          { status: 409 }
        );
      }
      
      // Devolver el mensaje de error específico
      return NextResponse.json(
        { message: error.message || 'Error al registrar usuario' },
        { status: 400 }
      );
    }
    
    // Error genérico
    return NextResponse.json(
      { message: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}