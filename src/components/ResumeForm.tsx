'use client';

import { useState } from 'react';

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
    <div className="bg-white p-8 rounded-lg shadow-sm mb-8 w-full border border-gray-100 transition-all duration-300">
      <h2 className="text-2xl font-bold mb-6 text-black border-b pb-3">Subir Archivos</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="mb-5">
          <label htmlFor="file" className="block text-black font-medium mb-2">
            Subir Currículum <span className="text-black font-bold">*</span>
          </label>
          <div className="relative">
            <input
              type="file"
              id="file"
              onChange={(e) => e.target.files && setFile(e.target.files[0])}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-black bg-white hover:border-black transition-colors duration-300 focus:outline-none focus:border-black cursor-pointer"
              accept="application/pdf"
            />
          </div>
          {file && (
            <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
              <span className="font-medium">Archivo seleccionado:</span> {file.name}
            </p>
          )}
        </div>

        <div className="mb-5">
          <label htmlFor="text" className="block text-black font-medium mb-2">
            Descripción del trabajo <span className="text-black font-bold">*</span>
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-md h-40 text-black resize-none hover:border-black transition-colors duration-300 focus:outline-none focus:border-black cursor-text"
            placeholder="Describe el puesto con el mayor detalle posible para una entrevista más precisa..."
          />
        </div>

        <div className="flex flex-col space-y-4">
          <button
            type="submit"
            disabled={isLoading || !isFormComplete}
            className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer transform hover:translate-y-[-2px] font-medium"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Subiendo...
              </span>
            ) : 'Enviar'}
          </button>

          {message && (
            <div className={`p-3 rounded-md text-sm ${message.includes('Error') ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
              {message}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}