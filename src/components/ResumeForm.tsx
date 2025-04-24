'use client';

import { useState, useEffect } from 'react';

interface ResumeFormProps {
  onComplete: (data: { resume: string; jobDescription: string; interviewId: string }) => void;
}

export function ResumeForm({ onComplete }: ResumeFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const isFormComplete = !!file && text.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !text) {
      setMessage('Por favor, proporciona un archivo y una descripción del trabajo');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('text', text);

      const response = await fetch('/api/interview', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Currículum y descripción del trabajo subidos exitosamente');
        onComplete({ resume: data.resume || '', jobDescription: text, interviewId: data.id.toString() });
      } else {
        setMessage(`Error: ${data.error || 'Algo salió mal'}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Algo salió mal'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8 w-full">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Subir Archivos</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="file" className="block text-gray-900 mb-2">
            Subir Currículum <span className="text-red-600">*</span>
          </label>
          <input
            type="file"
            id="file"
            onChange={(e) => e.target.files && setFile(e.target.files[0])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
            accept="application/pdf"
          />
          {file && <p className="mt-2 text-sm text-gray-700">Archivo seleccionado: {file.name}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="text" className="block text-gray-900 mb-2">
            Descripción del trabajo <span className="text-red-600">*</span>
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md h-32 text-gray-800"
            placeholder="Ingresa la descripción del trabajo..."
          />
        </div>

        <div className="flex flex-col space-y-4">
          <button
            type="submit"
            disabled={isLoading || !isFormComplete}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-black transition disabled:bg-gray-300"
          >
            {isLoading ? 'Subiendo...' : 'Enviar'}
          </button>

          {message && (
            <p className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}