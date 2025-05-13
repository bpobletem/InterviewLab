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
    <main className="flex flex-col items-center justify-center text-gray-800 px-4 sm:px-6 md:px-8 w-full">
      <div className="text-center space-y-4 mb-8 sm:mb-12 md:mb-16 mt-8 sm:mt-10 md:mt-12 w-full">
        <h1 className="text-gray-800 text-2xl sm:text-3xl font-bold">Bienvenido a Interview<span className='italic'>Lab</span></h1>
        <p className="text-sm sm:text-base">{data.user.email}</p>
      </div>

      <div className="w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl space-y-8 sm:space-y-12 md:space-y-16">
        <section className="bg-white/80 p-4 sm:p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">¿Qué es InterviewLab?</h2>
          <p className="text-gray-700 text-sm sm:text-base mb-3 sm:mb-4">
            InterviewLab es una plataforma innovadora diseñada para ayudarte a prepararte para entrevistas laborales mediante simulaciones realistas. 
            Utilizando inteligencia artificial avanzada, nuestro sistema analiza tu currículum y la descripción del puesto al que aspiras para crear 
            una experiencia de entrevista personalizada y relevante.
          </p>
          <p className="text-gray-700 text-sm sm:text-base">
            Nuestro entrevistador virtual, Alejandro, te hará preguntas específicas basadas en tu experiencia y los requisitos del puesto, 
            ayudándote a practicar y mejorar tus habilidades de entrevista en un entorno sin presión.
          </p>
        </section>

        <section className="bg-white/80 p-4 sm:p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">¿Cómo funciona?</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-gray-800 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0 mt-1">1</div>
              <div className="ml-3 sm:ml-4">
                <h3 className="font-semibold text-base sm:text-lg">Sube tu CV</h3>
                <p className="text-gray-700 text-sm sm:text-base">Carga tu currículum en formato PDF para que nuestro sistema pueda analizarlo.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-gray-800 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0 mt-1">2</div>
              <div className="ml-3 sm:ml-4">
                <h3 className="font-semibold text-base sm:text-lg">Describe el puesto</h3>
                <p className="text-gray-700 text-sm sm:text-base">Proporciona una descripción detallada del puesto al que estás aplicando.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-gray-800 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0 mt-1">3</div>
              <div className="ml-3 sm:ml-4">
                <h3 className="font-semibold text-base sm:text-lg">Inicia la entrevista</h3>
                <p className="text-gray-700 text-sm sm:text-base">Comienza la simulación de entrevista y responde a las preguntas como lo harías en una entrevista real.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-gray-800 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0 mt-1">4</div>
              <div className="ml-3 sm:ml-4">
                <h3 className="font-semibold text-base sm:text-lg">Mejora tus habilidades</h3>
                <p className="text-gray-700 text-sm sm:text-base">Practica tantas veces como necesites para ganar confianza y mejorar tus respuestas.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="text-center w-full py-4">
          <Link href="/entrevista" className="inline-block bg-blue-500 text-white px-4 sm:px-6 py-2 rounded-md font-medium hover:bg-blue-600 hover:translate-y-[-2px] transition text-sm sm:text-base">
            Comenzar una entrevista
          </Link>
        </div>
      </div>
    </main>
  )
}