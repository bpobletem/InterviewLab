import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col items-center justify-center flex-1 w-full max-w-4xl px-4 py-16 text-center gap-8">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          IntervAI
        </h1>
        <p className="mt-4 text-xl text-foreground/70 max-w-2xl">
          Mejora tus habilidades para entrevistas de trabajo con nuestro simulador de entrevistas impulsado por IA
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            href="/login"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-foreground/90 font-medium text-base h-12 px-8"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-base h-12 px-8"
          >
            Registrarse
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 w-full">
          <div className="p-6 border border-foreground/10 rounded-xl">
            <h3 className="text-xl font-bold">Entrevistas Realistas</h3>
            <p className="mt-2 text-foreground/70">Practica con simulaciones de entrevistas que se sienten reales</p>
          </div>
          <div className="p-6 border border-foreground/10 rounded-xl">
            <h3 className="text-xl font-bold">Feedback Instantáneo</h3>
            <p className="mt-2 text-foreground/70">Recibe retroalimentación detallada para mejorar tus respuestas</p>
          </div>
          <div className="p-6 border border-foreground/10 rounded-xl">
            <h3 className="text-xl font-bold">Personalizado</h3>
            <p className="mt-2 text-foreground/70">Entrevistas adaptadas a tu industria y nivel de experiencia</p>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-4xl py-8 border-t border-foreground/10 mt-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-foreground/70">IntervAI</p>
          <div className="flex gap-4">
            <Link href="#" className="text-foreground/70 hover:text-foreground">Términos</Link>
            <Link href="#" className="text-foreground/70 hover:text-foreground">Privacidad</Link>
            <Link href="#" className="text-foreground/70 hover:text-foreground">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
