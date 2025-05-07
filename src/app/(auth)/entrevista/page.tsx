'use client';

import { useState } from 'react';
import { ResumeForm } from '@/components/ResumeForm';
import { Conversation } from '@/components/Conversation';

export default function Home() {
  const [step, setStep] = useState<'form' | 'conversation'>('form');
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [interviewId, setInterviewId] = useState('');

  const handleFormComplete = (data: {
    resume: string;
    jobDescription: string;
    interviewId: string;
  }) => {
    setResume(data.resume);
    setJobDescription(data.jobDescription);
    setInterviewId(data.interviewId);
    setStep('conversation');
  };

  const handleBackToForm = () => {
    setStep('form');
  };

  return (
    <main className="flex items-center justify-center py-10 px-4 font-sans">
      <div className="bg-white shadow-sm rounded-xl p-8 max-w-4xl w-full">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-4">
          Simulador de Entrevistas
        </h1>

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
    </main>
  );
}