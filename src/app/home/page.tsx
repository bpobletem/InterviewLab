import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'

export default async function HomePage() {
    const cookieStore = cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set() { }, // App Router aún no permite modificar cookies aquí
                remove() { }
            }
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-white text-gray-800 px-4">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold">Hola, {user.email}</h1>
                <p className="text-gray-600">Bienvenido a InterviewLab</p>
            </div>
        </main>
    )
}
