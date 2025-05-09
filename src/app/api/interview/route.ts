import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import pdf from 'pdf-parse';

// GET all interviews
export async function GET() {
  try { 
    const interviews = await prisma.interview.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });
    
    return NextResponse.json(interviews);
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json({ error: 'Failed to fetch interviews' }, { status: 500 });
  }
}

// POST handler
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    // Obtener usuario
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userAuthId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { authId: userAuthId },
      select: { id: true }
    });

    if (!user) { 
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Procesar el formulario multipart
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const text = formData.get('text') as string | null;

    if (!file || !text) {
      return NextResponse.json(
        { error: 'CV y descripción del trabajo son requeridas' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Solo se aceptan archivos PDF' },
        { status: 400 }
      );
    }

    // Extraer texto del PDF
    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await pdf(buffer);
    const resumeText = pdfData.text;

    // Guardar en la base de datos
    const interview = await prisma.interview.create({
      data: {
        user_id: user.id,
        resume: resumeText,
        job_description: text,
        created_at: new Date(),
      },
    });

    // Devolver los datos procesados
    return NextResponse.json({
      id: interview.id.toString(),
      resume: resumeText,
      jobDescription: text,
    }, { status: 200 });

  } catch (error) {
    console.error('Error processing form data:', error);
    return NextResponse.json(
      { error: 'Failed to process form data' },
      { status: 500 }
    );
  }
}