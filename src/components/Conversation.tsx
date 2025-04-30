'use client';

import { useConversation } from '@11labs/react';
import { useCallback } from 'react';

interface ConversationProps {
  resume: string;
  jobDescription: string;
  interviewId: string;
  onBack: () => void;
}

export function Conversation({ resume, jobDescription, interviewId, onBack }: ConversationProps) {
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
            - You speak with a clear, professional, and natural voice in standard Spanish. Your goal is to answer questions accurately without hallucinating or generating unsolicited information. When encountering technical terms, acronyms, or proper nouns, pronounce them exactly as written.
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
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      {/* Interview Status Card */}
      <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm mb-6 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              {conversation.status === 'connected' ? 'Entrevista en curso' : 'Preparado para iniciar'}
            </h2>
            {conversation.status === 'connected' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 mr-1 bg-green-500 rounded-full animate-pulse"></span>
                Activo
              </span>
            )}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="p-5">
          {conversation.status === 'connected' ? (
            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-md">
              {conversation.isSpeaking ? (
                <div className="flex items-center">
                  <div className="relative mr-3">
                    <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Alejandro está hablando</p>
                    <div className="flex space-x-1 mt-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="relative mr-3">
                    <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                      </svg>
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Alejandro está escuchando</p>
                    <p className="text-sm text-gray-500">Habla con claridad hacia el micrófono</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-md text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-1">La entrevista aún no ha comenzado</p>
              <p className="text-sm text-gray-500">Presiona el botón para iniciar</p>
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <button
          onClick={startConversation}
          disabled={conversation.status === 'connected'}
          className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-md hover:bg-black transition disabled:bg-gray-300 disabled:cursor-not-allowed hover:cursor-pointer flex items-center justify-center gap-2 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Iniciar entrevista
        </button>
        <button
          onClick={stopConversation}
          disabled={conversation.status !== 'connected'}
          className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-800 rounded-md hover:bg-gray-50 transition disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed hover:cursor-pointer flex items-center justify-center gap-2 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
          Detener entrevista
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="w-full mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onBack}
          className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-800 rounded-md hover:bg-gray-50 transition hover:cursor-pointer flex items-center justify-center gap-2 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al formulario
        </button>
        <button
          onClick={onBack}
          className="flex-1 px-4 py-3 bg-gray-100 border border-gray-300 text-gray-800 rounded-md hover:bg-gray-200 transition hover:cursor-pointer flex items-center justify-center gap-2 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Ver feedback
        </button>
      </div>

      {/* Tips Section */}
      {conversation.status === 'connected' && (
        <div className="w-full mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="font-medium text-gray-800 mb-2">Consejos para la entrevista:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-start">
              <span className="text-gray-400 mr-2">•</span>
              Habla con claridad y a un ritmo moderado
            </li>
            <li className="flex items-start">
              <span className="text-gray-400 mr-2">•</span>
              Espera a que el entrevistador termine de hablar antes de responder
            </li>
            <li className="flex items-start">
              <span className="text-gray-400 mr-2">•</span>
              Proporciona ejemplos concretos de tu experiencia
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}