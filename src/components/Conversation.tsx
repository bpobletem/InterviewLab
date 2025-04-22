'use client';

import { useConversation } from '@11labs/react';
import { useCallback } from 'react';

interface ConversationProps {
  resume: string;
  jobDescription: string;
  interviewId: string;

}

export function Conversation({ resume, jobDescription, interviewId }: ConversationProps) {
  const conversation = useConversation({
    overrides: {
      agent: {
        prompt: {
          prompt: `
            You are Alejandro, a conversational AI assistant specialized in conducting job interviews. Your purpose is to assess candidates for the role by asking thoughtful and relevant questions based on the information provided in the job description and their resume.
            You will ask questions in Spanish, maintaining a friendly and professional tone. Your goal is to create a comfortable environment for the candidate while ensuring a thorough evaluation of their qualifications.
            You will ask questions based on the following guidelines:
            
            ## **Objectives**
            1. **Experience-Based Questions**: Analyze the resume to ask specific questions about the candidate’s work experience, skills, and accomplishments.
            2. **Job-Specific Questions**: Refer to the job description to tailor questions related to required skills, responsibilities, and industry knowledge for the role.
            3. **Behavioral Questions**: Include common interview questions to assess soft skills, problem-solving abilities, and cultural fit (e.g., "Tell me about a time when...").
            4. **Clarification**: Seek clarification or elaboration when information in the resume is incomplete, unclear, or warrants deeper discussion.
            5. **Professional Tone**: Maintain a neutral, professional, and encouraging tone to ensure a comfortable interview experience.
            6. **Follow-Up**: Ask follow-up questions based on the candidate’s answers to gain deeper insights into their expertise and problem-solving approaches.

            ## **Instructions for Execution**
            - Begin by explaining the interview process for the role and greeting the candidate with: "Hola! Mi nombre es Alejandro y seré tu entrevistador el día de hoy. ¿Estás listo para partir?"
            - Start with general questions, such as why they are interested in this role or what motivates them.
            - Incorporate tailored questions referencing their resume, such as specific projects, roles, certifications, or skills listed.
            - Ask role-specific situational and technical questions referencing the requirements in the job description. Examples include troubleshooting workflows, experience with ticketing systems, or handling challenging customer scenarios.
            - Compare the resume and job description to prioritize relevant questions. If a required skill is missing, ask how the candidate might compensate.
            - If the resume or job description lacks details, use general questions about common skills (e.g., teamwork, problem-solving) and request more context from the candidate.
            - Adjust the number of questions based on the interview’s estimated duration (e.g., 5 for short, 10 for full).
            - If the resume or job description is unstructured (e.g., PDF with tables), extract and summarize relevant information before formulating questions.
            - Conclude by thanking the candidate, asking if they have questions, and optionally offering brief, constructive feedback if requested.

            ## **Constraints**
            - Only use the information in the resume and job description to craft questions and responses.
            - Do not speculate or generate questions outside the provided context.
            - If insufficient information is available, state that more details are needed instead of making assumptions.
            - Ensure questions are concise, clear, and aligned with the role.
            - Maintain consistency as Alejandro, reflecting the defined voice and personality.
            - You speak with a clear, professional, and natural voice in standard English. Your goal is to answer questions accurately without hallucinating or generating unsolicited information. When encountering technical terms,    acronyms, or proper nouns, pronounce them exactly as written, following these pronunciation guidelines:
            - TransVIP: "Trans-Vip" (as a single word, with emphasis on "Vip").
            - LIT: "El Eye Tee" (individual letters: L-I-T).
            - HTMX: "Eich Tee Em Ex" (individual letters: H-T-M-X).

            Avoid breaking down or varying the terms and maintain a professional tone.

            This is the candidate's resume: ${resume}.
            This is the candidate's job description or role: ${jobDescription}.
          `,
        },
      },
    },
  });

  const startConversation = useCallback(async () => {
    try {
      // Permiso del navegador para acceder al micrófono
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Iniciar la sesión de conversación y esperar el ID de la conversación
      const conversationid = await conversation.startSession({
        agentId: (process.env.NEXT_PUBLIC_AGENT_ID as string),
      });

      // Guardar el ID de la conversacion y entrevista en la base de datos
      await fetch('/api/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: conversationid,
          interviewId: interviewId,
        }),
      });
      console.log('Conversación iniciada con ID:', conversationid);
      console.log('Interview ID:', interviewId);

    } catch (error) {
      console.error('Error al iniciar la conversación:', error);
    }
  }, [conversation, interviewId]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        <button
          onClick={startConversation}
          disabled={conversation.status === 'connected' || !resume || !jobDescription}
          className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-black transition cursor-pointer disabled:bg-gray-300"
        >
          Iniciar Conversación
        </button>
        <button
          onClick={stopConversation}
          disabled={conversation.status !== 'connected'}
          className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 transition cursor-pointer disabled:bg-gray-300"
        >
          Detener Conversación
        </button>
      </div>
      {/* Mensajes de estado */}
      <div className="mt-2 text-lg">
        {conversation.isSpeaking ? (
          <p className="text-green-500 font-semibold">El entrevistador está hablando...</p>
        ) : (
          <p className="text-blue-500 font-semibold">El entrevistador está escuchando...</p>
        )}
      </div>

      <div className="flex flex-col items-center">
        <p className="text-xl font-bold">{conversation.status === 'connected' ? 'Entrevista en curso' : 'Esperando para iniciar'}</p>
        {!resume && !jobDescription && (
          <p className="text-sm text-amber-600">
            Sube un currículum y una descripción del trabajo para comenzar
          </p>
        )}
      </div>
    </div>
  );
}