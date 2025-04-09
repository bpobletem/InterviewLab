export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-2xl">
        <h1 className="text-5xl font-bold">InterviewLab</h1>
        <p className="text-gray-600 text-lg">
          Mejora tus habilidades para entrevistas de trabajo con nuestro simulador de entrevistas impulsado por IA.
        </p>

        <div className="flex gap-4 justify-center mt-6">
          <a
            href="/login"
            className="bg-gray-900 text-white px-6 py-2 rounded-md font-medium hover:bg-black transition"
          >
            Iniciar sesión
          </a>
          <a
            href="/register"
            className="border border-gray-300 px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition"
          >
            Registrarse
          </a>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl w-full px-4">
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

      <footer className="mt-16 text-sm text-gray-500 flex flex-col items-center gap-1">
        <span>InterviewLab</span>
        <div className="flex gap-4">
          <a href="#">Términos</a>
          <a href="#">Privacidad</a>
          <a href="#">Contacto</a>
        </div>
      </footer>
    </main>
  )
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="border border-gray-200 bg-white p-6 rounded-xl text-center shadow-sm">
      <h2 className="font-semibold mb-2">{title}</h2>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  )
}
