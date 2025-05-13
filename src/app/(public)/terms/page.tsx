'use client'

export default function TermsPage() {
  return (
    <main className="px-6">
      <div className="max-w-4xl mx-auto bg-white/80 rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Términos y Condiciones</h1>

        <div className="prose prose-gray text-gray-800">
          <h2 className="text-xl font-semibold mb-4">1. Introducción</h2>
          <p className="mb-4">
            Bienvenido a InterviewLab. Estos términos y condiciones describen las reglas y regulaciones para el uso de nuestra plataforma.
          </p>

          <h2 className="text-xl font-semibold mb-4">2. Privacidad</h2>
          <p className="mb-4">
            Al utilizar esta plataforma, usted acepta que los datos personales proporcionados en su currículum vitae (CV) y las grabaciones o retroalimentación generadas durante las prácticas de entrevistas de trabajo serán recopilados, almacenados y procesados exclusivamente para mejorar sus habilidades de entrevista y ofrecer retroalimentación personalizada. Con su consentimiento expreso, podremos compartir información general y anónima sobre su desempeño (sin incluir datos personales identificables) con su institución educacional para apoyar su formación. Nos comprometemos a proteger sus datos conforme a la Ley N° 19.628 de Protección de Datos Personales, garantizando su confidencialidad y seguridad. Usted tiene derecho a acceder, rectificar, cancelar u oponerse al tratamiento de sus datos en cualquier momento, contactándonos a través de soporte@interviewlab.cl. Para más detalles, consulte nuestra <a className="underline" href="/privacy">Política de Privacidad</a>. 
          </p>

          <h2 className="text-xl font-semibold mb-4">3. Contacto</h2>
          <p className="mb-4">
            Si tiene alguna pregunta sobre estos términos, por favor contáctenos.
          </p>
        </div>
      </div>
    </main>
  )
}