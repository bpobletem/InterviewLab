import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveUser } from '@/utils/saveUser';

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
  const { email, password, name, birthday, institution_id, career_id } = body;

  try {
    const user = await saveUser({
      email,
      password,
      name,
      birthday: new Date(birthday), // Asegúrate de que sea un Date
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
    return NextResponse.json(
      { error: 'Failed to save user' },
      { status: 500 }
    );
  }
}