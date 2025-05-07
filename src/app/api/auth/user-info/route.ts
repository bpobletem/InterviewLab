import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ isAdmin: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Check if the user's email exists in the institutions table
    const adminInstitution = await prisma.institution.findFirst({
      where: { email: user.email },
      select: { id: true }
    });

    if (adminInstitution) {
      return NextResponse.json({ isAdmin: true });
    } else {
      return NextResponse.json({ isAdmin: false });
    }

  } catch (error) {
    console.error('Error checking user admin status:', error);
    return NextResponse.json({ isAdmin: false, error: 'Internal server error' }, { status: 500 });
  }
}