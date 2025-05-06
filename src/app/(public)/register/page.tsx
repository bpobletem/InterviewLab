'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Career, Institution } from '@prisma/client'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [birthdateError, setBirthdateError] = useState('')
  const [gender, setGender] = useState('')
  const [institutions, setInstitutions] = useState([])
  const [careers, setCareers] = useState([])
  const [selectedInstitution, setSelectedInstitution] = useState('')
  const [selectedCareer, setSelectedCareer] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const isValidBirthdate = (date: string) => {
    const birth = new Date(date)
    const today = new Date()
    const age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    const d = today.getDate() - birth.getDate()
    return age > 16 || (age === 16 && (m > 0 || (m === 0 && d >= 0)))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCareer) {
      setError('Por favor selecciona una carrera.')
      return
    }
    
    if (!gender) {
      setError('Por favor selecciona un género.')
      return
    }

    if (!acceptTerms) {
      setError('Debes aceptar los términos y condiciones para continuar.')
      return
    }

    if (!isValidBirthdate(birthdate)) {
      setBirthdateError('Debes tener al menos 16 años')
      return
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          name,
          birthday: birthdate,
          gender,
          institution_id: selectedInstitution,
          career_id: selectedCareer
        })
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.message || 'Error al registrar usuario')
        return
      }

      router.push('/login')
    } catch (err) {
      console.error('Error en el registro:', err)
      setError('Hubo un error al registrar el usuario.')
    }
  }

  return (
    <main className="flex items-center justify-center text-gray-800">
      <div className="w-full max-w-md p-6 border border-gray-200 rounded-xl shadow-sm">
        <h1 className="text-xl font-semibold text-center mb-1">Regístrate en <span className="font-bold text-gray-900">InterviewLab</span></h1>
        <form onSubmit={handleRegister} className="space-y-4 mt-4">
          <div>
            <label className="text-sm block mb-1">Nombre y Apellido</label>
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
              onChange={(e) => {
                const value = e.target.value
                setBirthdate(value)
                if (!isValidBirthdate(value)) {
                  setBirthdateError('Debes tener al menos 16 años')
                } else {
                  setBirthdateError('')
                }
              }}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            {birthdateError && (
              <p className="text-sm text-red-500 mt-1">{birthdateError}</p>
            )}
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
              {institutions.map((institution: Institution) => (
                <option key={institution.id} value={institution.id.toString()}>
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
              {careers.map((career: Career) => (
                <option key={career.id} value={career.id.toString()}>
                  {career.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm block mb-1">Género</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Ninguno">Ninguno</option>
            </select>
          </div>
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-600">
                Acepto los <a href="/terms" className="text-gray-800 underline hover:cursor-pointer">términos y condiciones</a> de privacidad
              </label>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-black transition hover:cursor-pointer"
          >
            Registrarse
          </button>
        </form>
        <p className="text-xs text-center text-gray-500 mt-6">
          ¿Ya tienes cuenta? <a href="/login" className="text-gray-800 underline hover:cursor-pointer">Inicia sesión</a>
        </p>
      </div>
    </main>
  )
}