'use client';

import { useState, useEffect } from 'react';

interface ResumeFormProps {
  setResume: (resume: string) => void;
  setJobDescription: (jobDescription: string) => void;
}

export function ResumeForm({ setResume, setJobDescription }: ResumeFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isFormComplete, setIsFormComplete] = useState(false);

  useEffect(() => {
    setIsFormComplete(!!file && text.trim().length > 0);
  }, [file, text]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

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
        setResume(data.resume || '');
        setJobDescription(text);
        setFile(null);
        setText('');
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
      <h2 className="text-xl font-bold mb-4 text-gray-700">Subir Archivos</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="file" className="block text-gray-700 mb-2">
            Subir Currículum <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md cursor-pointer"
            accept="application/pdf"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Archivo seleccionado: {file.name}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="text" className="block text-gray-700 mb-2">
            Descripción del trabajo <span className="text-red-500">*</span>
          </label>
          <textarea
            id="text"
            value={text}
            onChange={handleTextChange}
            className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md h-32"
            placeholder="Ingresa la descripción del trabajo..."
          />
        </div>

        <div className="flex flex-col space-y-4">
          <button
            type="submit"
            disabled={isLoading || !isFormComplete}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-black transition cursor-pointer disabled:bg-gray-300"
          >
            {isLoading ? 'Subiendo...' : 'Enviar'}
          </button>

          {!isFormComplete && (
            <p className="text-sm text-amber-600">
              Se requiere tanto el currículum como la descripción del trabajo para iniciar una conversación
            </p>
          )}

          {message && (
            <p className={`text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}