'use client';

import { useState } from 'react';
import { ResumeForm } from '@/components/ResumeForm';
import { Conversation } from '@/components/Conversation';

export default function Home() {
  const [step, setStep] = useState<'form' | 'conversation'>('form');
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [interviewId, setInterviewId] = useState('');
  // Eliminando la variable title que no se utiliza
  
  const handleFormComplete = (data: {
    resume: string;
    jobDescription: string;
    interviewId: string;
    title: string;
  }) => {
    setResume(data.resume);
    setJobDescription(data.jobDescription);
    setInterviewId(data.interviewId);
    // Eliminando la asignación a setTitle
    setStep('conversation');
  };

  const handleBackToForm = () => {
    setStep('form');
  };

  return (
    <main className="flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-12">
        Simulador de Entrevistas
      </h1>
      <div className="flex flex-col lg:flex-row gap-16 w-full max-w-7xl">
        {/* Columna Izquierda - Consejos */}
        <aside className="lg:w-1/3 bg-white/80 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Cómo funciona la entrevista</h2>
          <p className="text-gray-600 mb-4 text-md">
            Nuestro simulador de IA te hará preguntas basadas en tu currículum y la descripción del trabajo que proporcionaste.
            Responde de forma clara y concisa. Al finalizar, recibirás feedback sobre tus respuestas.
          </p>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Consejos para el éxito</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2 text-md">
            <li>Estructura tus respuestas (ej. método STAR: Situación, Tarea, Acción, Resultado).</li>
            <li>Sé específico y proporciona ejemplos concretos de tu experiencia.</li>
            <li>Mantén un tono profesional y entusiasta.</li>
            <li>Habla con claridad y a un ritmo adecuado.</li>
            <li>No tengas miedo de pedir una aclaración si no entiendes una pregunta.</li>
          </ul>
          <h2 className="text-xl font-semibold text-gray-700 mt-6 mb-4">Qué se evaluará</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2 text-md">
            <li>Interés: Tu entusiasmo y motivación por el puesto.</li>
            <li>Claridad: La facilidad para entender tus respuestas.</li>
            <li>Profesionalismo: Tu comportamiento y lenguaje.</li>
            <li>Técnica: El uso de métodos para estructurar respuestas y la relevancia de tus habilidades.</li>
            <li>Ejemplos: La calidad y pertinencia de los ejemplos que proporcionas.</li>
          </ul>
        </aside>

        {/* Columna Derecha - Contenido Principal */}
        <div className="lg:w-2/3">
          {step === 'form' ? (
            <ResumeForm onComplete={handleFormComplete} />
          ) : (
            <Conversation
              resume={resume}
              jobDescription={jobDescription}
              interviewId={interviewId}
              onBack={handleBackToForm}
            />
          )}
        </div>
      </div>
    </main>
  );
}