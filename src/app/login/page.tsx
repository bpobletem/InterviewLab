'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Error al iniciar sesión')
    } else {
      router.push('/home')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white text-gray-800">
      <div className="w-full max-w-sm p-6 border border-gray-200 rounded-xl shadow-sm">
        <h1 className="text-xl font-semibold text-center mb-1">Iniciar sesión en <span className="font-bold text-gray-900">InterviewLab</span></h1>
        <p className="text-sm text-center text-gray-500 mb-6">Ingresa tus credenciales</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm block mb-1">Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-300 text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm block mb-1">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-300 text-sm"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-black transition hover:cursor-pointer"
          >
            Ingresar
          </button>
        </form>
        <p className="text-xs text-center text-gray-500 mt-6">
          ¿No tienes cuenta? <a href="/register" className="text-gray-800 underline">Regístrate</a>
        </p>
      </div>
    </main>
  )
}
