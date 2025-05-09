export default function LandingPage() {
  return (
    <main className="text-gray-900 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 text-transparent bg-clip-text">
          Interview
          <span className="italic">Lab</span>
        </h1>
        <p className="text-gray-600 text-lg md:text-2xl mb-8">
          Mejora tus habilidades para entrevistas de trabajo con nuestro simulador de entrevistas impulsado por IA.
        </p>

        <div className="flex gap-4 justify-center mb-8">
          <a
            href="/entrevista"
            className="bg-gradient-to-r from-blue-500 to-violet-500 text-lg text-white mb-8 px-6 py-2 rounded-md hover:transform hover:scale-105 transition"
          >
            Comenzar
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl w-full">
        <Feature
          title="Entrevistas Realistas"
          description="Practica con simulaciones de entrevistas que se sienten reales."
        />
        <Feature
          title="Feedback"
          description="Recibe retroalimentación detallada para mejorar tus respuestas."
        />
        <Feature
          title="Personalizado"
          description="Entrevistas adaptadas a tu industria y nivel de experiencia."
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