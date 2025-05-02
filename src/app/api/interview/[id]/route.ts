import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let interviewId: bigint;
  try {
    interviewId = BigInt((await params).id);
  } catch (error) {
    console.error('Invalid interview ID format:', error);
    return NextResponse.json(
      { error: 'El formato del ID de entrevista es inválido' },
      { status: 400 }
    );
  }

  try {
    const interview = await prisma.interview.findUnique({
      where: {
        id: interviewId,
      },
      select: {
        id: true,
        resume: true,
        job_description: true,
        created_at: true,
      },
    });
    return NextResponse.json(interview, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener la entrevista' },
      { status: 500 }
    );
  }
}