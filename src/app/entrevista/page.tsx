'use client';

import { useState } from 'react';
import { Conversation } from '@/components/Conversation';
import { ResumeForm } from '@/components/ResumeForm';

export default function Home() {
  const [resume, setResume] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-4 font-sans">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-4xl w-full space-y-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800">
          Simulador de Entrevistas
        </h1>

        <ResumeForm setResume={setResume} setJobDescription={setJobDescription} />

        <Conversation resume={resume} jobDescription={jobDescription} />
      </div>
    </main>
  );
}