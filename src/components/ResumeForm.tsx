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
    <div className="bg-white/80 p-8 rounded-lg shadow-sm mb-8 w-full border border-gray-100 transition-all duration-300">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="mb-8">
          <label htmlFor="file-input-resume" className="block text-gray-800 font-medium mb-2">
            Currículum <span className="text-gray-800 font-bold">*</span>
          </label>
          <label
            htmlFor="file-input-resume"
            className={`w-full flex items-center px-4 py-3 border-2 border-gray-200 rounded-md bg-white hover:border-black transition-colors duration-300 cursor-pointer ${
              file ? 'text-gray-800' : 'text-gray-500'
            }`}
          >
            {file ? file.name : 'Seleccionar archivo PDF...'}
          </label>
          <input
            type="file"
            id="file-input-resume"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setFile(e.target.files[0]);
              }
            }}
            className="hidden"
            accept="application/pdf"
          />
        </div>

        <div className="mb-8">
          <label htmlFor="text" className="block text-gray-800 font-medium mb-4">
            Descripción del trabajo <span className="text-gray-800 font-bold">*</span>
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-md h-40 text-gray-800 resize-none hover:border-black transition-colors duration-300 focus:outline-none focus:border-black cursor-text"
            placeholder="Describe el puesto con el mayor detalle posible para una entrevista más precisa..."
          />
        </div>

        <div className="text-right">
          <button
            type="submit"
            disabled={isLoading || !isFormComplete}
            className="py-2 px-6 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer transform font-medium"
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