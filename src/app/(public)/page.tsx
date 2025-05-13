export default function LandingPage() {
  return (
    <main className="text-gray-600 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl md:text-7xl font-bold mb-8 md:mb-12 bg-gradient-to-r from-blue-500 via-violet-600 to-pink-600 text-transparent bg-clip-text tracking-tighter">
          Interview
          <span className="italic">Lab</span>
        </h1>
        <p className="text-gray-600 text-lg md:text-2xl mb-8 md:mb-12">
          Mejora tus habilidades para entrevistas de trabajo con nuestro simulador de entrevistas impulsado por IA.
        </p>

        <div className="flex gap-4 justify-center mb-8 md:mb-12">
          <a
            href="/entrevista"
            className="bg-gradient-to-r from-blue-500 to-violet-500 text-lg text-white mb-8 md:mb-12 px-6 py-2 rounded-md hover:transform hover:scale-105 transition"
          >
            Comienza aquí
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl w-full">
        <Feature
          title="Entrevistas Realistas"
          description="Experimenta escenarios de entrevista realistas adaptados a diferentes roles y sectores."
        />
        <Feature
          title="Análisis IA de tus Respuestas"
          description="Obtén un análisis sobre la claridad, estructura y contenido de tus respuestas para una mejora continua."
        />
        <Feature
          title="Adaptado a ti"
          description="Define tu industria y nivel de experiencia para simulaciones que se ajustan perfectamente a tu perfil profesional."
        />
      </div>
    </main>
  )
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="border border-gray-200 bg-white p-8 rounded-xl text-center shadow-sm hover:transform hover:scale-105 transition">
      <h2 className="font-semibold text-gray-700 mb-4 text-lg">{title}</h2>
      <p className="text-md text-gray-500">{description}</p>
    </div>
  )
}