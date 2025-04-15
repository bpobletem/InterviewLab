'use client';

import { useState } from 'react';
import { Conversation } from '@/components/Conversation';
import { ResumeForm } from '@/components/ResumeForm';

export default function Home() {
  const [resume, setResume] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          ElevenLabs Conversational AI
        </h1>
        <ResumeForm setResume={setResume} setJobDescription={setJobDescription} />
        <Conversation resume={resume} jobDescription={jobDescription} />
      </div>
    </main>
  );
}