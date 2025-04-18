import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <form className="w-full max-w-sm space-y-4 border border-gray-200 p-6 rounded-xl shadow">
        <h1 className="text-2xl font-semibold text-center text-gray-800">Iniciar sesión</h1>

        <div className="flex flex-col space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="px-3 py-2 border rounded-md text-sm text-gray-800 border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="px-3 py-2 border rounded-md text-sm text-gray-800 border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex gap-2">
          <button
            formAction={login}
            className="w-full py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
          >
            Iniciar sesión
          </button>
          <button
            formAction={signup}
            className="w-full py-2 border border-black text-black rounded-md hover:bg-black hover:text-white transition"
          >
            Registrarse
          </button>
        </div>
      </form>
    </main>
  )
}
