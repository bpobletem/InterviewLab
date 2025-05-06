import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  return (
    <main className="flex flex-col items-center justify-center text-gray-800 px-4">
      <div className="text-center space-y-4 mb-12 mt-12">
        <h1 className="text-3xl font-bold">Hola, {data.user.email}</h1>
        <p className="text-gray-600">Bienvenido a InterviewLab</p>
      </div>

      <div className="max-w-4xl w-full space-y-12">
        <section className="bg-gray-50 p-8 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-4">¿Qué es InterviewLab?</h2>
          <p className="text-gray-700 mb-4">
            InterviewLab es una plataforma innovadora diseñada para ayudarte a prepararte para entrevistas laborales mediante simulaciones realistas. 
            Utilizando inteligencia artificial avanzada, nuestro sistema analiza tu currículum y la descripción del puesto al que aspiras para crear 
            una experiencia de entrevista personalizada y relevante.
          </p>
          <p className="text-gray-700">
            Nuestro entrevistador virtual, Alejandro, te hará preguntas específicas basadas en tu experiencia y los requisitos del puesto, 
            ayudándote a practicar y mejorar tus habilidades de entrevista en un entorno sin presión.
          </p>
        </section>

        <section className="bg-gray-50 p-8 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-4">¿Cómo funciona?</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">1</div>
              <div className="ml-4">
                <h3 className="font-semibold text-lg">Sube tu CV</h3>
                <p className="text-gray-700">Carga tu currículum en formato PDF para que nuestro sistema pueda analizarlo.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">2</div>
              <div className="ml-4">
                <h3 className="font-semibold text-lg">Describe el puesto</h3>
                <p className="text-gray-700">Proporciona una descripción detallada del puesto al que estás aplicando.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">3</div>
              <div className="ml-4">
                <h3 className="font-semibold text-lg">Inicia la entrevista</h3>
                <p className="text-gray-700">Comienza la simulación de entrevista y responde a las preguntas como lo harías en una entrevista real.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="text-center">
          <Link href="/entrevista" className="inline-block bg-gray-900 text-white px-6 py-3 rounded-md font-medium hover:bg-black transition">
            Comenzar una entrevista
          </Link>
        </div>
      </div>
    </main>
  )
}