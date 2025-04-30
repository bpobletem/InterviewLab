export default function Footer() {
  return (
    <footer className="w-full text-sm text-gray-500 flex flex-col items-center gap-1 py-4 mt-auto fixed bottom-0 border-t border-gray-200">
      <span>InterviewLab</span>
      <div className="flex gap-4">
        <a href="/terms">Términos & Condiciones</a>
        <a href="/privacy">Política de Privacidad</a>
      </div>
    </footer>
  )
}