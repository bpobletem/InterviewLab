'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [birthdate, setBirthdate] = useState('') // Nuevo estado para la fecha de nacimiento
  const [institutions, setInstitutions] = useState([])
  const [careers, setCareers] = useState([])
  const [selectedInstitution, setSelectedInstitution] = useState('')
  const [selectedCareer, setSelectedCareer] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Cargar las instituciones al montar el componente
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const res = await fetch('/api/institutions')
        const data = await res.json()
        setInstitutions(data.institutions)
      } catch (err) {
        console.error('Error al cargar instituciones', err)
        setError('Error al cargar las instituciones.')
      }
    }

    fetchInstitutions()
  }, [])

  // Cargar las carreras cuando se seleccione una institución
  useEffect(() => {
    const fetchCareers = async () => {
      if (!selectedInstitution) return

      try {
        const res = await fetch(`/api/institutions/${selectedInstitution}/careers`)
        const data = await res.json()
        setCareers(data.careers)
      } catch (err) {
        console.error('Error al cargar carreras', err)
        setError('Error al cargar las carreras.')
      }
    }

    fetchCareers()
  }, [selectedInstitution])

  // Manejar el registro de usuario
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCareer) {
      setError('Por favor selecciona una carrera.')
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      setError(error.message)
      return
    }

    // Enviar los datos del nuevo usuario a la API
    await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify({
        id: data.user?.id,
        email,
        birthdate: new Date(birthdate),
        careerId: selectedCareer,
        institutionId: selectedInstitution
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    

    router.push('/login')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white text-gray-800">
      <div className="w-full max-w-sm p-6 border border-gray-200 rounded-xl shadow-sm">
        <h1 className="text-xl font-semibold text-center mb-1">Regístrate en <span className="font-bold text-gray-900">InterviewLab</span></h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-sm block mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="text-sm block mb-1">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="text-sm block mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="text-sm block mb-1">Fecha de Nacimiento</label>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="text-sm block mb-1">Institución</label>
            <select
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Selecciona una institución</option>
              {institutions.map((institution: any) => (
                <option key={institution.id} value={institution.id}>
                  {institution.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm block mb-1">Carrera</label>
            <select
              value={selectedCareer}
              onChange={(e) => setSelectedCareer(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Selecciona una carrera</option>
              {careers.map((career: any) => (
                <option key={career.id} value={career.id}>
                  {career.area.name} - {career.name}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-black transition"
          >
            Registrarse
          </button>
        </form>
        <p className="text-xs text-center text-gray-500 mt-6">
          ¿Ya tienes cuenta? <a href="/login" className="text-gray-800 underline">Inicia sesión</a>
        </p>
      </div>
    </main>
  )
}