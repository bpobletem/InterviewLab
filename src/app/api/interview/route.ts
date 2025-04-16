import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import pdf from 'pdf-parse';

// GET handler (unchanged)
export async function GET(request: NextRequest) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    const interviews = await prisma.interview.findMany({
      where: {
        user_id: userId
      },
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
    // Obtener usuario
    // const { data: { session } } = await supabase.auth.getSession();

    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // const userId = session.user.id;

    // Procesar el formulario multipart
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const text = formData.get('text') as string | null;

    if (!file || !text) {
      return NextResponse.json(
        { error: 'Both resume file and job description are required' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Extraer texto del PDF
    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await pdf(buffer);
    const resumeText = pdfData.text;

    // Guardar en la base de datos
    // const interview = await prisma.interview.create({
    //   data: {
    //     user_id: userId,
    //     resume: resumeText,
    //     job_description: text,
    //     created_at: new Date(),
    //   },
    // });

    // Devolver los datos procesados
    return NextResponse.json({
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